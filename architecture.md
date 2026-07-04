# BDO Combat Logger — Architecture

## 1. Overview

BDO Combat Logger ("ikusa_logger") is a Windows desktop application that passively sniffs Black Desert Online's network traffic to capture PvP kill/death events (Node Wars, Sieges, War of the Roses), lets the user correct player/guild name ordering, and exports a `.log` file for upload to the companion website [nodewar.gg](https://nodewar.gg).

The app is a **hybrid two-process system**:

- A **Neutralino.js desktop shell** (Chromium-based webview) hosting a **React 19 + TypeScript** UI.
- A **Python packet-sniffing backend**, compiled to a standalone executable (`logger.exe` via PyInstaller), spawned as a child process by the shell and communicating over stdout/stderr line streams.

There is no client/server network architecture in the traditional sense — "client" here means the local UI process, not a network client of a remote API. The only outbound network calls are to raw.githubusercontent.com (config/version files) and BDO's own game servers (passively observed, never written to).

```
┌─────────────────────────────────────────────────────────────┐
│  Neutralino Shell (bdo-combat-logger-win_x64.exe)            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Chromium WebView                                     │   │
│  │  React 19 + TypeScript UI (client/src)                │   │
│  │   - Routes: Home / Record / Open / Demo / Settings /  │   │
│  │             Docs                                      │   │
│  │   - Zustand modal store, i18next translations         │   │
│  └───────────────────┬────────────────────────────────────┘  │
│                       │ @neutralinojs/lib (os.spawnProcess,   │
│                       │ events, filesystem, storage, updater) │
└───────────────────────┼───────────────────────────────────────┘
                        │ stdin/stdout/stderr (line-based)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  logger.exe (PyInstaller build of logger/)                   │
│   - scapy packet capture (Npcap driver)                      │
│   - CLI modes: sniff / record / analyze / open / status /    │
│                update-config                                 │
│   - config.ini: per-patch byte offsets for name/guild/kill   │
└─────────────────────────────────────────────────────────────┘
```

## 2. Repository Layout

```
combat-logger/
├── client/                  React/TS frontend (Neutralino webview app)
│   └── src/
│       ├── routes/          Page-level views (one per app screen)
│       ├── components/      Reusable UI, config wizard, modal system
│       ├── logic/           Neutralino/OS integration + parsing helpers
│       ├── i18n/             Localization (en, de, es, fr)
│       └── app.tsx, main.tsx  App bootstrap, router, window lifecycle
├── logger/                  Python packet-sniffing backend
│   ├── logger.py             CLI entry point (argparse)
│   ├── logger.spec           PyInstaller build spec
│   └── src/
│       ├── config.py         Reads config.ini into a Config object
│       ├── parser.py         Production packet parser (fixed offsets)
│       └── options/          One module per CLI mode (sniff/record/open/
│                              analyze/status_check/update_config)
├── config.ini               Byte-offset config for the current BDO patch
├── neutralino.config.json   Neutralino app manifest (window, native API allowlist)
├── version/                 Auto-update manifest + packaged resources.neu
├── update.bat               Self-update script run by the shell
├── installer-full.iss       Inno Setup installer definition
├── build.bat                Local full-stack build script
└── .github/workflows/       CI: build-installer.yml, deploy.yml
```

## 3. Frontend (client/)

**Stack**: React 19, TypeScript, Vite 7, Tailwind CSS 4, React Router 7 (`HashRouter`, required because Neutralino serves from a local file/embedded server), Zustand (modal state), react-i18next, react-window (virtualized log lists), react-select.

### 3.1 App shell (`app.tsx`, `main.tsx`)
- Waits for Neutralino's `ready` event before rendering (`init()` from `@neutralinojs/lib`).
- Registers a `windowClose` handler that force-kills any lingering `logger.exe` process (`taskkill /F /IM logger.exe`) before calling `app.exit()` — necessary because the Python sniffer is a detached child process that doesn't die automatically with the parent window.
- Routes: `/` (Home), `/record`, `/open`, `/demo`, `/settings`, `/docs`.

### 3.2 Routes (`src/routes/`)
- **HomePage** — dashboard: runs `check_status()` against the logger to show Npcap/config health, and provides navigation cards + social links.
- **RecordPage** — live capture flow. Starts the logger in `analyze` mode, streams parsed rows in via the process callback, auto-detects the most likely name/guild/kill byte offsets (crowd-sourced from observed packets, see §3.3), and renders live stats (kills/deaths/KDR) and a timeline.
- **OpenPage** — two input paths: a saved `.log`/`.txt` file (parsed client-side via `LOG_REGEX`) or a raw `.pcap`/`.pcapng` capture (re-uses the logger process in `analyze -f <file>` mode).
- **SettingsPage** — toggles `all_interfaces` sniffing and displays current config (patch date, identifier, auto-scroll) persisted via Neutralino `storage`.
- **DemoPage / DocsPage** — self-contained demo data generator and documentation view.

### 3.3 Core logic (`src/logic/`)
- **logger-wrapper.ts** — the single integration point with the native process API:
  - Force-kills any previous `logger.exe` (`taskkill`) before spawning a new one, since only one capture session should run at a time.
  - Maps a small set of logical actions (`sniff`, `open_file`, `status`, `update`, `record`, `analyze`) to CLI flags and calls `os.spawnProcess`.
  - Subscribes to Neutralino's `spawnedProcess` event and forwards `stdOut`/`stdErr`/`exit` to a caller-supplied callback, tagged with a `running | terminated | error` status.
- **logger-status.ts** — runs the logger in `status` mode once, parses known status strings out of stdout (Npcap installed?, config valid?, config age) into a `LoggerStatus` object using a promise that resolves on process exit.
- **file.ts** — thin wrappers around `os.showOpenDialog` / `os.showSaveDialog`.
- **util.ts** — small helpers (e.g. `find_all_indicies` used by the offset auto-detection in `Logger.tsx`).
- **drawTimeline.ts / demoGenerator.ts** — canvas timeline rendering and synthetic demo data for `DemoPage`.

### 3.4 Config wizard (`src/components/create-config/`)
This is the most novel piece of client-side logic: because BDO's packet layout changes after weekly maintenance, the app doesn't just consume `config.ini` — it can **reverse-engineer a new one at runtime**:
- `Logger.tsx` accumulates every parsed candidate log line during a live "analyze" session, tallies which byte offsets repeatedly contain valid-looking player/guild names (regex-validated) and a stable kill/death flag position, and ranks candidates by frequency (`calculateConfig`, `findKillOffset`).
- `ConfigModal.tsx` lets the user manually override which detected offset maps to player-one/player-two/guild/kill if auto-detection guesses wrong, and can copy a ready-to-paste `config.ini` block to the clipboard (`config.ts#stringify_config`).
- `config.ts` centralizes the `Config`/`LogType`/`Log` types and persists the working config via Neutralino `storage` (`get_config`/`update_config`), not the filesystem — the `config.ini` on disk is only read by the Python side.

### 3.5 Native integration surface
`neutralino.config.json` explicitly allowlists the native APIs the webview may call (`nativeAllowList`): process spawn/kill/exec, file dialogs, file read/write, clipboard, key/value storage, and the built-in updater. This is the security boundary between the sandboxed webview and the OS.

## 4. Backend (logger/)

**Stack**: Python 3 + Scapy (packet capture/parsing), compiled to `logger.exe` via PyInstaller (`logger.spec`), driven entirely by CLI flags — there is no long-lived RPC server, only start/stop of short-lived subprocesses whose stdout is treated as an event stream.

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

Only one mode runs per invocation; `logger-wrapper.ts` on the frontend always spawns a fresh process per action.

### 4.2 Config (`src/config.py`)
Loads `config.ini` (`GENERAL.patch`, `IP.*` server ranges, `PACKAGE.*` byte offsets) into a module-level singleton (`config.config`) initialized once at startup via `config.init()`. If `[PACKAGE]` is missing, the config is flagged `invalid` and downstream commands degrade gracefully (status reporting, no crash).

### 4.3 Parsing strategies — two independent implementations
- **`src/parser.py`** (used by `sniff`/`record`/`open`): fast path assuming the current `config.ini` byte offsets are correct. Filters packets by known BDO server IPs, buffers partial TCP payloads across packets (`last_payload`), and slices out player/guild names and the kill/death flag at fixed offsets. This is what real recording sessions use once a working config exists.
- **`src/options/analyze.py`**: offset-agnostic path used for **both** the "analyze a live network" and "figure out this patch's new offsets" flows. It regex-scans the raw payload for the packet identifier pattern, extracts every 64-byte-aligned string that matches a plausible name pattern, and only accepts a match when exactly 5 valid names are found in a 600-byte window — then prints them as CSV for the frontend's offset-voting logic (§3.4) to consume. This module intentionally hardcodes a broader/duplicated set of BDO server IPs distinct from `config.ini`, since it's meant to work without a valid config.

### 4.4 Process lifecycle
Because BDO packet offsets drift after each patch, the backend has no persistent state beyond the current process's stdout stream — every "session" (record, open, analyze) is a fresh `logger.exe` invocation, and results are only as durable as what the frontend chooses to write to a `.log` file.

## 5. Data Flow

### 5.1 Live recording
```
BDO game traffic → Npcap → scapy sniff() → parser/analyze package_handler()
   → stdout line (CSV: identifier,time,name1 off,...,name5 off,hex)
   → Neutralino `spawnedProcess` event → logger-wrapper.ts callback
   → RecordPage state (LogType[]) → Logger.tsx renders rows + auto-detects
     offsets → user corrects names via dropdowns → Save → .log file written
     via `filesystem.writeFile` → user uploads to nodewar.gg manually
```

### 5.2 Opening an existing file
- `.log`/`.txt`: parsed entirely client-side with `LOG_REGEX` in `OpenPage.tsx` — no Python process involved.
- `.pcap`/`.pcapng`: re-spawns `logger.exe -a -f <path>` (offline analyze) and streams results the same way as live recording.

### 5.3 Config lifecycle
`config.ini` on disk (read only by Python) and the `Config` object in Neutralino `storage` (read/written by React) are **two separate stores that are not automatically synced** — the wizard's "copy to clipboard" flow is the deliberate hand-off point: the user pastes the generated block into `config.ini` themselves (or the app can fetch a community-maintained one via `-u`/`update_config.py` from the GitHub repo).

## 6. Packaging, Distribution & Update Mechanism

- **Local build** (`build.bat`): builds the Python logger with PyInstaller → copies it into `dist/bdo-combat-logger/logger/` → `npm install` + Neutralino CLI (`neu update && neu build`) builds/bundles the frontend into the same `dist/` tree → copies `update.bat` and `resources.neu` (Neutralino's packaged webview payload) into place and into `version/` for the update channel.
- **Installer** (`installer-full.iss`, Inno Setup): packages the built `.exe`, `resources.neu`, `update.bat`, icons, and the full `logger/` folder; silently installs Npcap if `npcap.sys` isn't already present; requires admin privileges (needed for raw packet capture).
- **CI** (`.github/workflows/`):
  - `build-installer.yml` (Windows runner): full pipeline — builds the Python exe, frontend, Neutralino app, and Inno Setup installer; uploads artifacts and, on version tags, publishes a GitHub Release with both the installer and the standalone exe.
  - `deploy.yml` (Ubuntu runner): builds only the frontend/Neutralino bundle and pushes the updated `resources.neu` + `version/version-manifest.json` back to `main` — this is what the in-app updater polls.
- **In-app self-update** (`Header.tsx` + `update.bat`): on load, fetches `version/version-manifest.json` from `raw.githubusercontent.com`; if the version differs from the running `NL_APPVERSION`, shows an "update available" button that shells out to `update.bat <version>`, which downloads the new exe + `resources.neu` from the matching GitHub Release/branch, swaps files (with a `.backup` fallback if the copy fails), and relaunches the app.

## 7. Key Architectural Characteristics

- **Patch fragility is a first-class concern.** BDO changes packet layouts on weekly maintenance, so the system is built around *two* parsers (fixed-offset for speed, regex-based for resilience/discovery) and a client-side wizard for regenerating config without waiting on a repo update.
- **No backend server / no persistent daemon.** All "backend" behavior is a short-lived local subprocess driven by CLI flags and read via stdout — the architecture is closer to a CLI tool with a GUI frontend than a client-server app.
- **Passive-only network access.** The Python side only reads (`scapy.sniff`/`rdpcap`); it never sends packets into the game, which is the basis of the project's "this won't get you banned like Wireshark wouldn't" positioning (see README FAQ).
- **Two disjoint config stores by design**: `config.ini` (Python, disk) vs. Neutralino `storage` (React, app-local key/value) — kept separate so the wizard can propose changes without silently mutating the file the packaged logger reads.
- **Update and distribution are decoupled from the game-logic release cadence**: `deploy.yml` (frontend-only, auto-runs on every push to `main`) feeds the lightweight in-app updater, while `build-installer.yml` (full native build) is reserved for tagged releases — recognizing that UI/i18n fixes ship far more often than logger binary changes.
