"""
Gera icon.ico com design moderno: gradiente roxo, letra F limpa com anti-aliasing.
"""
from PIL import Image, ImageDraw, ImageFilter
import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icon.ico")


def lerp(a, b, t):
    return int(a + (b - a) * t)


def draw_rounded_rect(draw, xy, radius, fill, outline=None, width=1):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill,
                            outline=outline, width=width)


def create_frame(size):
    # Work at 4x for anti-aliasing, then downsample
    scale = 4
    S = size * scale
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    r = max(8, int(S * 0.20))

    # ── Background: deep dark with subtle gradient feel
    draw.rounded_rectangle([0, 0, S - 1, S - 1], radius=r,
                            fill=(12, 10, 20, 255))

    # ── Gradient border: top-left lighter, bottom-right darker
    border_w = max(2, S // 20)
    # Draw border as multiple inset rings fading from accent to dark
    steps = border_w
    for i in range(steps):
        t = i / steps
        col = (
            lerp(160, 80, t),   # R
            lerp(130, 60, t),   # G
            lerp(250, 200, t),  # B
            lerp(255, 60, t),   # A
        )
        inset = i
        draw.rounded_rectangle(
            [inset, inset, S - 1 - inset, S - 1 - inset],
            radius=max(4, r - inset),
            fill=None, outline=col, width=1
        )

    # ── Inner glow behind the F
    glow_x = int(S * 0.28)
    glow_y = int(S * 0.24)
    glow_w = int(S * 0.50)
    glow_h = int(S * 0.58)
    for gi in range(12, 0, -1):
        alpha = int(30 * (1 - gi / 12))
        glow_img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow_img)
        gd.ellipse(
            [glow_x - gi * 2, glow_y - gi * 2,
             glow_x + glow_w + gi * 2, glow_y + glow_h + gi * 2],
            fill=(130, 100, 255, alpha)
        )
        img = Image.alpha_composite(img, glow_img)
        draw = ImageDraw.Draw(img)

    # ── Letter "F" — clean geometric, slightly rounded ends
    pad   = int(S * 0.27)
    thick = max(3, int(S * 0.14))
    mid_y = int(S * 0.50)
    right = S - int(S * 0.22)
    mid_right = int(S * 0.70)
    bottom = S - int(S * 0.24)

    white = (240, 235, 255, 255)  # slightly blue-white

    # Vertical bar
    draw.rounded_rectangle([pad, pad, pad + thick, bottom],
                            radius=max(2, thick // 3), fill=white)
    # Top bar (full)
    draw.rounded_rectangle([pad, pad, right, pad + thick],
                            radius=max(2, thick // 3), fill=white)
    # Mid bar (3/4)
    draw.rounded_rectangle([pad, mid_y, mid_right, mid_y + thick],
                            radius=max(2, thick // 3), fill=white)

    # Downsample with LANCZOS for smooth edges
    img = img.resize((size, size), Image.LANCZOS)
    return img


sizes = [256, 128, 64, 48, 32, 16]
frames = [create_frame(s) for s in sizes]

frames[0].save(
    OUT,
    format="ICO",
    sizes=[(s, s) for s in sizes],
    append_images=frames[1:],
)
print(f"Gerado: {OUT}")
