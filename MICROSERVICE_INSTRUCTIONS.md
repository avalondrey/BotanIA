# Instructions pour le Microservice AI de botanai

> Ce document est destiné à l'IA qui gère le microservice `C:\Users\Administrateur\Desktop\AI de botanai`.
> Ne pas modifier ce fichier — lire et appliquer les modifications décrites ci-dessous.

---

## 1. Nouveaux endpoints requis

### `POST /webhook/event`
Recevoir les événements métier envoyés par BotanIA via `src/lib/microservice-bridge.ts`.

**Body attendu :**
```json
{
  "event": { "type": "plant:harvested", "plantDefId": "tomato", "coins": 8 },
  "timestamp": 1713871200000
}
```

**Action :** Stocker l'événement dans la mémoire Qdrant (collection `botania_events`) pour que Lia puisse répondre avec du contexte historique.

---

### `POST /scan` (vérifier / adapter)
BotanIA envoie désormais un snapshot complet du jeu. Vérifiez que l'endpoint accepte :

```json
{
  "gameContext": {
    "day": 45,
    "season": "spring",
    "gardenPlants": [...],
    "pepiniere": [...],
    "gardenTanks": [...],
    "weather": "sunny",
    "realWeather": { ... }
  },
  "snapshot": true
}
```

**Réponse attendue :**
```json
{
  "notifications": [...],
  "suggestions": [...],
  "timestamp": 1713871200000
}
```

---

### `POST /analyze-plant-image` (Nouveau)
Analyse contextuelle d'une photo de plante.

**Body :**
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "plantDefId": "tomato",
  "gameContext": { "ageDays": 45, "lastWatered": 2, "diseases": [] }
}
```

**Réponse :** Diagnostic personnalisé de Lia basé sur l'état du jardin + l'image.

---

### `POST /save` et `POST /load` (Nouveau)
Synchronisation multi-appareil.

**POST /save**
```json
{
  "userId": "anonymous-or-auth-id",
  "saveData": { "encryptedBlob": "..." },
  "deviceId": "device-fingerprint"
}
```

**POST /load**
```json
{ "userId": "anonymous-or-auth-id" }
```

**Stockage :** SQLite ou Qdrant (collection `botania_saves`).

---

## 2. Sécurité — Headers à vérifier

BotanIA envoie désormais deux headers sur chaque requête :

| Header | Description |
|---|---|
| `X-Botania-Version` | Ex: `2.2.0` |
| `X-Botania-Signature` | HMAC-SHA256 du body JSON, signé avec `AI_MICROSERVICE_SECRET` |

**Middleware à ajouter dans `ai-microservice/src/index.ts` :**

```typescript
const SECRET = process.env.AI_MICROSERVICE_SECRET || '';

async function verifySignature(body: string, signature: string): Promise<boolean> {
  if (!SECRET) return true; // pas de secret = pas de vérification
  const crypto = await import('crypto');
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

**CORS :** Remplacer `*` par le domaine Vercel exact :
```typescript
const ALLOWED_ORIGINS = [
  'https://botan-ia.vercel.app', // ← adapter
];
```

---

## 3. Cache de contexte RAG

Dans `rag-engine.ts` ou `persona.ts`, ajouter un cache mémoire simple :

```typescript
const contextCache = new Map<string, { context: string; expiresAt: number }>();
const CACHE_TTL_MS = 60_000;

function getCachedContext(gameStateHash: string): string | null {
  const cached = contextCache.get(gameStateHash);
  if (cached && cached.expiresAt > Date.now()) return cached.context;
  return null;
}
```

Le `gameStateHash` peut être un MD5 du `gameContext` JSON.

---

## 4. Météo — Unifier sur Open-Meteo

BotanIA utilise Open-Meteo (gratuit, pas de clé). Le microservice utilise actuellement OpenWeatherMap.

**Action :** Remplacer `weather-service.ts` du microservice par un client Open-Meteo, ou faire en sorte que BotanIA ne consomme que l'API météo du microservice. La priorité est d'avoir une seule source de vérité.

---

## 5. Validation des requêtes

Le microservice doit rejeter (ou avertir en log) si `X-Botania-Version` ne correspond pas à la version attendue (`2.2.0`). Cela évite les incompatibilités de schéma.

---

## Récapitulatif des fichiers à modifier dans le microservice

| Fichier | Modification |
|---|---|
| `src/index.ts` | Ajouter routes `/webhook/event`, `/analyze-plant-image`, `/save`, `/load`. Ajouter middleware HMAC + version. |
| `src/lib/rag-engine.ts` | Ajouter cache de contexte |
| `src/lib/weather-service.ts` | Migrer vers Open-Meteo |
| `src/lib/memory-manager.ts` | S'assurer que `botania_events` existe |
| `.env.example` | Ajouter `AI_MICROSERVICE_SECRET` |
