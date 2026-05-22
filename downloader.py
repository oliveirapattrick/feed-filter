import glob
import os
import sys

import yt_dlp

import config


def _ffmpeg_path() -> str:
    # When running as a PyInstaller bundle, _MEIPASS points to the temp folder
    # where bundled files are extracted. Otherwise, look next to this script.
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, "ffmpeg.exe")

try:
    yt_dlp.update.run_update()
except Exception:
    pass

VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".mov", ".avi", ".m4v"}


def _is_video(path: str) -> bool:
    return os.path.splitext(path)[1].lower() in VIDEO_EXTENSIONS


def _extract_video_id(url: str) -> str:
    # Strips query string and trailing slashes, returns last non-empty path segment
    path = url.split("?")[0].rstrip("/")
    return path.split("/")[-1]


def _find_existing(folder: str, video_id: str):
    matches = sorted(glob.glob(os.path.join(glob.escape(folder), f"*{video_id}*")))
    video_matches = [f for f in matches if _is_video(f)]
    return video_matches[0] if video_matches else (matches[0] if matches else None)


def download_video(url: str) -> dict:
    folder = os.path.expanduser(config.DOWNLOAD_FOLDER)
    os.makedirs(folder, exist_ok=True)

    video_id = _extract_video_id(url)
    print(f"[downloader] ID do vídeo: {video_id}")

    existing = _find_existing(folder, video_id)
    if existing:
        print(f"[downloader] Arquivo já existe: {existing}")
        return {"status": "ok", "files": [existing], "file": existing}

    outtmpl = os.path.join(folder, "%(uploader)s_%(id)s.%(ext)s")

    ffmpeg = _ffmpeg_path()
    ydl_opts = {
        "outtmpl": outtmpl,
        "format": "bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        "ffmpeg_location": ffmpeg,
        "ignoreerrors": True,
        "writesubtitles": False,
        "quiet": False,
    }

    print(f"[downloader] Pasta: {folder}")
    print(f"[downloader] Iniciando download: {url}")

    try:
        before = set(glob.glob(os.path.join(glob.escape(folder), "*")))
        print(f"[downloader] Arquivos antes: {len(before)}")

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ret = ydl.download([url])
            print(f"[downloader] yt-dlp return code: {ret}")

        after = set(glob.glob(os.path.join(glob.escape(folder), "*")))
        new_files = sorted(after - before)
        print(f"[downloader] Novos arquivos: {new_files}")

        if not new_files:
            # yt-dlp skipped because file already exists — find it
            existing = _find_existing(folder, video_id)
            if existing:
                print(f"[downloader] Arquivo já existia (pulado pelo yt-dlp): {existing}")
                return {"status": "ok", "files": [existing], "file": existing}
            return {"status": "error", "message": "Nenhum arquivo foi baixado"}

        video_files = [f for f in new_files if _is_video(f)]
        return {
            "status": "ok",
            "files": new_files,
            "file": video_files[0] if video_files else new_files[0],
        }
    except Exception as e:
        print(f"[downloader] Exceção: {e}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python downloader.py <url>")
        sys.exit(1)
    result = download_video(sys.argv[1])
    print(result)
