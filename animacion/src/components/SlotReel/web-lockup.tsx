// Browser entry for the standalone page slot-reel-logo.html (built by scripts/build-web.mjs).
// Bundles the SAME SlotReelLockup component used for the video, so web and video never drift apart.
import React from "react";
import { createRoot } from "react-dom/client";
import { SlotReelLockup, SLUGS, Slug } from "./SlotReelLockup";

const params = new URLSearchParams(location.search);
const clean = params.has("clean");                       // ?clean&bg=transparent → OBS browser source
// ?area=cursos-libres → the reel lands on that area (default: estrategias-tecnologicas)
const area = (SLUGS as string[]).includes(params.get("area") ?? "") ? (params.get("area") as Slug) : SLUGS[0];
const initialBg = params.get("bg") === "transparent" ? "transparent" : "#262E6B";
const BGS: [string, string][] = [["Índigo", "#262E6B"], ["Lavanda", "#C1C6E4"], ["Negro", "#000000"], ["Transparente", "transparent"]];

const App: React.FC = () => {
  const [bg, setBg] = React.useState(initialBg);
  const [run, setRun] = React.useState(0);
  React.useEffect(() => { document.body.style.background = bg; }, [bg]);
  const btn: React.CSSProperties = {
    border: "1px solid rgba(255,255,255,.35)", background: "rgba(0,0,0,.35)", color: "#fff",
    padding: "8px 12px", borderRadius: 999, cursor: "pointer", font: "13px/1 system-ui, sans-serif",
  };
  return (
    <>
      <SlotReelLockup key={run} area={area} />
      {!clean && (
        <div style={{ position: "fixed", left: "50%", bottom: "2vh", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          <button style={btn} onClick={() => setRun((n) => n + 1)}>↻ Repetir</button>
          {BGS.map(([label, value]) => <button key={label} style={btn} onClick={() => setBg(value)}>{label}</button>)}
        </div>
      )}
    </>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
