import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { LogoSting, clamp } from "./LogoSting";
import { SlotReelLockup, Slug, lockupUnitMap } from "../components/SlotReel/SlotReelLockup";
import { COLORS, T_DOT, T_LOCKUP } from "../components/SlotReel/reel";
import { BgMesh, Grade, Grain, Vignette } from "../components/Layers";
import { theme, variants, Variant } from "../theme";
import { tickFrames } from "./SlotReelScene";

// Unit logo animation → the wordmark glides into the reel lockup → reel lands on the area,
// and the i-dot lights up with the area name.
// Timing in seconds; the reel's own 0.5 s rest is trimmed by LOCKUP_SKIP.
export const UNIDAD_T = { exitStart: 3.8, exitDur: 0.7, lockupSkip: 0.15, reelIn: 0.4 };
const CUT = UNIDAD_T.exitStart + UNIDAD_T.exitDur;
export const unidadDuration = (fps: number) => Math.round((CUT + T_LOCKUP.total - UNIDAD_T.lockupSkip) * fps);

export const UnidadAreaScene: React.FC<{ area?: Slug; variant?: Variant }> = ({
  area = "estrategias-tecnologicas", variant = "lavanda",
}) => {
  const v = variants[variant];
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const cut = Math.round(CUT * fps);
  const map = React.useMemo(() => lockupUnitMap(area, width, height), [area, width, height]);
  const ticks = React.useMemo(() => tickFrames(fps), [fps]);

  const lockT = (frame - cut) / fps + UNIDAD_T.lockupSkip;          // lockup timeline time
  const reelIn = interpolate(frame, [cut, cut + Math.round(UNIDAD_T.reelIn * fps)], [0, 1], { ...clamp, easing: theme.ease.out });
  const lockFrom = cut - Math.round(UNIDAD_T.lockupSkip * fps);     // frame where lockup time = 0
  // on white the lavender halo vanishes, so the glow uses the blue for both layers
  const glowColors: [string, string] = variant === "blanco" ? [COLORS.glowDeep, COLORS.glowDeep] : [COLORS.glowSoft, COLORS.glowDeep];

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {v.textured ? <BgMesh still={!v.grain} /> : v.bg ? <AbsoluteFill style={{ background: v.bg }} /> : null}

      <LogoSting variant={variant} background={false} overlays={false} hideAfter={cut}
        exit={{ start: UNIDAD_T.exitStart, dur: UNIDAD_T.exitDur, ...map }} />

      {frame >= cut && (
        <AbsoluteFill>
          <SlotReelLockup time={lockT} ink={v.ink} area={area} dotGlow reelIn={reelIn} glowColors={glowColors} />
        </AbsoluteFill>
      )}

      {v.textured && (<><Grade />{v.grain && <Grain />}<Vignette /></>)}

      {/* sound: soft whoosh on the glide, the reel's ticks + shimmer, a quiet pop on the dot */}
      <Sequence from={Math.round(UNIDAD_T.exitStart * fps) - 2}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.28} /></Sequence>
      {ticks.filter((k) => k.frame + lockFrom >= cut).map((k) => (
        <Sequence key={k.frame} from={lockFrom + k.frame - 1} durationInFrames={6}>
          <Audio src={staticFile("sfx/tick.wav")} volume={Math.max(0.12, 0.45 - k.speed * 0.12)} />
        </Sequence>
      ))}
      <Sequence from={lockFrom + Math.round(T_LOCKUP.highlight * fps) - 2}><Audio src={staticFile("sfx/shimmer.wav")} volume={0.32} /></Sequence>
      <Sequence from={lockFrom + Math.round(T_DOT.start * fps) - 1}><Audio src={staticFile("sfx/pop.wav")} volume={0.15} /></Sequence>
    </AbsoluteFill>
  );
};
