import os
import subprocess
os.environ['YOLO_VERBOSE'] = 'False'

from ultralytics import YOLO
import cv2
import easyocr
from collections import Counter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "Models", "500img.pt")

model = YOLO(MODEL_PATH)
reader = easyocr.Reader(['en'], gpu=False)


def run_anpr(video_path, output_path=None):
    """
    Processes a video for ANPR. Annotates frames with bounding boxes.
    Saves browser-compatible H.264 MP4 to output_path (if given).
    Returns a list of detected plate strings.
    """
    vehicle_data = {}
    cap = cv2.VideoCapture(video_path)

    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps    = cap.get(cv2.CAP_PROP_FPS) or 25.0

    # Write to a temporary raw MP4, then re-encode to H.264 via ffmpeg
    writer = None
    tmp_path = None
    if output_path:
        tmp_path = output_path + ".tmp.mp4"
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(tmp_path, fourcc, fps, (width, height))

    frame_count  = 0
    skip_frames  = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        annotated = frame.copy()

        if frame_count % (skip_frames + 1) == 0:
            results = model.track(
                source=frame,
                persist=True,
                tracker="bytetrack.yaml",
                verbose=False
            )

            for r in results:
                if r.boxes is not None and r.boxes.id is not None:
                    boxes     = r.boxes.xyxy.int().cpu().tolist()
                    track_ids = r.boxes.id.int().cpu().tolist()

                    for box, track_id in zip(boxes, track_ids):
                        x1, y1, x2, y2 = box

                        # Draw bounding box
                        cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)

                        plate_crop = frame[
                            max(0, y1):min(height, y2),
                            max(0, x1):min(width,  x2)
                        ]

                        if plate_crop.size == 0:
                            continue

                        if track_id not in vehicle_data or len(vehicle_data[track_id]) < 15:
                            ocr_result = reader.readtext(plate_crop)
                            plate_text = " ".join(res[1] for res in ocr_result).strip().upper()

                            if 7 < len(plate_text) < 13:
                                if track_id not in vehicle_data:
                                    vehicle_data[track_id] = []
                                vehicle_data[track_id].append(plate_text)

                                # Overlay plate text above the box
                                label = plate_text[:15]
                                (tw, th), _ = cv2.getTextSize(
                                    label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2
                                )
                                cv2.rectangle(
                                    annotated,
                                    (x1, max(0, y1 - th - 8)),
                                    (x1 + tw + 4, y1),
                                    (0, 255, 0), -1
                                )
                                cv2.putText(
                                    annotated, label,
                                    (x1 + 2, max(th, y1 - 4)),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.6,
                                    (0, 0, 0), 2
                                )

        if writer:
            writer.write(annotated)

    cap.release()
    if writer:
        writer.release()

    # Re-encode to H.264 so browsers can play it natively
    if output_path and tmp_path and os.path.exists(tmp_path):
        try:
            subprocess.run(
                [
                    "ffmpeg", "-y",
                    "-i", tmp_path,
                    "-vcodec", "libx264",
                    "-preset", "fast",
                    "-crf", "28",
                    "-movflags", "+faststart",
                    output_path
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )
        except Exception as e:
            print(f"ffmpeg re-encode failed: {e}")
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    # Tally and deduplicate detected plates
    global_tally = Counter()
    for plates in vehicle_data.values():
        for p in plates:
            clean = "".join(c for c in p if c.isalnum())
            if len(clean) > 4:
                global_tally[clean] += 1

    final_plates = []
    seen = set()
    for plate, count in global_tally.most_common():
        if count >= 4 and plate not in seen:
            final_plates.append(f"{plate} (Seen in {count} frames)")
            seen.add(plate)

    return final_plates


if __name__ == "__main__":
    test_path   = os.path.join(BASE_DIR, "uploads", "tf9.mp4")
    output_path = os.path.join(BASE_DIR, "static", "output.mp4")
    results = run_anpr(test_path, output_path)
    print("Detected:", results)
