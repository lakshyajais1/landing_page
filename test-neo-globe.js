import { renderToString } from 'react-dom/server';
import React from 'react';
import NeoGlobeStage from './temp-ssr/NeoGlobeStage.js';
try {
  const html = renderToString(React.createElement(NeoGlobeStage.default, { platformsEnabled: {meta: true} }));
  console.log("Render Success Globe", html.substring(0, 100));
} catch (e) {
  console.error("Render Error Globe:", e);
}
