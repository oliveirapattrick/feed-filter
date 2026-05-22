"""
Remove FeedFilter da inicialização automática do Windows.
Apaga a entrada do registro (não remove os arquivos instalados).
"""
import os
import winreg

REG_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
REG_VALUE = "FeedFilter"
APP_FOLDER = os.path.join(os.environ["LOCALAPPDATA"], "FeedFilter")


def remove():
    removed_reg = False
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG_KEY, 0, winreg.KEY_SET_VALUE) as key:
            winreg.DeleteValue(key, REG_VALUE)
        print("Entrada de inicialização automática removida do registro.")
        removed_reg = True
    except FileNotFoundError:
        print("Entrada de registro não encontrada (já removida ou nunca instalada).")

    if removed_reg:
        answer = input(f"Deseja também apagar os arquivos em {APP_FOLDER}? [s/N] ").strip().lower()
        if answer == "s":
            import shutil
            if os.path.exists(APP_FOLDER):
                shutil.rmtree(APP_FOLDER)
                print(f"{APP_FOLDER} removido.")
            else:
                print("Pasta não encontrada.")

    print("\nFeedFilter removido da inicialização automática.")


if __name__ == "__main__":
    remove()
