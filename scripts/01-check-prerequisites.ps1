[CmdletBinding()]
param([string]$Model = "llama3.2")
Write-Host "  → Vérification de Ollama..." -ForegroundColor Gray
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "  ❌ Ollama non trouvé. Téléchargez : https://ollama.com/download" -ForegroundColor Red
    exit 1
}
try {
    Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -UseBasicParsing -TimeoutSec 3 | Out-Null
    Write-Host "  ✅ Ollama est actif" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Ollama ne répond pas. Lancez : ollama serve" -ForegroundColor Yellow
}
 = ollama list 2>$null | Select-String llama3.2
if (-not ) {
    Write-Host "  ⬇️  Téléchargement du modèle 'llama3.2'..." -ForegroundColor Yellow
    ollama pull llama3.2
} else {
    Write-Host "  ✅ Modèle 'llama3.2' présent" -ForegroundColor Green
}
