import fs from 'fs';
import { build } from 'esbuild';

await build({
  entryPoints: ['src/neo/NeoApp.tsx'],
  bundle: true,
  outfile: 'temp-esbuild.js',
  format: 'esm',
  external: ['react', 'react-dom']
});

import React from 'react';
import { renderToString } from 'react-dom/server';
import NeoApp from './temp-esbuild.js';

try {
  console.log("Render: ", renderToString(React.createElement(NeoApp.default, { variation: 'globe' })).substring(0, 100));
} catch (e) {
  console.error("Crash: ", e.message);
}
