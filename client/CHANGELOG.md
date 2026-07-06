## [1.3.1](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.3.0...v1.3.1) (2026-07-06)


### Bug Fixes

* **ui:** align stats sidebar with header height ([c418c4f](https://github.com/Arkantik/Nodewar.gg-tool/commit/c418c4f6deca1380f09629995fa0cb93e23e441f))

# [1.3.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.2.3...v1.3.0) (2026-07-05)


### Features

* **stats:** track and display K/D metrics ([8d685ab](https://github.com/Arkantik/Nodewar.gg-tool/commit/8d685ab20461446a7b15169d6f49b05166cd0a05))

## [1.2.3](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.2.2...v1.2.3) (2026-07-05)


### Bug Fixes

* switch to one-click installer for silent updates ([09f4655](https://github.com/Arkantik/Nodewar.gg-tool/commit/09f46557510a6afa82bff09fb0f6483a2047dcd3))

## [1.2.2](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.2.1...v1.2.2) (2026-07-05)


### Bug Fixes

* **installer:** trigger release to verify per-user update flow ([77bb631](https://github.com/Arkantik/Nodewar.gg-tool/commit/77bb631f2121e54edb77bd0708eb80825d1a4e7d))

## [1.2.1](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.2.0...v1.2.1) (2026-07-05)


### Bug Fixes

* set electron publish type to release ([eb98ad9](https://github.com/Arkantik/Nodewar.gg-tool/commit/eb98ad9329e494e2148946769f04100dfdeacd4d))

# [1.2.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.1.1...v1.2.0) (2026-07-05)


### Features

* **stats:** show deadliest players with guild info ([0b4931e](https://github.com/Arkantik/Nodewar.gg-tool/commit/0b4931ec0dedc03a10ae3eb3b68b978537281cbd))

## [1.1.1](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.1.0...v1.1.1) (2026-07-05)


### Bug Fixes

* secure CI builds and validate config ([c56aa70](https://github.com/Arkantik/Nodewar.gg-tool/commit/c56aa70528f8e21d41bf3150d329486ed028b180))

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
