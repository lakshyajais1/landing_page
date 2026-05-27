import { renderToString } from 'react-dom/server';
import React from 'react';
import NeoApp from './temp-ssr/NeoApp.js';
import NeoGlobeStage from './temp-ssr/NeoGlobeStage.js';
import NeoAtlasStage from './temp-ssr/NeoAtlasStage.js';
import NeoDashboard from './temp-ssr/NeoInsightDashboard.js';
console.log("NeoApp:", !!NeoApp.default, "Globe:", !!NeoGlobeStage.default, "Atlas:", !!NeoAtlasStage.default, "Dash:", !!NeoDashboard.default);
try {
  const html = renderToString(React.createElement(NeoApp.default, { variation: 'globe' }));
  console.log("Render Success Globe", html.substring(0, 100));
} catch (e) {
  console.error("Render Error Globe:", e);
}
