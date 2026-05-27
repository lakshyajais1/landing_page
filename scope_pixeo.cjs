const fs = require('fs');

const tsxSource = fs.readFileSync('pages/src/App.tsx', 'utf8');
const cssSource = fs.readFileSync('pages/src/index.css', 'utf8');

// Process TSX
let newTsx = tsxSource.replace("import './index.css'", "import './PixeoStandalonePage.css'");
// Change function name to PixeoStandalonePage
newTsx = newTsx.replace('function App() {', 'export default function PixeoStandalonePage() {');
newTsx = newTsx.replace('export default App;', '');
// Wrap the return in a div with className "pixeo-standalone"
newTsx = newTsx.replace(/return \(\s*<>\s*/, 'return (\n    <div className="pixeo-standalone">\n');
newTsx = newTsx.replace(/\s*<\/>\s*\);\s*}\s*$/, '\n    </div>\n  );\n}');

fs.writeFileSync('src/PixeoStandalonePage.tsx', newTsx);

// Process CSS using PostCSS-like logic or simple replacement
// Since the CSS is relatively simple, we can prefix rules
const lines = cssSource.split('\n');
const scopedLines = [];
let inKeyframes = false;
let inMedia = false;

for (let line of lines) {
    if (line.includes('@keyframes')) {
        inKeyframes = true;
        scopedLines.push(line);
        continue;
    }
    if (line.includes('@media')) {
        inMedia = true;
        scopedLines.push(line);
        continue;
    }
    if (inKeyframes && line.includes('}')) {
        // Simple check for end of keyframes block (assuming typical formatting)
        // Actually, CSS formatting in this file has `@keyframes pulse{ ... }` on one line mostly.
        // Let's just prefix known class names and tags instead of writing a full parser.
    }
}

// Better approach for CSS: use a library if possible, but we don't have postcss installed.
// We'll prefix every selector block.
let cssStr = cssSource;
// Remove body/html/root resets that conflict
cssStr = cssStr.replace(/html\s*\{[^}]+\}/g, '');
cssStr = cssStr.replace(/body\s*\{([^}]*)\}/g, '.pixeo-standalone { $1 }');
cssStr = cssStr.replace(/:root\s*\{([^}]*)\}/g, '.pixeo-standalone { $1 }');
cssStr = cssStr.replace(/#root\s*\{([^}]*)\}/g, '.pixeo-standalone { $1 }');
cssStr = cssStr.replace(/\*\s*\{([^}]*)\}/g, '.pixeo-standalone * { $1 }');

// We will wrap the rest in a LESS/SASS-like string if we had a preprocessor, but we don't.
// Let's just prefix common selectors manually since they are predictable.
const prefixes = ['.starfield', '.vignette', 'header', '.brand', 'nav', '.frame', '#scene', '#stage', '.card', '.hero', '.scroll-hint', '.progress', '.outro', '#spacer'];

for (const p of prefixes) {
    const regex = new RegExp(`^(${p})(.*\\{)`, 'gm');
    cssStr = cssStr.replace(regex, `.pixeo-standalone $1$2`);
    // Handle inline ones like `#scene{`
    const regex2 = new RegExp(`(${p})\\s*\\{`, 'g');
    cssStr = cssStr.replace(regex2, `.pixeo-standalone $1 {`);
}

// Special case for hover
cssStr = cssStr.replace(/nav a:hover/g, '.pixeo-standalone nav a:hover');

fs.writeFileSync('src/PixeoStandalonePage.css', cssStr);
