import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoSting, clamp } from "./LogoSting";
import { SlotReelLockup, Slug, lockupUnitMap, lockupBX0 } from "../components/SlotReel/SlotReelLockup";
import { COLORS, T, T_DOT, T_LOCKUP } from "../components/SlotReel/reel";
import { BgMesh, Grade, Grain, Vignette } from "../components/Layers";
import { theme, variants, Variant } from "../theme";
import { tickFrames } from "./SlotReelScene";

// Unit logo animation → the wordmark glides into the reel lockup → reel lands on the area,
// and the i-dot lights up with the area name.
// Timing in seconds; the reel's own 0.5 s rest is trimmed by LOCKUP_SKIP.
export const UNIDAD_T = { exitStart: 3.8, exitDur: 0.7, lockupSkip: 0.15, reelIn: 0.4, tourEndHold: 1.0 };
const CUT = UNIDAD_T.exitStart + UNIDAD_T.exitDur;
/** `tour` = extra areas the reel visits after the first one, in reel order (each starts where the last landed) */
export const unidadDuration = (fps: number, tourLength = 0) =>
  Math.round((CUT + T_LOCKUP.total * (1 + tourLength) - UNIDAD_T.lockupSkip + (tourLength ? UNIDAD_T.tourEndHold : 0)) * fps);

export const UnidadAreaScene: React.FC<{ area?: Slug; variant?: Variant; tour?: Slug[] }> = ({
  area = "estrategias-tecnologicas", variant = "lavanda", tour = [],
}) => {
  const v = variants[variant];
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cut = Math.round(CUT * fps);
  const map = React.useMemo(() => lockupUnitMap(area, width, height), [area, width, height]);
  const ticks = React.useMemo(() => tickFrames(fps), [fps]);

  const segs = [area, ...tour];
  const segF = Math.round(T_LOCKUP.total * fps);
  const reelIn = interpolate(frame, [cut, cut + Math.round(UNIDAD_T.reelIn * fps)], [0, 1], { ...clamp, easing: theme.ease.out });
  const lockFrom = cut - Math.round(UNIDAD_T.lockupSkip * fps);     // frame where lockup time = 0
  const seg = Math.min(segs.length - 1, Math.max(0, Math.floor((frame - lockFrom) / segF)));
  const segFrom = lockFrom + seg * segF;
  const lockT = (frame - segFrom) / fps;                              // this segment's lockup time
  // chained segments: the framing glides from the previous area's centring to this one's during the spin
  const glide = interpolate(lockT, [T.accel, T.snap], [0, 1], { ...clamp, easing: theme.ease.inOut });
  const bx0 = seg === 0 ? undefined : lockupBX0(segs[seg - 1]) + (lockupBX0(segs[seg]) - lockupBX0(segs[seg - 1])) * glide;
  // on white the lavender halo vanishes, so the glow uses the blue for both layers
  const glowColors: [string, string] = variant === "blanco" ? [COLORS.glowDeep, COLORS.glowDeep] : [COLORS.glowSoft, COLORS.glowDeep];

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {v.textured ? <BgMesh still={!v.grain} /> : v.bg ? <AbsoluteFill style={{ background: v.bg }} /> : null}

      <LogoSting variant={variant} background={false} overlays={false} hideAfter={cut}
        exit={{ start: UNIDAD_T.exitStart, dur: UNIDAD_T.exitDur, ...map }} />

      {frame >= cut && (
        <AbsoluteFill>
          <SlotReelLockup key={seg} time={lockT} ink={v.ink} area={segs[seg]} dotGlow reelIn={seg === 0 ? reelIn : 1}
            glowColors={glowColors} fromLanded={seg > 0} bx0={bx0} />
        </AbsoluteFill>
      )}

      {v.textured && (<><Grade />{v.grain && <Grain />}<Vignette /></>)}

      {/* sound: soft whoosh on the glide, the reel's ticks + shimmer, a quiet pop on the dot */}
      <Sequence from={Math.round(UNIDAD_T.exitStart * fps) - 2}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.28} /></Sequence>
      {segs.map((_, i) => {
        const o = lockFrom + i * segF;
        return (
          <React.Fragment key={i}>
            {ticks.filter((k) => k.frame + o >= cut).map((k) => (
              <Sequence key={k.frame} from={o + k.frame - 1} durationInFrames={6}>
                <Audio src={staticFile("sfx/tick.wav")} volume={Math.max(0.12, 0.45 - k.speed * 0.12)} />
              </Sequence>
            ))}
            <Sequence from={o + Math.round(T_LOCKUP.highlight * fps) - 2}><Audio src={staticFile("sfx/shimmer.wav")} volume={0.32} /></Sequence>
            <Sequence from={o + Math.round(T_DOT.start * fps) - 1}><Audio src={staticFile("sfx/pop.wav")} volume={0.15} /></Sequence>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
