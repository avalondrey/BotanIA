# 🚀 Guide Ollama + qwen3.5 — BotanIA

## Installation

### 1️⃣ Installer Ollama
- **Windows** : https://ollama.ai/download
- **macOS** : `brew install ollama`
- **Linux** : `curl https://ollama.ai/install.sh | sh`

Après installation, redémarrez votre terminal.

---

## Configuration Rapide

### Option 1 : PowerShell (Recommandé)

#### Étape 1 : Activer le profil PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

#### Étape 2 : Télécharger qwen3.5
```powershell
ollama_pull qwen3.5
```

#### Étape 3 : Lancer Ollama avec Claude
```powershell
ollama_claude
# Ou pour démarrer le serveur
ollama_serve
```

---

### Option 2 : Command Prompt (Windows)

```cmd
cd C:\Users\Administrateur\Desktop\BotanIA\scripts

REM Lancer le serveur
ollama-launch.bat serve

REM Ou lancer Claude
ollama-launch.bat claude

REM Ou télécharger un modèle
ollama-launch.bat pull --model qwen3.5
```

---

## Commandes PowerShell Disponibles

| Commande | Fonction |
|----------|----------|
| `ollama_serve` | Démarrer le serveur Ollama (port 11434) |
| `ollama_claude` | Lancer Claude avec qwen3.5 |
| `ollama_status` | Vérifier le statut du serveur |
| `ollama_pull qwen3.5` | Télécharger qwen3.5 (~4.5 GB) |
| `dev_status` | Afficher l'état global de BotanIA |

---

## Commandes Batch Disponibles

```cmd
ollama-launch.bat serve                 # Démarrer le serveur
ollama-launch.bat claude                # Lancer Claude
ollama-launch.bat pull --model qwen3.5  # Télécharger un modèle
ollama-launch.bat status                # Vérifier le statut
ollama-launch.bat list                  # Lister les modèles
```

---

## Modèles Disponibles

### Modèles Configurés

| Alias | Modèle | Description |
|-------|--------|-------------|
| **claude** | qwen3.5 | IA généraliste bilingue (défaut) |
| **gardening** | qwen2.5:7b | Expert jardinage français |
| **vision** | llava | Vision multimodal |
| **embeddings** | nomic-embed-text | Embeddings RAG |
| **fast** | llama3.2 | Généraliste rapide |

### Télécharger les Modèles

```powershell
# Télécharger qwen3.5 (~4.5 GB)
ollama_pull qwen3.5

# Télécharger qwen2.5 pour jardinage (~4.5 GB)
ollama_pull qwen2.5:7b

# Télécharger llava pour vision (~4.7 GB)
ollama_pull llava

# Télécharger les embeddings (~275 MB)
ollama_pull nomic-embed-text

# Télécharger tous les modèles
ollama-launch.bat pull --model qwen3.5
ollama-launch.bat pull --model qwen2.5:7b
ollama-launch.bat pull --model llava
ollama-launch.bat pull --model nomic-embed-text
```

---

## Architecture Complète

```
┌─────────────────────────────────────────────────────┐
│         BotanIA Application (Next.js)              │
└────────────┬────────────────────────────────────────┘
             │
    ┌────────▼────────┐
    │  .env.local     │  ← Configuration (qwen3.5, ports, prompts)
    └────────┬────────┘
             │
    ┌────────▼───────────────────────────────────────┐
    │    Ollama Services (localhost:11434)           │
    ├────────────────────────────────────────────────┤
    │  • qwen3.5       — Chat généraliste            │
    │  • qwen2.5:7b    — Gardening expert            │
    │  • llava         — Vision multimodal           │
    │  • nomic-embed   — Embeddings RAG              │
    └────────┬───────────────────────────────────────┘
             │
    ┌────────▼────────────────────────────────────────┐
    │    Qdrant Vector DB (localhost:6333)           │
    │    └─ Stocke les embeddings des conseils       │
    └─────────────────────────────────────────────────┘
```

---

## Utilisation dans l'Application BotanIA

### 1. Assistant Papy le Jardinier
- Route : `/api/ollama`
- Modèle : `OLLAMA_CHAT_MODEL` (qwen3.5)
- Prompt système : `OLLAMA_SYSTEM_PROMPT`

### 2. Agent IA Lia (RAG)
- Embeddings : `OLLAMA_EMBEDDING_MODEL` (nomic-embed-text)
- Chat : `OLLAMA_MODEL` (qwen3.5)
- Vector DB : Qdrant

### 3. Plant Scanner (Vision)
- Route : `/api/scan-gesture`
- Modèle : `OLLAMA_VISION_MODEL` (llava)

---

## Dépannage

### 1️⃣ "Port already in use"
```powershell
# Vérifier quel processus utilise le port 11434
netstat -ano | findstr 11434

# Tuer le processus (remplacez PID par le numéro)
taskkill /PID <PID> /F

# Relancer Ollama
ollama_serve
```

### 2️⃣ "Model not found"
```powershell
# Télécharger le modèle manquant
ollama_pull qwen3.5

# Vérifier les modèles disponibles
ollama-launch.bat list
```

### 3️⃣ "Ollama service offline"
```powershell
# Vérifier le statut
ollama_status

# Redémarrer le service
ollama_serve
```

### 4️⃣ PowerShell n'exécute pas les scripts
```powershell
# Vérifier la politique d'exécution
Get-ExecutionPolicy

# Autoriser les scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

---

## Variables d'Environnement Finales

Voir `.env.local` :

```env
# Serveur Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_HOST=http://localhost:11434
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434

# Modèles
OLLAMA_MODEL=qwen3.5
OLLAMA_CHAT_MODEL=qwen3.5
OLLAMA_VISION_MODEL=llava
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Activation
ENABLE_OLLAMA=true

# Qdrant
NEXT_PUBLIC_QDRANT_URL=http://localhost:6333
```

---

## Ressources

- 📚 [Ollama Documentation](https://github.com/ollama/ollama)
- 🤖 [Qwen Model Cards](https://huggingface.co/Qwen)
- 🔍 [Qdrant Documentation](https://qdrant.tech/documentation/)
- 🌐 [BotanIA README](../README.md)

---

**Dernière mise à jour** : 17 avril 2026
**Créé par** : GitHub Copilot pour BotanIA
