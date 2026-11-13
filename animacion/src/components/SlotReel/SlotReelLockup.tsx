import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { AREAS, COLORS, FACES, T_LOCKUP, buildLockupTimeline, faceLayout, radiusFor, LockupState } from "./reel";
import logo from "../../logo.json";
import areaData from "../../areas.json";

/**
 * Slot reel placed to the RIGHT of the UiFCE wordmark, at the exact size and position of the
 * area name in the static area logos. It stops on "Estrategias Tecnológicas" and the last frames
 * are identical to the static logo  uifce-estrategias-tecnologicas.
 * - `time` given  → controlled (Remotion / video).   - `time` absent → plays live; click to replay.
 * Transparent background; scales to its container (container-query units).
 */
export type Slug = keyof typeof areaData.areas;
export const SLUGS = Object.keys(areaData.areas) as Slug[];      // same order as AREAS

// ---- geometry, in logo units (the static logos' coordinate system) ----
const CAP_TOP = areaData.capTop, BASE = areaData.base;
const CAP_H = BASE - CAP_TOP;
const X0 = 1200 + 0.21 * CAP_H;                           // where the area text starts (same as static logos)
const YC = (CAP_TOP + BASE) / 2;                          // reel axis = vertical centre of the text block
const SLOT = CAP_H * 1.3;                                 // slot height (text block + room for accents/descenders)
const R = radiusFor(SLOT);
const PAD = 110;                                          // wide enough that the winner's glow is never clipped
const RIGHTS = SLUGS.map((s) => areaData.areas[s].box[2]);
const FACE_W = Math.max(...RIGHTS) - X0 + 2 * PAD;
const WIN_HALF = R * 0.92;                                // visible part of the drum (above/below the axis)

// frame box: centred on each area's FINAL lockup; one common width (worst case over all areas)
// so the wordmark has exactly the same size and height in every area's version.
const HALF_W = Math.max(...RIGHTS.map((r) => Math.max(Math.max(...RIGHTS) - r / 2, r / 2))) + 60;
const BW = 2 * HALF_W;
const BY0 = YC - WIN_HALF - 20, BH = 2 * (WIN_HALF + 20);

// the i of the wordmark = dot (first sub-path) + stem, so the dot can glow on its own
const I_D = logo.wordmark[1].d, I_SPLIT = I_D.indexOf("M", 1);
const DOT_D = I_D.slice(0, I_SPLIT), STEM_D = I_D.slice(I_SPLIT);

/** Horizontal offset that centres the final lockup of `area` (logo units). */
export const lockupBX0 = (area: Slug) => RIGHTS[Math.max(0, SLUGS.indexOf(area))] / 2 - HALF_W;

/** Where logo unit (0,0) lands and how many px one unit measures, for a lockup filling a W×H frame. */
export function lockupUnitMap(area: Slug, W: number, H: number) {
  const target = Math.max(0, SLUGS.indexOf(area));
  const BX0 = RIGHTS[target] / 2 - HALF_W;
  const u = Math.min(W, (H * BW) / BH) / BW;
  return { u, ox: (W - BW * u) / 2 - BX0 * u, oy: (H - BH * u) / 2 - BY0 * u };
}

export const SlotReelLockup: React.FC<{
  time?: number; ink?: string; area?: Slug; style?: React.CSSProperties;
  /** the i-dot glows and pulses together with the area name */
  dotGlow?: boolean;
  /** reel entrance 0…1 (the wordmark is unaffected) */
  reelIn?: number;
  /** glow colours [soft, deep] — defaults to lavanda + azul */
  glowColors?: [string, string];
  /** chained tour: start from a landed reel (neighbours hidden) */
  fromLanded?: boolean;
  /** horizontal framing override (logo units), to glide between two areas' centring */
  bx0?: number;
}> = ({ time, ink = COLORS.ink, area = SLUGS[0], style, dotGlow = false, reelIn = 1, glowColors = [COLORS.glowSoft, COLORS.glowDeep], fromLanded = false, bx0 }) => {
  const target = Math.max(0, SLUGS.indexOf(area));
  const BX0 = bx0 ?? RIGHTS[target] / 2 - HALF_W;   // centre the final lockup of this area
  const state = useRef<LockupState>({ angle: 0, blur: 0, hl: 0, glow: 0, dot: 1 }).current;
  const tl = useMemo(() => buildLockupTimeline(state, target, fromLanded), [state, target, fromLanded]);
  const [, force] = useState(0);
  const filterId = useId().replace(/:/g, "");

  if (time !== undefined) tl.seek(Math.min(time, T_LOCKUP.total), false);
  useEffect(() => {
    if (time !== undefined) return;
    tl.eventCallback("onUpdate", () => force((n) => n + 1));
    tl.restart();
    return () => { tl.pause(); tl.eventCallback("onUpdate", null); };
  }, [tl, time]);

  const u = (n: number) => `calc(var(--u) * ${n.toFixed(3)})`;   // logo units → CSS length
  const glowFilter = (g: number) => g > 0.002
    ? `drop-shadow(0 0 ${u(18 * g)} ${glowColors[0]}) drop-shadow(0 0 ${u(55 * g)} ${glowColors[1]})`
    : undefined;
  const wmBox = { position: "absolute", left: u(0 - BX0), top: u(8 - BY0), width: u(1200), height: u(347), overflow: "visible" } as const;

  return (
    <div
      onClick={() => time === undefined && tl.restart()}
      style={{
        position: "relative", width: "100%", height: "100%", containerType: "size", background: "transparent",
        overflow: "hidden", display: "grid", placeItems: "center", cursor: time === undefined ? "pointer" : undefined, ...style,
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id={filterId} x="-2%" y="-20%" width="104%" height="140%">
          <feGaussianBlur stdDeviation={`0 ${state.blur.toFixed(2)}`} />
        </filter>
      </svg>

      <div
        role="img" aria-label={`UIFCE ${AREAS[target]}`}
        style={{
          position: "relative",
          ["--u" as string]: `calc(min(100cqw, 100cqh * ${(BW / BH).toFixed(5)}) / ${BW.toFixed(3)})`,
          width: u(BW), height: u(BH),
        } as React.CSSProperties}
      >
        {/* the UiFCE wordmark — fixed, exactly where it sits in the static area logos */}
        <svg viewBox="0 8 1200 347" style={wmBox}>
          <g fill={ink}>{logo.wordmark.map((g, k) => (dotGlow && k === 1 ? <path key={g.ch} d={STEM_D} /> : <path key={g.ch} d={g.d} />))}</g>
        </svg>
        {dotGlow && (
          <svg viewBox="0 8 1200 347" style={{ ...wmBox, filter: glowFilter(state.glow) }}>
            <path d={DOT_D} fill={ink} style={{ transformBox: "fill-box", transformOrigin: "center", transform: `scale(${state.dot.toFixed(4)})` }} />
          </svg>
        )}

        {/* reel window: the text column only; top/bottom fade by mask (background stays transparent) */}
        <div
          style={{
            position: "absolute", left: u(X0 - PAD - BX0), width: u(FACE_W),
            top: u(YC - WIN_HALF - BY0), height: u(2 * WIN_HALF),
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 30%, #000 70%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, #000 30%, #000 70%, transparent 100%)",
            filter: state.blur > 0.05 ? `url(#${filterId})` : undefined,
            opacity: reelIn, transform: reelIn < 1 ? `translateX(${u(-60 * (1 - reelIn))})` : undefined,
          }}
        >
          <div style={{ position: "absolute", inset: 0, perspective: u(R * 4), perspectiveOrigin: "35% 50%" }}>
            {FACES.map((_, i) => {
              const f = faceLayout(i, state, { fadeTo: 0, grow: 0, target });
              // chained tour: the area that just landed (previous in the list) stays fully visible while centred
              if (fromLanded && i % SLUGS.length === (target + SLUGS.length - 1) % SLUGS.length && Math.abs(f.rel) < 180 / FACES.length) {
                const facing = Math.cos((f.rel * Math.PI) / 180);
                f.opacity = facing <= 0 ? 0 : Math.pow(facing, 1.6);
              }
              if (!f.visible || f.opacity < 0.003) return null;
              const a = areaData.areas[SLUGS[i % SLUGS.length]];
              const glow = f.isWinner ? state.glow : 0;
              return (
                <svg
                  key={i}
                  viewBox={`${X0 - PAD} ${YC - SLOT / 2} ${FACE_W} ${SLOT}`}
                  style={{
                    position: "absolute", left: 0, top: u(WIN_HALF - SLOT / 2), width: u(FACE_W), height: u(SLOT),
                    overflow: "visible", opacity: f.opacity, backfaceVisibility: "hidden",
                    // translateZ(−R)…translateZ(R): the centred slot is at true size (no perspective enlargement)
                    transform: `translateZ(${u(-R)}) rotateX(${f.rel}deg) translateZ(${u(R)})`,
                    filter: glowFilter(glow),
                  }}
                >
                  <g fill={ink}>{a.lines.flat().map((g, k) => <path key={k} d={g.d} />)}</g>
                </svg>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotReelLockup;
