import React from "react";
import {
  AbsoluteFill, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Audio,
} from "remotion";
import { theme, variants, Variant } from "../theme";
import { BgMesh, Grade, Grain, Vignette } from "../components/Layers";
import logo from "../logo.json";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// split the hand-drawn "i" into dot (first sub-path) + stem
const iPath = logo.wordmark[1].d;
const iSplit = iPath.indexOf("M", 1);
export const DOT = iPath.slice(0, iSplit);
const I_STEM = iPath.slice(iSplit);

// wordmark rise order: u, i-stem, F, C, E
export const WORDMARK = [
  { key: "u", d: logo.wordmark[0].d },
  { key: "i", d: I_STEM },
  { key: "F", d: logo.wordmark[2].d },
  { key: "C", d: logo.wordmark[3].d },
  { key: "E", d: logo.wordmark[4].d },
];
export const WM_BASE = 354; // just under the wordmark baseline/overshoot (logo units)

export const RisingGlyph: React.FC<{ d: string; delay: number; dist: number; config: object }> = ({ d, delay, dist, config }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config });
  const y = interpolate(p, [0, 1], [dist, 0]);
  const o = interpolate(p, [0, 0.35], [0, 1], clamp);
  return <path d={d} style={{ transform: `translateY(${y}px)`, opacity: o }} />;
};

/** Optional exit used when the sting hands over to another scene: caption lines leave and the
 *  wordmark glides to a target pose (logo unit (0,0) → (ox, oy) px, `u` px per unit). */
export type StingExit = { start: number; dur: number; u: number; ox: number; oy: number };

export const LogoSting: React.FC<{
  variant: Variant; background?: boolean; overlays?: boolean; exit?: StingExit; hideAfter?: number;
}> = ({ variant, background = true, overlays = true, exit, hideAfter }) => {
  const v = variants[variant];
  const realFrame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  // during an exit the idle motion freezes so the glide starts from a fixed pose
  const frame = exit ? Math.min(realFrame, Math.round(exit.start * fps)) : realFrame;
  const T = (s: number) => Math.round(s * fps);

  // the i-dot: the first hit — pops with a bouncy spring and a quarter turn
  const dotP = spring({ frame: frame - T(theme.t.dot), fps, config: theme.spring.bouncy });
  const dotScale = interpolate(dotP, [0, 1], [0, 1]);
  const dotRot = interpolate(dotP, [0, 1], [-90, 0]);

  // shadow grows as the wordmark lands
  const shadowP = interpolate(frame, [T(theme.t.wordmark), T(theme.t.line1)], [0, 1], { ...clamp, easing: theme.ease.out });

  // idle breathing once everything has landed (slow, ease in-out)
  const settle = interpolate(frame, [T(theme.t.breathe), durationInFrames], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const breathe = 1 + settle * 0.018;
  const float = Math.sin(frame / 30) * 2 * settle;

  // whole-logo intro push: starts slightly larger, settles to 1
  const push = interpolate(frame, [0, T(1.4)], [1.06, 1], { ...clamp, easing: theme.ease.out });

  const scale = theme.logoWidth / logo.width;
  const s1k = (k: number) => scale * k;
  const w = logo.width * scale, h = logo.height * scale;

  const line1 = logo.lines[0].glyphs, line2 = logo.lines[1].glyphs;

  // exit: wordmark glide (straight-line affine move, ease in-out) + captions rise out (faster, staggered)
  let outer = "", exitP = 0, cap1 = { o: 1, y: 0 }, cap2 = { o: 1, y: 0 };
  if (exit) {
    const e0 = T(exit.start), e1 = e0 + T(exit.dur);
    const p = interpolate(realFrame, [e0, e1], [0, 1], { ...clamp, easing: theme.ease.inOut });
    const k0 = s1k(push * breathe);
    const m = 1 + (exit.u / k0 - 1) * p;
    const dx = (exit.ox - (width / 2 - (logo.width / 2) * exit.u)) * p;
    const dy = (exit.oy - (height / 2 - (logo.height / 2) * exit.u) - float * (exit.u / k0)) * p;
    exitP = p;
    outer = `translate(${dx}px, ${dy}px) scale(${m})`;
    const capOut = (d: number) => {
      const q = interpolate(realFrame, [e0 + d, e0 + d + T(0.33)], [0, 1], { ...clamp, easing: theme.ease.in });
      return { o: 1 - q, y: -46 * q };
    };
    cap1 = capOut(0); cap2 = capOut(T(0.1));
  }

  return (
    <AbsoluteFill>
      {/* 1 background */}
      {background && (v.textured ? <BgMesh still={!v.grain} /> : v.bg ? <AbsoluteFill style={{ background: v.bg }} /> : null)}

      {/* 3 graphics: the original logo */}
      {(hideAfter === undefined || realFrame < hideAfter) && (
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: outer || undefined, transformOrigin: "50% 50%" }}>
        <div
          style={{
            width: w, height: h,
            transform: `translateY(${float}px) scale(${push * breathe})`,
            filter: v.textured ? `drop-shadow(0 ${14 * shadowP * (1 - exitP)}px ${34 * shadowP * (1 - exitP)}px ${theme.colors.shadow})` : undefined,
          }}
        >
          <svg viewBox={`0 0 ${logo.width} ${logo.height}`} width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
              <clipPath id="wm"><rect x={-20} y={-60} width={logo.width + 40} height={WM_BASE + 60} /></clipPath>
              <clipPath id="l1"><rect x={-20} y={366} width={logo.width + 40} height={102} /></clipPath>
              <clipPath id="l2"><rect x={-20} y={481} width={logo.width + 40} height={60} /></clipPath>
            </defs>
            <g fill={v.ink}>
              {/* dot of the i */}
              <path
                d={DOT}
                style={{
                  transformBox: "fill-box", transformOrigin: "center",
                  transform: `scale(${dotScale}) rotate(${dotRot}deg)`,
                }}
              />
              {/* wordmark letters rise out of the baseline */}
              <g clipPath="url(#wm)">
                {WORDMARK.map((g, i) => (
                  <RisingGlyph
                    key={g.key} d={g.d} dist={WM_BASE + 20}
                    delay={T(theme.t.wordmark + i * theme.t.wordmarkStagger)}
                    config={theme.spring.rise}
                  />
                ))}
              </g>
              {/* caption line 1 — letter stagger */}
              <g clipPath="url(#l1)" style={{ opacity: cap1.o, transform: `translateY(${cap1.y}px)` }}>
                {line1.map((g, i) => (
                  <RisingGlyph key={i} d={g.d} dist={80}
                    delay={T(theme.t.line1 + i * theme.t.line1Stagger)} config={theme.spring.snappy} />
                ))}
              </g>
              {/* caption line 2 */}
              <g clipPath="url(#l2)" style={{ opacity: cap2.o, transform: `translateY(${cap2.y}px)` }}>
                {line2.map((g, i) => (
                  <RisingGlyph key={i} d={g.d} dist={50}
                    delay={T(theme.t.line2 + i * theme.t.line2Stagger)} config={theme.spring.snappy} />
                ))}
              </g>
            </g>
          </svg>
        </div>
      </AbsoluteFill>
      )}

      {/* 4 grade, 5 grain + vignette */}
      {overlays && v.textured && (<><Grade />{v.grain && <Grain />}<Vignette /></>)}

      {/* sound: each cue starts ~2 frames before its visual hit */}
      <Sequence from={Math.max(0, T(theme.t.dot) - 2)}><Audio src={staticFile("sfx/pop.wav")} volume={0.55} /></Sequence>
      <Sequence from={T(theme.t.wordmark) - 3}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.5} /></Sequence>
      {WORDMARK.map((_, i) => (
        <Sequence key={i} from={T(theme.t.wordmark + i * theme.t.wordmarkStagger + 0.17) - 2}>
          <Audio src={staticFile("sfx/thump.wav")} volume={0.32} />
        </Sequence>
      ))}
      <Sequence from={T(theme.t.line1) - 2}><Audio src={staticFile("sfx/shimmer.wav")} volume={0.3} /></Sequence>
      <Sequence from={T(theme.t.breathe) - 4}><Audio src={staticFile("sfx/pad.wav")} volume={0.22} /></Sequence>
    </AbsoluteFill>
  );
};
