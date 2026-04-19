@echo off
cd /d %~dp0
title Ollama Context Monitor
echo.
echo =======================================================
echo   Ollama Context Monitor
echo   Ctrl+C pour arreter
echo =======================================================
echo.
python3 scripts\ollama-monitor.py
pause