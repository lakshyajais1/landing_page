const fs = require('fs');

const tsxSource = fs.readFileSync('pages/src/App.tsx', 'utf8');
const cssSource = fs.readFileSync('pages/src/index.css', 'utf8');

let newTsx = tsxSource.replace("import './index.css'", "import './PixeoGallery.css'");
newTsx = newTsx.replace('function App() {', 'export default function PixeoGallery() {');
newTsx = newTsx.replace('export default App;', '');

// Strip the header and outro, because the user wants it embedded in the product page.
// The user previously had it embedded in ProductPage.
// Wait, the user said "i just wanted to be as a new section, rest remains the same"
// Let's strip <header> and .outro from the JSX, and only keep the scene and scrolling logic.

// Actually, replacing <header> to </header>
newTsx = newTsx.replace(/<header>[\s\S]*?<\/header>/g, '');
// Replacing <section className="outro"> to </section>
newTsx = newTsx.replace(/<section className="outro">[\s\S]*?<\/section>/g, '');

// Since we are embedding it in ProductPage, we want the sticky container.
// In the original, the scroll is driven by window.scrollY.
// To make it an embedded section, we must wrap it in a sticky wrapper, like it was before!
// Let's restore the sticky wrapper logic from the previous iteration!
// I can just read the previous transcript for PixeoGallery.tsx content if I want to be perfectly exact.
// BUT since the user said "i just wanted to be as a new section", and "it's coming out very weird",
// the weirdness was the sticky breaking due to body { overflow-x: hidden }.
// I will just dump the original App.tsx content and make it sticky via CSS!
