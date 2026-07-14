import glob
import os
import sys

import yt_dlp

import config

BROWSER_COOKIE_SOURCES = ("chrome", "edge", "opera", "brave", "vivaldi", "firefox")


def _base_dir() -> str:
    # When running as a PyInstaller bundle, _MEIPASS points to the temp folder
    # where bundled files are extracted. Otherwise, look next to this script.
    return getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))


def _ffmpeg_path() -> str:
    return os.path.join(_base_dir(), "ffmpeg.exe")


def _find_cookies_txt() -> str | None:
    """Looks for a cookies.txt in the app folder first (explicit, stable name),
    then in the user's Downloads folder for whatever the export extension
    named it (e.g. "instagram.com_cookies.txt") — so the user never has to
    rename or move the file after exporting it."""
    candidates = [os.path.join(_base_dir(), "cookies.txt")]

    downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    if os.path.isdir(downloads):
        matches = sorted(
            glob.glob(os.path.join(glob.escape(downloads), "*cookies*.txt")),
            key=os.path.getmtime,
            reverse=True,
        )
        candidates.extend(matches)

    for path in candidates:
        if os.path.isfile(path) and os.path.getsize(path) > 0:
            return path
    return None

try:
    yt_dlp.update.run_update()
except Exception:
    pass

VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".mov", ".avi", ".m4v"}

GET_COOKIES_EXT_URL = (
    "https://chromewebstore.google.com/detail/get-cookiestxt-locally/"
    "cclelndahbckbenkjhflpdbgdldlbecc"
)

LOGIN_REQUIRED_MSG = (
    "O Instagram está pedindo login para baixar esse conteúdo. Instale a "
    f"extensão \"Get cookies.txt LOCALLY\" ({GET_COOKIES_EXT_URL}), faça login "
    "no Instagram pelo navegador, clique no ícone da extensão e depois em "
    "\"Export\". O arquivo cai na sua pasta Downloads e o Feed Filter já usa "
    "ele automaticamente no próximo download. Veja o guia de instalação para "
    "o passo a passo com imagens."
)

LOGIN_ERROR_MARKERS = (
    "empty media response",
    "not granting access",
    "rate-limit reached",
    "login required",
    "requested content is not available",
)


def _is_login_error(message: str) -> bool:
    low = message.lower()
    return any(marker in low for marker in LOGIN_ERROR_MARKERS)


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


def _attempt_download(url: str, folder: str, cookies_from_browser=None, cookies_file=None) -> dict:
    """Runs one yt-dlp attempt. Returns {status, ...} — never raises."""
    outtmpl = os.path.join(folder, "%(uploader)s_%(id)s.%(ext)s")
    ffmpeg = _ffmpeg_path()

    captured_errors = []

    class _ErrorCatchingLogger:
        def debug(self, msg): pass
        def info(self, msg): pass
        def warning(self, msg): pass
        def error(self, msg): captured_errors.append(str(msg))

    ydl_opts = {
        "outtmpl": outtmpl,
        "format": "bestvideo+bestaudio/best",
        "merge_output_format": "mp4",
        "ffmpeg_location": ffmpeg,
        "ignoreerrors": True,
        "writesubtitles": False,
        "quiet": False,
        "logger": _ErrorCatchingLogger(),
    }
    if cookies_from_browser:
        ydl_opts["cookiesfrombrowser"] = (cookies_from_browser,)
    elif cookies_file:
        ydl_opts["cookiefile"] = cookies_file

    before = set(glob.glob(os.path.join(glob.escape(folder), "*")))

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ret = ydl.download([url])
        print(f"[downloader] yt-dlp return code: {ret} (cookies: {cookies_from_browser or 'none'})")

    after = set(glob.glob(os.path.join(glob.escape(folder), "*")))
    new_files = sorted(after - before)
    print(f"[downloader] Novos arquivos: {new_files}")

    if not new_files:
        message = captured_errors[-1] if captured_errors else "Nenhum arquivo foi baixado"
        return {"status": "error", "message": message}

    video_files = [f for f in new_files if _is_video(f)]
    return {
        "status": "ok",
        "files": new_files,
        "file": video_files[0] if video_files else new_files[0],
    }


def download_video(url: str) -> dict:
    folder = os.path.expanduser(config.DOWNLOAD_FOLDER)
    os.makedirs(folder, exist_ok=True)

    video_id = _extract_video_id(url)
    print(f"[downloader] ID do vídeo: {video_id}")

    existing = _find_existing(folder, video_id)
    if existing:
        print(f"[downloader] Arquivo já existe: {existing}")
        return {"status": "ok", "files": [existing], "file": existing}

    print(f"[downloader] Pasta: {folder}")
    print(f"[downloader] Iniciando download: {url}")

    # Instagram now requires an authenticated session for most posts/reels.
    # A manually exported cookies.txt (in the app folder or fresh in Downloads)
    # is the most reliable source, so try it first. Fall back through each
    # installed browser's cookie jar — yt-dlp copies the DB before reading,
    # so this works even while the browser is open, though modern Chrome/Edge
    # encryption on Windows often makes this fail anyway.
    cookies_file = _find_cookies_txt()

    last_result = None

    if cookies_file:
        try:
            result = _attempt_download(url, folder, cookies_file=cookies_file)
        except Exception as e:
            print(f"[downloader] Exceção (cookies.txt): {e}")
            result = {"status": "error", "message": str(e)}

        if result["status"] == "ok":
            return result
        last_result = result
        print(f"[downloader] Falhou (cookies.txt: {cookies_file}): {result['message']}")

    for source in BROWSER_COOKIE_SOURCES:
        try:
            result = _attempt_download(url, folder, cookies_from_browser=source)
        except Exception as e:
            print(f"[downloader] Exceção ({source}): {e}")
            result = {"status": "error", "message": str(e)}

        if result["status"] == "ok":
            return result
        last_result = result
        print(f"[downloader] Falhou ({source}): {result['message']}")

    technical_message = last_result["message"] if last_result else "Nenhum arquivo foi baixado"
    print(f"[downloader] Todas as tentativas falharam. Último erro: {technical_message}")

    if _is_login_error(technical_message):
        user_message = LOGIN_REQUIRED_MSG
    else:
        user_message = "Não foi possível baixar esse conteúdo. Verifique se o link ainda está disponível."

    return {"status": "error", "message": user_message, "technical_message": technical_message}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python downloader.py <url>")
        sys.exit(1)
    result = download_video(sys.argv[1])
    print(result)
