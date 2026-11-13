import React, { useEffect, useState } from "react";
import {
  AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import { SlotReelUIFCE } from "../components/SlotReel/SlotReelUIFCE";
import { STEP, T, buildTimeline, ReelState } from "../components/SlotReel/reel";

const FONT = staticFile("fonts/Roboto-Medium.ttf");

// frames where a new slot crosses the visor → one tick each (max one per frame)
export function tickFrames(fps: number) {
  const s: ReelState = { angle: 0, blur: 0, hl: 0 };
  const tl = buildTimeline(s);
  const out: { frame: number; speed: number }[] = [];
  let prevSlot = Math.round(s.angle / STEP), prevAngle = s.angle;
  for (let f = 1; f <= Math.ceil(T.highlight * fps); f++) {
    tl.seek(f / fps, false);
    const slot = Math.round(s.angle / STEP);
    if (slot !== prevSlot) out.push({ frame: f, speed: Math.abs(s.angle - prevAngle) / STEP });
    prevSlot = slot; prevAngle = s.angle;
  }
  return out;
}

export const SlotReelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [handle] = useState(() => delayRender("Loading Roboto"));
  const [ticks] = useState(() => tickFrames(fps));

  useEffect(() => {
    const ff = new FontFace("Roboto UIFCE", `url(${FONT})`, { weight: "500" });
    ff.load().then((f) => { document.fonts.add(f); continueRender(handle); })
      .catch(() => continueRender(handle));
  }, [handle]);

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      <SlotReelUIFCE time={frame / fps} />
      {ticks.map((k) => (
        <Sequence key={k.frame} from={k.frame - 1} durationInFrames={6}>
          {/* fast spin = many quiet ticks; slow end = fewer, clearer clicks */}
          <Audio src={staticFile("sfx/tick.wav")} volume={Math.max(0.12, 0.45 - k.speed * 0.12)} />
        </Sequence>
      ))}
      <Sequence from={Math.round(T.highlight * fps) - 2}>
        <Audio src={staticFile("sfx/shimmer.wav")} volume={0.32} />
      </Sequence>
    </AbsoluteFill>
  );
};
