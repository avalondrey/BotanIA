# Lia Agent RAG — BotanIA IA Locale avec Qdrant

> **Lia** est l'assistante IA de BotanIA, un agent proactif qui utilise Ollama + Qdrant pour fournir des réponses contextualisées sur TON jardin.

---

## Concept

Lia combine :
- **Qdrant** — base vectorielle locale (pas de cloud, pas de frais)
- **Ollama qwen2.5:7b** — modèle语言 français excellent (32K contexte)
- **RAG (Retrieval Augmented Generation)** — répond avec le contexte de TES données

Elle ne se contente pas d'attendre tes questions : elle **prend des initiatives** (notifications d'arrosage, alertes de gel, rappels de semis).

---

## Collections Qdrant

### `botania_components`
Code BotanIA parsé — indexation automatique des .tsx/.ts

```
{
  path: "src/components/game/HologramEvolution.tsx",
  name: "HologramEvolution",
  purpose: "Module de données botaniques pures + calculs agronomiques",
  exports: ["getPlantCard", "calcDailyGDD", "getWaterNeed", ...],
  tabs: ["jardin", "serre", "pepiniere"],
  functions: [
    {name: "getPlantCard", signature: "(plantDefId: string) => PlantCard | null", description: "..."},
    ...
  ]
}
```

**Fichiers indexés automatiquement :**
- `HologramEvolution.tsx`, `Jardin.tsx`, `SerreJardinView.tsx`, `Pepiniere.tsx`
- `Boutique.tsx`, `GrainCollection.tsx`, `GardenJournal.tsx`, `LunarCalendar.tsx`
- `HarvestTracker.tsx`, `PlantIdentifier.tsx`, `DiseaseDetector.tsx`
- `IAJardinier.tsx`, `EnhancedHUD.tsx`, `GameHUD.tsx`
- `ai-engine.ts`, `ai-advisor.ts`, `ia-jardinier.ts`, `gdd-engine.ts`
- `hydro-engine.ts`, `companion-matrix.ts`, `weather-service.ts`
- `lunar-calendar.ts`, `notification-system.ts`, `garden-memory.ts`
- `lia-data.ts`, `game-store.ts`

### `botania_data`
Données BotanIA (graines, arbres, encyclopedia)

```
{
  path: "src/data/graines/kokopelli/tomato-brandywine.ts",
  name: "tomato-brandywine",
  type: "seed",
  vendor: "kokopelli",
  plantDefId: "tomato",
  calendar: { sowing: [2,3], planting: [3,4], harvest: [7,8,9] },
  needs: { water: "high", light: "full-sun", soil: "rich" },
  companions: ["basilic", "carotte"],
  enemies: ["choux"],
  diseaseRisks: ["mildiou", "oidium"],
  totalDaysToHarvest: 80
}
```

### `botania_docs`
Tous les fichiers `.md` du projet, parsés automatiquement

### `botania_memory`
Mémoire utilisateur persistante :

| Type | Description |
|---|---|
| `observation` | "J'ai remarqué que mes tomates ont jauni après 3 semaines" |
| `decision` | "J'ai planté les tomates ici car plein sud et à l'abri du vent" |
| `treatment` | "Traitement cuivre applied 2026-03-15, résultat: efficace" |
| `flashcard` | Notes d'apprentissage |
| `journal` | Entrées de journal |

### `botania_game_state`
Snapshots périodiques de l'état du jeu :

```
{
  day: 45,
  season: "spring",
  weatherCondition: "sunny",
  temperatureCelsius: 18,
  waterLiters: 850,
  waterCapacity: 2000,
  waterUrgency: "ok",
  plants: [{plantDefId: "tomato", zone: "(100,200)", stage: 3, needsWater: false}],
  pendingTasks: ["arroser_tomates"],
  activeAlerts: [{type: "water", message: "Cuve basse", severity: "high"}]
}
```

---

## Activation

1. **Installer Qdrant** : https://qdrant.tech/downloads — lancer le serveur sur port 6333
2. **Lancer Ollama** : `ollama serve` (en background)
3. **Optionnel** : `ollama pull nomic-embed-text` (pour les embeddings)
4. Dans BotanIA : cliquer **"🔮 Activer Super IA Locale"** dans le header
5. Status 🟢 quand Ollama + Qdrant détectés

---

## Utilisation

### Chat
Ouvre le panel Lia (en bas à droite), pose tes questions :
- `"Pourquoi mes tomates jaunissent?"`
- `"Explique-moi HologramEvolution.tsx"`
- `"Quand dois-je semer mes pois?"`
- `"J'ai mis mes tomates en serre, pourquoi?"`

### Proactif
Sans action de ta part, Lia scanne toutes les 60s et notifie :
- 💧 **Eau** : "5 plantes ont soif", "Cuve principale basse"
- 🌱 **Plantes** : "Tes tomates sont prêtes à récolter"
- 🌡️ **Météo** : "⚠️ GEL DEMAIN! Protège tes tomates"
- 📅 **Calendrier** : "C'est la période pour semer les haricots"
- 🦠 **Maladie** : "Plante malade détectée en zone A3"

---

## Mode Passif (Fallback)

Si Ollama ou Qdrant est éteint, Lia retombe **transparenment** sur le système existant :
- Groq → Ollama → Plant.id → Claude (détection de maladies)
- `ai-advisor.ts` pour les suggestions rules-based
- `lia-data.ts` pour les tips statiques

**Zéro changement perceptible** pour l'utilisateur sans activation.

---

## Fichiers Sources

| Fichier | Rôle |
|---|---|
| `src/lib/agent/qdrant.ts` | Client REST Qdrant |
| `src/lib/agent/ollama.ts` | Client Ollama chat + embeddings |
| `src/lib/agent/persona.ts` | System prompt Lia |
| `src/lib/agent/rag-engine.ts` | Moteur RAG |
| `src/lib/agent/code-scanner.ts` | Parse .tsx → vecteurs |
| `src/lib/agent/proactive-agent.ts` | Boucle proactive |
| `src/lib/agent/fallback-chain.ts` | Fallback Groq |
| `src/lib/agent/memory-manager.ts` | Mémoire utilisateur |
| `src/lib/agent/markdown-ingester.ts` | Indexe .md |
| `src/lib/agent/action-executor.ts` | Notifications + vibrations |
| `src/lib/hooks/useAgent.ts` | Hook React |
| `src/store/agent-store.ts` | State Zustand |
| `src/components/agent/LiaInterface.tsx` | Chat UI |
| `src/components/agent/LiaStatusIndicator.tsx` | Indicateur 🟢/🟡/🔴 |

---

## API Routes

| Route | Méthode | Description |
|---|---|---|
| `/api/agent/status` | GET | Estat Ollama + Qdrant |
| `/api/agent/scan` | POST | Scan complet du code |
| `/api/agent/rag` | POST | RAG query |
| `/api/agent/index-file` | POST | Indexe 1 fichier |

---

## Exportabilité

La base Qdrant est **100% locale** et peut être exportée/utilisée ailleurs :
- Format standard REST API
- Collections accessibles depuis n'importe quel client Qdrant
- Pas de vendor lock-in

---

## Todo / Améliorations

- [ ] Intégrer Lia dans l'onglet IA Advisor (actuellement panel flottant uniquement)
- [ ] File watcher temps réel (polling ou fs.watch)
- [ ] Interface d'administration Qdrant ( Clean collections, stats)
- [ ] Multimodal : envoyez une photo à Lia pour diagnostic
- [ ] Intégration voix (Web Speech API pour parler à Lia)
