import hashlib
import os
from datetime import datetime

import requests as http_requests
from flask import Flask, jsonify, request
from flask_cors import CORS

import config
import downloader
import transcriber

app = Flask(__name__)
# Server binds to 127.0.0.1 only, so wildcard CORS is safe — no external
# host can reach this port. Chrome extension service workers send no Origin
# or send chrome-extension://<id>, which an allowlist would reject.
CORS(app, origins="*")

ALLOWED_HOSTS = {"instagram.com", "tiktok.com"}


def _log(method: str, path: str, status: int):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {method} {path} → {status}")


def _validate_url(url: str) -> bool:
    from urllib.parse import urlparse
    try:
        host = urlparse(url).netloc.lstrip("www.")
        return any(host == h or host.endswith("." + h) for h in ALLOWED_HOSTS)
    except Exception:
        return False


@app.after_request
def _after(response):
    _log(request.method, request.path, response.status_code)
    return response


@app.route("/status", methods=["GET"])
def status():
    return jsonify({"running": True, "version": "1.0"})


@app.route("/download", methods=["POST"])
def download():
    body = request.get_json(silent=True) or {}
    url = body.get("url", "").strip()

    if not url:
        return jsonify({"status": "error", "message": "Campo 'url' obrigatório"}), 400
    if not _validate_url(url):
        return jsonify({"status": "error", "message": "URL deve ser do instagram.com ou tiktok.com"}), 400

    result = downloader.download_video(url)
    return jsonify(result)


@app.route("/transcribe", methods=["POST"])
def transcribe_endpoint():
    body = request.get_json(silent=True) or {}
    url = body.get("url", "").strip()

    if not url:
        return jsonify({"status": "error", "message": "Campo 'url' obrigatório"}), 400
    if not _validate_url(url):
        return jsonify({"status": "error", "message": "URL deve ser do instagram.com ou tiktok.com"}), 400

    dl = downloader.download_video(url)
    if dl["status"] != "ok":
        return jsonify(dl)

    file_path = dl["file"]
    result = transcriber.transcribe(file_path)
    return jsonify(result)


@app.route("/download-direct", methods=["POST"])
def download_direct():
    body = request.get_json(silent=True) or {}
    urls = body.get("urls", [])

    if not urls or not isinstance(urls, list):
        return jsonify({"status": "error", "message": "Campo 'urls' obrigatório (array)"}), 400

    folder = os.path.expanduser(config.DOWNLOAD_FOLDER)
    os.makedirs(folder, exist_ok=True)

    saved = []
    errors = []
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.instagram.com/",
    }

    for cdn_url in urls:
        try:
            # Derive extension from URL before query string
            path_part = cdn_url.split("?")[0]
            ext = os.path.splitext(path_part)[1].lower() or ".jpg"
            url_hash = hashlib.md5(cdn_url.encode()).hexdigest()[:12]
            filename = f"carousel_{url_hash}{ext}"
            file_path = os.path.join(folder, filename)

            print(f"[download-direct] Baixando: {cdn_url[:80]}...")
            resp = http_requests.get(cdn_url, headers=headers, timeout=30, stream=True)
            resp.raise_for_status()

            with open(file_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=65536):
                    f.write(chunk)

            print(f"[download-direct] Salvo: {filename}")
            saved.append(file_path)
        except Exception as e:
            print(f"[download-direct] Erro em {cdn_url[:60]}: {e}")
            errors.append(str(e))

    if not saved:
        return jsonify({"status": "error", "message": "Nenhum arquivo baixado", "errors": errors})

    return jsonify({"status": "ok", "files": saved, "file": saved[0], "errors": errors})


@app.route("/save-transcription", methods=["POST"])
def save_transcription():
    body = request.get_json(silent=True) or {}
    text = body.get("text", "").strip()
    filename = body.get("filename", "").strip()

    if not text:
        return jsonify({"status": "error", "message": "Campo 'text' obrigatório"}), 400
    if not filename:
        return jsonify({"status": "error", "message": "Campo 'filename' obrigatório"}), 400

    # Strip any path components to prevent directory traversal
    filename = os.path.basename(filename)
    if not filename.endswith(".txt"):
        filename += ".txt"

    folder = os.path.expanduser(config.DOWNLOAD_FOLDER)
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, filename)

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(text)

    return jsonify({"status": "ok", "file": file_path})


if __name__ == "__main__":
    print(f"[server] Iniciando na porta {config.SERVER_PORT}")
    app.run(host="127.0.0.1", port=config.SERVER_PORT, threaded=True)
