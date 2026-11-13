import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { theme } from "../theme";

// 1 — background mesh: lavender base with two slow-drifting light/deep blooms
export const BgMesh: React.FC<{ still?: boolean }> = ({ still = false }) => {
  const current = useCurrentFrame();
  const frame = still ? 0 : current;
  const d1 = Math.sin(frame / 55) * 50;
  const d2 = Math.cos(frame / 70) * 40;
  return (
    <AbsoluteFill style={{ background: theme.colors.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", width: 1500, height: 1500, borderRadius: "50%",
          top: -700, left: -420 + d1, filter: "blur(60px)",
          background: `radial-gradient(circle, ${theme.colors.bgLight}, transparent 62%)`,
        }}
      />
      <div
        style={{
          position: "absolute", width: 1300, height: 1300, borderRadius: "50%",
          bottom: -720, right: -380 - d2, filter: "blur(80px)",
          background: `radial-gradient(circle, ${theme.colors.bgDeep}, transparent 64%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// 4 — colour grade
export const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ backgroundColor: theme.colors.grade, mixBlendMode: "soft-light", opacity: 0.1 }} />
  </AbsoluteFill>
);

// 5 — grain + vignette
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  const noise = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none", backgroundImage: noise, backgroundSize: "220px",
        backgroundPosition: `${(frame * 7) % 220}px ${(frame * 13) % 220}px`,
        opacity: 0.05, mixBlendMode: "multiply",
      }}
    />
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at center, transparent 58%, ${theme.colors.vignette} 100%)`,
    }}
  />
);
