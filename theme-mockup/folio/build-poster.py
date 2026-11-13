#!/usr/bin/env python3
"""
FOLIO design showcase — typeset as an actual newspaper front page.
Consumes the real Edge headless screenshots and sets them in columns.
"""
from PIL import Image, ImageDraw, ImageFont
import pathlib

D = pathlib.Path(__file__).resolve().parent
OUT = D / 'poster.png'
W, H = 2400, 1720
PAPER = (244, 241, 232)
CARD = (250, 248, 241)
INK = (26, 26, 24)
INK2 = (74, 72, 65)
INK3 = (139, 135, 124)
RULE = (211, 206, 192)
RULE2 = (184, 178, 162)
RED = (178, 58, 46)


def font(sz, kind='body', italic=False):
    table = {
        'display': ['/System/Library/Fonts/Supplemental/Didot.ttc', '/System/Library/Fonts/Supplemental/Bodoni 72.ttc'],
        'display-i': ['/System/Library/Fonts/Supplemental/Didot.ttc', '/System/Library/Fonts/Supplemental/Bodoni 72.ttc'],
        'body': ['/System/Library/Fonts/Supplemental/Iowan Old Style.ttc', '/System/Library/Fonts/Supplemental/Charter.ttc'],
        'ui': ['/System/Library/Fonts/Supplemental/Futura.ttc', '/System/Library/Fonts/Avenir Next.ttc'],
        'mono': ['/System/Library/Fonts/Supplemental/Courier New.ttf'],
        'cjk': ['/System/Library/Fonts/Supplemental/Songti.ttc', '/System/Library/Fonts/STHeiti Light.ttc'],
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
    return img.resize((int(w * k), int(h * k)), Image.LANCZOS)


def main():
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    # newsprint grain
    import random
    random.seed(7)
    for _ in range(9000):
        x, y = random.randrange(W), random.randrange(H)
        if random.random() < .5:
            d.point((x, y), fill=(236, 232, 221))

    # ===== masthead =====
    d.text((80, 40), 'THE LIBWRT REVIEW', font=font(24, 'mono'), fill=RED)
    d.text((W - 80 - d.textlength('VOL. 25 · NO. 12     PRICE: ONE PACKET', font=font(22, 'mono')), 42),
           'VOL. 25 · NO. 12     PRICE: ONE PACKET', font=font(22, 'mono'), fill=INK3)
    d.line([(80, 78), (W - 80, 78)], fill=RULE2, width=1)

    d.text((80, 96), '刊', font=font(150, 'display'), fill=INK)
    d.text((230, 108), 'FOLIO', font=font(148, 'display'), fill=INK, anchor='la')
    # italic subtitle overlay in red
    d.text((232, 262), 'A theme set in type, not decorated', font=font(40, 'body'), fill=RED)
    d.text((84, 282), 'AN EDITORIAL INTERFACE FOR L U C I   /   OPENWRT', font=font(22, 'mono'), fill=INK2)
    d.line([(80, 320), (W - 80, 320)], fill=INK, width=4)
    d.line([(80, 328), (W - 80, 328)], fill=INK, width=1)

    # ===== lead + palette column (left) =====
    d.text((80, 352), 'THE BRIEF', font=font(22, 'mono'), fill=RED)
    lead = [
        'We grew tired of glowing dashes and shout-',
        'ing capitals. So we typeset the router',
        'instead: a masthead, a folio, a numbered',
        'index, and hairline rules. The data is',
        'the story; the design only sets the column.',
        '',
        'Didot for the masthead. Iowan Old Style',
        'for reading. Futura for the small labels.',
        'One vermilion ink, used sparingly. Nothing',
        'else competes for attention.',
    ]
    for i, line in enumerate(lead):
        d.text((80, 390 + i * 34), line, font=font(23, 'body'), fill=INK2)

    # color chips
    d.text((80, 790), 'THE INKS', font=font(22, 'mono'), fill=RED)
    chips = [('#F4F1E8', 'PAPER', PAPER), ('#1A1A18', 'INK', INK),
             ('#B23A2E', 'SEAL', RED), ('#8B877C', 'MARGIN', INK3)]
    cx = 80
    for hexv, nm, col in chips:
        d.rectangle([cx, 830, cx + 56, 886], fill=col, outline=RULE2)
        d.text((cx, 894), nm, font=font(16, 'mono'), fill=INK)
        d.text((cx, 916), hexv, font=font(15, 'mono'), fill=INK3)
        cx += 120

    # vertical rule separating columns
    d.line([(660, 352), (660, 1000)], fill=RULE, width=1)

    # ===== big screenshot (right, above the fold) =====
    light = Image.open('/tmp/folio-light.png').convert('RGB')
    big = fit(light, W - 720 - 80, 620)
    bx, by = 700, 352
    d.rectangle([bx - 1, by - 1, bx + big.width + 1, by + big.height + 1], outline=RULE2)
    im.paste(big, (bx, by))
    d.text((bx, by + big.height + 12), 'FIG. 1  ·  THE CONSOLE, LIGHT EDITION  ·  1600 × 1100',
           font=font(20, 'mono'), fill=INK2)

    # ===== three-column lower section =====
    y0 = 1010
    d.line([(80, y0), (W - 80, y0)], fill=INK, width=3)
    d.line([(80, y0 + 5), (W - 80, y0 + 5)], fill=INK, width=1)

    dark = Image.open('/tmp/folio-dark.png').convert('RGB')
    s1 = Image.open('/tmp/folio-scaling-1440.png').convert('RGB')
    s4 = Image.open('/tmp/folio-scaling-4k.png').convert('RGB')

    cols = [(80, 'FIG. 2 · DARK / 墨黑纸', dark, 'Warm-black paper, low contrast'),
            (860, 'FIG. 3 · 1440 / 1.00×', s1, 'Baseline measure'),
            (1640, 'FIG. 4 · 3840 / 1.80×', s4, 'Continuous scaling, not hard-coded')]
    for x, cap, src, sub in cols:
        f = fit(src, 700, 350)
        d.rectangle([x - 1, y0 + 24 - 1, x + f.width + 1, y0 + 24 + f.height + 1], outline=RULE2)
        im.paste(f, (x, y0 + 24))
        d.text((x, y0 + 24 + f.height + 14), cap, font=font(20, 'mono'), fill=RED)
        d.text((x, y0 + 24 + f.height + 44), sub, font=font(19, 'body'), fill=INK2)

    # vertical column rules
    for x in (820, 1600):
        d.line([(x, y0 + 16), (x, 1600)], fill=RULE, width=1)

    # ===== footer =====
    d.line([(80, 1618), (W - 80, 1618)], fill=INK, width=2)
    d.text((80, 1636), '刊 / FOLIO   ·   A LIBWRT LUCI THEME CONCEPT', font=font(20, 'mono'), fill=INK3)
    tail = 'SET IN DIDOT · IOWAN OLD STYLE · FUTURA · SONGTI'
    d.text((W - 80 - d.textlength(tail, font=font(19, 'mono')), 1638), tail, font=font(19, 'mono'), fill=INK3)

    im.save(OUT, 'PNG', optimize=True)
    print('wrote', OUT, im.size)


if __name__ == '__main__':
    main()
