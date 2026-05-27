"""Colorize each brand logo with its company's signature color.

For each brand PNG (which is currently a grayscale or white silhouette
on transparent background), we tint the opaque pixels using the brand's
signature color, preserving the alpha channel and (where useful) the
luminance shading of the original artwork.
"""

from PIL import Image
import numpy as np
import os
import shutil

PUBLIC = "/sessions/confident-wonderful-archimedes/mnt/cproj/public"

# Brand-N -> (label, hex color, mode)
#   mode = "tint"   : preserve alpha, replace RGB with brand color
#   mode = "luminance" : keep luminance shading (darker => more brand color,
#                       lighter => more white), good for shaded artwork
BRANDS = {
    1:  ("ESC PLAN",     "#1F2A44", "tint"),       # deep navy charcoal
    2:  ("SUCCESS TEA",  "#B5651D", "tint"),       # warm tea brown
    3:  ("enormous",     "#E10600", "tint"),       # signature red
    4:  ("Questt",       "#1D4ED8", "tint"),       # edtech blue
    5:  ("agrizy",       "#7C3AED", "tint"),       # violet
    6:  ("oap",          None,      "skip"),       # already has its purple bg
    7:  ("apna",         None,      "skip"),       # already has dark bg + accent
    8:  ("RARE RABBIT",  "#111111", "tint"),       # charcoal black
    9:  ("IKONIC",       "#000000", "tint"),       # black
    10: ("HRX",          "#EF1C25", "tint"),       # HRX red
    11: ("dishtv",       "#E94E1B", "tint"),       # dishtv red-orange
}


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def tint_png(src, dst, color_rgb):
    """Replace RGB of every opaque pixel with `color_rgb`, keep alpha."""
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    alpha = arr[..., 3]

    out = np.zeros_like(arr)
    out[..., 0] = color_rgb[0]
    out[..., 1] = color_rgb[1]
    out[..., 2] = color_rgb[2]
    out[..., 3] = alpha
    Image.fromarray(out).save(dst)


def backup_originals():
    bdir = os.path.join(PUBLIC, "_brand_originals")
    os.makedirs(bdir, exist_ok=True)
    for i in range(1, 12):
        src = os.path.join(PUBLIC, f"brand-{i}.png")
        dst = os.path.join(bdir, f"brand-{i}.png")
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copy2(src, dst)


def main():
    backup_originals()
    for i, (label, hex_color, mode) in BRANDS.items():
        src = os.path.join(PUBLIC, f"brand-{i}.png")
        if not os.path.exists(src):
            print(f"[skip] missing {src}")
            continue
        if mode == "skip":
            print(f"[keep] brand-{i} ({label}) — already colored")
            continue
        rgb = hex_to_rgb(hex_color)
        tint_png(src, src, rgb)
        print(f"[done] brand-{i} ({label}) -> {hex_color}")


if __name__ == "__main__":
    main()
