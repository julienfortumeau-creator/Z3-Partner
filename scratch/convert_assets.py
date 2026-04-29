import os
from PIL import Image

assets_dir = './assets'
files_to_convert = ['icon.png', 'splash.png', 'adaptive-icon.png']

for filename in files_to_convert:
    filepath = os.path.join(assets_dir, filename)
    if os.path.exists(filepath):
        print(f"Checking {filename}...")
        try:
            with Image.open(filepath) as img:
                if img.format != 'PNG':
                    print(f"Converting {filename} from {img.format} to PNG...")
                    # Save to a temporary file first to avoid issues
                    temp_path = filepath + '.temp.png'
                    img.save(temp_path, 'PNG')
                    os.remove(filepath)
                    os.rename(temp_path, filepath)
                    print(f"Successfully converted {filename} to PNG.")
                else:
                    print(f"{filename} is already a PNG.")
        except Exception as e:
            print(f"Error processing {filename}: {e}")
    else:
        print(f"{filename} not found.")
