const fs = require('fs');
const path = require('path');

let strip;
try {
  strip = require('strip-comments');
} catch (e) {
  strip = null;
}

const files = fs.readFileSync('files_to_strip.txt', 'utf-8')
  .split(/\r?\n/)
  .map(f => f.trim())
  .filter(f => f && !f.startsWith('node_modules') && !f.startsWith('.git'));

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  const ext = path.extname(file);
  if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) return;
  let content = fs.readFileSync(file, 'utf-8');
  let noComments;
  if (strip) {
    noComments = strip(content);
  } else {
    // Fallback: Remove block comments and all // comments (even after code)
    // This regex is aggressive and may remove // inside strings, but is a last resort
    noComments = content
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
      .replace(/(^|[^:"'])\/\/.*$/gm, '$1'); // Remove // comments not in strings
  }
  fs.writeFileSync(file, noComments, 'utf-8');
  console.log(`Stripped all comments from: ${file}`);
});

console.log('All comments (including tricky // type) removed from listed files.'); 