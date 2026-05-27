/* ────────────────────────────────────────────────────────────────
   Shared primitives: scroll-progress hook, platform glyphs, scene
   constants, easing helpers. Exposed on window so v1/v2/v3 can pull.
   ──────────────────────────────────────────────────────────────── */

const { useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } = React;

/* ── Easing ─────────────────────────────────────────────────────── */
const ease = {
  linear: (t) => t,
  inOut:  (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  out:    (t) => 1 - Math.pow(1 - t, 3),
  in:     (t) => t * t * t,
};

const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const mix   = (start, end, t) => clamp((t - start) / (end - start));

/* ── Scroll progress hook ───────────────────────────────────────
   Returns 0..1 representing how far the user has scrolled through
   the pinned section. 0 = section entered viewport top; 1 = bottom
   reached top of viewport (pin released).

   Reads on each scroll/resize event directly (no RAF gating). The
   browser already throttles scroll events, so this is plenty fast,
   and it keeps working in test environments where requestAnimation-
   Frame may be paused (background iframes, etc).
   ─────────────────────────────────────────────────────────────── */
function useScrollProgress(ref) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const read = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? clamp(-rect.top / total) : 0;
      setProgress(p);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, []);
  return progress;
}

/* ── Platform glyphs (inline SVG, brand-accurate colors) ────────── */
const PlatformGlyph = ({ id, size = 22 }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor" };
  switch (id) {
    case "meta":
      return (
        <svg {...props} viewBox="0 0 36 24">
          <path d="M18 4.5C13.6 4.5 10.4 7.9 7.9 11.7 5.9 14.8 4.5 18 2.6 18c-1 0-1.6-.9-1.6-2.2 0-1.7.9-3.7 1.9-5.2C4 8.9 5.1 7.8 5.1 7.8L3.6 6.4S2.3 7.6.9 9.9C-.5 12.1-1 14.4-1 16.5c0 3 1.6 5 3.9 5 2.9 0 4.7-3 6.5-5.9C11.5 12.2 13.6 8.7 18 8.7c4.4 0 6.5 3.5 8.6 6.9 1.8 2.9 3.6 5.9 6.5 5.9 2.3 0 3.9-2 3.9-5 0-2.1-.5-4.4-1.9-6.6C33.7 7.6 32.4 6.4 32.4 6.4l-1.5 1.4s1.1 1.1 2.2 2.8c1 1.5 1.9 3.5 1.9 5.2 0 1.3-.6 2.2-1.6 2.2-1.9 0-3.3-3.2-5.3-6.3C25.6 7.9 22.4 4.5 18 4.5z" fill="#0866FF"/>
        </svg>
      );
    case "google":
      return (
        <svg {...props}>
          <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9c-.3 1.4-1 2.5-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-7.9z"/>
          <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8C3.9 20.7 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.8 14.3c-.2-.7-.4-1.4-.4-2.3s.2-1.6.4-2.3V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.7-2.7z"/>
          <path fill="#EA4335" d="M12 5.5c1.6 0 3.1.6 4.2 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.7 1 3.9 3.3 2.1 7l3.7 2.8C6.7 7.4 9.1 5.5 12 5.5z"/>
        </svg>
      );
    case "linkedin":
      return (
        <svg {...props}>
          <path fill="#0A66C2" d="M20.4 3H3.6C2.7 3 2 3.7 2 4.6v14.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V4.6c0-.9-.7-1.6-1.6-1.6zM7.7 18H5.1V9.6h2.6V18zM6.4 8.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM18 18h-2.6v-4.1c0-1-.2-2-1.5-2-1.4 0-1.6 1.1-1.6 2V18H9.7V9.6h2.5v1.1c.4-.7 1.3-1.3 2.6-1.3 2.7 0 3.2 1.8 3.2 4.1V18z"/>
        </svg>
      );
    case "tiktok":
      return (
        <svg {...props}>
          <path fill="#fff" d="M19.3 8.8c-1.6 0-3-.5-4.2-1.4v8.4c0 3.3-2.7 6-6 6S3 19.1 3 15.8s2.7-6 6-6c.3 0 .6 0 .9.1v3.3c-.3-.1-.6-.2-.9-.2-1.5 0-2.7 1.2-2.7 2.7s1.2 2.7 2.7 2.7 2.7-1.2 2.7-2.7V2.5h3.4c.3 2.1 2.1 3.7 4.2 3.7v2.6z"/>
          <path fill="#25F4EE" d="M16.6 8c-1.1-.7-1.9-1.8-2.2-3.1V2.5h-2.2v15.4c0 1.5-1.2 2.7-2.7 2.7-.9 0-1.6-.4-2.1-1.1.7.4 1.6.6 2.5.6 1.5 0 2.7-1.2 2.7-2.7V2H15c.3 2.1 2.1 3.7 4.2 3.7v2.6c-1 0-1.9-.1-2.6-.3z" opacity=".5"/>
          <path fill="#FE2C55" d="M16.6 8.8c-1-.4-1.8-1.2-2.2-2.3v1.9c.7.2 1.4.4 2.2.4z" opacity=".7"/>
        </svg>
      );
  }
  return null;
};

const PLATFORMS = [
  { id: "meta",     name: "Meta",     color: "#0866FF" },
  { id: "google",   name: "Google",   color: "#4285F4" },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { id: "tiktok",   name: "TikTok",   color: "#FE2C55" },
];

/* ── Ad creative palette — sampled, warm studio-lit feel ─────────── */
const AD_CARDS = [
  { id: "a", grad: "linear-gradient(135deg, #FFB199 0%, #FF6F61 100%)", label: "Hero", copy: "Bottle / sunset" },
  { id: "b", grad: "linear-gradient(135deg, #C7A8FF 0%, #7648EF 100%)", label: "Carousel", copy: "Lifestyle" },
  { id: "c", grad: "linear-gradient(135deg, #6FE4C5 0%, #1C994A 100%)", label: "Story", copy: "Studio" },
  { id: "d", grad: "linear-gradient(135deg, #FFD27F 0%, #F4A261 100%)", label: "Reel",   copy: "Behind-scenes" },
  { id: "e", grad: "linear-gradient(135deg, #FFA8C5 0%, #EB75B2 100%)", label: "Square", copy: "Product hero" },
  { id: "f", grad: "linear-gradient(135deg, #8FB7FF 0%, #4F7CFF 100%)", label: "Story",  copy: "Founder cut" },
];

/* ── Generated headlines (typewriter through these) ─────────────── */
const HEADLINES = [
  "Sun-kissed scent. Year-round shine.",
  "Bottled radiance — now 20% off.",
  "The glow your shelf was missing.",
  "Built for sun-drenched mornings.",
];

/* ── Beat / scene definitions ─────────────────────────────────── */
const SCENES = [
  { id: "prompt",   label: "Prompt",     range: [0.00, 0.16] },
  { id: "thinking", label: "Synthesis",  range: [0.16, 0.30] },
  { id: "images",   label: "Image Ads",  range: [0.30, 0.48] },
  { id: "video",    label: "Video Ad",   range: [0.48, 0.62] },
  { id: "copy",     label: "Copywriting",range: [0.62, 0.74] },
  { id: "post",     label: "Posting",    range: [0.74, 0.88] },
  { id: "metrics",  label: "Live Results", range: [0.88, 1.00] },
];

/* sceneProgress: returns 0..1 within a scene given global progress */
const sceneAt = (p, range) => mix(range[0], range[1], p);
/* current scene index */
function currentScene(p) {
  for (let i = SCENES.length - 1; i >= 0; i--) {
    if (p >= SCENES[i].range[0]) return i;
  }
  return 0;
}

/* ── Typed-text hook: reveals chars by progress through a window ── */
function useTypedText(text, p, start, end) {
  const t = ease.out(mix(start, end, p));
  const n = Math.round(text.length * t);
  return { shown: text.slice(0, n), done: t >= 1, t };
}

/* ── Number tween hook ─────────────────────────────────────────── */
const fmtMetric = (n, kind) => {
  if (kind === "money") {
    if (n >= 1000) return `₹${(n / 1000).toFixed(2)}K`;
    return `₹${n.toFixed(0)}`;
  }
  if (kind === "pct") return `${n.toFixed(2)}%`;
  if (kind === "k") {
    if (n >= 1000) return `${(n / 1000).toFixed(2)}K`;
    return `${n.toFixed(0)}`;
  }
  return n.toFixed(0);
};

/* ── Headline + crumb component ───────────────────────────────── */
function StageHeadline({ headline, sub, scene, total, sceneLabel }) {
  return (
    <div className="stage-headline">
      <div className="crumb">
        <span style={{ color: "var(--accent, var(--nyx-primary-soft))" }}>{String(scene + 1).padStart(2, "0")}</span>
        <span style={{ opacity: 0.4, margin: "0 10px" }}>/</span>
        <span>{String(total).padStart(2, "0")}</span>
        <span style={{ opacity: 0.4, margin: "0 10px" }}>·</span>
        <span>{sceneLabel}</span>
      </div>
      <h2>{headline}</h2>
    </div>
  );
}

function SceneRail({ scene, total, label }) {
  return (
    <div className="scene-rail">
      <div className="ticks">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`tick ${i < scene ? "passed" : ""} ${i === scene ? "current" : ""}`}
          />
        ))}
      </div>
      <div className="scene-label">
        <span className="num">{String(scene + 1).padStart(2, "0")}</span>
        {label}
      </div>
    </div>
  );
}

/* expose */
Object.assign(window, {
  useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback,
  ease, clamp, lerp, mix,
  useScrollProgress, useTypedText,
  PlatformGlyph, PLATFORMS, AD_CARDS, HEADLINES, SCENES,
  sceneAt, currentScene, fmtMetric,
  StageHeadline, SceneRail,
});
