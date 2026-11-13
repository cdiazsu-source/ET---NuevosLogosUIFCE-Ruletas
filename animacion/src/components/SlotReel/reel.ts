// Shared slot-reel model: areas, geometry and the GSAP timeline (5 phases).
// Used by SlotReelUIFCE.tsx (live React + Remotion video). index.html mirrors these values.
import gsap from "gsap";

export const AREAS = [
  "Estrategias Tecnológicas", // index 0 = the winner
  "Apoyos Académicos",
  "Gestión del Conocimiento",
  "Desarrollo & Automatizaciones TI",
  "Virtualización Académica",
  "Cursos Libres",
  "Coordinación",
] as const;
export const TARGET = 0; // "Estrategias Tecnológicas"
export const START = 6;  // rest position = START slots after the target ("Coordinación" when the target is index 0)

// The drum carries the list twice so the cylinder is dense like a real reel.
export const FACES = [...AREAS, ...AREAS];
export const STEP = 360 / FACES.length; // degrees between slots

export const COLORS = {
  ink: "#FFFFFF",
  glowSoft: "#C1C6E4", // lavanda UIFCE
  glowDeep: "#49689F", // azul áreas UIFCE
  rule: "rgba(193, 198, 228, 0.55)",
};

// Timeline phases (seconds)
export const T = { accel: 0.5, decel: 1.2, snap: 3.0, highlight: 3.6, end: 4.5, total: 5.0 };

export type ReelState = { angle: number; blur: number; hl: number };

/**
 * Builds the paused 5-phase GSAP timeline that animates a plain state object.
 * Phase 2 (power2.in) and phase 3 (power4.out) are sized so the reel's speed is continuous at 1.2 s.
 */
export function buildTimeline(state: ReelState) {
  const tl = spin(state);
  tl.to(state, { hl: 1, duration: T.end - T.highlight, ease: "power3.out" }, T.highlight)  // phase 5
    .to({}, { duration: T.total - T.end }, T.end);                                         // hold
  return tl;
}

/** Phases 1–4 (rest, acceleration, inertia, overshoot) shared by every reel version. */
function spin(state: ReelState, target: number = TARGET) {
  const S = (target + START) * STEP;          // same travel for every target → same speed profile
  const F = 3 * 360 + target * STEP;          // 3 full turns + land on the target
  const preSnap = F - 0.5 * STEP;             // phase 3 stops half a slot short; phase 4 overshoots into place
  const dur2 = T.decel - T.accel, dur3 = T.snap - T.decel;
  // v_end(power2.in) = 2·a/dur2 must equal v_start(power4.out) = 4·d/dur3, with a + d = preSnap − S
  const a = (preSnap - S) / (1 + (2 * dur3) / (4 * dur2));

  state.angle = S; state.blur = 0; state.hl = 0;
  const tl = gsap.timeline({ paused: true });
  tl.to(state, { angle: S + a, duration: dur2, ease: "power2.in" }, T.accel)              // phase 2
    .to(state, { blur: 8, duration: dur2, ease: "power2.in" }, T.accel)
    .to(state, { angle: preSnap, duration: dur3, ease: "power4.out" }, T.decel)            // phase 3
    .to(state, { blur: 0, duration: dur3 * 0.75, ease: "power2.out" }, T.decel)
    .to(state, { angle: F, duration: T.highlight - T.snap, ease: "back.out(1.7)" }, T.snap); // phase 4
  return tl;
}

// Lockup version (reel beside the wordmark): ends EXACTLY on the static area logo —
// neighbours fade out completely, the glow flares and settles back to zero, no scale-up.
export const T_LOCKUP = { ...T, glowPeak: 4.0, settle: 4.9, total: 5.5 };
export type LockupState = ReelState & { glow: number; dot: number };
// i-dot pulse (only drawn when the lockup is asked for it): starts a few frames after the name lights up
export const T_DOT = { start: T.highlight + 0.09, peak: T.highlight + 0.33 };

export function buildLockupTimeline(state: LockupState, target: number = TARGET) {
  state.glow = 0; state.dot = 1;
  const tl = spin(state, target);
  tl.to(state, { dot: 1.12, duration: T_DOT.peak - T_DOT.start, ease: "power2.out" }, T_DOT.start)
    .to(state, { dot: 1, duration: T_LOCKUP.settle - T_DOT.peak, ease: "elastic.out(1, 0.45)" }, T_DOT.peak);
  tl.to(state, { hl: 1, duration: 0.7, ease: "power2.out" }, T.highlight)                       // neighbours → 0
    .to(state, { glow: 1, duration: T_LOCKUP.glowPeak - T.highlight, ease: "power2.out" }, T.highlight)
    .to(state, { glow: 0, duration: T_LOCKUP.settle - T_LOCKUP.glowPeak, ease: "power2.inOut" }, T_LOCKUP.glowPeak)
    .to({}, { duration: T_LOCKUP.total - T_LOCKUP.settle }, T_LOCKUP.settle);                  // hold = static logo
  return tl;
}

/** Per-face transform/opacity for a given drum angle (relative units: 1 = slot height). */
export function faceLayout(i: number, state: ReelState, opts: { fadeTo?: number; grow?: number; target?: number } = {}) {
  const { fadeTo = 0.3, grow = 0.15, target = TARGET } = opts;
  let rel = i * STEP - state.angle;
  rel = ((rel % 360) + 540) % 360 - 180; // −180…180, 0 = centre of the visor
  const facing = Math.cos((rel * Math.PI) / 180);
  const isWinner = i % AREAS.length === target && Math.abs(rel) < STEP / 2;
  const base = facing <= 0 ? 0 : Math.pow(facing, 1.6);
  const opacity = isWinner ? base : base * (1 - (1 - fadeTo) * state.hl); // neighbours fade to `fadeTo`
  const scale = isWinner ? 1 + grow * state.hl : 1;
  return { rel, opacity, scale, isWinner, visible: facing > 0.02 };
}

/** Drum radius for slot height h so neighbouring faces touch. */
export const radiusFor = (h: number) => h / 2 / Math.tan(((STEP / 2) * Math.PI) / 180);
