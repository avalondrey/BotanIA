# Système Économique BotanIA

**Version :** v0.20.0
**Store :** `economy-store.ts` (persistance `botania-economy`)
**Store lié :** `shop-store.ts` (persistance `botania-shop`)

---

## Flux de revenus

| Source | Montage | Frequence |
|---|---|---|
| Récolte (base) | +3 pièces | Chaque récolte |
| Vente marché | 5-20 pièces/unité | Manuel, illimité |
| Bonus quotidien | 5-15 pièces (streak) | 1 fois/jour |
| Quêtes | 5-20 pièces/quête | 3 quêtes/jour |
| Achievements | 15-30 pièces | Au déblocage |

**Rythme cible :** 10-20 pièces par session (~15 min)

---

## Inventaire de récoltes (`harvestInventory`)

Chaque récolte ajoute 1 unité dans `harvestInventory` (Record<string, number>).
L'inventaire est vendable via l'onglet Marché de la Boutique.

### Prix de vente (par unité)

| Plante | Prix de vente |
|---|---|
| Salade | 5 |
| Concombre | 5 |
| Carotte | 6 |
| Courgette | 6 |
| Basilic | 7 |
| Tomate | 8 |
| Piment | 9 |
| Fraise | 10 |
| Pomme | 15 |
| Poire | 18 |
| Cerise | 20 |

**Action :** `sellHarvest(plantDefId, quantity?)` — vend 1 ou tout, ajoute pièces

---

## Bonus Quotidien

| Jour de streak | Pièces |
|---|---|
| J1 | 5 |
| J2 | 6 |
| J3 | 7 |
| J4 | 8 |
| J5 | 9 |
| J6 | 10 |
| J7+ | 15 |

- `claimDailyBonus()` — réclame le bonus du jour
- `checkAndResetDaily()` — vérifie si un nouveau jour, reset le streak si >1 jour sans claim
- Popup automatique au lancement (`DailyBonusPopup.tsx`)

---

## Quêtes Journalières

3 quêtes tirées aléatoirement chaque jour parmi le pool :

| Quête | Cible | Récompense |
|---|---|---|
| Arroser 3 plantes | 3 | 5 |
| Arroser 5 plantes | 5 | 8 |
| Planter 2 graines | 2 | 10 |
| Planter 4 graines | 4 | 15 |
| Identifier 1 plante | 1 | 15 |
| Récolter 3 plantes | 3 | 15 |
| Récolter 5 plantes | 5 | 20 |
| Planter 1 arbre | 1 | 20 |

**Tracking automatique via :**
- `trackWaterPlant()` — appelé dans `garden-store.waterPlantGarden()`
- `trackPlantSeed()` — appelé dans `garden-store.placePlantInGarden()`
- `trackHarvest()` — appelé dans `game-store.harvestPlantGarden()`
- `trackIdentify()` — appelé après identification photo
- `trackTreePlanted()` — appelé dans `garden-store.buyTree()`

**Cycle :** `refreshDailyQuests()` reset chaque jour, `claimQuestReward(questId)` réclame

---

## Paquets de Graines (deux inventaires)

### Système

```
Achat variété → seedVarieties[varietyId]++ (paquet fermé, non plantable)
                     ↓
          openSeedPacket(varietyId)
                     ↓
seedVarieties[varietyId]--  →  seedCollection[plantDefId] += seedCount (plantable!)
```

### Inventaires

| Inventaire | Store | Plantable? | Action |
|---|---|---|---|
| `seedCollection` | shop-store | Oui | Utilisé directement dans Pépinière |
| `seedVarieties` | shop-store | Non | Paquets fermés, nécessite ouverture |

### Actions

- `buySeedVariety(varietyId)` — achète un paquet fermé (déduit pièces, ajoute à `seedVarieties`)
- `openSeedPacket(varietyId)` — ouvre un paquet (retire de `seedVarieties`, ajoute `seedCount` à `seedCollection`)
- `_getSeedCount(plantDefId)` — compte total (collection + variétés correspondantes)
- `_consumeSeed(plantDefId)` — consomme prioritairement variétés, puis collection

### UI

- **Boutique > Graines** : section "📦 Paquets à ouvrir" avec animation
- **GrainCollection** : même section paquets à ouvrir
- **Pépinière** : `availableSeeds` vérifie uniquement `seedCollection` (graines ouvertes)

---

## Prix Boutique (v0.20.0)

### Graines (SEED_CATALOG)

| Graine | Prix | Graines reçues |
|---|---|---|
| Salade | 15 | 2 |
| Carotte | 20 | 2 |
| Basilic | 25 | 2 |
| Tomate | 25 | 2 |
| Piment | 30 | 2 |
| Fraise | 35 | 3 |

### Plantules (PLANTULE_CATALOG)

| Plantule | Prix |
|---|---|
| Salade | 30 |
| Carotte | 40 |
| Basilic | 45 |
| Tomate | 50 |
| Piment | 50 |
| Fraise | 55 |

### Équipement

| Équipement | Prix |
|---|---|
| Serre Tile | 40 |
| Extension | 80 |
| Mini Serre | 120 |
| Zone serre | 150 |
| Chambre S | 200 |
| Chambre M | 350 |
| Chambre L | 550 |

### Arbres fruitiers (gamme)

| Catégorie | Prix |
|---|---|
| Arbres locaux | 250-280 |
| Arbres boutique | 200-300 |
| Haies Leaderplant | 90-160 |

---

## Achievements → Pièces

| Achievement | Pièces bonus |
|---|---|
| Night Owl | 15 |
| Weather Master | 15 |
| Green Thumb | 30 |

Déblocage automatique via `unlockAchievement()` → appelle `addCoins(coinReward)`