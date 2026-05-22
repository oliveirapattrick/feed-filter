import os
import sys
import subprocess
import threading
import winreg
import urllib.request
import json

from PIL import Image
import pystray

BASE_DIR = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

import config
import server

_flask_thread = None
_icon_ref = None

REG_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
REG_VALUE = "FeedFilter"


def _exe_path():
    if getattr(sys, "frozen", False):
        return sys.executable
    return os.path.abspath(__file__)


def _is_startup_enabled():
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_KEY, 0, winreg.KEY_READ) as k:
            winreg.QueryValueEx(k, REG_VALUE)
            return True
    except FileNotFoundError:
        return False


def _enable_startup():
    exe = _exe_path()
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_KEY, 0, winreg.KEY_SET_VALUE) as k:
        winreg.SetValueEx(k, REG_VALUE, 0, winreg.REG_SZ, f'"{exe}"')


def _disable_startup():
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_KEY, 0, winreg.KEY_SET_VALUE) as k:
            winreg.DeleteValue(k, REG_VALUE)
    except FileNotFoundError:
        pass


def _toggle_startup(icon, item):
    if _is_startup_enabled():
        _disable_startup()
    else:
        _enable_startup()
    # Rebuild menu to refresh checkmark
    icon.menu = _build_menu(icon)


def _load_icon_image():
    ico_path = os.path.join(BASE_DIR, "icon.ico")
    if os.path.exists(ico_path):
        return Image.open(ico_path).convert("RGBA")
    img = Image.new("RGBA", (64, 64), (124, 106, 247, 255))
    return img


def _open_downloads():
    folder = os.path.expanduser(config.DOWNLOAD_FOLDER)
    os.makedirs(folder, exist_ok=True)
    subprocess.Popen(["explorer", folder])


def _restart_server(icon, item):
    global _flask_thread
    _flask_thread = threading.Thread(target=_run_flask, daemon=True)
    _flask_thread.start()


def _run_flask():
    server.app.run(
        host="127.0.0.1",
        port=config.SERVER_PORT,
        threaded=True,
        use_reloader=False,
        debug=False,
    )


def _build_menu(icon, update_url=None, update_version=None):
    startup_label = (
        "✓ Iniciar com o Windows" if _is_startup_enabled()
        else "  Iniciar com o Windows"
    )
    items = [
        pystray.MenuItem(f"Feed Filter v{config.VERSION}", None, enabled=False),
        pystray.Menu.SEPARATOR,
    ]
    if update_url:
        def _open_update(icon, item, url=update_url):
            subprocess.Popen(["explorer", url])
        items.append(pystray.MenuItem(f"⬆ Atualização {update_version} disponível!", _open_update))
        items.append(pystray.Menu.SEPARATOR)
    items += [
        pystray.MenuItem("📁 Abrir pasta de downloads", lambda icon, item: _open_downloads()),
        pystray.MenuItem(startup_label, _toggle_startup),
        pystray.MenuItem("🔄 Reiniciar servidor", _restart_server),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("✕ Encerrar", lambda icon, item: icon.stop()),
    ]
    return pystray.Menu(*items)


def _check_for_update(icon):
    """Check GitHub for a newer version and notify if found."""
    import time
    # Wait for icon to be ready first
    for _ in range(20):
        if icon.visible:
            break
        time.sleep(0.15)
    try:
        icon.notify("Servidor rodando na porta 5123", "Feed Filter iniciado")
    except Exception:
        pass
    # Version check (silently skip if offline)
    try:
        with urllib.request.urlopen(config.UPDATE_CHECK_URL, timeout=5) as resp:
            data = json.loads(resp.read().decode())
        remote = data.get("version", "0")
        if remote != config.VERSION:
            notes = data.get("notes", "")
            dl = data.get("download_url", "")
            msg = f"Versão {remote} disponível. {notes}"
            try:
                icon.notify(msg, "Feed Filter — Atualização disponível")
            except Exception:
                pass
            # Add update menu item dynamically
            icon.menu = _build_menu(icon, update_url=dl, update_version=remote)
    except Exception:
        pass


def _notify_when_ready(icon):
    threading.Thread(target=_check_for_update, args=(icon,), daemon=True).start()


def main():
    global _flask_thread, _icon_ref

    _flask_thread = threading.Thread(target=_run_flask, daemon=True)
    _flask_thread.start()

    image = _load_icon_image()
    icon = pystray.Icon("FeedFilter", image, "Feed Filter")
    _icon_ref = icon
    icon.menu = _build_menu(icon)

    # Fire notification after icon is ready (separate thread)
    threading.Thread(target=_notify_when_ready, args=(icon,), daemon=True).start()

    icon.run()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
