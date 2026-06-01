const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) return;

  const buffer = fs.readFileSync(envPath);
  const hasUtf16Bom = buffer.length > 1 && buffer[0] === 0xff && buffer[1] === 0xfe;
  const hasUtf16Nulls = buffer.length > 3 && buffer[3] === 0;
  const content = buffer.toString(hasUtf16Bom || hasUtf16Nulls ? 'utf16le' : 'utf8').replace(/^\uFEFF/, '');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

module.exports = loadEnv;
