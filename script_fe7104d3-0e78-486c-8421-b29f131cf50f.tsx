/* ────────────────────────────────────────────────────────────────
   V1 — STAGE
   One centered, browser-styled card. Scenes cross-fade INSIDE the
   card as the user scrolls. Card itself subtly morphs (width/scale
   changes between beats). Background drifts.
   ──────────────────────────────────────────────────────────────── */

function StageVariation({ promptText, headline, subhead, speed = 1, accent }) {
  const sectionRef = useRef(null);
  const p = useScrollProgress(sectionRef);
  const scene = currentScene(p);

  // Card grows slightly during media-heavy beats, contracts for prompt/metrics
  const cardScale = useMemo(() => {
    // base 1.0, peaks 1.04 around images→video, slight 0.98 dip at very start
    if (p < 0.05) return 0.985;
    if (p < 0.16) return 1;
    if (p < 0.62) return 1.025;
    if (p < 0.88) return 1.01;
    return 1;
  }, [p]);

  return (
    <section className="pinned-section" ref={sectionRef} data-screen-label="V1 Stage">
      <div className="pinned-stage" style={{ "--accent": accent }}>
        <StageHeadline
          headline={headline}
          sub={subhead}
          scene={scene}
          total={SCENES.length}
          sceneLabel={SCENES[scene].label}
        />

        <div className="stage-wrap">
          <div
            className="stage-card scene-card"
            style={{
              transform: `scale(${cardScale})`,
            }}
          >
            <div className="scene-card-header">
              <div className="traffic">
                <span /><span /><span />
              </div>
              <div className="title">nyx · campaign-builder</div>
              <div className="tag">{labelFor(scene)}</div>
            </div>

            <div className="stage-body">
              <PromptScene  p={p} text={promptText} speed={speed} />
              <ThinkingScene p={p} />
              <ImagesScene  p={p} />
              <VideoScene   p={p} />
              <CopyScene    p={p} />
              <PostScene    p={p} />
              <MetricsScene p={p} />
            </div>
          </div>

          <FloatingDetailsLeft p={p} />
          <FloatingDetailsRight p={p} />
        </div>

        <SceneRail scene={scene} total={SCENES.length} label={SCENES[scene].label} />
      </div>

      <style>{stageStyles}</style>
    </section>
  );
}

function labelFor(idx) {
  const map = ["draft prompt", "thinking", "generating images", "rendering video", "writing copy", "publishing", "live"];
  return map[idx] || "";
}

/* ── Scene helper: fade in over [a,b] range, hold, fade out [c,d] ── */
const sceneOpacity = (p, [a, b, c, d]) => {
  if (p < a) return 0;
  if (p < b) return mix(a, b, p);
  if (p < c) return 1;
  if (p < d) return 1 - mix(c, d, p);
  return 0;
};

/* ── Scene container ── */
function Layer({ p, range, children, style }) {
  const op = sceneOpacity(p, range);
  if (op < 0.01) return null;
  return (
    <div className="stage-layer" style={{ opacity: op, ...style }}>
      {children}
    </div>
  );
}

/* ── SCENE 1: Prompt typing ─────────────────────────────────── */
function PromptScene({ p, text, speed }) {
  // type during [0.01, 0.13], hold to 0.15, fade out by 0.20
  const adj = Math.min(0.13, 0.01 + (0.12 / speed));
  const { shown } = useTypedText(text, p, 0.01, adj);
  return (
    <Layer p={p} range={[0, 0, 0.16, 0.21]}>
      <div className="prompt-scene">
        <div className="prompt-label">
          <span className="prompt-dot" />
          New campaign brief
          <span className="prompt-meta">⌘K</span>
        </div>
        <div className="prompt-input">
          <span className="prompt-icon">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </span>
          <div className="prompt-text">
            {shown}
            <span className="caret" />
          </div>
        </div>
        <div className="prompt-hints">
          <span className="hint-chip">Solé Skincare</span>
          <span className="hint-chip">Summer launch</span>
          <span className="hint-chip">India · UAE</span>
          <span className="hint-chip muted">+ 4 brand assets attached</span>
        </div>
      </div>
    </Layer>
  );
}

/* ── SCENE 2: AI Thinking ───────────────────────────────────── */
function ThinkingScene({ p }) {
  const local = sceneAt(p, [0.16, 0.30]);
  const steps = [
    { label: "Parsing brief",         start: 0.0,  end: 0.25 },
    { label: "Loading brand voice",   start: 0.15, end: 0.45 },
    { label: "Sampling visual style", start: 0.35, end: 0.65 },
    { label: "Drafting variants",     start: 0.55, end: 0.95 },
  ];
  return (
    <Layer p={p} range={[0.15, 0.18, 0.28, 0.32]}>
      <div className="thinking-scene">
        <div className="orb">
          <div className="orb-ring r1" />
          <div className="orb-ring r2" />
          <div className="orb-core" />
        </div>
        <div className="thinking-list">
          {steps.map((s, i) => {
            const t = clamp((local - s.start) / (s.end - s.start));
            const done = local > s.end;
            const active = local >= s.start && local <= s.end;
            return (
              <div key={i} className={`think-row ${done ? "done" : active ? "active" : ""}`}>
                <span className="think-check">
                  {done ? (
                    <svg viewBox="0 0 14 14" width="12" height="12">
                      <path d="M3 7.2 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : <span className="think-spinner" />}
                </span>
                <span className="think-label">{s.label}</span>
                <span className="think-bar">
                  <span className="think-bar-fill" style={{ width: `${(done ? 1 : t) * 100}%` }} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Layer>
  );
}

/* ── Subscribe to the master product image (live as user drops) ── */
function useProductImage(slotId = "nyx-video-product") {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    const read = () => {
      const slot = document.getElementById(slotId);
      if (slot && slot._img) {
        const url = slot._img.src;
        if (url) setSrc(url);
      }
    };
    read();
    // Poll — the slot doesn't broadcast change events. setInterval is cheap.
    const id = setInterval(read, 400);
    return () => clearInterval(id);
  }, [slotId]);
  return src;
}

/* ── Six ad treatments (distinct compositions) ─────────────────── */
const AD_LAYOUTS = [
  {
    id: "hero",   label: "Hero · 1080×1350", aspect: "4/5",
    bg: "linear-gradient(160deg, #FFB37A 0%, #C84A3E 90%)",
    copyTop: "Glow on,",  copyBig: "summer.",
    productStyle: { width: "44%", bottom: "8%", left: "50%", transform: "translateX(-50%)" },
  },
  {
    id: "story",  label: "Story · 1080×1920", aspect: "9/16",
    bg: "linear-gradient(180deg, #FFE9C8 0%, #E8854A 60%, #5b1f12 100%)",
    copyBottom: "Bottled radiance.",
    productStyle: { width: "60%", bottom: "18%", left: "50%", transform: "translateX(-50%)" },
  },
  {
    id: "split",  label: "Carousel · 1080×1080", aspect: "1/1",
    bg: "linear-gradient(110deg, #2a1612 0%, #1a0c0a 100%)",
    copyRight: "Sun-kissed.\nYear-round.",
    productStyle: { width: "44%", bottom: "8%", left: "16%" },
  },
  {
    id: "badge",  label: "Square · 1080×1080", aspect: "1/1",
    bg: "radial-gradient(circle at 70% 30%, #FFD2A8 0%, #C84A3E 75%)",
    badge: "20% OFF",
    productStyle: { width: "52%", bottom: "10%", left: "50%", transform: "translateX(-50%)" },
  },
  {
    id: "macro",  label: "Reel · 1080×1920", aspect: "9/16",
    bg: "radial-gradient(ellipse at 50% 40%, #FFE0B0 0%, #b25a35 80%)",
    copyBottom: "Skin, lit.",
    productStyle: { width: "80%", bottom: "-6%", left: "50%", transform: "translateX(-50%)" },
  },
  {
    id: "banner", label: "Banner · 1200×628", aspect: "16/9",
    bg: "linear-gradient(95deg, #18181A 0%, #2a1612 50%, #C84A3E 100%)",
    copyLeft: "Solé — bottled summer.",
    productStyle: { width: "26%", bottom: "8%", right: "8%" },
  },
];

/* ── SCENE 3: Image Ads grid reveal ─────────────────────────── */
function ImagesScene({ p }) {
  const local = sceneAt(p, [0.30, 0.48]);
  const productSrc = useProductImage();

  return (
    <Layer p={p} range={[0.29, 0.32, 0.46, 0.50]}>
      <div className="images-scene">
        <div className="images-grid">
          {AD_LAYOUTS.map((ad, i) => {
            const start = 0.08 + i * 0.085;
            const t = ease.out(clamp((local - start) / 0.22));
            return (
              <div
                key={ad.id}
                className="ad-card"
                style={{
                  opacity: t,
                  transform: `translateY(${(1 - t) * 24}px) scale(${0.92 + t * 0.08})`,
                }}
              >
                <div className="ad-canvas" style={{ background: ad.bg }}>
                  {/* Soft top highlight */}
                  <div className="ad-glow" />

                  {/* Product image */}
                  {productSrc ? (
                    <img className="ad-product-img" src={productSrc} alt="" style={ad.productStyle} />
                  ) : null}

                  {/* Copy overlays per layout */}
                  {ad.copyTop ? <div className="ad-copy-top">{ad.copyTop}</div> : null}
                  {ad.copyBig ? <div className="ad-copy-big">{ad.copyBig}</div> : null}
                  {ad.copyBottom ? <div className="ad-copy-bottom">{ad.copyBottom}</div> : null}
                  {ad.copyLeft ? <div className="ad-copy-left">{ad.copyLeft}</div> : null}
                  {ad.copyRight ? <div className="ad-copy-right">{ad.copyRight.split("\n").map((s, j) => <div key={j}>{s}</div>)}</div> : null}
                  {ad.badge ? <div className="ad-badge">{ad.badge}</div> : null}

                  {/* Generating shimmer that sweeps once as the card reveals */}
                  <div className="ad-generate-shimmer" style={{ opacity: t < 1 ? 1 : 0 }} />
                </div>
                <div className="ad-foot">
                  <span className="ad-tag">{ad.label.split(" · ")[0]}</span>
                  <span className="ad-copy">{ad.label.split(" · ")[1]}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="images-foot">
          <span className="dot-led" />
          Generated 6 variants · 1080×1350 · 1080×1920 · 1200×628
        </div>
      </div>
    </Layer>
  );
}

/* ── SCENE 4: Video Ad — feels like a video being generated ───── */
function VideoScene({ p }) {
  const local = sceneAt(p, [0.48, 0.62]);

  // Continuously-ticking frame counter (so the preview always feels "live")
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    let id, last = performance.now();
    // setInterval works in headless/throttled contexts where rAF doesn't
    id = setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setFrame(f => (f + dt * 24) % (24 * 9));
    }, 1000 / 24);
    return () => clearInterval(id);
  }, []);

  // Render progress driven by scroll within scene
  const renderPct = Math.round(clamp(local * 1.08) * 100);
  const sec = Math.floor(frame / 24);
  // Which "shot" the live preview is on (0..3 across the 9s loop)
  const activeShot = Math.min(3, Math.floor(sec / 2.25));

  return (
    <Layer p={p} range={[0.46, 0.50, 0.60, 0.64]}>
      <div className="video-scene">
        {/* Left: 9:16 video preview that loops continuously */}
        <div className="video-preview">
          {/* Per-shot atmospheric backgrounds cross-fade behind the product */}
          <div className="vp-mood mood-a" />
          <div className="vp-mood mood-b" />
          <div className="vp-mood mood-c" />
          <div className="vp-mood mood-d" />

          {/* Soft floor/table plane to ground the product */}
          <div className="vp-floor" />

          {/* The product image — drag-and-drop slot. Camera wrapper does the
              cinematic panning/zooming across the 9s shot cycle. */}
          <div className="vp-camera">
            <image-slot
              id="nyx-video-product"
              fit="contain"
              placeholder="Drop your product photo"
              src={DEFAULT_PRODUCT_SVG}
              style={{
                width: "78%",
                height: "82%",
                position: "absolute",
                left: "11%",
                top: "10%",
                background: "transparent",
              }}
            />
          </div>

          {/* Effect overlays — each is keyed to a specific shot via @keyframes */}
          <div className="vp-light-pass" />
          <div className="vp-flare" />
          <div className="vp-particles">
            {Array.from({ length: 14 }).map((_, i) => (
              <span key={i} className="vp-particle" style={{
                left:  `${(i * 13 + 7) % 100}%`,
                top:   `${(i * 29 + 11) % 100}%`,
                animationDelay: `${i * 0.18}s`,
              }} />
            ))}
          </div>

          {/* End-card brand overlay (last shot only) */}
          <div className="vp-end-overlay">
            <div className="vp-end-mark">solé</div>
            <div className="vp-end-cta">Glow on this summer →</div>
          </div>

          {/* Subtle vignette + scanline texture (constant) */}
          <div className="vp-scan" />

          {/* Persistent chrome over the playing video */}
          <div className="vp-top-bar">
            <span className="vp-rec"><span className="vp-rec-dot" /> RENDERING</span>
            <span className="vp-frame">F<span>{String(Math.floor(frame)).padStart(3, "0")}</span> / 216</span>
          </div>
          <div className="vp-bottom-bar">
            <div className="vp-time">
              <b>0:{String(sec).padStart(2, "0")}</b>
              <span>/ 0:09</span>
            </div>
            <div className="vp-aspect">9:16 · 1080p</div>
          </div>
          <div className="vp-shot-strip">
            {[0, 1, 2, 3].map(i => (
              <span key={i} className={`vp-shot-tick ${activeShot === i ? "active" : ""}`} />
            ))}
          </div>
        </div>

        {/* Right: render panel — feels like the AI is composing this */}
        <div className="video-panel">
          <div className="vp-panel-title">
            <span className="dot-led" />
            Generating ad
            <span className="vp-panel-pct">{renderPct}%</span>
          </div>

          <div className="vp-shotlist">
            <ShotRow t={local} a={0.00} b={0.22} name="01 · Hero bottle"     spec="Wide · 2.25s" />
            <ShotRow t={local} a={0.20} b={0.46} name="02 · Texture close-up" spec="Macro · 2.25s" />
            <ShotRow t={local} a={0.42} b={0.70} name="03 · Sun-ray atmos."   spec="Insert · 2.25s" />
            <ShotRow t={local} a={0.66} b={0.92} name="04 · Brand end-card"   spec="Static · 2.25s" />
          </div>

          <div className="vp-progress">
            <div className="vp-progress-track">
              <div className="vp-progress-fill" style={{ width: `${renderPct}%` }} />
            </div>
            <div className="vp-progress-meta">
              <span>{Math.floor(renderPct * 2.16)} / 216 frames</span>
              <span>·</span>
              <span>VO synthesized · EN-IN</span>
            </div>
          </div>
        </div>
      </div>
    </Layer>
  );
}

/* Default product image — a clean SVG silhouette so the slot looks like a
   product until the user drops in their own photo. Encoded as a data URL so
   we don't need a separate file. */
const DEFAULT_PRODUCT_SVG =
  "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 480">
  <defs>
    <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#fff4e3"/>
      <stop offset="35%"  stop-color="#ffd2a8"/>
      <stop offset="70%"  stop-color="#c87753"/>
      <stop offset="100%" stop-color="#5a221a"/>
    </linearGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="rgba(255,255,255,0)"/>
      <stop offset="50%" stop-color="rgba(255,255,255,0.78)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.2"/>
    </filter>
  </defs>
  <ellipse cx="120" cy="455" rx="78" ry="9" fill="rgba(0,0,0,0.5)" filter="url(#soft)"/>
  <rect x="98" y="22" width="44" height="34" rx="6" fill="#3a1f15" stroke="rgba(255,255,255,0.12)"/>
  <rect x="103" y="56" width="34" height="10" fill="#22120a"/>
  <rect x="68" y="66" width="104" height="380" rx="22" fill="url(#glass)" stroke="rgba(255,255,255,0.32)"/>
  <rect x="76" y="80" width="12" height="350" rx="6" fill="url(#shine)" opacity="0.7"/>
  <rect x="82" y="200" width="76" height="120" rx="3" fill="rgba(20,12,8,0.45)" stroke="rgba(255,255,255,0.16)"/>
  <text x="120" y="244" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="22" fill="#fff8ec" letter-spacing="2">solé</text>
  <text x="120" y="278" text-anchor="middle" font-family="ui-sans-serif, sans-serif" font-size="7" fill="rgba(255,248,236,0.8)" letter-spacing="3">RADIANCE · SERUM</text>
  <text x="120" y="310" text-anchor="middle" font-family="ui-sans-serif, sans-serif" font-size="6" fill="rgba(255,248,236,0.55)" letter-spacing="2">50 ML · 1.7 FL.OZ</text>
</svg>`);

function ShotRow({ t, a, b, name, spec }) {
  const local = clamp((t - a) / (b - a));
  const done = t >= b;
  const active = t >= a && t < b;
  return (
    <div className={`shot-row ${done ? "done" : active ? "active" : ""}`}>
      <span className="shot-status">
        {done ? (
          <svg viewBox="0 0 14 14" width="11" height="11">
            <path d="M3 7.2 5.8 10 11 4.2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : active ? <span className="shot-spinner" /> : <span className="shot-pending" />}
      </span>
      <span className="shot-name">{name}</span>
      <span className="shot-spec">{spec}</span>
      <span className="shot-bar">
        <span className="shot-bar-fill" style={{ width: `${(done ? 1 : local) * 100}%` }} />
      </span>
    </div>
  );
}

/* ── SCENE 5: Copywriting ───────────────────────────────────── */
function CopyScene({ p }) {
  const local = sceneAt(p, [0.62, 0.74]);
  return (
    <Layer p={p} range={[0.60, 0.64, 0.72, 0.76]}>
      <div className="copy-scene">
        <div className="copy-col">
          <div className="copy-eyebrow">Headlines · ×4</div>
          {HEADLINES.map((h, i) => {
            const start = 0.05 + i * 0.18;
            const dur = 0.16;
            const { shown, done } = useTypedText(h, local, start, start + dur);
            return (
              <div key={i} className={`copy-line ${done ? "done" : ""}`}>
                <span className="copy-mark">H{i + 1}</span>
                <span className="copy-text">
                  {shown}
                  {!done && local >= start ? <span className="caret" /> : null}
                </span>
              </div>
            );
          })}
        </div>
        <div className="copy-col">
          <div className="copy-eyebrow">Targeting</div>
          <div className="copy-target">
            <TargetingRow t={local} delay={0.10} label="Geo"      value="India · UAE · Singapore" />
            <TargetingRow t={local} delay={0.22} label="Age"      value="25–40, urban" />
            <TargetingRow t={local} delay={0.34} label="Interest" value="Skincare, beauty, wellness" />
            <TargetingRow t={local} delay={0.46} label="Budget"   value="₹2.4L / month · ₹8K daily" />
            <TargetingRow t={local} delay={0.58} label="Goal"     value="ROAS ≥ 3.0×" />
          </div>
        </div>
      </div>
    </Layer>
  );
}

function TargetingRow({ t, delay, label, value }) {
  const local = clamp((t - delay) / 0.18);
  const op = ease.out(local);
  return (
    <div className="target-row" style={{ opacity: op, transform: `translateY(${(1 - op) * 6}px)` }}>
      <span className="target-label">{label}</span>
      <span className="target-value">{value}</span>
    </div>
  );
}

/* ── SCENE 6: Posting to platforms ──────────────────────────── */
function PostScene({ p }) {
  const local = sceneAt(p, [0.74, 0.88]);
  return (
    <Layer p={p} range={[0.72, 0.76, 0.86, 0.90]}>
      <div className="post-scene">
        <div className="post-flow">
          <div className="post-source">
            <div className="post-source-card">
              <div className="ps-grad" />
              <div className="ps-label">Campaign · v1.2</div>
            </div>
          </div>
          <div className="post-arrows">
            {PLATFORMS.map((pl, i) => {
              const start = 0.08 + i * 0.12;
              const t = ease.inOut(clamp((local - start) / 0.18));
              return (
                <div key={pl.id} className="post-row" style={{ "--row-color": pl.color }}>
                  <div className="post-line">
                    <div className="post-line-fill" style={{ width: `${t * 100}%` }} />
                    <div className="post-pulse" style={{ left: `${t * 100}%`, opacity: t > 0 && t < 1 ? 1 : 0 }} />
                  </div>
                  <div className="post-target" style={{ opacity: 0.4 + t * 0.6, transform: `scale(${0.9 + t * 0.1})` }}>
                    <span className="post-target-glyph">
                      <PlatformGlyph id={pl.id} size={20} />
                    </span>
                    <span className="post-target-text">
                      <span className="ptt-name">{pl.name}</span>
                      <span className="ptt-status">
                        {t >= 1
                          ? <><span className="led ok" /> Live</>
                          : t > 0
                            ? <><span className="led" /> Publishing…</>
                            : <><span className="led off" /> Queued</>}
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layer>
  );
}

/* ── SCENE 7: Live metrics ──────────────────────────────────── */
function MetricsScene({ p }) {
  const local = sceneAt(p, [0.88, 1.0]);
  const t = ease.out(local);
  // Tween metrics from low to high
  const spend     = lerp(2_400, 19_140, t);
  const clicks    = lerp(400, 8180, t);
  const ctr       = lerp(0.8, 2.4, t);
  const roas      = lerp(1.2, 3.4, t);
  return (
    <Layer p={p} range={[0.86, 0.90, 1.05, 1.10]}>
      <div className="metrics-scene">
        <div className="metric-grid">
          <MetricCard label="Spend"       value={fmtMetric(spend, "money")} delta="+12.4%" up />
          <MetricCard label="Clicks"      value={fmtMetric(clicks, "k")}    delta="+24.1%" up />
          <MetricCard label="CTR"         value={fmtMetric(ctr, "pct")}     delta="+0.6%"  up />
          <MetricCard label="ROAS"        value={`${roas.toFixed(2)}×`}     delta="+1.8×"  up />
        </div>
        <div className="metric-chart">
          <svg viewBox="0 0 320 90" preserveAspectRatio="none" width="100%" height="90">
            <defs>
              <linearGradient id="ml-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%"  stopColor="var(--accent, #7648EF)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--accent, #7648EF)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <MetricsPath progress={t} />
          </svg>
          <div className="chart-foot">
            <span className="led ok" />
            Live · updating every 60 seconds
          </div>
        </div>
      </div>
    </Layer>
  );
}

function MetricsPath({ progress }) {
  // Generate a path that "draws in" with progress
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const x = (i / 24) * 320;
      const baseline = 70 - i * 1.6;
      const wobble = Math.sin(i * 0.7) * 6 + Math.sin(i * 0.3) * 4;
      pts.push([x, baseline + wobble]);
    }
    return pts;
  }, []);
  const draw = clamp(progress * 1.05);
  const upto = Math.max(2, Math.round(points.length * draw));
  const visible = points.slice(0, upto);
  const d = visible.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt[0]} ${pt[1]}`).join(" ");
  const dFill = visible.length > 1
    ? `${d} L ${visible[visible.length - 1][0]} 90 L 0 90 Z`
    : "";
  return (
    <>
      {dFill && <path d={dFill} fill="url(#ml-fill)" />}
      <path d={d} fill="none" stroke="var(--accent, #7648EF)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {visible.length > 0 && (
        <circle
          cx={visible[visible.length - 1][0]}
          cy={visible[visible.length - 1][1]}
          r="4"
          fill="var(--accent, #7648EF)"
        />
      )}
    </>
  );
}

function MetricCard({ label, value, delta, up }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className={`metric-delta ${up ? "up" : "down"}`}>
        <svg viewBox="0 0 12 12" width="10" height="10" fill="currentColor"><path d={up ? "M2 9l4-4 4 4H2z" : "M2 3l4 4 4-4H2z"} /></svg>
        {delta}
      </div>
    </div>
  );
}

/* ── Floating ambient details around the card ────────────────── */
function FloatingDetailsLeft({ p }) {
  // brand-asset chips appear during prompt → thinking, fly out during images
  const op = sceneOpacity(p, [0, 0.05, 0.28, 0.36]);
  if (op < 0.02) return null;
  return (
    <div className="float-left" style={{ opacity: op }}>
      <div className="ambient-chip">
        <div className="ac-thumb" style={{ background: "linear-gradient(135deg,#FFB199,#FF6F61)" }} />
        <div className="ac-meta"><b>Brand kit</b><span>Solé · v3</span></div>
      </div>
      <div className="ambient-chip">
        <div className="ac-thumb" style={{ background: "linear-gradient(135deg,#C7A8FF,#7648EF)" }} />
        <div className="ac-meta"><b>Last campaign</b><span>+38% ROAS</span></div>
      </div>
      <div className="ambient-chip">
        <div className="ac-thumb" style={{ background: "linear-gradient(135deg,#6FE4C5,#1C994A)" }} />
        <div className="ac-meta"><b>Audience</b><span>Lookalike 1%</span></div>
      </div>
    </div>
  );
}

function FloatingDetailsRight({ p }) {
  // metrics-y floats during posting / metrics
  const op = sceneOpacity(p, [0.7, 0.78, 1.0, 1.06]);
  if (op < 0.02) return null;
  return (
    <div className="float-right" style={{ opacity: op }}>
      <div className="ambient-chip">
        <div className="ac-glyph"><PlatformGlyph id="meta" size={18} /></div>
        <div className="ac-meta"><b>2 ad sets live</b><span>Reach 142K · CPM ₹46</span></div>
      </div>
      <div className="ambient-chip">
        <div className="ac-glyph"><PlatformGlyph id="google" size={18} /></div>
        <div className="ac-meta"><b>P-Max running</b><span>CPA ₹212 ↓ 18%</span></div>
      </div>
      <div className="ambient-chip">
        <div className="ac-glyph"><PlatformGlyph id="tiktok" size={18} /></div>
        <div className="ac-meta"><b>Spark Ads on</b><span>Avg watch 7.2s</span></div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
const stageStyles = `
.stage-wrap {
  position: absolute;
  inset: 0;
  padding: 180px 24px 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stage-card {
  position: relative;
  width: min(820px, 92vw);
  height: 100%;
  max-height: 520px;
  transform-origin: center;
  transition: transform 800ms cubic-bezier(.2,.7,.2,1);
  overflow: hidden;
}
.stage-body {
  position: relative;
  width: 100%;
  height: calc(100% - 46px);
}
.stage-layer {
  position: absolute;
  inset: 0;
  padding: 28px 32px;
  transition: opacity 240ms ease;
}

/* PROMPT */
.prompt-scene { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.prompt-label {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--nyx-font-ui);
  font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--nyx-fg-dim);
}
.prompt-label .prompt-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 8px var(--accent); }
.prompt-label .prompt-meta { margin-left: auto; font-family: var(--nyx-font-mono); font-size: 10px; padding: 3px 6px; background: var(--nyx-layer-2); border-radius: 4px; letter-spacing: 0.05em; color: var(--nyx-fg-soft); }
.prompt-input {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}
.prompt-input::before {
  content: "";
  position: absolute; inset: 0;
  background: radial-gradient(120% 80% at 0% 0%, color-mix(in srgb, var(--accent) 16%, transparent) 0%, transparent 60%);
  pointer-events: none;
}
.prompt-icon { color: var(--accent); flex-shrink: 0; padding-top: 2px; animation: drift 3s ease-in-out infinite; }
.prompt-text {
  font-family: var(--nyx-font-display);
  font-size: 15px;
  line-height: 1.55;
  color: var(--nyx-fg);
  position: relative;
  z-index: 1;
}
.prompt-hints { display: flex; flex-wrap: wrap; gap: 8px; }
.hint-chip {
  padding: 5px 12px;
  background: var(--nyx-layer-2);
  border: 1px solid var(--nyx-border);
  border-radius: 9999px;
  font-family: var(--nyx-font-ui);
  font-size: 11px;
  font-weight: 600;
  color: var(--nyx-fg);
}
.hint-chip.muted { color: var(--nyx-fg-soft); border-style: dashed; }

/* THINKING */
.thinking-scene {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 32px;
  height: 100%;
  align-items: center;
}
.orb {
  width: 140px; height: 140px;
  position: relative;
  margin: auto;
}
.orb-ring {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
}
.orb-ring.r1 { animation: orbSpin 6s linear infinite; border-top-color: var(--accent); border-right-color: transparent; border-bottom-color: transparent; border-left-color: transparent; }
.orb-ring.r2 { inset: 18px; animation: orbSpin 4s linear infinite reverse; border-bottom-color: var(--nyx-primary-soft); border-top-color: transparent; border-left-color: transparent; border-right-color: transparent; }
.orb-core {
  position: absolute; inset: 40px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--accent) 80%, white), var(--accent) 60%, color-mix(in srgb, var(--accent) 30%, black));
  box-shadow: 0 0 30px var(--accent), inset 0 0 20px color-mix(in srgb, var(--accent) 50%, white);
  animation: drift 3s ease-in-out infinite;
}
@keyframes orbSpin { to { transform: rotate(360deg); } }
.thinking-list { display: flex; flex-direction: column; gap: 14px; }
.think-row {
  display: grid;
  grid-template-columns: 18px 160px 1fr;
  align-items: center; gap: 12px;
  font-family: var(--nyx-font-ui);
  font-size: 13px;
  color: var(--nyx-fg-dim);
}
.think-row.done { color: var(--nyx-fg); }
.think-row.active { color: var(--nyx-fg); }
.think-check { color: var(--accent); display: inline-flex; align-items: center; justify-content: center; }
.think-spinner {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 1.5px solid var(--accent);
  border-right-color: transparent;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.think-bar {
  height: 4px; background: var(--nyx-layer-2); border-radius: 9999px; overflow: hidden;
}
.think-bar-fill { display: block; height: 100%; background: linear-gradient(90deg, var(--accent), var(--nyx-primary-soft)); transition: width 100ms linear; }

/* IMAGES — six distinct ad treatments featuring the product photo */
.images-scene { display: flex; flex-direction: column; height: 100%; gap: 14px; }
.images-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  min-height: 0;
}
.ad-card {
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border);
  border-radius: 10px;
  overflow: hidden;
  display: flex; flex-direction: column;
  min-height: 0;
}
.ad-canvas {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}
.ad-glow {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 15%, rgba(255,255,255,0.32), transparent 55%);
  pointer-events: none;
}
.ad-product-img {
  position: absolute;
  object-fit: contain;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,0.45));
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}
/* Layout-specific copy overlays */
.ad-copy-top {
  position: absolute;
  top: 8px; left: 12px;
  font-family: var(--nyx-font-display);
  font-weight: 600;
  font-size: 11px;
  color: rgba(255,255,255,0.88);
  letter-spacing: 0.02em;
  z-index: 2;
}
.ad-copy-big {
  position: absolute;
  top: 22px; left: 12px;
  font-family: var(--nyx-font-display);
  font-weight: 800;
  font-size: 20px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: #FFE7C9;
  text-shadow: 0 2px 12px rgba(0,0,0,0.35);
  z-index: 2;
}
.ad-copy-bottom {
  position: absolute;
  bottom: 10px; left: 0; right: 0;
  text-align: center;
  font-family: var(--nyx-font-display);
  font-weight: 700;
  font-style: italic;
  font-size: 13px;
  color: #FFF1DC;
  text-shadow: 0 2px 10px rgba(0,0,0,0.45);
  letter-spacing: -0.005em;
  z-index: 2;
}
.ad-copy-left {
  position: absolute;
  top: 50%; left: 12px; transform: translateY(-50%);
  font-family: var(--nyx-font-display);
  font-weight: 700;
  font-size: 12px;
  color: #FFF1DC;
  letter-spacing: -0.005em;
  max-width: 50%;
  line-height: 1.15;
  text-shadow: 0 2px 10px rgba(0,0,0,0.45);
  z-index: 2;
}
.ad-copy-right {
  position: absolute;
  top: 16px; right: 12px;
  text-align: right;
  font-family: var(--nyx-font-display);
  font-weight: 700;
  font-size: 13px;
  color: #FFE7C9;
  line-height: 1.05;
  letter-spacing: -0.01em;
  z-index: 2;
}
.ad-badge {
  position: absolute;
  top: 10px; left: 10px;
  padding: 4px 9px;
  background: white;
  color: #4a1a14;
  font-family: var(--nyx-font-display);
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 0.08em;
  border-radius: 9999px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  z-index: 2;
}

/* Generation shimmer that sweeps once as each card "renders in" */
.ad-generate-shimmer {
  position: absolute; inset: 0;
  background: linear-gradient(105deg,
    transparent 0%,
    rgba(255,255,255,0) 40%,
    rgba(255,255,255,0.45) 50%,
    rgba(255,255,255,0) 60%,
    transparent 100%);
  pointer-events: none;
  z-index: 3;
  animation: adShimmer 1.2s ease-out;
  mix-blend-mode: screen;
  transition: opacity 240ms ease;
}
@keyframes adShimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.ad-foot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 9px;
  font-family: var(--nyx-font-ui);
  font-size: 10px;
}
.ad-tag {
  font-weight: 700; color: var(--accent);
  letter-spacing: 0.1em; text-transform: uppercase;
}
.ad-copy { color: var(--nyx-fg-dim); }
.images-foot {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--nyx-font-ui);
  font-size: 11px;
  color: var(--nyx-fg-dim);
}
.dot-led {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--nyx-success); box-shadow: 0 0 8px var(--nyx-success);
}

/* VIDEO — cinematic preview + render panel */
.video-scene {
  display: grid;
  grid-template-columns: minmax(180px, 200px) 1fr;
  gap: 18px;
  height: 100%;
}
.video-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #0c0c0e;
  box-shadow: 0 12px 32px -12px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04);
}
/* The "video" — a product image sits centered, with a camera wrapper that
   pans/zooms across 4 shots in a 9-second loop. Mood backgrounds + effects
   cross-fade to match each shot. */

/* Mood backgrounds — full-bleed, cross-fade for each shot phase */
.vp-mood {
  position: absolute; inset: 0;
  opacity: 0;
  animation: moodCycle 9s linear infinite;
}
.mood-a {
  animation-delay: 0s;
  background:
    radial-gradient(ellipse at 50% 35%, #FFD2A8 0%, #FF9466 38%, #C84A3E 78%, #2c0f0a 100%);
}
.mood-b {
  animation-delay: 2.25s;
  background:
    radial-gradient(ellipse at 30% 30%, #FFE9C8 0%, #FFB37A 40%, #8e3b25 100%);
}
.mood-c {
  animation-delay: 4.5s;
  background:
    radial-gradient(ellipse at 65% 25%, #FFE19C 0%, #E8854A 45%, #5b1f12 100%);
}
.mood-d {
  animation-delay: 6.75s;
  background:
    radial-gradient(ellipse at 50% 65%, #1c0e0a 0%, #08060a 80%),
    radial-gradient(ellipse at 50% 30%, rgba(255,180,120,0.45), transparent 60%);
}
@keyframes moodCycle {
  0%   { opacity: 0; }
  3%   { opacity: 1; }
  22%  { opacity: 1; }
  25%  { opacity: 0; }
  100% { opacity: 0; }
}

/* Floor — a soft ground plane to anchor the bottle visually */
.vp-floor {
  position: absolute;
  bottom: 0; left: -10%; right: -10%;
  height: 26%;
  background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%);
  pointer-events: none;
  z-index: 1;
}

/* Camera wrapper — runs the cinematography. translate/scale move the
   product image to give the impression of dolly/push/pull/cut shots. */
.vp-camera {
  position: absolute;
  inset: 0;
  animation: cameraMove 9s linear infinite;
  transform-origin: 50% 60%;
  z-index: 2;
}
@keyframes cameraMove {
  /* Shot A — wide, slow push-in 0s-2.25s (0-25%) */
  0%    { transform: scale(1)    translate(0, 0); }
  22%   { transform: scale(1.12) translate(0, 1%); }
  /* Cut to Shot B — tight close-up 2.25-4.5s (25-50%) */
  25%   { transform: scale(1.7)  translate(-6%, -3%); }
  47%   { transform: scale(1.85) translate(-8%, -5%); }
  /* Cut to Shot C — atmospheric, slight tilt 4.5-6.75s (50-75%) */
  50%   { transform: scale(1.15) translate(8%, -2%); }
  72%   { transform: scale(1.05) translate(6%, 1%); }
  /* Cut to Shot D — pull back for end card 6.75-9s (75-100%) */
  75%   { transform: scale(0.78) translate(0, 4%); }
  100%  { transform: scale(0.78) translate(0, 4%); }
}

/* The image slot — let the camera do the work */
.vp-camera image-slot {
  filter: drop-shadow(0 24px 32px rgba(0,0,0,0.55));
  animation: bottleSettle 9s ease-in-out infinite;
}
@keyframes bottleSettle {
  0%, 100% { transform: rotate(-0.6deg); }
  25%      { transform: rotate(0.4deg); }
  50%      { transform: rotate(-0.3deg); }
  75%      { transform: rotate(0deg); }
}
/* Override the default slot placeholder styling to blend in */
.vp-camera image-slot {
  --slot-bg: transparent;
}

/* Effect overlays — each one fades in during its assigned shot */

/* Light pass — sweeps across during shot A (0-2.25s) */
.vp-light-pass {
  position: absolute;
  top: 0; left: -50%;
  width: 60%; height: 100%;
  background: linear-gradient(105deg, transparent 0%, rgba(255,240,210,0.45) 45%, rgba(255,255,255,0.7) 50%, rgba(255,240,210,0.45) 55%, transparent 100%);
  filter: blur(10px);
  z-index: 3;
  opacity: 0;
  animation: lightPassCycle 9s linear infinite;
}
@keyframes lightPassCycle {
  0%   { opacity: 0; transform: translateX(0); }
  3%   { opacity: 1; }
  22%  { opacity: 1; transform: translateX(280%); }
  25%  { opacity: 0; transform: translateX(280%); }
  100% { opacity: 0; transform: translateX(280%); }
}

/* Lens flare — pulses during shot B (2.25-4.5s) */
.vp-flare {
  position: absolute;
  top: 18%; right: 14%;
  width: 70px; height: 70px;
  background: radial-gradient(circle, rgba(255,240,200,0.95) 0%, rgba(255,200,140,0.3) 40%, transparent 70%);
  filter: blur(4px);
  z-index: 3;
  opacity: 0;
  animation: flareCycle 9s linear infinite;
}
@keyframes flareCycle {
  0%, 24%, 51%, 100% { opacity: 0; transform: scale(0.6); }
  28%   { opacity: 1; transform: scale(1); }
  37%   { opacity: 0.85; transform: scale(1.2); }
  47%   { opacity: 1; transform: scale(0.95); }
}

/* Sun particles — visible during shot C (4.5-6.75s) */
.vp-particles {
  position: absolute; inset: 0;
  z-index: 3;
  opacity: 0;
  animation: particlesCycle 9s linear infinite;
}
@keyframes particlesCycle {
  0%, 49%, 76%, 100% { opacity: 0; }
  53%   { opacity: 1; }
  72%   { opacity: 1; }
}
.vp-particle {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  background: rgba(255, 235, 190, 0.95);
  box-shadow: 0 0 8px rgba(255, 220, 160, 0.95);
  animation: particleFloat 2.4s ease-in-out infinite;
}
@keyframes particleFloat {
  0%   { transform: translateY(0) scale(0.6); opacity: 0; }
  20%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
}

/* End card brand overlay — shot D (6.75-9s) */
.vp-end-overlay {
  position: absolute; inset: 0;
  z-index: 4;
  pointer-events: none;
  opacity: 0;
  animation: endCardCycle 9s linear infinite;
}
@keyframes endCardCycle {
  0%, 74%, 100% { opacity: 0; }
  78%  { opacity: 1; }
  97%  { opacity: 1; }
}
.vp-end-mark {
  position: absolute;
  top: 38%; left: 50%; transform: translate(-50%, -50%);
  font-family: "Georgia", "Montserrat", serif;
  font-style: italic;
  font-weight: 700;
  font-size: 38px;
  letter-spacing: -0.01em;
  color: #FFE7C9;
  text-shadow: 0 0 28px rgba(255,180,120,0.7);
}
.vp-end-cta {
  position: absolute;
  bottom: 18%;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--nyx-font-display);
  font-weight: 600;
  font-size: 12px;
  padding: 8px 16px;
  background: white;
  color: #1a0f0c;
  border-radius: 9999px;
  white-space: nowrap;
}

/* Chrome over the video preview */
.vp-top-bar {
  position: absolute;
  top: 8px; left: 8px; right: 8px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--nyx-font-mono);
  font-size: 9px;
  color: white;
  letter-spacing: 0.08em;
  z-index: 3;
}
.vp-rec {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 7px;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  border-radius: 4px;
  letter-spacing: 0.18em;
  font-weight: 600;
}
.vp-rec-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--nyx-warning);
  box-shadow: 0 0 6px var(--nyx-warning);
  animation: recBlink 1s ease-in-out infinite;
}
@keyframes recBlink { 50% { opacity: 0.35; } }
.vp-frame {
  padding: 3px 7px;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  border-radius: 4px;
}
.vp-frame span { color: var(--accent, var(--nyx-primary-soft)); font-weight: 600; }

.vp-bottom-bar {
  position: absolute;
  bottom: 14px; left: 8px; right: 8px;
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--nyx-font-mono);
  font-size: 10px;
  color: rgba(255,255,255,0.92);
  z-index: 3;
}
.vp-time {
  display: inline-flex; align-items: baseline; gap: 6px;
  padding: 3px 7px;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  border-radius: 4px;
}
.vp-time b { font-weight: 600; color: white; }
.vp-time span { opacity: 0.6; font-size: 9px; }
.vp-aspect {
  padding: 3px 7px;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(6px);
  border-radius: 4px;
  letter-spacing: 0.08em;
}

.vp-shot-strip {
  position: absolute;
  bottom: 4px; left: 8px; right: 8px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
  z-index: 3;
}
.vp-shot-tick {
  height: 2px;
  border-radius: 2px;
  background: rgba(255,255,255,0.18);
  transition: background 220ms ease;
}
.vp-shot-tick.active {
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

/* Subtle scanline / vignette */
.vp-scan {
  position: absolute; inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.06) 3px),
    radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
  z-index: 2;
}

/* Right-side render panel */
.video-panel {
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border-muted);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex; flex-direction: column;
  gap: 12px;
  min-width: 0;
}
.vp-panel-title {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--nyx-font-ui);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--nyx-fg);
  font-weight: 700;
}
.vp-panel-pct {
  margin-left: auto;
  color: var(--accent);
  font-family: var(--nyx-font-mono);
  font-size: 12px;
  letter-spacing: 0;
}

.vp-shotlist {
  display: flex; flex-direction: column;
  gap: 8px;
}
.shot-row {
  display: grid;
  grid-template-columns: 14px 1fr auto;
  grid-template-rows: auto auto;
  column-gap: 10px;
  row-gap: 4px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--nyx-border-muted);
  border-radius: 7px;
  font-family: var(--nyx-font-ui);
  font-size: 11.5px;
  color: var(--nyx-fg-dim);
  transition: border-color 200ms ease, color 200ms ease;
}
.shot-row.active { color: var(--nyx-fg); border-color: color-mix(in srgb, var(--accent) 24%, var(--nyx-border)); }
.shot-row.done   { color: var(--nyx-fg); }
.shot-status {
  grid-row: 1 / 3;
  align-self: center;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--accent);
}
.shot-spinner {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 1.5px solid var(--accent);
  border-right-color: transparent;
  animation: spin 0.8s linear infinite;
}
.shot-pending {
  width: 8px; height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--nyx-border-strong);
}
.shot-name {
  grid-column: 2; grid-row: 1;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.shot-spec {
  grid-column: 3; grid-row: 1;
  color: var(--nyx-fg-soft);
  font-family: var(--nyx-font-mono);
  font-size: 10px;
}
.shot-bar {
  grid-column: 2 / 4; grid-row: 2;
  height: 2px;
  background: var(--nyx-layer-2);
  border-radius: 9999px;
  overflow: hidden;
}
.shot-bar-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--nyx-primary-soft));
  transition: width 80ms linear;
}

.vp-progress {
  margin-top: auto;
}
.vp-progress-track {
  height: 4px;
  background: var(--nyx-layer-2);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 6px;
}
.vp-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--nyx-primary-soft));
  box-shadow: 0 0 8px var(--accent);
  transition: width 80ms linear;
}
.vp-progress-meta {
  display: flex; gap: 8px;
  font-family: var(--nyx-font-ui);
  font-size: 10px;
  color: var(--nyx-fg-dim);
}
.vp-progress-meta span:nth-child(2) { opacity: 0.4; }

@media (max-width: 760px) {
  .video-scene { grid-template-columns: 160px 1fr; gap: 14px; }
  .shot-spec { display: none; }
}

/* COPY */
.copy-scene { display: grid; grid-template-columns: 1.1fr 1fr; gap: 20px; height: 100%; }
.copy-col { display: flex; flex-direction: column; gap: 12px; }
.copy-eyebrow {
  font-family: var(--nyx-font-ui);
  font-size: 10px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--nyx-fg-dim);
  margin-bottom: 4px;
}
.copy-line {
  display: flex;
  gap: 12px;
  padding: 10px 12px;
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border-muted);
  border-radius: 8px;
  font-family: var(--nyx-font-display);
  font-size: 13px;
  line-height: 1.45;
  color: var(--nyx-fg);
  min-height: 38px;
  transition: border-color 200ms ease;
}
.copy-line.done { border-color: color-mix(in srgb, var(--accent) 40%, var(--nyx-border)); }
.copy-mark {
  flex-shrink: 0;
  font-family: var(--nyx-font-mono);
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.05em;
  padding-top: 2px;
}
.copy-target {
  display: flex; flex-direction: column; gap: 8px;
}
.target-row {
  display: flex;
  justify-content: space-between;
  padding: 9px 12px;
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border-muted);
  border-radius: 8px;
  font-family: var(--nyx-font-ui);
  font-size: 12px;
}
.target-label { color: var(--nyx-fg-dim); font-weight: 600; letter-spacing: 0.04em; }
.target-value { color: var(--nyx-fg); font-weight: 500; }

/* POSTING */
.post-scene { height: 100%; display: flex; align-items: center; }
.post-flow {
  width: 100%;
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 22px;
  align-items: center;
}
.post-source { display: flex; justify-content: center; }
.post-source-card {
  width: 100px; height: 130px;
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border-strong);
  border-radius: 10px;
  padding: 8px;
  display: flex; flex-direction: column; gap: 6px;
  box-shadow: 0 0 30px color-mix(in srgb, var(--accent) 25%, transparent);
}
.ps-grad {
  flex: 1;
  background:
    linear-gradient(135deg, #FFB199 0%, #FF6F61 50%, #7648EF 100%);
  border-radius: 6px;
}
.ps-label {
  font-family: var(--nyx-font-ui);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--nyx-fg-dim);
  text-align: center;
}
.post-arrows { display: flex; flex-direction: column; gap: 10px; }
.post-row {
  display: grid;
  grid-template-columns: 1fr 180px;
  align-items: center;
  gap: 14px;
}
.post-line {
  position: relative;
  height: 1px;
  background: var(--nyx-border);
  border-radius: 1px;
}
.post-line-fill {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, var(--accent), var(--row-color));
  box-shadow: 0 0 8px var(--accent);
  transition: width 80ms linear;
}
.post-pulse {
  position: absolute;
  top: 50%; transform: translate(-50%, -50%);
  width: 10px; height: 10px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 12px white, 0 0 4px var(--row-color);
  transition: left 80ms linear, opacity 120ms ease;
}
.post-target {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border);
  border-radius: 8px;
  transition: opacity 200ms ease, transform 200ms ease;
}
.post-target-glyph {
  width: 24px; height: 24px;
  display: grid; place-items: center;
  background: white; border-radius: 5px;
}
.post-target-text { display: flex; flex-direction: column; line-height: 1.1; flex: 1; min-width: 0; }
.ptt-name { font-family: var(--nyx-font-ui); font-size: 12px; font-weight: 600; color: var(--nyx-fg); }
.ptt-status {
  font-family: var(--nyx-font-ui); font-size: 10px; color: var(--nyx-fg-dim);
  display: flex; align-items: center; gap: 6px; margin-top: 2px;
}
.led {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--nyx-warning); box-shadow: 0 0 6px var(--nyx-warning);
  animation: pulse 1s ease-in-out infinite;
}
.led.ok { background: var(--nyx-success); box-shadow: 0 0 6px var(--nyx-success); animation: none; }
.led.off { background: var(--nyx-border-strong); box-shadow: none; animation: none; }
@keyframes pulse { 50% { opacity: 0.4; } }

/* METRICS */
.metrics-scene { display: flex; flex-direction: column; gap: 12px; height: 100%; }
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.metric-card {
  padding: 10px 12px;
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border-muted);
  border-radius: 8px;
}
.metric-label {
  font-family: var(--nyx-font-ui);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--nyx-fg-dim);
}
.metric-value {
  font-family: var(--nyx-font-ui);
  font-size: 22px;
  font-weight: 700;
  color: var(--nyx-fg);
  margin-top: 4px;
  letter-spacing: -0.01em;
}
.metric-delta {
  display: inline-flex; align-items: center; gap: 4px;
  margin-top: 4px;
  font-family: var(--nyx-font-ui);
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
}
.metric-delta.up { color: var(--nyx-success); background: var(--nyx-success-bg); }
.metric-delta.down { color: var(--nyx-danger); background: var(--nyx-danger-bg); }
.metric-chart {
  flex: 1;
  background: var(--nyx-layer-3);
  border: 1px solid var(--nyx-border-muted);
  border-radius: 10px;
  padding: 12px;
  display: flex; flex-direction: column;
}
.metric-chart svg { flex: 1; }
.chart-foot {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--nyx-font-ui);
  font-size: 10px;
  color: var(--nyx-fg-dim);
  margin-top: 6px;
}

/* FLOAT */
.float-left, .float-right {
  position: absolute;
  top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 10px;
  transition: opacity 300ms ease;
  pointer-events: none;
}
.float-left  { left: max(24px, calc(50% - 510px)); }
.float-right { right: max(24px, calc(50% - 510px)); }
.ambient-chip {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px;
  background: rgba(28, 28, 32, 0.78);
  backdrop-filter: blur(10px);
  border: 1px solid var(--nyx-border);
  border-radius: 10px;
  box-shadow: var(--nyx-shadow-card);
  min-width: 168px;
  animation: drift 5s ease-in-out infinite;
}
.ambient-chip:nth-child(2) { animation-delay: 0.6s; }
.ambient-chip:nth-child(3) { animation-delay: 1.2s; }
.ac-thumb {
  width: 28px; height: 28px; border-radius: 7px;
  flex-shrink: 0;
}
.ac-glyph {
  width: 28px; height: 28px; border-radius: 7px;
  background: white;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.ac-meta { display: flex; flex-direction: column; line-height: 1.2; }
.ac-meta b { font-family: var(--nyx-font-ui); font-size: 11px; font-weight: 600; color: var(--nyx-fg); }
.ac-meta span { font-family: var(--nyx-font-ui); font-size: 10px; color: var(--nyx-fg-dim); margin-top: 2px; }

@media (max-width: 980px) {
  .float-left, .float-right { display: none; }
}
`;

window.StageVariation = StageVariation;
