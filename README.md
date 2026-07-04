# BDO Combat Logger

[![Version][version-shield]][version-url]
[![Commit][commit-shield]][commit-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<p align="center">
 A powerful tool for Black Desert Online that captures and logs combat messages during PvP activities such as Node Wars, Sieges, and War of the Roses.
 <br />
 <br />
 <a href="https://github.com/Arkantik/Nodewar.gg-tool/issues">Report Bug</a>
 ·
 <a href="https://github.com/Arkantik/Nodewar.gg-tool/issues">Request Feature</a>
</p>

> New here? The [Quick Start Guide](docs/QUICKSTART.md) gets you installed and recording your first session in under 5 minutes.

## 📋 Table of Contents

- [✨ Features](#-features)
- [📥 Installation](#-installation)
  - [Method 1: Installer (Recommended)](#method-1-installer-recommended)
  - [Method 2: Manual Build](#method-2-manual-build)
- [🎮 Usage](#-usage)
- [📊 Visualizing Your Logs](#-visualizing-your-logs)
- [❗ Troubleshooting](#-troubleshooting)
- [🤔 FAQ](#-faq)
- [💬 Need Help?](#-need-help)
- [👥 Credits](#-credits)
- [📝 Notes for Advanced Users](#-notes-for-advanced-users)

## ✨ Features

- **Real-time Combat Logging**: Automatically captures kill and death messages during PvP
- **Network Recording**: Option to record network traffic as backup
- **File Analysis**: Analyze previously recorded `.pcap` files
- **Log Adjustment**: Manually adjust player names and guilds in logs before saving
- **Auto Format Detection**: Automatically formats logs for War of the Roses or Node Wars based on time
- **Web Visualization**: Upload logs directly to the visualization website

---

## 📥 Installation

### Method 1: Installer (Recommended)

This is the easiest way to install BDO Combat Logger. The installer handles everything automatically.

---

#### ⚠️ Windows Security Warning

When downloading and running `bdo-combat-installer.exe` for the first time, Windows Defender SmartScreen will display a security warning:

```
"Windows protected your PC - Microsoft Defender SmartScreen prevented an unrecognized app from starting"
```

#### ✅ This is Normal and Expected

This warning appears because the application is not code-signed with an expensive certificate ($300-500/year). **The application is completely safe** - all source code is publicly available on GitHub for review.

#### How to Run the Application

Follow these steps when you see the warning:

1. Click **"More info"** on the SmartScreen warning
2. Click **"Run anyway"** button that appears
3. The application will start normally

#### Why Does This Warning Appear?

* Code signing certificates cost $300-500 per year from Certificate Authorities
* As a free, open-source project, we don't have commercial funding for certificates
* Windows shows this warning for any unsigned application, regardless of safety
* Thousands of apps on GitHub have the same situation - it's standard for open-source software

#### What Does This Application Actually Do?

The BDO Combat Logger:

* ✅ **Only reads** network traffic (like Wireshark does)
* ✅ Does **NOT** modify game files
* ✅ Does **NOT** inject code into games
* ✅ Does **NOT** access sensitive data
* ✅ **All source code** is public and can be audited on GitHub

---

#### Step 1: Download the Installer

Go to the [Releases page](https://github.com/Arkantik/Nodewar.gg-tool/releases/latest) and download:
- **`bdo-combat-installer.exe`** (or the latest version)

#### Step 2: Run the Installer

1. **Right-click** the installer and select **"Run as administrator"**
2. If you see the Windows SmartScreen warning, follow the steps above to proceed
3. Follow the installation wizard
4. The installer will automatically:
   - ✅ Install the BDO Combat Logger application
   - ✅ Install Npcap driver (if not already installed)
   - ✅ Create desktop shortcuts (optional)
   - ✅ Add to Start Menu

#### Step 3: Launch the Application

After installation, you can launch BDO Combat Logger from:
- Desktop shortcut (if created during installation)
- Start Menu → BDO Combat Logger
- Installation folder: `C:\Program Files\BDO-combat-logger\bdo-combat-logger-win_x64.exe`

> [!Note]
> **No prerequisites needed!** The installer includes everything required to run the application. You don't need to install Python, Node.js, or manually download Npcap.

---

### Method 2: Manual Build

<details>

For advanced users or developers who want to build from source.

#### Prerequisites

Before building manually, you need:

**Required:**
- **[Npcap 1.7.8+](https://npcap.com/dist/)** - Network packet capture library
- **[Node.js 20+](https://nodejs.org/en/download/)** - JavaScript runtime
- **[Python 3+](https://www.python.org/downloads/)** - Programming language

**Optional:**
- **[Wireshark](https://www.wireshark.org/download.html)** - Network protocol analyzer (Useful for backup recordings)

> [!Warning]
> When installing Python, make sure to check the box that says **"Add Python to PATH"** during installation!

#### Step 1: Get the Project Files

Choose one of these methods:

**Method A: Clone with Git**

```bash
git clone https://github.com/Arkantik/ikusa_logger.git
cd ikusa_logger
```

**Method B: Download as ZIP**

1. Download the project: [bdo-combat-logger.zip](https://github.com/Arkantik/Nodewar.gg-tool/archive/refs/heads/main.zip)
2. Extract the ZIP file to a folder of your choice
3. Open the extracted folder

#### Step 2: Verify Prerequisites

Make sure you have installed:

- Node.js (Check by opening Command Prompt and typing: `node --version`)
- Python (Check by opening Command Prompt and typing: `python --version`)

#### Step 3: Build the Application

1. Locate the `build.bat` file in the project folder
2. **Double-click** `build.bat` to run it
3. If a command prompt window appears asking you to press any key, **press Enter**
4. Wait for the build process to complete (this may take several minutes)
5. When finished, you'll find:
   - A ready-to-share installer: `client\dist\bdo-combat-installer-v<version>.exe`
   - The unpacked app (no installer needed): `client\dist\win-unpacked\bdo-combat-logger-win_x64.exe`

> [!Note]
> The first build may take a few minutes as it downloads and installs all necessary dependencies.

</details>

---

## 🎮 Usage

<details>

### Starting the Logger

1. Launch `bdo-combat-logger-win_x64.exe` from:
   - Desktop shortcut (if using installer)
   - Installation folder: `C:\Program Files\BDO-combat-logger\` (installer)
   - Build folder: `client\dist\win-unpacked\` (manual build)
2. You'll see the sidebar navigation on the left with several sections (Record, Open File, History, Demo, Settings, Docs)

### Recording Combat Logs (Live)

1. Make sure Black Desert Online is running
2. Click **Record** in the sidebar
3. The logger will start capturing combat messages automatically
4. Engage in PvP activities (Node War, Siege, War of the Roses)
5. Click **Stop Recording** when you're finished - you'll see a session recap (kills, deaths, K/D ratio, top guild and enemy you fought)
6. The logs will be displayed in the interface, ready to adjust and save

### Adjusting Log Names

After recording or opening logs, you may need to adjust the player name order:

1. Review the captured logs in the interface
2. Use the dropdown menus to set the correct order:
   - **First dropdown**: Family Name 1 (players from your alliance)
   - **Second dropdown**: Family Name 2 (the other player)
   - **Third dropdown**: Guild Name
3. The format should read: **FamilyName-1 killed/died to FamilyName-2 from Guild**
4. Click **Save** to export your corrected logs

### Saving Your Logs

1. After adjusting names, click the **Save Logs** button
2. Choose a location and filename for your `.log` file
3. You can now upload this file to the visualization website
4. Saving also adds the session to **History**, so you can get the file again later even if you lose it

### Viewing Past Sessions

Click **History** in the sidebar to see your last 7 recorded sessions, each with its date, kills/deaths/K-D, and the top guild and enemy you fought. From there you can:

- **Download** the `.log` file again, for a session you already saved
- **Delete** a session you no longer need

### Opening Existing Files

The logger can open two types of files:

**Network Capture Files** (`.pcap`, `.pcapng`)

- These are raw network recordings
- The logger will extract combat messages from them
- Useful if you recorded with Wireshark as backup

**Log Files** (`.log`)

- Previously saved combat logs
- Can be opened to adjust names if needed
- Use this to fix mistakes in exported logs

To open a file:

1. Click **Open File** in the sidebar
2. Select your file
3. Adjust names if needed
4. Save the corrected version

</details>

---

## 📊 Visualizing Your Logs

After saving your logs, visualize them using the Nodewar website:

1. Log in to your account on [nodewar.gg](https://nodewar.gg/account)
2. Upload your `.log` file
3. View detailed statistics, graphs, and analysis of your combat performance

The website provides:

- Kill/Death ratios
- Performance over time
- Player and guild statistics
- Interactive charts and graphs

---

## ❗ Troubleshooting

<details>

### Startup Issues

**Problem**: Logger won't start or shows errors immediately

**Solutions**:

1. Check if Npcap is properly installed:
   - Open the logger
   - Check the status message on the home screen
   - If it says "Npcap is not installed", download and install from [npcap.com](https://npcap.com/dist/)
   - Or reinstall using the full installer

### "The system cannot find the path specified" Error

This error usually means Python is not added to your system PATH (only relevant for manual builds):

1. Follow this guide to add Python to PATH: [Python PATH Configuration Guide](https://www.pythoncentral.io/add-python-to-path-python-is-not-recognized-as-an-internal-or-external-command/)
2. After adding Python to PATH, restart your computer
3. Try building again

### No Logs Being Captured

1. **VPN or Software altering your network**: If you are using a VPN or any Software that alters your normal network, it will prevent the tool to pick up events during your record session.

2. **Config is outdated**: BDO changes its network structure after each weekly maintenance

   - Wait for a config update
   - Check the Discord for announcements
   - As a backup, use Wireshark to record the session, then analyze the `.pcap` file later

3. **Wrong network interface selected**:

   - Go to Settings
   - Try switching between "All" and "Default" network interfaces
   - Restart recording

4. **Firewall or antivirus blocking**:
   - Add an exception for the logger in your antivirus
   - Run the logger as Administrator

### Logs Have Wrong Names

1. In the log display, use the dropdown menus to reorder the names
2. The correct format is: **YourGuild-FamilyName killed/died to Enemy-FamilyName from Guild**
3. Save the corrected logs

### Can't Save Logs / Logs Not Found

1. Make sure you've adjusted the names correctly
2. Check that you have write permissions in the save location
3. Try saving to a different folder (like Documents)

</details>

---

## 🤔 FAQ

<details>

**Q: Is this tool safe to use?**  
A: Yes, the logger only reads network packets and doesn't modify or inject anything into the game.

**Q: Will I get banned for using this?**  
A: The tool operates similarly to Wireshark and only observes network traffic. However, use at your own discretion.

**Q: Why is the config outdated after maintenance?**  
A: BDO changes its network packet structure during weekly maintenance. The config needs to be updated to match these changes. Check Discord for updates.

**Q: Can I use this during any PvP activity?**  
A: Yes! It works during Node Wars, Sieges and GvG.

**Q: Can I edit logs after saving them?**  
A: Yes! Use the Open function to load your `.log` file, adjust the names, and save again.

**Q: What if I accidentally close the logger while recording?**  
A: A warning message should appear asking you to confirm. If you lose data, you can use your Wireshark recording as backup (if you made one).

**Q: Do I need to install Python and Node.js if I use the installer?**  
A: No! The installer method is completely standalone. You only need Python and Node.js if you're building from source manually.

</details>

---

## 💬 Need Help?

If you're experiencing issues or have questions:

- **Discord**: Join our community server: [discord.gg/CUc38nKyDU](https://discord.gg/CUc38nKyDU)
- **GitHub Issues**: Report bugs on the [Issues page](https://github.com/Arkantik/Nodewar.gg-tool/issues)

When asking for help, please provide:

1. Your Windows version
2. Installation method used (installer or manual build)
3. The exact error message (if any)
4. What you were doing when the problem occurred
5. Screenshots if possible

---

## 👥 Credits

- **Original Creator**: ORACLE (sch-28)
- **Current Maintainer**: ArkantiK
- **Visualization Website**: [Nodewar.gg](https://nodewar.gg/)

---

## 📝 Notes for Advanced Users

<details>

### Manual Config Updates

If you need to update the config manually:

1. The config file is `config.ini` in the application folder
2. You can edit it with any text editor
3. The main values to update after BDO patches are:
   - `identifier`: Package identifier in hex
   - `guild`: Offset for guild name
   - `player_one`: Offset for first player name
   - `player_two`: Offset for second player name
   - `kill`: Offset for kill/death flag

### Building Your Own Installer

If you want to create the installer yourself:

1. Follow the manual build steps first
2. Run `setup-wizard.bat` and choose option 3 (Build Application), then option 4 (Create Installer)
   - No separate Inno Setup install needed - `electron-builder` bundles everything it needs automatically
3. The installer will be created in the `client\dist` folder

See [docs/BUILDING.md](docs/BUILDING.md) for the full build guide, including troubleshooting and typical build times.

</details>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[version-shield]: https://img.shields.io/github/v/release/Arkantik/Nodewar.gg-tool.svg?style=for-the-badge
[version-url]: https://github.com/Arkantik/Nodewar.gg-tool/releases
[commit-shield]: https://img.shields.io/github/last-commit/Arkantik/Nodewar.gg-tool.svg?style=for-the-badge
[commit-url]: https://github.com/Arkantik/Nodewar.gg-tool/commits/main/
[contributors-shield]: https://img.shields.io/github/contributors/Arkantik/Nodewar.gg-tool.svg?style=for-the-badge
[contributors-url]: https://github.com/Arkantik/Nodewar.gg-tool/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/Arkantik/Nodewar.gg-tool.svg?style=for-the-badge
[forks-url]: https://github.com/Arkantik/Nodewar.gg-tool/network/members
[stars-shield]: https://img.shields.io/github/stars/Arkantik/Nodewar.gg-tool.svg?style=for-the-badge
[stars-url]: https://github.com/Arkantik/Nodewar.gg-tool/stargazers
[issues-shield]: https://img.shields.io/github/issues/Arkantik/Nodewar.gg-tool.svg?style=for-the-badge
[issues-url]: https://github.com/Arkantik/Nodewar.gg-tool/issues
[license-shield]: https://img.shields.io/github/license/Arkantik/Nodewar.gg-tool.svg?style=for-the-badge
[license-url]: https://github.com/Arkantik/Nodewar.gg-tool/blob/main/LICENSE.txt

---
