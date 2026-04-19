#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
#  Ollama Context Monitor — Simple, Windows-compatible
# ═══════════════════════════════════════════════════════════════

import sys
import time
import json
import signal
import argparse
from urllib.request import urlopen, Request
from urllib.error import URLError

# Disable ANSI on Windows to avoid black screen
import os
if os.name == 'nt':
    os.system('color')  # Enable colors but use simpler output

HOST = "http://127.0.0.1:11434"
INTERVAL = 5
RUNNING = True


def signal_handler(sig, frame):
    global RUNNING
    print("\n\nArret du monitor...")
    RUNNING = False


def get_ollama_models():
    try:
        req = Request(f"{HOST}/api/tags", headers={"Content-Type": "application/json"})
        with urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data.get('models', [])
    except (URLError, json.JSONDecodeError, TimeoutError):
        return None


def get_model_context(model_name: str):
    try:
        req = Request(
            f"{HOST}/api/show",
            data=json.dumps({"name": model_name}).encode('utf-8'),
            headers={"Content-Type": "application/json"},
            method='POST'
        )
        with urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode('utf-8'))
            ctx = data.get('details', {}).get('context_length', 0)
            if ctx:
                return ctx
            model_info = data.get('model_info', {})
            for key, value in model_info.items():
                if key.endswith('.context_length') and isinstance(value, int):
                    return value
            return 0
    except (URLError, json.JSONDecodeError, TimeoutError):
        return 0


def format_ctx(size: int) -> str:
    if not size:
        return "?"
    if size >= 1_000_000:
        return f"{size / 1_000_000:.0f}M"
    if size >= 1_000:
        return f"{size / 1_000:.0f}k"
    return str(size)


def clear_screen():
    if os.name == 'nt':
        os.system('cls')
    else:
        os.system('clear')


def main():
    global HOST, INTERVAL, RUNNING

    parser = argparse.ArgumentParser(description='Ollama Context Monitor')
    parser.add_argument('--interval', '-i', type=int, default=5)
    parser.add_argument('--model', '-m', type=str, default=None)
    parser.add_argument('--host', type=str, default=None)
    args = parser.parse_args()

    if args.host:
        HOST = args.host
    INTERVAL = args.interval

    signal.signal(signal.SIGINT, signal_handler)

    print("=" * 60)
    print("  Ollama Context Monitor")
    print("  Ctrl+C pour arreter")
    print("=" * 60)
    print()

    while RUNNING:
        clear_screen()
        print("=" * 60)
        print("  Ollama Context Monitor  -  Ctrl+C pour arreter")
        print("=" * 60)
        print()

        models = get_ollama_models()

        if models is None:
            print("ERREUR: Impossible de se connecter a Ollama")
            print("Verifie que 'ollama serve' tourne")
        else:
            print(f"  {'MODEL':<40} {'CONTEXT':>10}")
            print(f"  {'-' * 50}")

            for model in models:
                name = model.get('name', '?')
                ctx = get_model_context(name)
                ctx_str = format_ctx(ctx)
                print(f"  {name:<40} {ctx_str:>10}")

            print()
            print(f"  {len(models)} modeles trouves")

        print()
        print(f"Prochaine mise a jour dans {INTERVAL}s...")

        time.sleep(INTERVAL)


if __name__ == '__main__':
    main()