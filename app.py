from flask import Flask, render_template, request, jsonify
import os
from test_videos import run_anpr

app = Flask(__name__)

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR   = os.path.join(BASE_DIR, 'uploads')
STATIC_DIR   = os.path.join(BASE_DIR, 'static')
OUTPUT_VIDEO = os.path.join(STATIC_DIR, 'output.mp4')

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(STATIC_DIR, exist_ok=True)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload_video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['video']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    video_path = os.path.join(UPLOAD_DIR, file.filename)
    file.save(video_path)

    print(f"--- Starting ANPR on: {file.filename} ---")
    try:
        plates = run_anpr(video_path, output_path=OUTPUT_VIDEO)

        video_url = None
        if os.path.exists(OUTPUT_VIDEO):
            video_url = '/static/output.mp4'

        return jsonify({'result': plates, 'video_url': video_url})
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
