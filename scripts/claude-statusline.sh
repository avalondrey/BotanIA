#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Claude Code Status Line — Ollama Context Monitor
# ═══════════════════════════════════════════════════════════════
#  Script pour afficher le context remaining dans la statusbar
#  de Claude Code. Lit le JSON de stdin et affiche:
#    - Modèle + % context utilisé (barre colorée)
#    - Alertes visuelles quand saturation approche
# ═══════════════════════════════════════════════════════════════

# Couleurs (ANSI)
RED='\033[0;31m'
YELLOW='\033[0;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

# Lire le JSON depuis stdin
input=$(cat)

# Extraire les données avec jq
MODEL=$(echo "$input" | jq -r '.model.display_name // "?"')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
PCT=${PCT%.*}  # Supprimer décimales si présent
REMAIN=$(echo "$input" | jq -r '.context_window.remaining_percentage // 100')
CTX_SIZE=$(echo "$input" | jq -r '.context_window.context_window_size // 0')
IN_TOK=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0')
OUT_TOK=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0')

# Formater le context size (ex: 200000 -> 200k)
format_ctx() {
    local size="$1"
    if [ -z "$size" ] || [ "$size" = "0" ] || [ "$size" = "null" ]; then
        echo "?"
        return
    fi
    if [ "$size" -ge 1000000 ]; then
        echo "$((size / 1000000))M"
    elif [ "$size" -ge 1000 ]; then
        echo "$((size / 1000))k"
    else
        echo "$size"
    fi
}

# Construire la barre de progression (10 caractères)
build_bar() {
    local pct="$1"
    local width=10
    local filled=$((width * pct / 100))
    local empty=$((width - filled))

    local color="$GREEN"
    if [ "$pct" -ge 85 ]; then color="$RED"
    elif [ "$pct" -ge 60 ]; then color="$YELLOW"
    fi

    printf "${color}"
    printf "%${filled}s" | tr ' ' '▓'
    printf "${CYAN}"
    printf "%${empty}s" | tr ' ' '▒'
    printf "${RESET}"
}

# Choisir le couleur du texte selon usage
get_text_color() {
    local pct="$1"
    if [ "$pct" -ge 85 ]; then echo "$RED"
    elif [ "$pct" -ge 60 ]; then echo "$YELLOW"
    else echo "$GREEN"
    fi
}

# Formater les tokens (ex: 15234 -> 15k)
format_tokens() {
    local tok="$1"
    if [ -z "$tok" ] || [ "$tok" = "null" ]; then echo "0"; return; fi
    if [ "$tok" -ge 1000000 ]; then
        echo "$((tok / 1000000))M"
    elif [ "$tok" -ge 1000 ]; then
        echo "$((tok / 1000))k"
    else
        echo "$tok"
    fi
}

# Alertes context faible
check_warnings() {
    local pct="$1"
    if [ "$pct" -ge 95 ]; then
        echo -e " ${RED}⚠️ SATURÉ${RESET}"
    elif [ "$pct" -ge 85 ]; then
        echo -e " ${YELLOW}⚠️ context bas${RESET}"
    fi
}

# ─── Affichage ───

CTX_FORMATTED=$(format_ctx "$CTX_SIZE")
IN_FORMATTED=$(format_tokens "$IN_TOK")
OUT_FORMATTED=$(format_tokens "$OUT_TOK")
TEXT_COLOR=$(get_text_color "$PCT")
BAR=$(build_bar "$PCT")
WARNING=$(check_warnings "$PCT")

# Ligne principale: [modèle] ▓▓▓▓▓▒▒▒▒ 45% (200k ctx) remaining: 55%
echo -e "${BOLD}[$MODEL]${RESET} $BAR ${TEXT_COLOR}${BOLD}${PCT}%${RESET} ${CYAN}(${CTX_FORMATTED} ctx)${RESET} in:${IN_FORMATTED} out:${OUT_FORMATTED}${WARNING}"