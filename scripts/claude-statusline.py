#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
#  Claude Code Status Line — Context Monitor
# ═══════════════════════════════════════════════════════════════
#  Script pour afficher le context remaining dans la statusbar
#  de Claude Code. Lit le JSON de stdin et affiche une barre
#  colorée de contexte avec alertes de saturation.
# ═══════════════════════════════════════════════════════════════

import sys
import json
import io

# Fix UTF-8 encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8', errors='replace')

# Couleurs ANSI
RED = '\033[0;31m'
YELLOW = '\033[0;33m'
GREEN = '\033[0;32m'
CYAN = '\033[0;36m'
BOLD = '\033[1m'
RESET = '\033[0m'


def format_ctx(size: int) -> str:
    """Formate le context size (ex: 128000 -> 128k)"""
    if not size:
        return "?"
    if size >= 1_000_000:
        return f"{size // 1_000_000}M"
    if size >= 1_000:
        return f"{size // 1_000}k"
    return str(size)


def format_tokens(tok: int) -> str:
    """Formate les tokens (ex: 57600 -> 57k)"""
    if not tok:
        return "0"
    if tok >= 1_000_000:
        return f"{tok // 1_000_000}M"
    if tok >= 1_000:
        return f"{tok // 1_000}k"
    return str(tok)


def build_bar(pct: int, width: int = 10) -> str:
    """Construire une barre de progression colorée"""
    filled = width * pct // 100
    empty = width - filled

    if pct >= 85:
        color = RED
    elif pct >= 60:
        color = YELLOW
    else:
        color = GREEN

    return f"{color}{'▓' * filled}{CYAN}{'▒' * empty}{RESET}"


def get_text_color(pct: int) -> str:
    if pct >= 85:
        return RED
    elif pct >= 60:
        return YELLOW
    return GREEN


def check_warnings(pct: int) -> str:
    """Retourne une alerte si context critique"""
    if pct >= 95:
        return f" {RED}⚠️ SATURÉ{RESET}"
    if pct >= 85:
        return f" {RED}⚠️ critique{RESET}"
    if pct >= 70:
        return f" {YELLOW}⚠️ context bas{RESET}"
    return ""


def main():
    try:
        data = json.load(sys.stdin)
    except json.JSONDecodeError:
        print("❌ JSON invalide")
        return

    # Extraire les données
    model = data.get('model', {}).get('display_name', '?')
    pct = data.get('context_window', {}).get('used_percentage', 0) or 0
    pct = int(pct)
    ctx_size = data.get('context_window', {}).get('context_window_size', 0) or 0
    in_tok = data.get('context_window', {}).get('total_input_tokens', 0) or 0
    out_tok = data.get('context_window', {}).get('total_output_tokens', 0) or 0

    # Formater
    ctx_fmt = format_ctx(ctx_size)
    in_fmt = format_tokens(in_tok)
    out_fmt = format_tokens(out_tok)
    bar = build_bar(pct)
    text_color = get_text_color(pct)
    warning = check_warnings(pct)

    # Afficher
    # Format: [model] ▓▓▓▓▓▒▒▒▒ 45% (128k ctx) in:57k out:24k ⚠️
    print(f"{BOLD}[{model}]{RESET} {bar} {text_color}{BOLD}{pct}%{RESET} {CYAN}({ctx_fmt} ctx){RESET} in:{in_fmt} out:{out_fmt}{warning}")


if __name__ == '__main__':
    main()