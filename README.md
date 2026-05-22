# Feed Filter

Extensão Chrome + App local para filtrar, baixar e transcrever posts do Instagram.

## Instalação

Abra o arquivo `guia_instalacao.html` e siga os passos.

## Atualização

Execute `atualizar.bat` ou faça `git pull origin main` manualmente.

## Estrutura

```
feed-extension/   extensão Chrome (carregar sem compactação)
app.py            app principal (bandeja do sistema)
server.py         servidor Flask (porta 5123)
downloader.py     download via yt-dlp
transcriber.py    transcrição via faster-whisper
config.py         configurações globais
version.json      versão atual (lida pelo app para checar updates)
atualizar.bat     script de atualização para a equipe
```
