# [1.1.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.0.2...v1.1.0) (2026-07-05)


### Features

* Add Linux AppImage build and release ([cc1875c](https://github.com/Arkantik/Nodewar.gg-tool/commit/cc1875cc30491f11fe6c5d8e51ef0da9f3197f33))
* **home:** add welcome and last session UI ([84de4af](https://github.com/Arkantik/Nodewar.gg-tool/commit/84de4af2849690a1ef912d6d6f36fef692fe4798))
* **ui:** implement global system status indicator ([ec98548](https://github.com/Arkantik/Nodewar.gg-tool/commit/ec98548758555173c28409b83035374cb4496e7c))

## [1.0.2](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.0.1...v1.0.2) (2026-07-05)


### Bug Fixes

* Resolve installer and asset loading issues ([96b43e1](https://github.com/Arkantik/Nodewar.gg-tool/commit/96b43e11bfe2f099e5d4e2e601beee96c2979cbc))

## [1.0.1](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.0.0...v1.0.1) (2026-07-05)


### Bug Fixes

* Improve UI layering and translation hook usage ([b86d073](https://github.com/Arkantik/Nodewar.gg-tool/commit/b86d0733100f308dbdd513c72b3aaec302cc7fc0))

# 1.0.0 (2026-07-04)


* feat!: migrate to Electron with typed IPC, new UI, and session history ([292115c](https://github.com/Arkantik/Nodewar.gg-tool/commit/292115c8c8b0397b748a9f23a169d5f793df9f09))


### BREAKING CHANGES

* Replaces the Neutralino.js runtime with Electron. The app now uses a typed IPC contract instead of the nativeAllowList, electron-updater/electron-builder instead of the hand-rolled updater and Inno Setup installer, and a new sidebar-based UI (replacing the home-screen action tiles) with session history and recap features.
