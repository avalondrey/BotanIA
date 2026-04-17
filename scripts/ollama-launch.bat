@echo off
REM ═══ ollama-launch.bat — BotanIA Ollama Launcher ═══
REM Usage: ollama-launch.bat [service] [--model MODEL]

setlocal enabledelayedexpansion

if "%1"=="" goto serve
if /i "%1"=="help" goto help
if /i "%1"=="--help" goto help
if /i "%1"=="-h" goto help
if /i "%1"=="status" goto status
if /i "%1"=="serve" goto serve
if /i "%1"=="claude" goto claude
if /i "%1"=="chat" goto claude
if /i "%1"=="pull" goto pull
if /i "%1"=="list" goto list

REM Si argument non reconnu, essayer comme modèle aliasif /i "%1"=="gardening" ( set MODEL=qwen2.5:7b && goto claude )
if /i "%1"=="vision" ( set MODEL=llava && goto claude )
if /i "%1"=="embeddings" ( set MODEL=nomic-embed-text && goto chat )
if /i "%1"=="fast" ( set MODEL=llama3.2 && goto claude )

REM Sinon, essayer comme service
goto try_run

:serve
echo.
echo 🚀 Lancement du serveur Ollama...
echo 📍 URL : http://localhost:11434
echo.
ollama serve
goto end

:claude
if not defined MODEL (
    if "%2"=="--model" ( set MODEL=%3 ) else ( set MODEL=qwen3.5 )
)
echo.
echo 🤖 Ollama Chat — Claude Mode
echo 📦 Modèle : !MODEL!
echo.
ollama run !MODEL!
goto end

:pull
if "%2"=="" (
    set /p MODEL="Quel modèle télécharger ? (défaut: qwen3.5): "
    if "!MODEL!"=="" set MODEL=qwen3.5
) else (
    if "%2"=="--model" ( set MODEL=%3 ) else ( set MODEL=%2 )
)
echo.
echo 📥 Téléchargement du modèle : !MODEL!
echo.
ollama pull !MODEL!
goto end

:list
echo.
echo 📦 Modèles Ollama disponibles:
echo.
ollama list
goto end

:status
echo.
echo 🔍 Vérification du statut Ollama...
echo.
curl -s http://localhost:11434/api/tags >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Serveur Ollama : EN LIGNE
    echo 📍 URL : http://localhost:11434
    echo.
    echo 📦 Modèles disponibles:
    curl -s http://localhost:11434/api/tags | findstr /i "name"
) else (
    echo ❌ Serveur Ollama : HORS LIGNE
    echo 💡 Lancez avec : ollama-launch.bat serve
)
goto end

:help
echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║  Ollama Launch — BotanIA Configuration            ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo USAGE:
echo   ollama-launch.bat [SERVICE] [OPTIONS]
echo.
echo SERVICES:
echo   serve           Lancer le serveur Ollama (défaut)
echo   claude          Lancer Ollama avec qwen3.5
echo   chat            Alias pour claude
echo   pull            Télécharger un modèle
echo   list            Lister les modèles disponibles
echo   status          Vérifier le statut
echo   help            Afficher cette aide
echo.
echo OPTIONS:
echo   --model MODEL   Spécifier un modèle
echo.
echo MODÈLES DISPONIBLES:
echo   qwen3.5         (défaut) — IA généraliste bilingue
echo   qwen2.5:7b      — Expert jardinage français
echo   llava           — Vision imageLlama3.2
echo   nomic-embed-text — Embeddings pour RAG
echo.
echo EXEMPLES:
echo   ollama-launch.bat serve
echo   ollama-launch.bat claude
echo   ollama-launch.bat claude --model qwen2.5:7b
echo   ollama-launch.bat pull --model qwen3.5
echo   ollama-launch.bat status
echo.
goto end

:try_run
REM Essayer de lancer comme modèle
ollama run %1 %2 %3 %4 %5
goto end

:end
endlocal
exit /b
