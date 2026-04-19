#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Ollama Status — Monitoring léger pour usage context
# ═══════════════════════════════════════════════════════════════
#  Usage: ./ollama-status.sh [model]
#         ./ollama-status.sh --watch [model]
#         curl -s http://localhost:11434/api/tags | ./ollama-status.sh --parse
# ═══════════════════════════════════════════════════════════════

set -e

HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
MODEL="${1:-}"
WATCH_MODE=false

# Couleurs
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# ─── Fonctions ───

usage() {
    echo "Usage: ollama-status.sh [model] [--watch] [--help]"
    echo ""
    echo "Options:"
    echo "  model       Montrer le context du modèle spécifié"
    echo "  --watch     Mode watch (rafraîchissement toutes les 5s)"
    echo "  --list      Lister tous les modèles disponibles"
    echo "  --loaded    Montrer seulement les modèles chargés"
    echo "  --parse     Parser la sortie JSON de /api/tags (pour piping)"
    echo "  --help      Cette aide"
    exit 0
}

# Obtenir le context length d'un modèle
get_context() {
    local model="$1"
    local ctx
    ctx=$(curl -s "$HOST/api/show" \
        -d "{\"name\":\"$model\"}" \
        2>/dev/null | jq -r '.details.context_length // empty')
    echo "$ctx"
}

# Obtenir le nombre de paramètres d'un modèle
get_params() {
    local model="$1"
    local params
    params=$(curl -s "$HOST/api/show" \
        -d "{\"name\":\"$model\"}" \
        2>/dev/null | jq -r '.details.parameter_size // empty')
    echo "$params"
}

# Formater les nombres (ex: 7B, 3.8B)
format_size() {
    local size="$1"
    if [ -z "$size" ]; then echo "?"; return; fi
    if [ "$size" = "null" ] || [[ "$size" == *"error"* ]]; then echo "?"; return; fi
    echo "$size"
}

# Afficher une barre de progression context
context_bar() {
    local used="$1"
    local total="$2"
    local width=20

    if [ -z "$total" ] || [ "$total" = "0" ] || [ "$total" = "null" ]; then
        echo "${CYAN}[?${RESET}${CYAN}$(printf '%*s' $width '' | tr ' ' '─')${RESET}${CYAN}?${RESET}]"
        return
    fi

    local pct=$((used * 100 / total))
    local filled=$((width * used / total))
    local empty=$((width - filled))

    local color="$GREEN"
    if [ "$pct" -gt 60 ]; then color="$YELLOW"; fi
    if [ "$pct" -gt 85 ]; then color="$RED"; fi

    printf "${color}[${RESET}"
    printf "${color}%${filled}s${RESET}" | tr ' ' '█'
    printf "${CYAN}%${empty}s${RESET}" | tr ' ' '─'
    printf "${color}]${RESET} ${BOLD}%d%%${RESET}" "$pct"
}

# Parser la sortie JSON (pour piping depuis curl)
parse_json() {
    local input
    input=$(cat)
    local models
    models=$(echo "$input" | jq -r '.models[] | "\(.name)|\(.digest[0:12])|\(.size)"' 2>/dev/null)

    if [ -z "$models" ]; then
        echo "❌ Aucun modèle disponible"
        return
    fi

    printf "${BOLD}%-30s %10s %12s${RESET}\n" "MODÈLE" "TAILLE" "CONTEXT"
    echo "────────────────────────────────────────────────────────"

    while IFS='|' read -r name digest size; do
        local ctx
        ctx=$(get_context "$name" 2>/dev/null)
        printf "%-30s %10s %12s\n" "$name" "$(format_size "$size")" "${ctx:-?}"
    done <<< "$models"
}

# ─── Commandes principales ───

cmd_list() {
    echo ""
    echo "${BOLD}${CYAN}╭──────────────────────────────────────╮${RESET}"
    echo "${BOLD}${CYAN}│     🤖 Modèles Ollama disponibles     │${RESET}"
    echo "${BOLD}${CYAN}╰──────────────────────────────────────╯${RESET}"
    echo ""

    local tags
    tags=$(curl -s "$HOST/api/tags" 2>/dev/null)

    if [ -z "$tags" ] || [ "$tags" = "null" ]; then
        echo "❌ Impossible de se connecter à Ollama sur $HOST"
        echo "   Vérifie que 'ollama serve' tourne"
        return 1
    fi

    local models
    models=$(echo "$tags" | jq -r '.models[] | "\(.name)|\(.size)"' 2>/dev/null)

    if [ -z "$models" ]; then
        echo "   Aucun modèle trouvé"
        return
    fi

    printf "${BOLD}%-35s %12s %12s %10s${RESET}\n" "NOM" "TAILLE" "CONTEXT" "PARAMÈTRES"
    echo "────────────────────────────────────────────────────────────────────────"

    while IFS='|' read -r name size; do
        local ctx params
        ctx=$(get_context "$name" 2>/dev/null)
        params=$(get_params "$name" 2>/dev/null)
        printf "%-35s %12s %12s %10s\n" \
            "$name" \
            "$(format_size "$size")" \
            "${ctx:-?} tokens" \
            "$(format_size "$params")"
    done <<< "$models"

    echo ""
}

cmd_loaded() {
    echo ""
    echo "${BOLD}${CYAN}╭──────────────────────────────────────╮${RESET}"
    echo "${BOLD}${CYAN}│        🤖 Modèles chargés            │${RESET}"
    echo "${BOLD}${CYAN}╰──────────────────────────────────────╯${RESET}"
    echo ""

    local tags
    tags=$(curl -s "$HOST/api/tags" 2>/dev/null)

    if [ -z "$tags" ]; then
        echo "❌ Impossible de se connecter à Ollama"
        return 1
    fi

    local models
    models=$(echo "$tags" | jq -r '.models[].name' 2>/dev/null)

    for name in $models; do
        local ctx
        ctx=$(get_context "$name" 2>/dev/null)

        local bar
        bar=$(context_bar 0 "${ctx:-0}" 2>/dev/null)

        printf "${BOLD}%-25s${RESET} $bar  ${CYAN}%s tokens${RESET}\n" "$name" "${ctx:-?}"
    done

    echo ""
}

cmd_show() {
    local model="$1"
    if [ -z "$model" ]; then
        echo "❌ Spécifie un modèle: ollama-status.sh <model>"
        return 1
    fi

    echo ""
    echo "${BOLD}${CYAN}╭──────────────────────────────────────╮${RESET}"
    echo "${BOLD}${CYAN}│        📊 $model                      │${RESET}"
    echo "${BOLD}${CYAN}╰──────────────────────────────────────╯${RESET}"
    echo ""

    local info
    info=$(curl -s "$HOST/api/show" -d "{\"name\":\"$model\"}" 2>/dev/null)

    if [ -z "$info" ] || echo "$info" | jq -e '.error' > /dev/null 2>&1; then
        echo "❌ Modèle '$model' non trouvé"
        echo "   Vérifie avec: ollama-status.sh --list"
        return 1
    fi

    local ctx=$(echo "$info" | jq -r '.details.context_length // "?"')
    local params=$(echo "$info" | jq -r '.details.parameter_size // "?"')
    local quant=$(echo "$info" | jq -r '.details.quantization_level // "?"')
    local family=$(echo "$info" | jq -r '.details.family // "?"')
    local modified=$(echo "$info" | jq -r '.modified_at // "?"')

    local bar
    bar=$(context_bar 0 "${ctx:-0}")

    echo "${BOLD}Modèle:${RESET}     $model"
    echo "${BOLD}Context:${RESET}    $ctx tokens"
    echo "${BOLD}Paramètres:${RESET} $(format_size "$params")"
    echo "${BOLD}Quantization:${RESET} $quant"
    echo "${BOLD}Famille:${RESET}   $family"
    echo "${BOLD}Modifié:${RESET}   $modified"
    echo ""
    echo "Usage context: $bar"
    echo ""
}

cmd_watch() {
    local model="${2:-}"
    while true; do
        clear
        if [ -n "$model" ]; then
            cmd_show "$model"
        else
            cmd_loaded
        fi
        sleep 5
    done
}

# ─── Parsing arguments ───

case "${1:-}" in
    --help|-h)
        usage
        ;;
    --list|-l)
        cmd_list
        ;;
    --loaded)
        cmd_loaded
        ;;
    --watch|-w)
        WATCH_MODE=true
        shift
        cmd_watch "$@"
        ;;
    --parse|-p)
        parse_json
        ;;
    "")
        cmd_list
        ;;
    *)
        cmd_show "$1"
        ;;
esac