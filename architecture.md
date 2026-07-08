# BDO Combat Logger — Architecture

## 1. Overview

BDO Combat Logger is a Windows desktop application that passively sniffs Black Desert Online's network traffic to capture PvP kill/death events (Node Wars, Sieges, War of the Roses), lets the user correct player/guild name ordering, and exports a `.log` file for upload to the companion website [nodewar.gg](https://nodewar.gg).

The app is a **hybrid two-process system**:

- An **Electron shell** — a sandboxed Chromium renderer hosting a **React 19 + TypeScript** UI, talking to a Node.js main process over a typed IPC contract.
- A **Python packet-sniffing backend**, compiled to a standalone executable (`logger.exe` via PyInstaller), spawned as a child process by the main process and communicating over stdout/stderr line streams.

There is no client/server network architecture in the traditional sense — "client" here means the local UI process, not a network client of a remote API. The only outbound network calls are to GitHub (config updates, release/update manifests) and BDO's own game servers (passively observed, never written to).

```
┌──────────────────────────────────────────────────────────────────┐
│  Electron Main Process (Node.js)                                  │
│   - index.ts: BrowserWindow lifecycle, IPC handler registration   │
│   - logger/process-manager.ts: LoggerProcessManager               │
│   - store.ts: JSON config store (userData/store.json)             │
│   - updater.ts: electron-updater wiring                           │
│   - ipc/*.ts: logger, dialogs, fs, clipboard, config, updater,     │
│               app, shell handlers                                 │
└───────────────────────┬─────────────────────────────────────────┬─┘
                         │ contextBridge (window.api)              │ child_process.spawn
                         │ contextIsolation + sandbox               │ (argv array, no shell)
┌────────────────────────▼──────────────────────────────────────┐  │
│  Renderer (Chromium, sandboxed, nodeIntegration: false)        │  │
│  React 19 + TypeScript UI (client/src/renderer/src)            │  │
│   - Sidebar + Header shell, HashRouter routes                  │  │
│   - Zustand stores: config, history, modal                     │  │
│   - i18next translations (en/de/fr/es)                         │  │
└──────────────────────────────────────────────────────────────┘  │
                                                                    ▼
                                                  ┌─────────────────────────────────────────┐
                                                  │  logger.exe (PyInstaller build of logger/) │
                                                  │   - scapy packet capture (Npcap driver)    │
                                                  │   - CLI modes: sniff / record / analyze /  │
                                                  │                open / status / update       │
                                                  │   - config.ini: per-patch byte offsets      │
                                                  └─────────────────────────────────────────┘
```

## 2. Repository Layout

```
combat-logger/
├── client/                  Electron app (main + preload + renderer)
│   ├── electron.vite.config.ts  Three build targets: main, preload, renderer
│   ├── electron-builder.yml     Packaging/installer config (NSIS + dir targets)
│   ├── release.config.js        semantic-release plugin pipeline
│   └── src/
│       ├── main/
│       │   ├── index.ts             App lifecycle, BrowserWindow, IPC registration
│       │   ├── store.ts             Hand-rolled JSON key/value store (userData/store.json)
│       │   ├── updater.ts           electron-updater wiring (manual download/install)
│       │   ├── logger/
│       │   │   ├── process-manager.ts   LoggerProcessManager (spawn/kill logger.exe)
│       │   │   └── resolve-exe-path.ts  Dev vs. packaged path resolution
│       │   └── ipc/                 logger, dialogs, fs, clipboard, config, updater, app, shell
│       ├── preload/index.ts         Single contextBridge.exposeInMainWorld("api", ...)
│       ├── shared/ipc-contract.ts   TS types shared by main/preload/renderer
│       └── renderer/src/
│           ├── routes/          HomePage, RecordPage, OpenPage, DemoPage, SettingsPage,
│           │                    HistoryPage, DocsPage
│           ├── components/      Sidebar, Header, modal system, ui/ primitives,
│           │                    create-config/ (Logger, LogEditor, ConfigModal, config store)
│           ├── logic/            useLoggerSession, useNameIndices, history-store, util,
│           │                     demoGenerator, drawTimeline, file, logger-status
│           ├── i18n/             Localization (en, de, es, fr)
│           └── app.tsx           HashRouter shell (Sidebar + Header + routed content + Modal)
├── logger/                  Python packet-sniffing backend (unchanged by the Electron migration)
│   ├── logger.py             CLI entry point (argparse)
│   ├── logger.spec           PyInstaller build spec
│   └── src/
│       ├── config.py         Reads config.ini into a Config object
│       ├── parser.py         Production packet parser (fixed offsets)
│       └── options/          One module per CLI mode (sniff/record/open/
│                              analyze/status_check/update_config)
├── config.ini               Byte-offset config for the current BDO patch
├── docs/                    QUICKSTART.md (end users), BUILDING.md (developers)
└── .github/workflows/       CI: release.yml (tagged releases), build-installer.yml (PR builds)
```

## 3. Frontend (`client/src/renderer/`)

**Stack**: React 19, TypeScript, Vite 7 (via `electron-vite`), Tailwind CSS 4, React Router 7 (`HashRouter`, required because the renderer serves from a bundled `file://` origin), Zustand (config/history/modal state), react-i18next, react-window (virtualized log lists), react-select.

### 3.1 App shell (`app.tsx`)
- Layout: `<Sidebar />` + a right-hand column of `<Header />` above the routed page content, with a global `<Modal />` mounted at root.
- Routes: `/` (Home), `/record`, `/open`, `/demo`, `/settings`, `/history`, `/docs`.
- **Sidebar.tsx** is the primary navigation surface (replacing the old home-screen action tiles): a fixed icon-only rail (always collapsed) with nav items for every route and social links opened via `window.api.shell.openExternal`.

### 3.2 Routes (`src/renderer/src/routes/`)
- **HomePage** — system-status card: runs the logger in `status` mode (`logic/logger-status.ts`) to report Npcap driver presence and config freshness.
- **RecordPage** — live capture flow. Starts a logger session via the `useLoggerSession()` hook (mode `analyze`), parses incoming CSV-like stdout lines into rows, retries automatically (up to 3 attempts) on logger errors, and renders live stats (kills/deaths/KDR), a timeline, `GuildStats`/`EnemyStats` leaderboards, and a post-stop session recap. On stop, a summary is written to session history.
- **OpenPage** — two input paths: a saved `.log`/`.txt` file (parsed client-side via `LOG_REGEX`, no logger process involved) or a raw `.pcap`/`.pcapng` capture (re-uses a logger session in `analyze -f <file>` mode).
- **SettingsPage** — toggles `all_interfaces` sniffing and displays current config (patch date, identifier, auto-scroll), all backed by the shared Zustand config store.
- **HistoryPage** — lists up to the last 7 recorded sessions (`useHistoryStore`), with per-entry re-download-as-`.log` and delete actions.
- **DemoPage / DocsPage** — self-contained synthetic-data demo and static documentation/FAQ view.

### 3.3 Core logic (`src/renderer/src/logic/`)
- **`useLoggerSession.ts`** — the renderer-side lifecycle hook: starts a logger session and, critically, calls `window.api.logger.stop(sessionId)` unconditionally in its `useEffect` cleanup, so navigating away from `/record` or `/open` always stops the underlying `logger.exe` process. `RecordPage`/`OpenPage` consume this hook rather than talking to the logger directly.
- **`useNameIndices.ts`** — shared player-one/player-two/guild index-swap logic used by both `Logger.tsx` and `LogEditor.tsx`.
- **`logger-status.ts`** — runs the logger in `status` mode once and parses known status strings out of stdout into a `LoggerStatus` object.
- **`history-store.ts`** — Zustand store (`useHistoryStore`) for session history; see §3.5.
- **`util.ts`** — small helpers, including `mostFrequent()` used to compute the session recap's top guild/enemy.
- **`drawTimeline.ts` / `demoGenerator.ts`** — canvas timeline rendering and synthetic demo data for `DemoPage`.

### 3.4 Config wizard (`src/renderer/src/components/create-config/`)
Because BDO's packet layout changes after weekly maintenance, the app doesn't just consume `config.ini` — it can **reverse-engineer a new one at runtime**:
- `Logger.tsx` accumulates every parsed candidate log line during a live "analyze" session, tallies which byte offsets repeatedly contain valid-looking player/guild names (regex-validated) and a stable kill/death flag position, and ranks candidates by frequency.
- `ConfigModal.tsx` lets the user manually override which detected offset maps to player-one/player-two/guild/kill if auto-detection guesses wrong, and can copy a ready-to-paste `config.ini` block to the clipboard.
- `config-store.ts` is a Zustand store backed by the `config:get`/`config:set` IPC channels — `RecordPage`/`Logger`/`OpenPage`/`SettingsPage` all read/write the same config through it instead of fetching independently. The `config.ini` on disk is only ever read by the Python side; the two stores are deliberately not auto-synced (see §5.3).

### 3.5 Session history & stats leaderboards
- **`logic/history-store.ts`** — `HistoryEntry{id, date, kills, deaths, kdr, topGuild, topEnemy, logText}`, persisted through `window.api.config.get/set` under the `sessionHistory` key (i.e. through the main process's JSON store, not browser storage). Capped at the 7 most recent entries; `Logger.tsx`/`LogEditor.tsx` add an entry whenever a session's logs are saved.
- **`components/ui/GuildStats.tsx`** / **`EnemyStats.tsx`** — pure derived-state ranked-list components (numbered chips + progress bars) recomputed from the live `logs` array: `GuildStats` groups by enemy guild and ranks by distinct member count, `EnemyStats` ranks individual enemies by raw encounter count.

### 3.6 Native integration surface
`client/src/shared/ipc-contract.ts` defines the full typed `IpcApi` surface exposed at `window.api` by `client/src/preload/index.ts`, and is the security boundary between the sandboxed renderer (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`) and the Node-capable main process:

| Domain | Channels |
|---|---|
| Logger | `logger:start`, `logger:stop` (+ push `logger:event`) |
| Dialogs | `dialog:openFile`, `dialog:saveFile` |
| FS | `fs:readTextFile` (extension-allowlisted to `.log`/`.txt`), `fs:writeFile` |
| Clipboard | `clipboard:writeText` |
| Config | `config:get`, `config:set` |
| Updater | `updater:check`, `updater:download` (+ push `updater:event`) |
| App | `app:getVersion`, `app:exit` |
| Shell | `shell:openExternal` (rejects non-`http(s)` URLs) |

## 4. Backend (`logger/`)

**Stack**: Python 3 + Scapy (packet capture/parsing), compiled to `logger.exe` via PyInstaller (`logger.spec`), driven entirely by CLI flags — there is no long-lived RPC server, only start/stop of short-lived subprocesses whose stdout is treated as an event stream. **Unchanged by the Electron migration.**

### 4.1 CLI surface (`logger.py`)
Argparse-based entry point dispatching to one mode:

| Flag | Module | Purpose |
|---|---|---|
| *(none)* | `options/sniff.py` | Live sniff using the fixed-offset `parser.py`, writes matches to a `.log` file |
| `-r/--record` | `options/record.py` | Live sniff, writes matching raw packets to a `.pcap` (backup capture, no parsing) |
| `-a/--analyze` | `options/analyze.py` | Live or offline (`-f`) sniff using **regex-based, offset-agnostic** parsing; prints structured CSV-like lines to stdout for the frontend's auto-config wizard |
| `-f/--file` (without `-a`) | `options/open.py` | Parses a `.pcap`/`.pcapng` file with the fixed-offset parser |
| `-s/--status` | `options/status_check.py` | Reports Npcap driver presence and config freshness |
| `-u/--update` | `options/update_config.py` | Downloads a fresh `config.ini` from GitHub |

Only one mode runs per invocation; the main process's `LoggerProcessManager` always spawns a fresh process per session and only ever keeps one alive at a time.

### 4.2 Config (`src/config.py`)
Loads `config.ini` (`GENERAL.patch`, `IP.*` server ranges, `PACKAGE.*` byte offsets) into a module-level singleton (`config.config`) initialized once at startup via `config.init()`. If `[PACKAGE]` is missing, the config is flagged `invalid` and downstream commands degrade gracefully (status reporting, no crash).

### 4.3 Parsing strategies — two independent implementations
- **`src/parser.py`** (used by `sniff`/`record`/`open`): fast path assuming the current `config.ini` byte offsets are correct. Filters packets by known BDO server IPs, buffers partial TCP payloads across packets (`last_payload`), and slices out player/guild names and the kill/death flag at fixed offsets. This is what real recording sessions use once a working config exists.
- **`src/options/analyze.py`**: offset-agnostic path used for **both** the "analyze a live network" and "figure out this patch's new offsets" flows. It regex-scans the raw payload for the packet identifier pattern, extracts every 64-byte-aligned string that matches a plausible name pattern, and only accepts a match when exactly 5 valid names are found in a 600-byte window — then prints them as CSV for the frontend's offset-voting logic (§3.4) to consume. This module intentionally hardcodes a broader/duplicated set of BDO server IPs distinct from `config.ini`, since it's meant to work without a valid config.

### 4.4 Process lifecycle
Because BDO packet offsets drift after each patch, the backend has no persistent state beyond the current process's stdout stream — every "session" (record, open, analyze) is a fresh `logger.exe` invocation, and results are only as durable as what the frontend chooses to write to a `.log` file (or, since the Electron migration, also mirrors into session history — see §3.5).

## 5. Data Flow

### 5.1 Live recording
```
BDO game traffic → Npcap → scapy sniff() → parser/analyze package_handler()
   → stdout line (CSV: identifier,time,name1 off,...,name5 off,hex)
   → node:readline line-buffering in LoggerProcessManager
   → "logger:event" IPC push → useLoggerSession() → RecordPage state
   → Logger.tsx renders rows + auto-detects offsets → user corrects names
     via dropdowns → Save → .log file written via `fs:writeFile` IPC
     + a summary entry added to session history → user uploads to
     nodewar.gg manually
```

### 5.2 Opening an existing file
- `.log`/`.txt`: parsed entirely client-side with `LOG_REGEX` in `OpenPage.tsx` — no Python process involved.
- `.pcap`/`.pcapng`: re-spawns `logger.exe -a -f <path>` (offline analyze) via `useLoggerSession`, streaming results the same way as live recording.

### 5.3 Config lifecycle
`config.ini` on disk (read only by Python) and the renderer's config Zustand store (backed by the main process's `store.json`, read/written via `config:get`/`config:set`) are **two separate stores that are not automatically synced** — the wizard's "copy to clipboard" flow is the deliberate hand-off point: the user pastes the generated block into `config.ini` themselves (or the app can fetch a community-maintained one via `-u`/`update_config.py` from the GitHub repo).

## 6. Packaging, Distribution & Update Mechanism

- **Build targets** (`client/electron.vite.config.ts`): three separate Vite builds — `main`, `preload`, `renderer` — bundled into `out/`.
- **Packaging** (`client/electron-builder.yml`): `electron-builder` packages `out/**/*` plus `extraResources` — the PyInstaller-built Python logger, a single onefile executable (`../logger/dist/logger.exe → logger/logger.exe`) and the Npcap installer (`../dependencies → dependencies`, filtered to `npcap-*.exe`). Windows targets: `nsis` (a wizard-style installer — directory picker, admin elevation via `allowElevation`, desktop shortcut) and `dir` (unpacked, for local testing). Npcap's bundled installer is run without `/S` (free Npcap doesn't support silent install, only Npcap OEM does) via an NSIS `include` macro (`build/installer.nsh`), which skips it entirely if the driver is already present. An `afterPack` hook (`build/afterPack.js`) strips all Chromium locale `.pak` files except `en-US`, since the app's own UI strings are handled by i18next, not Chromium's browser-chrome locale.
- **Update mechanism**: `electron-updater`, wired in `client/src/main/updater.ts` with `autoDownload = false` and `autoInstallOnAppQuit = false` — fully user-initiated, never silent. The main process checks once on startup and pushes `checking-for-update` / `update-available` / `update-not-available` / `download-progress` / `update-downloaded` / `error` events to the renderer over `updater:event`; the Header's update button triggers the actual download, and `quitAndInstall()` fires automatically once the download completes. This reads `latest.yml`, which `electron-builder` generates and which `release.yml` uploads alongside the installer.
- **Versioning & releases**: fully automated via `semantic-release` (`client/release.config.js`), gated on Conventional Commits. Plugin order: `commit-analyzer` → `release-notes-generator` → `changelog` → `npm` (bumps `package.json`, no publish) → `exec` (`npm run build:win`, so the installer and `latest.yml` are built *after* the version bump) → `git` (commits `package.json`/`CHANGELOG.md` back to `main`) → `github` (creates the GitHub Release, uploads the installer `.exe` and `latest.yml` as assets).
- **CI** (`.github/workflows/`):
  - `release.yml` (Windows runner, triggers on push to `main`): downloads Npcap, builds the Python logger via PyInstaller, installs frontend deps, then runs `npx semantic-release` — a single step that bumps the version, builds the installer, and publishes the GitHub Release with assets attached.
  - `build-installer.yml` (Windows runner, triggers on PRs to `main` + manual dispatch): same native/Python build steps, but only builds the installer and uploads it as a workflow artifact — it does **not** create a release or touch versioning, keeping PR verification separate from the release pipeline.

## 7. Key Architectural Characteristics

- **Patch fragility is a first-class concern.** BDO changes packet layouts on weekly maintenance, so the system is built around *two* parsers (fixed-offset for speed, regex-based for resilience/discovery) and a client-side wizard for regenerating config without waiting on a repo update.
- **No backend server / no persistent daemon.** All "backend" behavior is a short-lived local subprocess driven by CLI flags and read via stdout — the architecture is closer to a CLI tool with a GUI frontend than a client-server app.
- **Passive-only network access.** The Python side only reads (`scapy.sniff`/`rdpcap`); it never sends packets into the game, which is the basis of the project's "this won't get you banned like Wireshark wouldn't" positioning (see README FAQ).
- **Two disjoint config stores by design**: `config.ini` (Python, disk) vs. the main process's JSON store (React, app-local key/value via IPC) — kept separate so the wizard can propose changes without silently mutating the file the packaged logger reads.
- **Process lifecycle is owned at the hook level, not the page level.** `useLoggerSession()`'s cleanup unconditionally stops the logger on unmount, so every consumer (`RecordPage`, `OpenPage`) gets correct capture-stops-on-navigate behavior by construction rather than by convention.
- **No shell involved in native process spawning.** `LoggerProcessManager` always calls `child_process.spawn` with an argv array, never a shell string — user-influenced values (like file paths from `OpenPage`) are passed as discrete argv entries, not interpolated into a command line.
- **Update and distribution are unified around a single release cadence**: unlike a split "lightweight auto-update channel" vs. "full native build" model, every release is a single semantic-release run — version bump, native build (Python + Electron), and GitHub Release publish all happen atomically off Conventional Commits on `main`.
