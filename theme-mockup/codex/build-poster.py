#!/usr/bin/env python3
"""
CODEX design showcase — typeset as an illuminated manuscript page.
Consumes the real Edge headless screenshots and sets them in columns.
"""
from PIL import Image, ImageDraw, ImageFont
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
DESIGN = ROOT / 'design'
DESIGN.mkdir(exist_ok=True)
OUT = DESIGN / 'showcase.png'

W, H = 2400, 1720
PARCHMENT = (245, 240, 225)  # warm vellum
INK = (26, 22, 18)
INK2 = (74, 70, 59)
INK3 = (139, 135, 124)
RULE = (211, 206, 192)
RULE2 = (184, 178, 162)
SEPIA = (139, 119, 85)
GOLD = (201, 168, 76)
RUBRIC = (196, 30, 58)
PAPER = (245, 240, 225)  # warm vellum
INK = (26, 22, 18)
INK2 = (74, 70, 59)
INK3 = (139, 135, 124)
RULE = (211, 206, 192)
RULE2 = (184, 178, 162)
SEPIA = (139, 119, 85)
GOLD = (201, 168, 76)
RUBRIC = (196, 30, 58)

def font(sz, kind='body'):
    table = {
        'display': ['/System/Library/Fonts/Supplemental/Cloister Black.ttf',
                    '/System/Library/Fonts/Supplemental/Bodoni 72.ttc'],
        'body': ['/System/Library/Fonts/Supplemental/Iowan Old Style.ttc',
                 '/System/Library/Fonts/Supplemental/Charter.ttc'],
        'ui': ['/System/Library/Fonts/Supplemental/Futura.ttc'],
        'mono': ['/System/Library/Fonts/Supplemental/Courier New.ttf'],
    }
    for p in table.get(kind, table['body']):
        if pathlib.Path(p).exists():
            try:
                return ImageFont.truetype(p, sz)
            except Exception:
                continue
    return ImageFont.load_default()


def fit(img, bw, bh):
    w, h = img.size
    k = min(bw / w, bh / h)
    return img.resize((int(w * k), int(h * k)), Image.LANCZOS), int(w * k), int(h * k)


def main():
    im = Image.new('RGB', (W, H), PARCHMENT)
    d = ImageDraw.Draw(im)

    # subtle paper grain
    import random
    random.seed(7)
    for _ in range(8000):
        x, y = random.randrange(W), random.randrange(H)
        if random.random() < .5:
            d.point((x, y), fill=(230, 226, 218))

    # ===== Masthead =====
    d.text((80, 40), 'CODEX LIBWRT', font=font(24, 'mono'), fill=RUBRIC)
    d.text((W - 80 - d.textlength('FOLIO MMXXVI', font=font(22, 'mono')), 42),
           'FOLIO MMXXVI', font=font(22, 'mono'), fill=INK3)
    d.line([(80, 78), (W - 80, 78)], fill=RULE2, width=1)

    d.text((80, 100), 'CODEX', font=font(140, 'display'), fill=INK)
    d.text((80, 240), 'L I B W R T', font=font(120, 'display'), fill=INK)
    d.text((84, 360), 'Incipit liber systematis de router', font=font(40, 'body'), fill=RUBRIC)
    d.text((84, 430), 'A manuscript describing the estate of the router',
           font=font(22, 'body'), fill=INK2)
    d.line([(80, 490), (W - 80, 490)], fill=INK, width=4)

    # ===== Palette =====
    d.text((80, 520), 'THE INKS', font=font(22, 'mono'), fill=RUBRIC)
    swatches = [('#F5F0E8', 'VELLUM', PAPER), ('#1A1612', 'INK', INK),
                ('#C41E3A', 'RUBRIC', RUBRIC), ('#C9A84C', 'GOLD', GOLD),
                ('#8B7355', 'SEPIA', SEPIA), ('#FDF8E7', 'VELLUM', (253,248,231))]
    sx = 80
    for hexv, name, col in swatches:
        d.rectangle([sx, 104, sx + 60, 570], fill=col, outline=RULE2, width=2)
        d.text((sx, 916), name, font=font(16, 'mono'), fill=INK)
        d.text((sx, 938), hexv, font=font(15, 'mono'), fill=INK3)
        sx += 130

    # vertical rule
    d.line([(660, 520), (660, 1000)], fill=RULE, width=1)

    # ===== Big screenshot (right, above the fold) =====
    light = Image.open(DESIGN / '02-console-light.png').convert('RGB')
    big, bw, bh = fit(light, W - 720 - 80, 600)
    bx, by = 700, 352
    d.rectangle([bx - 1, by - 1, bx + bw + 1, by + bh + 1], outline=RULE2, width=2)
    im.paste(big, (bx, by))
    d.text((bx, by + big.height + 12), 'FIG. 1  ·  THE CONSOLE, LIGHT EDITION  ·  1600 × 1100',
           font=font(20, 'mono'), fill=INK2)

    # ===== Three columns =====
    y0 = 1010
    d.line([(80, y0), (W - 80, y0)], fill=INK, width=3)
    d.line([(80, y0 + 5), (W - 80, y0 + 5)], fill=INK, width=1)

    dark = Image.open(DESIGN / '03-console-dark.png').convert('RGB')
    s1 = Image.open(DESIGN / '04-scaling-1440.png').convert('RGB')
    s4 = Image.open(DESIGN / '05-scaling-4k.png').convert('RGB')

    cols = [(80, 'FIG. 2 · DARK / 墨韵纸', dark, 'Warm-black paper, low contrast'),
            (860, 'FIG. 3 · 1440 / 1.00×', s1, 'Baseline measure'),
            (1640, 'FIG. 4 · 3840 / 1.80×', s4, 'Continuous scaling, no hardcoded steps')]
    for x, cap, src, sub in cols:
        f, fw, fh = fit(src, 700, 350)
        d.rectangle([x - 1, y0 + 20 - 1, x + fw + 1, y0 + 20 + fh + 1], outline=RULE2, width=2)
        im.paste(f, (x, y0 + 20))
        d.text((x, y0 + 20 + fh + 14), cap, font=font(20, 'mono'), fill=RUBRIC)
        d.text((x, y0 + 20 + fh + 44), sub, font=font(19, 'body'), fill=INK2)

    # vertical column rules
    for x in (820, 1600):
        d.line([(x, y0 + 16), (x, 1600)], fill=RULE, width=1)

    # ===== Footer =====
    d.line([(80, 1618), (W - 80, 1618)], fill=INK, width=2)
    d.text((80, 1636), 'CODEX LIBWRT   ·   A MANUSCRIPT LUCI THEME CONCEPT',
           font=font(18, 'mono'), fill=INK3)
    tail = 'VERIFIED · EDGE HEADLESS · 1440 / 3840 / LIGHT / DARK'
    d.text((W - 80 - d.textlength(tail, font=font(19, 'mono')), 1638),
           tail, font=font(19, 'mono'), fill=SEPIA)

    # subtle paper grain overlay
    veil = Image.new('RGB', (W, H), (0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for y in range(0, H, 4):
        vd.line([(0, y), (W, y)], fill=(2, 2, 3))
    im = Image.blend(im, veil, 0.06)

    im.save(OUT, 'PNG', optimize=True)
    print('wrote', OUT, im.size)


if __name__ == '__main__':
    main()