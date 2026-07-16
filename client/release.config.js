// Runs from client/ (this is where package.json - the app's version source - lives).
// This step only bumps the version, tags, and creates the (assetless) GitHub
// release - installers are built and attached separately per-platform by the
// publish-installers job in release.yml, via electron-builder's own publisher.
module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      { releaseRules: [{ type: "refactor", release: "patch" }] }
    ],
    [
      "@semantic-release/release-notes-generator",
      { presetConfig: { types: [{ type: "refactor", section: "Refactoring" }] } }
    ],
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false }],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
};
