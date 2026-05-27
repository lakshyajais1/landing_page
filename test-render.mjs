import fs from 'fs';
import { renderToString } from 'react-dom/server';
import React from 'react';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

try {
  const mod = await server.ssrLoadModule('/src/neo/NeoApp.tsx');
  console.log("Module loaded successfully");
  const html = renderToString(React.createElement(mod.default, { variation: 'globe' }));
  console.log("Render Success!");
} catch(e) {
  console.error("Crash:", e.message);
}
await server.close();
