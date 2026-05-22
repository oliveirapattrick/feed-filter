import sys
import threading
import time

from faster_whisper import WhisperModel

import config

model = WhisperModel(config.WHISPER_MODEL, device="cpu", compute_type="int8")
_lock = threading.Lock()


def transcribe(file_path: str) -> dict:
    if not _lock.acquire(blocking=False):
        return {"status": "error", "message": "Uma transcrição já está em andamento. Aguarde."}

    print(f"[transcriber] Iniciando transcrição: {file_path}")
    start = time.time()
    try:
        segments, info = model.transcribe(file_path, language="pt")
        text = " ".join([s.text for s in segments])
        elapsed = time.time() - start
        print(f"[transcriber] Concluído em {elapsed:.1f}s (idioma: {info.language})")
        return {"status": "ok", "text": text.strip()}
    except Exception as e:
        elapsed = time.time() - start
        print(f"[transcriber] Erro após {elapsed:.1f}s: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        _lock.release()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python transcriber.py <caminho_do_arquivo>")
        sys.exit(1)
    result = transcribe(sys.argv[1])
    print(result)
