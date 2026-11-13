// theme.ts — single source of truth (colours, easings, springs, timing).
import { Easing } from "remotion";

export const theme = {
  colors: {
    bg: "#C1C6E4", // lavanda original UIFCE
    bgLight: "#D9DCF1",
    bgDeep: "#A3A9D5",
    ink: "#FFFFFF", // el logo original es blanco
    shadow: "rgba(38, 46, 107, 0.22)",
    grade: "#262E6B",
    vignette: "rgba(38, 46, 107, 0.20)",
  },
  ease: {
    out: Easing.bezier(0.16, 1, 0.3, 1),
    inOut: Easing.bezier(0.83, 0, 0.17, 1),
    in: Easing.bezier(0.7, 0, 0.84, 0),
  },
  spring: {
    snappy: { damping: 14, stiffness: 160, mass: 0.6 },
    rise: { damping: 17, stiffness: 120, mass: 0.8 },
    smooth: { damping: 20, stiffness: 90, mass: 1 },
    bouncy: { damping: 11, stiffness: 170, mass: 0.7 },
  },
  // timing in SECONDS (converted with fps inside components)
  t: {
    dot: 0.13,
    wordmark: 0.33,
    wordmarkStagger: 0.13,
    line1: 1.55,
    line1Stagger: 0.033,
    line2: 1.95,
    line2Stagger: 0.022,
    breathe: 2.6,
  },
  logoWidth: 1240, // px on a 1920×1080 frame
} as const;

// Colour variants. "lavanda" is the approved original look (mesh, grade, grain, shadow);
// the flat variants are clean brand versions: solid background (or none), no texture or shadow.
// "lavandaGif" = same look without film grain or background drift (per-frame changes make GIFs explode in size).
export type Variant = "lavanda" | "lavandaGif" | "blanco" | "negro" | "transparente";
export const variants: Record<Variant, { bg: string | null; ink: string; textured: boolean; grain: boolean }> = {
  lavanda: { bg: theme.colors.bg, ink: theme.colors.ink, textured: true, grain: true },
  lavandaGif: { bg: theme.colors.bg, ink: theme.colors.ink, textured: true, grain: false },
  blanco: { bg: "#FFFFFF", ink: "#000000", textured: false, grain: false },
  negro: { bg: "#000000", ink: "#FFFFFF", textured: false, grain: false },
  transparente: { bg: null, ink: "#FFFFFF", textured: false, grain: false },
};
