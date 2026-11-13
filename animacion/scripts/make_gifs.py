"""Build high-quality GIFs (+ full-alpha animated WebP) from Remotion PNG sequences, then verify them.

usage: python make_gifs.py <seq_dir> <out_dir> <name_prefix>
  <seq_dir> must contain the sub-folders  lavandaGif/  blanco/  negro/  transparente/  (PNG frames)
  writes  <prefix>.gif, <prefix>-fondo-blanco.gif, <prefix>-fondo-negro.gif,
          <prefix>-transparente.gif, <prefix>-transparente.webp
"""
import glob, os, sys
from PIL import Image, ImageSequence, ImageChops, ImageStat

HOLD_END = 2000  # ms the final logo stays before the loop restarts
FPS = 30

def frames(seq, sub):
    files = sorted(glob.glob(os.path.join(seq, sub, '*.png')))
    if not files: raise SystemExit(f'no frames in {os.path.join(seq, sub)}')
    return [Image.open(f) for f in files]

def durations(n):
    d = [40 if i % 3 == 1 else 30 for i in range(n)]  # 30/40/30 ms ≈ 33.3 ms (GIF uses centiseconds)
    d[-1] = HOLD_END
    return d

def save_gif(path, pal_frames, **kw):
    pal_frames[0].save(path, save_all=True, append_images=pal_frames[1:], loop=0,
                       duration=durations(len(pal_frames)), optimize=False, **kw)

GREY = [v for g in range(256) for v in (g, g, g)]

def grey_gif(src, path):
    # exact: grey level L -> palette index L (Pillow's quantize() drifts off pure white/black)
    out = []
    for im in src:
        L = im.convert('L'); p = Image.frombytes('P', L.size, L.tobytes()); p.putpalette(GREY); out.append(p)
    save_gif(path, out)

def lavender_gif(src, path):
    src = [im.convert('RGB') for im in src]
    keys = [src[i] for i in (0, 40, 75, len(src) - 1)]
    strip = Image.new('RGB', (keys[0].width, keys[0].height * len(keys)))
    for i, k in enumerate(keys): strip.paste(k, (0, i * k.height))
    pal = strip.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
    save_gif(path, [im.quantize(palette=pal, dither=Image.Dither.NONE) for im in src])

def transparent_gif(src, path):
    pal = [0, 0, 0, 255, 255, 255] + [0, 0, 0] * 254  # 0 = transparent, 1 = white; alpha cut at 50 %
    out = []
    for im in src:
        p = im.convert('RGBA').split()[3].point(lambda v: 1 if v >= 128 else 0).convert('P'); p.putpalette(pal); out.append(p)
    save_gif(path, out, transparency=0, disposal=2)

def transparent_webp(src, path):
    rgba = [im.convert('RGBA') for im in src]
    # WebP stores milliseconds: 33/33/34 keeps exact 30 fps (a flat 33 ms drifts ~2 frames over 5 s)
    durs = [34 if i % 3 == 2 else 33 for i in range(len(rgba) - 1)] + [HOLD_END]
    rgba[0].save(path, save_all=True, append_images=rgba[1:], duration=durs,
                 loop=0, lossless=True, method=4)

def verify(path, src, alpha_only):
    """Compare decoded animation with the source frames at the same timestamps."""
    fr, starts, t = [], [], 0
    for f in ImageSequence.Iterator(Image.open(path)):
        fr.append(f.convert('RGBA')); starts.append(t); t += f.info.get('duration', 0)
    worst = 0
    for i in (5, 25, 45, 60, 90, len(src) - 1):
        ms = i * 1000 / FPS + 5 if i < len(src) - 1 else t - 10
        b = fr[max(k for k, st in enumerate(starts) if st <= ms)]; a = src[i].convert('RGBA')
        if alpha_only:
            A = a.split()[3].point(lambda v: 255 if v >= 128 else 0); B = b.split()[3].point(lambda v: 255 if v >= 128 else 0)
            d = ImageChops.difference(A, B).histogram()[255] / (A.width * A.height) * 100
        else:
            d = sum(ImageStat.Stat(ImageChops.difference(a.convert('RGB'), b.convert('RGB'))).mean) / 3
        worst = max(worst, d)
    return t / 1000, worst

if __name__ == '__main__':
    seq, out, prefix = sys.argv[1:4]
    os.makedirs(out, exist_ok=True)
    jobs = [
        ('lavandaGif', f'{prefix}.gif', lavender_gif, False, 3.0),
        ('blanco', f'{prefix}-fondo-blanco.gif', grey_gif, False, 0.01),
        ('negro', f'{prefix}-fondo-negro.gif', grey_gif, False, 0.01),
        ('transparente', f'{prefix}-transparente.gif', transparent_gif, True, 0.01),
        ('transparente', f'{prefix}-transparente.webp', transparent_webp, True, 0.1),
    ]
    ok = True
    for sub, name, fn, alpha, limit in jobs:
        src = frames(seq, sub); path = os.path.join(out, name)
        fn(src, path)
        dur, worst = verify(path, src, alpha)
        expected = (len(src) - 1) / FPS + HOLD_END / 1000      # animation length + final hold
        good = worst <= limit and abs(dur - expected) <= 0.12
        ok &= good
        print(f'{"OK " if good else "MAL"} {name}  {os.path.getsize(path)/1e6:.1f} MB  {dur:.2f}s  '
              f'{"alfa distinto %" if alpha else "error medio"}={worst:.3f}')
    sys.exit(0 if ok else 1)
