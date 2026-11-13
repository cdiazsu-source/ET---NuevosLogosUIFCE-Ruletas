import React from "react";
import {
  AbsoluteFill, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig, Audio,
} from "remotion";
import { theme, variants, Variant } from "../theme";
import { BgMesh, Grade, Grain, Vignette } from "../components/Layers";
import { clamp, DOT, WORDMARK, WM_BASE, RisingGlyph } from "./LogoSting";
import areaData from "../areas.json";

export type AreaSlug = keyof typeof areaData.areas;
export const AREA_SLUGS = Object.keys(areaData.areas) as AreaSlug[];

// one scale for every area, so "UiFCE" is identical across the family
const WIDEST = Math.max(...AREA_SLUGS.map((s) => areaData.areas[s].box[2]));
const SCALE = 1720 / WIDEST;

export const AreaSting: React.FC<{ area: AreaSlug; variant: Variant }> = ({ area, variant }) => {
  const a = areaData.areas[area];
  const v = variants[variant];
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const T = (s: number) => Math.round(s * fps);

  const dotP = spring({ frame: frame - T(theme.t.dot), fps, config: theme.spring.bouncy });
  const shadowP = interpolate(frame, [T(theme.t.wordmark), T(theme.t.line1)], [0, 1], { ...clamp, easing: theme.ease.out });
  const settle = interpolate(frame, [T(theme.t.breathe), durationInFrames], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const breathe = 1 + settle * 0.018;
  const float = Math.sin(frame / 30) * 2 * settle;
  const push = interpolate(frame, [0, T(1.4)], [1.06, 1], { ...clamp, easing: theme.ease.out });

  const [bx0, by0, bx1, by1] = a.box;
  const bw = bx1 - bx0, bh = by1 - by0;
  const w = bw * SCALE, h = bh * SCALE;
  const lift = areaData.em * 0.45; // area letters rise this far (logo units)

  return (
    <AbsoluteFill>
      {v.textured ? <BgMesh still={!v.grain} /> : v.bg ? <AbsoluteFill style={{ background: v.bg }} /> : null}

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: w, height: h,
            transform: `translateY(${float}px) scale(${push * breathe})`,
            filter: v.textured ? `drop-shadow(0 ${10 * shadowP}px ${26 * shadowP}px ${theme.colors.shadow})` : undefined,
          }}
        >
          <svg viewBox={`${bx0} ${by0} ${bw} ${bh}`} width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
              <clipPath id="wm"><rect x={-20} y={-60} width={1240} height={WM_BASE + 60} /></clipPath>
            </defs>
            <g fill={v.ink}>
              <path
                d={DOT}
                style={{
                  transformBox: "fill-box", transformOrigin: "center",
                  transform: `scale(${dotP}) rotate(${interpolate(dotP, [0, 1], [-90, 0])}deg)`,
                }}
              />
              <g clipPath="url(#wm)">
                {WORDMARK.map((g, i) => (
                  <RisingGlyph key={g.key} d={g.d} dist={WM_BASE + 20}
                    delay={T(theme.t.wordmark + i * theme.t.wordmarkStagger)} config={theme.spring.rise} />
                ))}
              </g>
              {/* area name: letters rise + fade in, staggered (no clip: descenders and accents overlap between lines) */}
              {a.lines.map((line, li) =>
                line.map((g, i) => (
                  <RisingGlyph key={`${li}-${i}`} d={g.d} dist={lift}
                    delay={T(theme.t.line1 + li * 0.3 + i * theme.t.line1Stagger)} config={theme.spring.snappy} />
                )),
              )}
            </g>
          </svg>
        </div>
      </AbsoluteFill>

      {v.textured && (<><Grade />{v.grain && <Grain />}<Vignette /></>)}

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
