/* ────────────────────────────────────────────────────────────────
   Main app — composes chrome + variation switcher + active variation.
   ──────────────────────────────────────────────────────────────── */

const { useState: useStateApp } = React;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#7648EF",
  "promptText": "Generate a campaign for Solé Skincare's summer launch — premium tone, sun-kissed visuals, 2 image ad sets + 1 vertical video. Target India + UAE, ages 25–40, ROAS target 3×.",
  "headline": "From prompt to campaign in 60 seconds.",
  "subhead": "NYX writes the brief, drafts the creative, picks the platforms and pushes it live.",
  "speed": 1
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(DEFAULTS);

  // Sync accent var on :root
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
  }, [t.accent]);

  return (
    <>
      <div className="bg-fx"><div className="grain" /></div>

      <StageVariation
        promptText={t.promptText}
        headline={t.headline}
        subhead={t.subhead}
        speed={t.speed}
        accent={t.accent}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Visual" />
        <TweakColor
          label="Accent"
          value={t.accent}
          onChange={(v) => setTweak("accent", v)}
          options={["#7648EF", "#B39DFF", "#EB75B2", "#4F7CFF", "#4ADE80"]}
        />

        <TweakSection label="Copy" />
        <TweakText
          label="Headline"
          value={t.headline}
          onChange={(v) => setTweak("headline", v)}
        />
        <TweakText
          label="Prompt"
          value={t.promptText}
          onChange={(v) => setTweak("promptText", v)}
        />

        <TweakSection label="Motion" />
        <TweakSlider
          label="Speed"
          value={t.speed}
          onChange={(v) => setTweak("speed", v)}
          min={0.5} max={2} step={0.1} unit="×"
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
