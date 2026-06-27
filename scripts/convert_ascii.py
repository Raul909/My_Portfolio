import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import os
import subprocess
import argparse
import sys

def convert_to_ascii(input_path, output_path):
    print(f"Opening video: {input_path}")
    cap = cv2.VideoCapture(input_path)
    if not cap.isOpened():
        print(f"Error opening {input_path}")
        return

    # Video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    orig_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    orig_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Original: {orig_w}x{orig_h} @ {fps}fps, {total_frames} frames")

    # ASCII rendering settings
    out_w, out_h = orig_w, orig_h
    font_size = 18 if orig_w > 1200 else 14 # scale font based on resolution
    
    font_path = "/System/Library/Fonts/Supplemental/Courier New Bold.ttf"
    try:
        font = ImageFont.truetype(font_path, font_size)
    except IOError:
        print("Font not found, using default")
        font = ImageFont.load_default()

    char_w = int(font_size * 0.6)
    char_h = font_size

    cols = out_w // char_w
    rows = out_h // char_h
    print(f"Grid: {cols}x{rows} characters")

    density = "Ñ@#W$9876543210?!abc;:+=-,._ "
    density_len = len(density) - 1

    temp_output = "temp_" + os.path.basename(output_path)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_output, fourcc, fps, (out_w, out_h))

    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        if frame_count % 30 == 0:
            print(f"Processing frame {frame_count}/{total_frames}...")

        small_frame = cv2.resize(frame, (cols, rows))
        small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

        img = Image.new('RGB', (out_w, out_h), color=(8, 8, 8))
        draw = ImageDraw.Draw(img)

        for y in range(rows):
            for x in range(cols):
                r, g, b = small_frame[y, x]
                avg = (int(r) + int(g) + int(b)) / 3
                
                if avg < 25:
                    continue
                
                char_idx = int(((avg - 25) / 230) * density_len)
                char_idx = min(max(char_idx, 0), density_len)
                char = density[density_len - char_idx]
                
                draw.text((x * char_w, y * char_h), char, font=font, fill=(r, g, b))

        out_frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        out.write(out_frame)

    cap.release()
    out.release()

    print(f"Done rendering frames. Compressing to {output_path} using ffmpeg...")
    
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-i", temp_output, 
        "-c:v", "libx264", "-crf", "32", "-preset", "faster", 
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", output_path
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    
    os.remove(temp_output)
    print(f"Success! Saved to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("input", help="Input video file")
    parser.add_argument("output", help="Output video file")
    args = parser.parse_args()
    
    convert_to_ascii(args.input, args.output)
