// Runs from client/ (this is where package.json - the app's version source - lives).
// Order matters: npm bumps package.json's version *before* exec builds the installer,
// so electron-builder's artifactName/latest.yml pick up the new version automatically.
module.exports = {
  branches: ["main"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    ["@semantic-release/npm", { npmPublish: false }],
    ["@semantic-release/exec", { prepareCmd: "npm run build:win" }],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    [
      "@semantic-release/github",
      {
        assets: [
          { path: "dist/bdo-combat-installer-v${nextRelease.version}.exe", label: "Windows Installer" },
          { path: "dist/latest.yml", label: "latest.yml" }
        ]
      }
    ]
  ]
};
