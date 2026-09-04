# [1.9.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.8.6...v1.9.0) (2026-09-04)


### Bug Fixes

* **client:** improve error handling and validation ([c9ff1a4](https://github.com/Arkantik/Nodewar.gg-tool/commit/c9ff1a4ce115e294306a8cd6af62d80fc53a3aee))
* **i18n:** update record action title labels ([bf8d47e](https://github.com/Arkantik/Nodewar.gg-tool/commit/bf8d47ee5a7c74283d5f2747bf0387879786ca65))
* **logger:** handle sync spawn launch failures ([4d24e6d](https://github.com/Arkantik/Nodewar.gg-tool/commit/4d24e6de04a726d588b8bd528d6c2cf441146c87))
* **logger:** improve packet parsing and stability ([92d12d1](https://github.com/Arkantik/Nodewar.gg-tool/commit/92d12d175cc317955e561dc761d9177d8509ffe7))
* **parser:** clean stray bytes from names ([7fbb8a4](https://github.com/Arkantik/Nodewar.gg-tool/commit/7fbb8a41b0d3c8059c733fe56f30ea2fd61c1fc4))


### Features

* add app version downgrade functionality ([bcb0d7e](https://github.com/Arkantik/Nodewar.gg-tool/commit/bcb0d7ea06213bcfb0f97646c0097b1110fee3f2))
* **config:** add option to toggle coordinates ([48d92ae](https://github.com/Arkantik/Nodewar.gg-tool/commit/48d92ae7b41047972a83486da5ecbb0b9e30e560))

## [1.8.6](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.8.5...v1.8.6) (2026-08-25)


### Bug Fixes

* **logger:** render character names only if valid ([37564ec](https://github.com/Arkantik/Nodewar.gg-tool/commit/37564ecc931e5b6e5a743d698111ed986857f295))

## [1.8.5](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.8.4...v1.8.5) (2026-08-13)

## [1.8.4](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.8.3...v1.8.4) (2026-08-13)


### Bug Fixes

* **logger:** refine kill offset detection logic ([48d58f2](https://github.com/Arkantik/Nodewar.gg-tool/commit/48d58f2a5bf7d01516e666d3720295b952f1acde))

## [1.8.3](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.8.2...v1.8.3) (2026-07-30)

## [1.8.2](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.8.1...v1.8.2) (2026-07-29)


### Bug Fixes

* trigger release to publish missing v1.8.0 windows installer assets ([3c1a091](https://github.com/Arkantik/Nodewar.gg-tool/commit/3c1a0911b0a5da7dfeea8219a66fc09c83fe41fc))

## [1.8.1](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.8.0...v1.8.1) (2026-07-27)


### Bug Fixes

* trigger release to publish missing v1.8.0 windows installer assets ([dd6e758](https://github.com/Arkantik/Nodewar.gg-tool/commit/dd6e7583de16a3647e656cc25cbe860acaaca6f3))

# [1.8.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.7.0...v1.8.0) (2026-07-26)


### Features

* **logger:** add offset validation and save warning ([ffa7b3a](https://github.com/Arkantik/Nodewar.gg-tool/commit/ffa7b3a1ae8fc0dc8771699c95739ad49aac0b97))

# [1.7.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.6.1...v1.7.0) (2026-07-20)


### Bug Fixes

* **analyze:** fix tracking and win interfaces ([d27e264](https://github.com/Arkantik/Nodewar.gg-tool/commit/d27e264286c633d148cce73efe8f12133950e9b2))


### Features

* prevent accidental quit during recording ([5801056](https://github.com/Arkantik/Nodewar.gg-tool/commit/58010569b9bddf427582e9081b9fc65c56194308))

## [1.6.1](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.6.0...v1.6.1) (2026-07-16)


### Bug Fixes

* **release:** let refactor commits trigger a patch release ([912bdbf](https://github.com/Arkantik/Nodewar.gg-tool/commit/912bdbfc61ea18bde075e4151ac847bbb4a2f236))

# [1.6.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.5.0...v1.6.0) (2026-07-16)


### Features

* add family name config for player detection ([e91670d](https://github.com/Arkantik/Nodewar.gg-tool/commit/e91670d4df2633d4bb95ac5ec37e600f4f844279))
* Extract and display death coordinates ([9ffcb58](https://github.com/Arkantik/Nodewar.gg-tool/commit/9ffcb58f9f7f75366782008075561b32c013258e))

# [1.5.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.4.0...v1.5.0) (2026-07-10)


### Bug Fixes

* **ci:** update Node.js to v22 in workflows ([3ecb1af](https://github.com/Arkantik/Nodewar.gg-tool/commit/3ecb1af34bd901f90ba0e47d65c2ac1b431d6141))
* **overlay:** correct stats logic and layout shifts ([14beaa1](https://github.com/Arkantik/Nodewar.gg-tool/commit/14beaa14b64e7e3c526e337cab317aca50ffd685))
* prevent concurrent session recovery ([8373e3f](https://github.com/Arkantik/Nodewar.gg-tool/commit/8373e3fe405e16c65194442b1943112f08075d4b))


### Features

* **client:** add hotkey, tray, and recovery ([723b5be](https://github.com/Arkantik/Nodewar.gg-tool/commit/723b5be9a1da9932a97ac1873167bafda017c8eb))
* Implement custom window title bar ([d13d3b8](https://github.com/Arkantik/Nodewar.gg-tool/commit/d13d3b8e3f84a50aad0033438fe1b42e0e57b1d8))
* **overlay:** add in-game combat stats overlay ([f10be99](https://github.com/Arkantik/Nodewar.gg-tool/commit/f10be99664ae0f11d534b53ed90716f678ca62ed))
* **overlay:** add settings and dynamic resizing ([b369bd0](https://github.com/Arkantik/Nodewar.gg-tool/commit/b369bd0a491983d45a4256608b47e1bf34d85a22))
* **timeline:** add interactive scrubbing and tags ([8c854b2](https://github.com/Arkantik/Nodewar.gg-tool/commit/8c854b2f1de7f2d96bf827cc6bba8a4467c050fd))
* **ui:** add recording status indicator ([222e93d](https://github.com/Arkantik/Nodewar.gg-tool/commit/222e93de1e7765cc7cba83cc4a530aee11b0ee0d))
* **ui:** add reusable Tooltip component ([d8072f1](https://github.com/Arkantik/Nodewar.gg-tool/commit/d8072f15a025cd3230a2fecb1a1a108b4b989439))

# [1.4.0](https://github.com/Arkantik/Nodewar.gg-tool/compare/v1.3.1...v1.4.0) (2026-07-06)


### Features

* **record:** add resume and restart recording ([855a9a1](https://github.com/Arkantik/Nodewar.gg-tool/commit/855a9a1a236363e85a71e97cb65dd377c07d11f4))

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
