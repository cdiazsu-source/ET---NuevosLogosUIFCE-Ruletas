import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { SlotReelLockup, Slug } from "../components/SlotReel/SlotReelLockup";
import { T_LOCKUP } from "../components/SlotReel/reel";
import { BgMesh } from "../components/Layers";
import { variants, Variant } from "../theme";
import { tickFrames } from "./SlotReelScene";

// Reel beside the wordmark; every target uses the same spin profile, so the same tick schedule applies.
export const SlotReelLockupScene: React.FC<{ area?: Slug; variant?: Variant }> = ({
  area = "estrategias-tecnologicas", variant = "transparente",
}) => {
  const v = variants[variant];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ticks = React.useMemo(() => tickFrames(fps), [fps]);
  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {v.textured ? <BgMesh still={!v.grain} /> : v.bg ? <AbsoluteFill style={{ background: v.bg }} /> : null}
      <SlotReelLockup time={frame / fps} ink={v.ink} area={area} />
      {ticks.map((k) => (
        <Sequence key={k.frame} from={k.frame - 1} durationInFrames={6}>
          <Audio src={staticFile("sfx/tick.wav")} volume={Math.max(0.12, 0.45 - k.speed * 0.12)} />
        </Sequence>
      ))}
      <Sequence from={Math.round(T_LOCKUP.highlight * fps) - 2}>
        <Audio src={staticFile("sfx/shimmer.wav")} volume={0.32} />
      </Sequence>
    </AbsoluteFill>
  );
};
