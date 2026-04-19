#!/bin/bash
# Pre-commit hook pour BotanIA
# Lance la validation TypeScript et validate-plant-data avant chaque commit

echo "🔍 Pré-commit: validation..."

# Vérifier TypeScript
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ Échec TypeScript - commit annulé"
    exit 1
fi
echo "✅ TypeScript OK"

# Vérifier données botaniques
npx tsx scripts/validate-plant-data.ts
if [ $? -ne 0 ]; then
    echo "❌ Échec validation données - commit annulé"
    exit 1
fi
echo "✅ Validation données OK"

echo "✅ Pré-commit passé avec succès"
exit 0