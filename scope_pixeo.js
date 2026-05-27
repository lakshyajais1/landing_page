const fs = require('fs');

// Read source files
const tsxSource = fs.readFileSync('pages/src/App.tsx', 'utf8');
const cssSource = fs.readFileSync('pages/src/index.css', 'utf8');

// Process CSS
let scopedCss = cssSource;
// Replace root/body resets that we don't want to affect the whole site
scopedCss = scopedCss.replace(/:root\s*\{/g, '.pixeo-standalone {');
scopedCss = scopedCss.replace(/html\{[^}]+\}/g, '');
scopedCss = scopedCss.replace(/body\s*\{([^}]*)\}/g, '.pixeo-standalone { $1 }');
scopedCss = scopedCss.replace(/#root\s*\{([^}]*)\}/g, '.pixeo-standalone { $1 }');
scopedCss = scopedCss.replace(/\*\s*\{\s*margin:0;\s*padding:0;\s*box-sizing:border-box;\s*\}/g, '.pixeo-standalone * { box-sizing: border-box; }');

// Scope other rules
scopedCss = scopedCss.replace(/^(?!\s*@| \.| #| \/\*| \})([^\{]+)\{/gm, '.pixeo-standalone $1 {');
scopedCss = scopedCss.replace(/^(\.[a-zA-Z0-9_-]+)([^\{]*)\{/gm, '.pixeo-standalone $1$2 {');
scopedCss = scopedCss.replace(/^(#[a-zA-Z0-9_-]+)([^\{]*)\{/gm, '.pixeo-standalone $1$2 {');

// Fix the keyframes so they don't get prefixed incorrectly (the above regex might miss some or hit some we don't want)
// Wait, the regex `^(\.[a-zA-Z0-9_-]+)` works. What about indented rules?
// Let's just use a simpler method or write it carefully.
