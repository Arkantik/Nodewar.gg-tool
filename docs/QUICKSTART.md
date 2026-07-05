# 🚀 Quick Start Guide - BDO Combat Logger

Get up and running in under 5 minutes.

> Building the app from source instead? See [BUILDING.md](BUILDING.md).

## 1️⃣ Install

### Windows

1. Download the latest `.exe` installer from the [Releases page](https://github.com/Arkantik/Nodewar.gg-tool/releases/latest)
2. **Right-click** `bdo-combat-installer.exe` and select **Run as administrator**
3. If Windows SmartScreen warns you, click **More info** → **Run anyway** (expected for unsigned open-source apps - see the [README](../README.md#-installation) for why)
4. Follow the installer - it also installs the Npcap driver for you, so there's nothing else to set up

### Linux

1. Download the latest `.AppImage` from the [Releases page](https://github.com/Arkantik/Nodewar.gg-tool/releases/latest)
2. Make it executable and run it: `chmod +x bdo-combat-installer-*.AppImage && ./bdo-combat-installer-*.AppImage`
3. Grant the bundled logger permission to capture packets once (there's no Npcap
   driver on Linux - it uses libpcap directly, gated by the `cap_net_raw`
   capability): the home screen's status card will say "Capture Permission" is
   missing until you run
   `sudo setcap cap_net_raw+eip <path-to-logger>` (see [BUILDING.md](BUILDING.md#-building-on-linux)
   for how to locate the extracted path)

## 2️⃣ Record Your First Session

1. Launch **BDO Combat Logger** and make sure Black Desert Online is running
2. Click **Record** in the sidebar
3. Take part in a Node War, Siege, or War of the Roses
4. Click **Stop Recording** when you're done - you'll get a quick recap (kills, deaths, K/D, top guild and enemy you fought)

## 3️⃣ Fix Names & Save

1. Use the dropdowns on each row so the log reads: **YourGuild-FamilyName killed/died to Enemy-FamilyName from Guild**
2. Click **Save Logs** to export a `.log` file - this also adds the session to **History**, so you can grab the file again later if you lose it
3. Click **Upload to NodewarGG** to open your [nodewar.gg](https://nodewar.gg/account) account and upload the file for detailed stats

## 📚 Want More?

- Full feature list, troubleshooting, and FAQ: see the [README](../README.md)
- Past sessions, re-downloading a `.log`, or deleting one: open **History** in the sidebar
- Questions? Join [Discord](https://discord.gg/CUc38nKyDU) or open a [GitHub issue](https://github.com/Arkantik/Nodewar.gg-tool/issues)
