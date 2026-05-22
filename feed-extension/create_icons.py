from PIL import Image, ImageDraw
import os

def create_icon(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = int(size * 0.22)
    bg_color = (10, 10, 15, 255)
    accent = (124, 106, 247, 255)

    # Rounded square background
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=radius, fill=bg_color, outline=accent, width=max(1, size//32))

    # Letter "F" — draw manually with rectangles
    pad = int(size * 0.28)
    stroke = max(2, int(size * 0.12))
    # Vertical bar
    draw.rectangle([pad, pad, pad+stroke, size-pad], fill=(255, 255, 255, 255))
    # Top horizontal
    draw.rectangle([pad, pad, size-pad, pad+stroke], fill=(255, 255, 255, 255))
    # Middle horizontal (shorter)
    mid = size // 2 - stroke // 2
    draw.rectangle([pad, mid, size-pad-int(size*0.12), mid+stroke], fill=(255, 255, 255, 255))

    return img

sizes = [16, 32, 48, 128]
out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
os.makedirs(out_dir, exist_ok=True)

for s in sizes:
    img = create_icon(s)
    img.save(os.path.join(out_dir, f"icon{s}.png"))
    print(f"Gerado: icon{s}.png")

print("Icones gerados com sucesso!")
