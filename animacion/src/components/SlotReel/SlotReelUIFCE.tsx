import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AREAS, COLORS, FACES, T, buildTimeline, faceLayout, radiusFor, ReelState } from "./reel";
import logo from "../../logo.json";

/**
 * UIFCE cylindrical slot reel — lands on "Estrategias Tecnológicas".
 * - `time` given  → controlled: renders that exact instant (Remotion / video export).
 * - `time` absent → plays live with GSAP; click to replay.
 * Transparent background; every size is in container-query units (cqh/cqw), so it scales with its box.
 */
export const SlotReelUIFCE: React.FC<{ time?: number; fontUrl?: string; style?: React.CSSProperties }> = ({
  time, fontUrl, style,
}) => {
  const state = useRef<ReelState>({ angle: 0, blur: 0, hl: 0 }).current;
  const tl = useMemo(() => buildTimeline(state), [state]);
  const [, force] = useState(0);
  const [liveT, setLiveT] = useState(0);
  const filterId = useId().replace(/:/g, "");

  // controlled mode: jump the paused timeline to the requested instant (synchronous)
  if (time !== undefined) tl.seek(Math.min(time, T.total), false);

  // live mode: play the timeline and re-render on every GSAP tick
  useEffect(() => {
    if (time !== undefined) return;
    tl.eventCallback("onUpdate", () => { setLiveT(tl.time()); force((n) => n + 1); });
    tl.restart();
    return () => { tl.pause(); tl.eventCallback("onUpdate", null); };
  }, [tl, time]);

  const t = time ?? liveT;
  const H = 12;               // slot height, cqh
  const R = radiusFor(H);     // drum radius, cqh
  const float = Math.sin(t * 1.8) * 0.6;
  const pulse = 1 + Math.sin(t * 2.4) * 0.008;

  return (
    <div
      onClick={() => time === undefined && tl.restart()}
      style={{
        position: "relative", width: "100%", height: "100%", containerType: "size",
        background: "transparent", overflow: "hidden", cursor: time === undefined ? "pointer" : undefined,
        fontFamily: "'Roboto UIFCE', Roboto, 'Segoe UI', sans-serif", fontWeight: 500, ...style,
      }}
    >
      {fontUrl && <style>{`@font-face{font-family:'Roboto UIFCE';src:url('${fontUrl}') format('truetype');font-weight:500;}`}</style>}

      {/* vertical-only motion blur (CSS blur() cannot be directional) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id={filterId} x="-5%" y="-20%" width="110%" height="140%">
          <feGaussianBlur stdDeviation={`0 ${state.blur.toFixed(2)}`} />
        </filter>
      </svg>

      {/* 1 — identity: the original UiFCE wordmark, gently floating */}
      <svg
        viewBox="0 8 1200 347" aria-label="UIFCE"
        style={{
          position: "absolute", left: "50%", top: "7cqh", height: "min(15cqh, 22cqw)",
          transform: `translateX(-50%) translateY(${float}cqh) scale(${pulse})`,
        }}
      >
        <g fill={COLORS.ink}>{logo.wordmark.map((g) => <path key={g.ch} d={g.d} />)}</g>
      </svg>

      {/* 2 — reel window: clip + top/bottom fade (mask keeps the background transparent) */}
      <div
        style={{
          position: "absolute", left: "5cqw", right: "5cqw", top: `${60 - R}cqh`, height: `${2 * R}cqh`,
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 24%, #000 76%, transparent 100%)",
          filter: state.blur > 0.05 ? `url(#${filterId})` : undefined,
        }}
      >
        <div style={{ position: "absolute", inset: 0, perspective: "110cqh" }}>
          {FACES.map((name, i) => {
            const f = faceLayout(i, state);
            if (!f.visible) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute", left: 0, right: 0, top: "50%", height: `${H}cqh`, marginTop: `${-H / 2}cqh`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "min(6.2cqh, 4.4cqw)", color: COLORS.ink, whiteSpace: "nowrap", letterSpacing: "-0.01em",
                  opacity: f.opacity, backfaceVisibility: "hidden",
                  transform: `rotateX(${f.rel}deg) translateZ(${R}cqh) scale(${f.scale})`,
                  textShadow: f.isWinner && state.hl > 0
                    ? `0 0 ${1.1 * state.hl}cqh ${COLORS.glowSoft}, 0 0 ${3.2 * state.hl}cqh ${COLORS.glowDeep}, 0 0 ${6 * state.hl}cqh ${COLORS.glowDeep}88`
                    : undefined,
                }}
              >
                {name}
              </div>
            );
          })}
        </div>
      </div>

      {/* visor: two thin rules framing the centre slot */}
      {[-1, 1].map((s) => (
        <div
          key={s}
          style={{
            position: "absolute", left: "18cqw", right: "18cqw", height: "0.25cqh",
            top: `${60 + (s * H) / 2 * (1 + 0.15 * state.hl)}cqh`,
            background: `linear-gradient(90deg, transparent, ${COLORS.rule} 20%, ${COLORS.rule} 80%, transparent)`,
          }}
        />
      ))}

      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {`Área seleccionada: ${AREAS[0]}`}
      </span>
    </div>
  );
};

export default SlotReelUIFCE;
