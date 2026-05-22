@echo off
chcp 65001 >nul
echo.
echo  Feed Filter — Atualizador
echo  ─────────────────────────
echo.

where git >nul 2>&1
if %errorlevel% neq 0 (
  echo  [ERRO] Git nao encontrado. Baixe em https://git-scm.com e tente novamente.
  pause
  exit /b 1
)

git pull origin main

if %errorlevel% neq 0 (
  echo.
  echo  [ERRO] Nao foi possivel atualizar. Verifique sua conexao com a internet.
  pause
  exit /b 1
)

echo.
echo  Atualizacao concluida!
echo  Recarregue a extensao no Chrome: chrome://extensions
echo.
pause
