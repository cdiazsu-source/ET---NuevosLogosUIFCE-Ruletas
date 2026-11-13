// Synthesises a small, deterministic SFX kit as 16-bit mono WAVs into public/sfx/.
import { writeFileSync, mkdirSync } from "node:fs";

const SR = 48000;
mkdirSync("public/sfx", { recursive: true });

function wav(name, samples) {
  const n = samples.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  let peak = 1e-9; // loop, not Math.max(...spread): long arrays overflow the call stack
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  samples.forEach((s, i) => buf.writeInt16LE(Math.round((s / peak) * 0.9 * 32767), 44 + i * 2));
  writeFileSync(`public/sfx/${name}.wav`, buf);
}

// deterministic noise
let seed = 1234567;
const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;
const len = (s) => Math.round(s * SR);

// pop: pitch-dropping sine with a fast decay (the i-dot)
wav("pop", Array.from({ length: len(0.22) }, (_, i) => {
  const t = i / SR, f = 220 + 700 * Math.exp(-t * 28);
  return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 18) * Math.min(1, t * 400);
}));

// whoosh: noise through a swept one-pole low-pass, swelling envelope
{
  const N = len(0.75); let y = 0; const out = [];
  for (let i = 0; i < N; i++) {
    const t = i / N, cutoff = 300 + 5000 * Math.sin(Math.PI * t) ** 2;
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    y += a * (rnd() - y);
    out.push(y * Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 2);
  }
  wav("whoosh", out);
}

// thump: soft low sine kick for each letter landing
wav("thump", Array.from({ length: len(0.18) }, (_, i) => {
  const t = i / SR, f = 70 + 90 * Math.exp(-t * 35);
  return Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 22) * Math.min(1, t * 600);
}));

// shimmer: bright partials with tremolo and slow decay (caption reveal)
wav("shimmer", Array.from({ length: len(1.2) }, (_, i) => {
  const t = i / SR, env = Math.min(1, t * 30) * Math.exp(-t * 3.2);
  const trem = 0.75 + 0.25 * Math.sin(2 * Math.PI * 9 * t);
  return [1760, 2217, 2637, 3520].reduce((s, f, k) => s + Math.sin(2 * Math.PI * f * t + k) / (k + 1), 0) * env * trem;
}));

// pad: detuned warm chord (D major add9) fading in/out under the final hold
wav("pad", Array.from({ length: len(2.6) }, (_, i) => {
  const t = i / SR, env = Math.sin(Math.PI * Math.min(1, t / 2.6)) ** 1.5;
  return [293.66, 369.99, 440, 659.25].reduce(
    (s, f) => s + Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 1.004 * t), 0) * env;
}));

// tick: short mechanical click (slot reel passing a slot)
wav("tick", Array.from({ length: len(0.035) }, (_, i) => {
  const t = i / SR;
  return (Math.sin(2 * Math.PI * 2400 * t) * 0.6 + rnd() * 0.4) * Math.exp(-t * 160);
}));

console.log("sfx written to public/sfx/");
