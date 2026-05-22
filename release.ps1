# Feed Filter — Release automático
# Uso: .\release.ps1 -Version "1.1.0" -Notes "Descrição do que mudou"
# O token é lido da variável de ambiente GITHUB_TOKEN (ou pedido interativamente)

param(
    [Parameter(Mandatory)][string]$Version,
    [Parameter(Mandatory)][string]$Notes
)

$ErrorActionPreference = "Stop"
$REPO = "oliveirapattrick/feed-filter"
$EXE  = "dist\FeedFilter.exe"

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
Step "2/6  Rebuilding FeedFilter.exe (pode demorar ~5 min)"
python -m PyInstaller feed_filter.spec --clean --noconfirm
if (-not (Test-Path $EXE)) { Err "Exe não encontrado em $EXE após o build" }
Ok "Build concluído — $([math]::Round((Get-Item $EXE).Length/1MB,1)) MB"

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

# ── 5. Upload exe ──────────────────────────────────────────────────────────────
Step "5/6  Enviando FeedFilter.exe para o Release"
$uploadUrl = "https://uploads.github.com/repos/$REPO/releases/$($release.id)/assets?name=FeedFilter.exe"
$uploadHeaders = @{ Authorization = "token $token"; "Content-Type" = "application/octet-stream" }
$bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $EXE))
Write-Host "  Enviando $([math]::Round($bytes.Length/1MB,1)) MB..." -ForegroundColor Gray
$up = Invoke-WebRequest -Uri $uploadUrl -Method POST -Headers $uploadHeaders -Body $bytes `
    -UseBasicParsing -TimeoutSec 600
if ($up.StatusCode -ne 201) { Err "Upload falhou — status $($up.StatusCode)" }
Ok "Exe enviado"

# ── 6. Resumo ──────────────────────────────────────────────────────────────────
Step "6/6  Concluído!"
Write-Host ""
Write-Host "  Versão   : $Version" -ForegroundColor White
Write-Host "  Release  : https://github.com/$REPO/releases/tag/v$Version" -ForegroundColor White
Write-Host "  Download : https://github.com/$REPO/releases/latest" -ForegroundColor White
Write-Host ""
Write-Host "  Os usuários serão notificados automaticamente ao abrir o app." -ForegroundColor DarkGray
Write-Host ""
