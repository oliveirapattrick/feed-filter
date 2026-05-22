# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['app.py'],
    pathex=['.'],
    binaries=[('ffmpeg.exe', '.')],
    datas=[
        ('icon.ico', '.'),
        ('config.py', '.'),
        ('server.py', '.'),
        ('downloader.py', '.'),
        ('transcriber.py', '.'),
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'pystray',
        'PIL',
        'PIL.Image',
        'faster_whisper',
        'yt_dlp',
        'requests',
        'threading',
        'subprocess',
        'ctypes',
        'werkzeug',
        'werkzeug.serving',
        'werkzeug.debug',
        'jinja2',
        'click',
        'itsdangerous',
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='FeedFilter',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    icon='icon.ico',
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='FeedFilter',
)
