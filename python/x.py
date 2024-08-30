import subprocess
import sys
import json

def get_video_url(video_url):
    try:
        result = subprocess.run(
            ['yt-dlp', '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]', '--get-url', video_url],
            capture_output=True,
            text=True,
            check=True
        )
        video_urls = result.stdout.strip().split('\n')
        if len(video_urls) == 2:
            video_url, audio_url = video_urls
            return {'video_url': video_url, 'audio_url': audio_url}
        else:
            return {'error': 'Failed to retrieve both video and audio URLs'}
    except subprocess.CalledProcessError as e:
        return {'error': str(e)}

if __name__ == "__main__":
    video_url = sys.argv[1]
    info = get_video_url(video_url)
    print(json.dumps(info))