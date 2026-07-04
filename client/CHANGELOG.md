# 1.0.0 (2026-07-04)


* feat!: migrate to Electron with typed IPC, new UI, and session history ([292115c](https://github.com/Arkantik/Nodewar.gg-tool/commit/292115c8c8b0397b748a9f23a169d5f793df9f09))


### BREAKING CHANGES

* Replaces the Neutralino.js runtime with Electron. The app now uses a typed IPC contract instead of the nativeAllowList, electron-updater/electron-builder instead of the hand-rolled updater and Inno Setup installer, and a new sidebar-based UI (replacing the home-screen action tiles) with session history and recap features.
