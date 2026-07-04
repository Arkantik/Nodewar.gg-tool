# 🛠️ Building From Source - BDO Combat Logger

This is the FASTEST way to create a complete installer for your application.

> Looking for how to *use* the app instead? See the [Quick Start Guide](QUICKSTART.md).

## ⚡ Super Quick Start (3 Steps)

### 1️⃣ Run Setup Wizard

Double-click: **`setup-wizard.bat`**

### 2️⃣ Follow the Menu

- First time? Choose **Option 1** (Check Prerequisites)
- Then choose **Option 3** (Build Application), then **Option 4** (Create Installer)

### 3️⃣ Done!

Your installer will be at: `client\dist\bdo-combat-installer-v<version>.exe`

---

## 📋 What You Need (One-Time Install)

Before building for the first time, install these:

1. **Python** - https://www.python.org/downloads/
   - ✅ Check "Add Python to PATH"
2. **Node.js** - https://nodejs.org/
   - ✅ Just install normally

No separate installer tool is needed - `electron-builder` bundles everything required to package the Windows installer.

**Run `check-prerequisites.bat` to verify everything is installed correctly.**

---

## 🎯 Usage Scenarios

### First Time Building Everything

```batch
setup-wizard.bat
→ Choose 1 (Check Prerequisites)
→ Choose 2 (Download Npcap) [Optional but recommended]
→ Choose 3 (Build Application)
→ Choose 4 (Create Installer)
```

### Quick Rebuild (After Code Changes)

```batch
setup-wizard.bat
→ Choose 3 (Build Application)
→ Choose 4 (Create Installer)
```

### Only Need the App (No Installer)

```batch
setup-wizard.bat
→ Choose 3 (Build Application)
```

The unpacked app will be at `client\dist\win-unpacked\bdo-combat-logger-win_x64.exe`.

### Already Built, Just Need Installer

```batch
setup-wizard.bat
→ Choose 4 (Create Installer)
```

### Start Fresh

```batch
setup-wizard.bat
→ Choose 5 (Clean Build)
→ Choose 3 (Build Application)
→ Choose 4 (Create Installer)
```

---

## 📁 File Structure

After a successful build:

```
root_folder/
├── client/
│   ├── out/                 (compiled main/preload/renderer)
│   └── dist/
│       ├── win-unpacked/
│       │   └── bdo-combat-logger-win_x64.exe
│       └── bdo-combat-installer-v1.13.3.exe
├── dependencies/
│   └── npcap-1.87.exe
└── setup-wizard.bat
```

---

## ⏱️ Build Times

Typical build times on a modern PC:

- **First build**: 5-10 minutes (downloads dependencies)
- **Subsequent builds**: 2-5 minutes
- **Installer creation**: 30 seconds

---

## 🎁 What Users Get

When you distribute `bdo-combat-installer-v<version>.exe`, users:

1. ✅ Download ONE file
2. ✅ Run the installer (as admin)
3. ✅ Click "Next" a few times
4. ✅ App is ready to use!

**No Python, no Node.js, no build tools needed!**

---

## 🔧 Troubleshooting

### Build Fails?

1. Run `check-prerequisites.bat`
2. Make sure all items show [OK]
3. Try `setup-wizard.bat` → Option 5 (Clean) → Option 3 (Build) → Option 4 (Installer)

### Installer Won't Create?

- Check that `client\out\main\index.js` exists (run Option 3 first)
- Try creating manually: `setup-wizard.bat` → Option 4

### Npcap Download Fails?

- Download manually: https://npcap.com/dist/npcap-1.87.exe
- Place in `dependencies/` folder
- Continue with build

---

## 📞 Need Help?

- **Discord**: https://discord.gg/CUc38nKyDU
- **GitHub Issues**: https://github.com/Arkantik/Nodewar.gg-tool/issues

---
