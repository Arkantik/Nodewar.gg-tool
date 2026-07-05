// Chromium ships a .pak file per locale for its own browser-chrome strings
// (context menus, spellcheck, etc.), none of which this app's UI ever shows -
// in-app translations are handled separately by i18next. Keep only en-US so
// Chromium's internal fallbacks still resolve.
const fs = require("fs");
const path = require("path");

const KEEP_LOCALES = new Set(["en-US.pak"]);

exports.default = async function afterPack(context) {
  const localesDir = path.join(context.appOutDir, "locales");
  if (!fs.existsSync(localesDir)) return;

  for (const file of fs.readdirSync(localesDir)) {
    if (!KEEP_LOCALES.has(file)) {
      fs.unlinkSync(path.join(localesDir, file));
    }
  }
};
