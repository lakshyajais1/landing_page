import os, re

def read_file(uuid):
    with open(f"neo_unpacked/{uuid}", "r", encoding="utf-8") as f:
        return f.read()

def write_file(filename, content):
    with open(f"src/neo/{filename}", "w", encoding="utf-8") as f:
        f.write(content)

shared_src = read_file("ca3f6eb0-e2f6-451c-914f-3f257d0ffb08")
globe_src = read_file("e9c4bf3b-7070-4cd3-b56b-4bea819a9ec9")
atlas_src = read_file("eddd28b5-9c76-44bb-b0fe-8e35bab2f199")
dashboard_src = read_file("3073320b-8790-458e-9352-32e9250867f7")
app_src = read_file("eae7b03b-e32b-4594-adbc-7f23f1805ad6")

def clean_exports(src):
    # Remove Object.assign(window, {...})
    return re.sub(r'Object\.assign\(window,\s*\{[^}]*\}\);?', '', src)

# --- NeoShared.tsx ---
shared_src = clean_exports(shared_src)
shared_src = 'import React, { useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } from "react";\n\n' + shared_src
shared_src += "\nexport { NeoPlatformGlyph, NEO_PLATFORMS, NEO_SCENES, neoSceneAt, neoCurrentScene, latLngToXY3D, useNeoTicker, useTimeProgress, useScrambleNumber, NeoMark, ease, clamp, lerp, mix };\n"
write_file("NeoShared.tsx", shared_src)

# --- NeoInsightDashboard.tsx ---
dashboard_src = clean_exports(dashboard_src)
dashboard_imports = '''import React, { useState, useEffect, useRef, useMemo } from "react";
import { NEO_PLATFORMS, useScrambleNumber } from "./NeoShared";
'''
dashboard_src = dashboard_src.replace('const { useState, useEffect, useRef, useMemo } = React;', '')
dashboard_src = dashboard_imports + dashboard_src
dashboard_src += "\nexport default NeoDashboard;\n"
write_file("NeoInsightDashboard.tsx", dashboard_src)

# --- NeoGlobeStage.tsx ---
globe_src = clean_exports(globe_src)
globe_imports = '''import React, { useState, useEffect, useRef, useMemo } from "react";
import { NEO_PLATFORMS, NEO_SCENES, neoCurrentScene, latLngToXY3D, useTimeProgress, NeoPlatformGlyph, NeoMark, ease, clamp, lerp } from "./NeoShared";
import NeoDashboard from "./NeoInsightDashboard";
'''
globe_src = globe_src.replace('const { useState, useEffect, useRef, useMemo } = React;', '')
globe_src = globe_imports + globe_src
globe_src += "\nexport default NeoGlobeStage;\n"
write_file("NeoGlobeStage.tsx", globe_src)

# --- NeoAtlasStage.tsx ---
atlas_src = clean_exports(atlas_src)
atlas_imports = '''import React, { useState, useEffect, useRef, useMemo } from "react";
import { NEO_PLATFORMS, NEO_SCENES, neoCurrentScene, useTimeProgress, NeoPlatformGlyph, NeoMark, ease, clamp, lerp } from "./NeoShared";
import NeoDashboard from "./NeoInsightDashboard";
'''
atlas_src = atlas_src.replace('const { useState, useEffect, useRef, useMemo } = React;', '')
atlas_src = atlas_imports + atlas_src
atlas_src += "\nexport default NeoAtlasStage;\n"
write_file("NeoAtlasStage.tsx", atlas_src)

# --- NeoApp.tsx ---
app_src = clean_exports(app_src)
# Strip out TweaksPanel imports/usage
app_imports = '''import React, { useEffect } from "react";
import NeoGlobeStage from "./NeoGlobeStage";
import NeoAtlasStage from "./NeoAtlasStage";
import "./Neo.css";
'''
app_src = app_imports + app_src
app_src = app_src.replace('ReactDOM.createRoot(document.getElementById("root")).render(<NeoApp/>);', 'export default NeoApp;')
write_file("NeoApp.tsx", app_src)

