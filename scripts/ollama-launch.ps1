# ═══ Ollama Launch Wrapper ═══
# Usage: 
#   ollama-launch claude --model qwen3.5
#   ollama-launch serve
#   ollama-launch pull qwen3.5

param(
    [string]$Service = "serve",
    [string]$Model = $null,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
╔════════════════════════════════════════════════════════╗
║   Ollama Launch Wrapper — BotanIA Configuration       ║
╚════════════════════════════════════════════════════════╝

USAGE:
  .\ollama-launch.ps1 [SERVICE] [-Model MODEL] [OPTIONS]

SERVICES:
  serve           Lancer le serveur Ollama (défaut)
  claude          Lancer Ollama avec le modèle spécifié
  pull            Télécharger un modèle
  status          Vérifier le statut Ollama
  help            Afficher cette aide

MODÈLES DISPONIBLES:
  qwen3.5         (par défaut) — IA généraliste bilingue
  qwen2.5:7b      — Expert jardinage français
  llava           — Vision modelBakllava
  nomic-embed-text — Embeddings pour RAG
  llama3.2        — Généraliste

EXEMPLES:
  # Lancer le serveur
  .\ollama-launch.ps1

  # Lancer avec Claude (qwen3.5)
  .\ollama-launch.ps1 claude

  # Lancer avec un modèle spécifique
  .\ollama-launch.ps1 claude -Model qwen2.5:7b

  # Télécharger un modèle
  .\ollama-launch.ps1 pull -Model qwen3.5

"@
    exit 0
}

# ─── Configuration ───
$OLLAMA_HOST = "http://localhost:11434"
$DEFAULT_MODEL = "qwen3.5"
$MODELS_CONFIG = @{
    "claude"          = "qwen3.5"
    "qwen3.5"         = "qwen3.5"
    "qwen2.5"         = "qwen2.5:7b"
    "gardening"       = "qwen2.5:7b"
    "vision"          = "llava"
    "embeddings"      = "nomic-embed-text"
    "fast"            = "llama3.2"
}

function Cleanup-AnthropicAuth {
    if (Test-Path Env:ANTHROPIC_AUTH_TOKEN) {
        Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
        Write-Host "🔐 Suppression de ANTHROPIC_AUTH_TOKEN pour éviter le conflit Claude/Ollama" -ForegroundColor Yellow
    }
}

function Test-OllamaInstalled {
    $ollamaCmd = Get-Command ollama -ErrorAction SilentlyContinue
    if (-not $ollamaCmd) {
        Write-Host "❌ Ollama n'est pas installé ou pas dans le PATH" -ForegroundColor Red
        Write-Host "📥 Installez depuis : https://ollama.ai" -ForegroundColor Yellow
        exit 1
    }
    return $ollamaCmd
}

function Get-ModelName {
    param([string]$Alias)
    
    if ($MODELS_CONFIG.ContainsKey($Alias)) {
        return $MODELS_CONFIG[$Alias]
    }
    # Si c'est un nom de modèle direct (ex: qwen3.5)
    return $Alias -ne "" ? $Alias : $DEFAULT_MODEL
}

function Start-OllamaServer {
    Write-Host "🚀 Lancement du serveur Ollama..." -ForegroundColor Cyan
    Write-Host "   URL : $OLLAMA_HOST" -ForegroundColor DarkCyan
    ollama serve
}

function Start-OllamaChat {
    param([string]$Model)
    
    $model = Get-ModelName $Model
    
    Write-Host "🤖 Chargement de $model..." -ForegroundColor Cyan
    
    # Vérifier que le modèle existe
    $tags = ollama list 2>&1
    if ($tags -notmatch $model) {
        Write-Host "⚠️  Modèle '$model' pas trouvé localement" -ForegroundColor Yellow
        Write-Host "📥 Télécharge avec : ollama pull $model" -ForegroundColor Yellow
        $response = Read-Host "Télécharger maintenant ? (y/n)"
        if ($response -eq "y") {
            ollama pull $model
        } else {
            exit 1
        }
    }
    
    Write-Host "💬 Lancement du chat avec $model" -ForegroundColor Green
    ollama run $model
}

function Pull-Model {
    param([string]$Model)
    
    if (-not $Model) {
        $Model = Read-Host "Quel modèle télécharger ? (défaut: $DEFAULT_MODEL)"
        $Model = $Model -eq "" ? $DEFAULT_MODEL : $Model
    }
    
    Write-Host "📥 Téléchargement de $Model..." -ForegroundColor Cyan
    ollama pull $Model
}

function Get-OllamaStatus {
    Write-Host "🔍 Vérification du statut Ollama..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri "$OLLAMA_HOST/api/tags" -TimeoutSec 3 -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Serveur Ollama : EN LIGNE" -ForegroundColor Green
            Write-Host "   URL : $OLLAMA_HOST" -ForegroundColor DarkGreen
            
            $models = $response.Content | ConvertFrom-Json
            Write-Host "   📦 Modèles disponibles :" -ForegroundColor DarkGreen
            foreach ($m in $models.models) {
                Write-Host "      • $($m.name)" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "❌ Serveur Ollama : HORS LIGNE" -ForegroundColor Red
        Write-Host "   Lancez avec : .\ollama-launch.ps1 serve" -ForegroundColor Yellow
    }
}

# ─── Main ───
Cleanup-AnthropicAuth
Test-OllamaInstalled | Out-Null

switch ($Service.ToLower()) {
    "serve" {
        Start-OllamaServer
    }
    "claude" {
        Start-OllamaChat -Model ($Model -ne "" ? $Model : $DEFAULT_MODEL)
    }
    "chat" {
        Start-OllamaChat -Model ($Model -ne "" ? $Model : $DEFAULT_MODEL)
    }
    "pull" {
        Pull-Model -Model $Model
    }
    "status" {
        Get-OllamaStatus
    }
    "list" {
        ollama list
    }
    default {
        # Si aucun service spécifié, essayer comme un alias de modèle
        if ($Service -and $Service -ne "") {
            Start-OllamaChat -Model $Service
        } else {
            Start-OllamaServer
        }
    }
}
