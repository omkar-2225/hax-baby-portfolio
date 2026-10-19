import cv2
import numpy as np
import os
import time

def process_turntable():
    video_path = os.path.join('public', '3D model video.mp4')
    out_dir = os.path.join('public', 'pip3d')
    os.makedirs(out_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open {video_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Total video frames: {total_frames}, FPS: {fps}")

    # One full 360 rotation is 1200 frames (40.0s)
    rotation_frames = 1200
    num_samples = 60 # 6 degrees per frame
    step = rotation_frames / num_samples

    print(f"Extracting and cleaning {num_samples} transparent 3D frames...")
    start_time = time.time()

    for i in range(num_samples):
        target_frame = int(round(i * step))
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        ret, img = cap.read()
        if not ret:
            print(f"Failed to read frame at {target_frame}")
            break

        h, w = img.shape[:2]
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        h_c, s_c, v_c = cv2.split(hsv)
        y_coords, x_coords = np.mgrid[0:h, 0:w]

        # Background conditions:
        # Dark studio backdrop or neutral floor grid
        is_def_bg = (v_c < 50) | ((v_c < 110) & (s_c < 22) & ((y_coords > 330) | (y_coords < 40) | (x_coords < 35) | (x_coords > 415)))

        # Foreground conditions: Pip, cloud, moon, star
        is_def_fg = ((v_c > 130) | ((v_c > 90) & (s_c > 35))) & (y_coords > 60) & (y_coords < 460) & (x_coords > 50) & (x_coords < 405)

        mask = np.ones((h, w), dtype=np.uint8) * cv2.GC_PR_BGD
        mask[is_def_bg] = cv2.GC_BGD
        mask[is_def_fg] = cv2.GC_PR_FGD

        bgdModel = np.zeros((1, 65), np.float64)
        fgdModel = np.zeros((1, 65), np.float64)
        cv2.grabCut(img, mask, None, bgdModel, fgdModel, 3, cv2.GC_INIT_WITH_MASK)

        clean_mask = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype('uint8')
        clean_mask = cv2.morphologyEx(clean_mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))

        # Remove small disjoint floor grid artifacts while retaining moon, star, pip
        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(clean_mask)
        final_mask = np.zeros_like(clean_mask)
        for lbl in range(1, num_labels):
            if stats[lbl, cv2.CC_STAT_AREA] > 80:
                final_mask[labels == lbl] = 255

        alpha = cv2.GaussianBlur(final_mask, (5, 5), 0)
        b, g, r = cv2.split(img)
        bgra = cv2.merge([b, g, r, alpha])

        out_file = os.path.join(out_dir, f"frame_{i:02d}.png")
        cv2.imwrite(out_file, bgra)

        if (i + 1) % 10 == 0 or i == num_samples - 1:
            print(f"Processed {i + 1}/{num_samples} frames ({((i+1)/num_samples)*100:.0f}%)")

    cap.release()
    elapsed = time.time() - start_time
    print(f"Done! Successfully generated {num_samples} transparent 3D turntable frames in {elapsed:.1f}s.")

if __name__ == '__main__':
    process_turntable()
