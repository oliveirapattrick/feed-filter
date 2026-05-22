# Feed Filter — Release automático
# Uso: .\release.ps1 -Version "1.1.0" -Notes "Descrição do que mudou"
# O token é lido da variável de ambiente GITHUB_TOKEN (ou pedido interativamente)

param(
    [Parameter(Mandatory)][string]$Version,
    [Parameter(Mandatory)][string]$Notes
)

$ErrorActionPreference = "Stop"
$REPO = "oliveirapattrick/feed-filter"
$DIST_DIR = "dist\FeedFilter"
$ZIP_NAME = "FeedFilter.zip"

# ── Token ────────────────────────────────────────────────────────────────────
$token = $env:GITHUB_TOKEN
if (-not $token) {
    $token = Read-Host "GitHub token (GITHUB_TOKEN não definido)"
}
$headers = @{ Authorization = "token $token"; "Content-Type" = "application/json" }

function Step($msg) { Write-Host "`n[$msg]" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "  OK  $msg" -ForegroundColor Green }
function Err($msg)  { Write-Host "  ERRO $msg" -ForegroundColor Red; exit 1 }

# ── 1. Bump version nos arquivos ──────────────────────────────────────────────
Step "1/6  Atualizando versão para $Version"

$configPath  = "config.py"
$versionPath = "version.json"

(Get-Content $configPath) -replace 'VERSION = ".*"', "VERSION = `"$Version`"" |
    Set-Content $configPath -Encoding UTF8
Ok "config.py atualizado"

$vJson = @{ version = $Version; notes = $Notes; download_url = "https://github.com/$REPO/releases/latest" } |
    ConvertTo-Json -Compress
[System.IO.File]::WriteAllText((Resolve-Path $versionPath), $vJson + "`n")
Ok "version.json atualizado"

# ── 2. Build PyInstaller ───────────────────────────────────────────────────────
Step "2/6  Rebuilding FeedFilter (onedir, pode demorar ~5 min)"
python -m PyInstaller feed_filter.spec --clean --noconfirm
if (-not (Test-Path "$DIST_DIR\FeedFilter.exe")) { Err "Exe não encontrado em $DIST_DIR\FeedFilter.exe após o build" }
$sizeMB = [math]::Round((Get-ChildItem $DIST_DIR -Recurse | Measure-Object Length -Sum).Sum / 1MB, 1)
Ok "Build concluído — $sizeMB MB total"

# ── 3. Git commit + push ───────────────────────────────────────────────────────
Step "3/6  Commit e push"
git add config.py version.json
git commit -m "chore: bump versao para $Version`n`nCo-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push origin main
Ok "Código no GitHub"

# ── 4. Criar GitHub Release ────────────────────────────────────────────────────
Step "4/6  Criando Release v$Version"
$releaseBody = [System.Text.Encoding]::UTF8.GetBytes(
    (ConvertTo-Json @{
        tag_name   = "v$Version"
        name       = "v$Version"
        body       = $Notes
        draft      = $false
        prerelease = $false
    } -Compress)
)
$release = Invoke-WebRequest `
    -Uri "https://api.github.com/repos/$REPO/releases" `
    -Method POST -Headers $headers -Body $releaseBody -UseBasicParsing |
    ConvertFrom-Json
Ok "Release criado — ID $($release.id)"

# ── 5. Upload assets ──────────────────────────────────────────────────────────
Step "5/6  Enviando arquivos para o Release"

function Upload($filePath, $assetName, $contentType) {
    $url = "https://uploads.github.com/repos/$REPO/releases/$($release.id)/assets?name=$assetName"
    $hdrs = @{ Authorization = "token $token"; "Content-Type" = $contentType }
    $data = [System.IO.File]::ReadAllBytes((Resolve-Path $filePath))
    Write-Host "  Enviando $assetName ($([math]::Round($data.Length/1KB,1)) KB)..." -ForegroundColor Gray
    $r = Invoke-WebRequest -Uri $url -Method POST -Headers $hdrs -Body $data -UseBasicParsing -TimeoutSec 600
    if ($r.StatusCode -ne 201) { Err "Upload de $assetName falhou — status $($r.StatusCode)" }
    Ok "$assetName enviado"
}

# FeedFilter.zip (pasta onedir)
if (Test-Path $ZIP_NAME) { Remove-Item $ZIP_NAME -Force }
Compress-Archive -Path $DIST_DIR -DestinationPath $ZIP_NAME -Force
$zipMB = [math]::Round((Get-Item $ZIP_NAME).Length / 1MB, 1)
Write-Host "  Enviando $ZIP_NAME ($zipMB MB)..." -ForegroundColor Gray
Upload $ZIP_NAME $ZIP_NAME "application/zip"

# feed-extension.zip
Compress-Archive -Path "feed-extension" -DestinationPath "feed-extension.zip" -Force
Upload "feed-extension.zip" "feed-extension.zip" "application/zip"

# guia_instalacao.html
Upload "guia_instalacao.html" "guia_instalacao.html" "text/html"

# ── 6. Resumo ──────────────────────────────────────────────────────────────────
Step "6/6  Concluído!"
Write-Host ""
Write-Host "  Versão   : $Version" -ForegroundColor White
Write-Host "  Release  : https://github.com/$REPO/releases/tag/v$Version" -ForegroundColor White
Write-Host "  Download : https://github.com/$REPO/releases/latest" -ForegroundColor White
Write-Host ""
Write-Host "  Asset    : $ZIP_NAME (extrair pasta e executar FeedFilter\FeedFilter.exe)" -ForegroundColor DarkGray
Write-Host "  Os usuários serão notificados automaticamente ao abrir o app." -ForegroundColor DarkGray
Write-Host ""
