"""Recolor brand-6 (oap) and brand-7 (apna) to use the brands'
actual primary palette instead of the dark / desaturated versions.

We operate on the originals saved under public/_brand_originals/ so the
mapping is stable.

brand-6 (oap):
    Original = vibrant violet block with white wordmark + paper-plane.
    Strategy: map by luminance. Darker pixels -> vibrant brand violet,
    lighter pixels -> white.

brand-7 (apna):
    Original = framed rounded card with "apna" wordmark inside.
    Strategy: map the lighter frame ring to apna's signature lime-yellow,
    the inner block + wordmark to a deep charcoal so the lime pops.
"""
from PIL import Image
import numpy as np
import os

PUBLIC = "/sessions/confident-wonderful-archimedes/mnt/cproj/public"

def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], dtype=np.float32)

def luminance(arr_rgb):
    return (0.2126 * arr_rgb[..., 0]
            + 0.7152 * arr_rgb[..., 1]
            + 0.0722 * arr_rgb[..., 2])

def lerp_color(c_dark, c_light, t):
    """t in [0,1]; 0 -> c_dark, 1 -> c_light."""
    t = np.clip(t, 0, 1)[..., None]
    return c_dark[None, None, :] * (1 - t) + c_light[None, None, :] * t


def remap_brand_6():
    """oap -> vibrant violet bg + clean white wordmark."""
    src = os.path.join(PUBLIC, "_brand_originals", "brand-6.png")
    dst = os.path.join(PUBLIC, "brand-6.png")
    im = np.array(Image.open(src).convert("RGBA")).astype(np.float32)
    rgb = im[..., :3]
    alpha = im[..., 3]
    L = luminance(rgb) / 255.0
    # Dark color = OAP brand violet, Light color = white
    c_dark = hex_rgb("#5D2EAD")
    c_light = hex_rgb("#FFFFFF")
    out_rgb = lerp_color(c_dark, c_light, L)
    out = np.dstack([out_rgb, alpha]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out).save(dst)
    print("brand-6 -> oap violet")


def remap_brand_7():
    """apna -> lime-yellow frame + dark wordmark + light inner."""
    src = os.path.join(PUBLIC, "_brand_originals", "brand-7.png")
    dst = os.path.join(PUBLIC, "brand-7.png")
    im = np.array(Image.open(src).convert("RGBA")).astype(np.float32)
    rgb = im[..., :3]
    alpha = im[..., 3]
    L = luminance(rgb) / 255.0
    # Two-band mapping:
    #   bright pixels (L >= 0.5) -> apna sage   (#9CAB7A)
    #   dark pixels  (L <  0.5)  -> charcoal    (#111111)
    sage = hex_rgb("#9CAB7A")
    dark = hex_rgb("#111111")
    bright_mask = (L >= 0.5)
    out_rgb = np.where(bright_mask[..., None],
                       sage[None, None, :],
                       dark[None, None, :])
    out = np.dstack([out_rgb, alpha]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out).save(dst)
    print("brand-7 -> apna lime + charcoal")


if __name__ == "__main__":
    remap_brand_6()
    remap_brand_7()
