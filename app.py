import ctypes
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

_MUTEX_NAME = "FeedFilterSingleInstance"
_mutex_handle = None


def _acquire_single_instance_mutex():
    """Return True if this is the first instance, False if another is already running."""
    global _mutex_handle
    _mutex_handle = ctypes.windll.kernel32.CreateMutexW(None, True, _MUTEX_NAME)
    return ctypes.windll.kernel32.GetLastError() != 183  # 183 = ERROR_ALREADY_EXISTS

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


def _show_splash():
    """Show a brief 'loading' message box, then close it automatically after the tray icon appears."""
    ctypes.windll.user32.MessageBoxW(
        0,
        "Feed Filter está iniciando...\n\nO ícone aparecerá na bandeja do sistema em instantes.",
        "Feed Filter",
        0x40,  # MB_ICONINFORMATION
    )


def _win_notify(title: str, msg: str):
    """Reliable tray balloon via Shell_NotifyIcon or fallback MessageBox."""
    try:
        import pystray._win32 as _w32  # noqa: F401 — just check it exists
        if _icon_ref and _icon_ref.visible:
            _icon_ref.notify(msg, title)
            return
    except Exception:
        pass
    ctypes.windll.user32.MessageBoxW(0, msg, title, 0x40)


def _check_for_update(icon):
    """Show startup notification and check GitHub for a newer version."""
    import time
    for _ in range(60):
        if icon.visible:
            break
        time.sleep(0.25)
    _win_notify("Feed Filter iniciado", f"Servidor rodando na porta {config.SERVER_PORT}")
    try:
        with urllib.request.urlopen(config.UPDATE_CHECK_URL, timeout=5) as resp:
            data = json.loads(resp.read().decode())
        remote = data.get("version", "0")
        if remote != config.VERSION:
            notes = data.get("notes", "")
            dl = data.get("download_url", "")
            _win_notify(
                "Feed Filter — Atualização disponível",
                f"Versão {remote} disponível. {notes}",
            )
            icon.menu = _build_menu(icon, update_url=dl, update_version=remote)
    except Exception:
        pass


def _notify_when_ready(icon):
    threading.Thread(target=_check_for_update, args=(icon,), daemon=True).start()


def main():
    global _flask_thread, _icon_ref

    if not _acquire_single_instance_mutex():
        return

    # Show splash immediately so user gets feedback while tray icon loads
    splash_thread = threading.Thread(target=_show_splash, daemon=True)
    splash_thread.start()

    _flask_thread = threading.Thread(target=_run_flask, daemon=True)
    _flask_thread.start()

    image = _load_icon_image()
    icon = pystray.Icon("FeedFilter", image, "Feed Filter")
    _icon_ref = icon
    icon.menu = _build_menu(icon)

    threading.Thread(target=_notify_when_ready, args=(icon,), daemon=True).start()

    icon.run()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        pass
