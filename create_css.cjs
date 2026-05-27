const fs = require('fs');
let css = fs.readFileSync('pages/src/index.css', 'utf8');

css = css.replace(/body\s*\{[^}]+\}/g, '');
css = css.replace(/#root\s*\{[^}]+\}/g, '');
css = css.replace(/html\s*\{[^}]+\}/g, '');
css = css.replace(/\*\s*\{[^}]+\}/g, '');
css = css.replace(/:root/g, '.pixeo-gallery');
css = css.replace(/\.starfield/g, '.pg-starfield');
css = css.replace(/\.vignette/g, '.pg-vignette');
css = css.replace(/\.frame/g, '.pg-frame');
css = css.replace(/#scene/g, '.pg-scene');
css = css.replace(/#stage/g, '.pg-stage');
css = css.replace(/\.card/g, '.pg-card');
css = css.replace(/\.hero/g, '.pg-hero');
css = css.replace(/\.scroll-hint/g, '.pg-scroll-hint');
css = css.replace(/\.bar/g, '.pg-bar');
css = css.replace(/\.progress/g, '.pg-progress');
css = css.replace(/#spacer/g, '');
css = css.replace(/header[\s\S]*?@media.*?\}/, '');
css = css.replace(/\.outro[\s\S]*?\.outro a:hover\{.*?\}/, '');

css += `
.pixeo-gallery {
  position: relative;
  background: #050308;
  color: #f4f1f8;
  font-family: "DM Mono", ui-monospace, monospace;
}

.pg-stage-wrap {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.pg-scene {
  position: absolute;
  inset: 0;
  z-index: 10;
  perspective: 900px;
  perspective-origin: 50% 48%;
  pointer-events: none;
}

.pg-stage {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
}

.pg-starfield {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.pg-vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.pg-hero {
  position: absolute;
}
.pg-progress {
  position: absolute;
}
.pg-scroll-hint {
  position: absolute;
}
.pg-frame {
  position: absolute;
}
`;

fs.writeFileSync('src/PixeoGallery.css', css);
