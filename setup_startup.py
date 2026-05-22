"""
Instala FeedFilter para iniciar automaticamente com o Windows.
Copia FeedFilter.exe para %LOCALAPPDATA%\FeedFilter\ e adiciona entrada no registro.
"""
import os
import sys
import shutil
import winreg

EXE_NAME = "FeedFilter.exe"
APP_FOLDER = os.path.join(os.environ["LOCALAPPDATA"], "FeedFilter")
DEST_EXE = os.path.join(APP_FOLDER, EXE_NAME)
REG_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
REG_VALUE = "FeedFilter"

# Source: same folder as this script
SRC_EXE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist", EXE_NAME)


def install():
    if not os.path.exists(SRC_EXE):
        print(f"ERRO: {SRC_EXE} não encontrado. Execute o build primeiro.")
        sys.exit(1)

    os.makedirs(APP_FOLDER, exist_ok=True)
    print(f"Copiando {EXE_NAME} para {APP_FOLDER} ...")
    shutil.copy2(SRC_EXE, DEST_EXE)
    print("Cópia concluída.")

    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_KEY, 0, winreg.KEY_SET_VALUE) as key:
        winreg.SetValueEx(key, REG_VALUE, 0, winreg.REG_SZ, f'"{DEST_EXE}"')
    print("Entrada de inicialização automática adicionada ao registro.")

    answer = input("Deseja iniciar o FeedFilter agora? [s/N] ").strip().lower()
    if answer == "s":
        import subprocess
        subprocess.Popen([DEST_EXE], close_fds=True)
        print("FeedFilter iniciado.")

    print("\nInstalação concluída!")


if __name__ == "__main__":
    install()
