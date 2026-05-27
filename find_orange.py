import os
from PIL import Image

def has_orange(filepath):
    try:
        img = Image.open(filepath).convert("RGB")
        data = img.getdata()
        orange_pixels = 0
        total_pixels = len(data)
        for r, g, b in data:
            if r > 200 and g > 80 and g < 180 and b < 50:
                orange_pixels += 1
        return orange_pixels / total_pixels
    except Exception as e:
        return 0

for root, dirs, files in os.walk('public'):
    for file in files:
        if file.endswith('.png'):
            filepath = os.path.join(root, file)
            orange_ratio = has_orange(filepath)
            if orange_ratio > 0.01:
                print(f"{filepath}: {orange_ratio*100:.2f}% orange")
