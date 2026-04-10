# BotanIA - Système de Validation des Gestes Écologiques

## Concept

"Preuve de Geste Écologique" — Valider des actions réelles (paillage, compost, récupération d'eau de pluie) via une photo rapide analysée par **Ollama Vision**.

**Boucle vertueuse** : Jeu → Réalité → Jeu

```
Jouer à BotanIA
    │
    ▼
Faire un geste écologique réel (paillage, compost, récupération d'eau)
    │
    ▼
Prendre une photo
    │
    ▼
Ollama Vision analyse l'image (IA locale, 100% privé)
    │
    ▼
Si geste vérifié (confidence > 0.6) → +EcoPoints
    │
    ▼
Débloquer graine rare ou boost temporaire
```

---

## Types de Gestes Validés

| Type | Description | Points |
|------|-------------|--------|
| `mulch` | Sol couvert de paille, copeaux, BRF, cartons | +15 |
| `compost` | Tas de compost, bac à compost, épluchures | +20 |
| `rainwater` | Cuve, tonneau, récupérateur d'eau de pluie | +10 |
| `none` | Aucun geste détecté | +0 |

---

## Implémentation Technique

### API Route

**Fichier** : `src/app/api/scan-gesture/route.ts`

**Endpoint** : `POST /api/scan-gesture`

**Payload** :
```typescript
{
  imageBase64: string;  // Image encodée en base64
  mediaType?: string;    // MIME type (défaut: image/jpeg)
}
```

**Réponse** :
```typescript
{
  verified: boolean;
  type: 'mulch' | 'compost' | 'rainwater' | 'none';
  confidence: number;      // 0-1
  description: string;    // Description du geste vu
  ecoPoints: number;     // Points gagnés
  message: string;        // Feedback en français
}
```

### Modèle Vision

Le système utilise **Ollama Vision** (bakllava ou llava) :
- 100% local et gratuit
- Aucune donnée ne quitte l'appareil
- Prompt strict pour éviter les faux positifs

### Prompt Système

```
Tu es un expert en jardinage écologique. Analyse cette image et détermine si elle montre un geste écologique réel.

Types de gestes valides :
- "mulch" : sol couvert de paille, copeaux de bois, feuilles mortes, BRF, cartons
- "compost" : tas de compost, bac à compost, seau de compost
- "rainwater" : récupérateur d'eau de pluie (cuve, tonneau, réservoir)
- "none" : aucun geste écologique visible

Règles :
- Une plante seule dans un pot n'est PAS un geste écologique
- Sois STRICT : seul les gestes intentionnels comptent
```

---

## Game Store

### État ajouté

```typescript
interface GameState {
  ecoPoints: number;  // Points écologiques cumulés
  ecoLevel: number;   // Niveau 0-10 (50 pts = 1 niveau)
}
```

### Actions

```typescript
addEcoPoints(points: number)  // Ajoute des points et recalcule le niveau
```

### Persistence

Les ecoPoints sont sauvegardés dans localStorage :
- `jardin-culture-eco-points`
- `jardin-culture-eco-level`

---

## Récompenses

| Niveau | Points Requis | Récompense |
|--------|---------------|------------|
| 1 | 50 | Graines de base |
| 2 | 100 | Accès semenciers moyens |
| 3 | 150 | Graines rares |
| 4 | 200 | Boost croissance 7 jours |
| 5 | 250 | Outils préventifs débloqués |
| ... | ... | ... |
| 10 | 500 | Graine legendary + badge |

---

## Différence avec les Autres Systèmes

| Système | Type | Source |
|---------|------|--------|
| Identification Plante | Vision AI | Cloud (Groq/Plant.id/Claude) |
| Maladies | Prévention | Météo Open-Meteo |
| Pollinisation | Simulation | Météo Open-Meteo |
| **Gestes Écologiques** | **Vision AI** | **Ollama Local (100% privé)** |

---

## Configuration Requise

### Variables d'environnement

```bash
OLLAMA_HOST=http://localhost:11434
OLLAMA_VISION_MODEL=bakllava  # ou llava
```

### Installation Ollama

```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Télécharger le modèle vision
ollama pull bakllava

# Lancer le serveur
ollama serve
```

---

## Fichiers Modifiés/Créés

| Fichier | Type | Description |
|---------|------|-------------|
| `src/app/api/scan-gesture/route.ts` | **Créé** | API route pour scan de gestes |
| `src/store/game-store.ts` | Modifié | Ajout ecoPoints, ecoLevel, addEcoPoints |
| `src/components/game/EcoGestureWidget.tsx` | **Créé** | Widget UI dans EnhancedHUD pour valider les gestes |
| `src/components/game/EnhancedHUD.tsx` | Modifié | Import et affichage du EcoGestureWidget |
| `src/data/ECOLOGICAL_GESTURE_SYSTEM.md` | **Créé** | Cette documentation |

---

## UI Suggérée

Bouton dans la barre HUD ou menu :
```
┌─────────────────────────────┐
│ 🌍 Geste Écologique        │
│ 📸 Valider un geste        │
│    (paillage/compost/eau)  │
└─────────────────────────────┘
```

Après scan réussi :
```
┌─────────────────────────────┐
│ ✅ Super ! Le paillage,     │
│    c'est le secret des      │
│    jardiniers malins.       │
│                            │
│ 🌍 +15 EcoPoints           │
│    Niveau 3 atteint !       │
└─────────────────────────────┘
```

---

*Document généré le 2026-04-07*
