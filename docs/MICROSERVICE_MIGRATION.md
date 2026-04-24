# Migration vers l'architecture Microservice

## Contexte

BotanIA migrée d'une architecture monolithique (agent IA embarqué) vers un microservice externe dédié.

## Ce qui a été supprimé

### Routes API (`src/app/api/agent/`)
- `asset-gaps`, `chat`, `embed`, `generate-carddata`, `generate-image-prompt`
- `generate-plantcard`, `generate-plants`, `generate-preview`, `groq-chat`
- `index-docs`, `index-file`, `rag`, `scan-plants`, `scan`
- `status`, `update-plant`, `validate-carddata`, `validate-plantcard`, `validate-plants`

### Librairies agent (`src/lib/agent/`)
- `action-executor`, `asset-detector`, `code-scanner`, `fallback-chain`
- `generate-plants`, `generation-pipeline`, `image-prompt-utils`, `local-knowledge`
- `markdown-ingester`, `memory-manager`, `micro-client` (ancienne version)
- `ollama`, `persona`, `plant-integrator`, `proactive-agent`
- `qdrant`, `rag-engine`

### Middleware
- `src/middleware.ts` — supprimé, à remplacer si besoin de guards d'authentification

## Ce qui a été ajouté

### Bridge Microservice (`src/lib/microservice-bridge.ts`)
- EventBus à 17 types d'événements
- Synchronisation bidirectionnelle état jardin ↔ microservice

### Client HTTP (`src/lib/micro-client.ts`)
- Fetch avec timeout configurable (défaut 15s)
- Retry automatique (2 tentatives)
- Signature HMAC avec `NEXT_PUBLIC_AI_MICROSERVICE_SECRET`

### Hooks
- `useMicroserviceStatus.ts` — polling health toutes les 30s
- `usePlantCatalog.ts` — catalogue Pokedex via React Query

### Dashboard (`src/app/dashboard/`)
- `page.tsx` — page principale avec iframe dashboard.html
- `PokedexPanel.tsx` — panel catalogue plantes
- `layout.tsx` — layout dédié

## Variables d'environnement

```env
# URL du microservice (sans slash final)
NEXT_PUBLIC_AI_MICROSERVICE_URL=https://pc-avalondrey.tail56d862.ts.net

# Secret HMAC partagé avec le microservice
NEXT_PUBLIC_AI_MICROSERVICE_SECRET=ton-secret-partage
```

## Points de vigilance

1. **CORS** : le microservice doit autoriser `Access-Control-Allow-Origin` pour le domaine BotanIA
2. **Auth** : pas de middleware Next.js actuellement — ajouter si routes sensibles
3. **Fallback** : si le microservice est down, les hooks retournent `[]` ou `null` gracieusement

## Tests

- `src/lib/micro-client.test.ts` — tests unitaires du client HTTP
- `src/lib/event-bus.test.ts` — tests de l'EventBus
