import sys
from PIL import Image

def make_transparent(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    # Background color is roughly RGB(10, 8, 25).
    for item in datas:
        r, g, b, a = item
        
        # Simple distance to dark blue
        dist = ((r - 10)**2 + (g - 8)**2 + (b - 25)**2)**0.5
        
        if dist < 30:
            new_data.append((0, 0, 0, 0))
        elif dist < 60:
            alpha = int((dist - 30) / 30 * 255)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, a))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

for filename in ["ms-startup.png", "nsrcel.png", "nvidia-inception.png", "ph-award.png"]:
    try:
        make_transparent(f"public/{filename}", f"public/{filename}")
        print(f"Processed {filename}")
    except Exception as e:
        print(f"Failed {filename}: {e}")
