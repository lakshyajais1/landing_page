from PIL import Image
import math

def remove_bg(filename):
    try:
        img = Image.open(filename).convert("RGBA")
        datas = img.getdata()
        
        # Assume top-left pixel is background
        bg_r, bg_g, bg_b, _ = datas[0]
        
        newData = []
        for item in datas:
            r, g, b, a = item
            # Calculate distance to background color
            dist = math.sqrt((r - bg_r)**2 + (g - bg_g)**2 + (b - bg_b)**2)
            # If distance is small (e.g., <= 40), make it transparent
            if dist <= 40:
                newData.append((r, g, b, 0))
            else:
                newData.append((r, g, b, a))
                
        img.putdata(newData)
        img.save(filename, "PNG")
        print(f"Processed {filename}")
    except Exception as e:
        print(f"Error on {filename}: {e}")

remove_bg("public/brand-6.png")
remove_bg("public/brand-6-light.png")
remove_bg("public/brand-6-dark.png")
remove_bg("public/brand-6-lightdd.png")
