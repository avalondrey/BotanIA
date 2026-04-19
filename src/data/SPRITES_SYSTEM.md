# BotanIA — Sprites & Images

> Comment le systeme d'images fonctionne, quelles routes utilise chaque type de plante.
> Mis a jour : 2026-04-19

---

##getStageImage() — Routing centralise

Fonction dans `src/store/game-store.ts` :

```typescript
export function getStageImage(plantDefId: string, stage: number, route?: string): string {
  const dir = route === 'miniserre' ? 'plantules'
    : route === 'plant' ? 'plant'
    : 'plants';
  return `/${dir}/${plantDefId}-stage-${Math.min(stage, 5) + 1}.png`;
}
```

---

## Dossiers et routes

| growthRoute | Dossier public | Fichiers | Utilisation |
|---|---|---|---|
| `miniserre` | `/plantules/` | `{plantDefId}-stage-{1-6}.png` | Graines semees en mini-serre |
| `plant` | `/plant/` | `{plantDefId}-stage-{1-5}.png` | Plants achetes dans la boutique |
| `jardin` | `/plants/` | `{plantDefId}-stage-{1-6}.png` | Graines directes en jardin |
| `semis-direct` | `/plants/` | `{plantDefId}-stage-{1-6}.png` | Semis direct en pleine terre |
| `tree` | `/trees/` | `{treeDefId}-stage-{1-5}.png` | Arbres fruitiers/forestiers |

---

## Stades de croissance

### Plants du shop (route: plant) — 5 stades

| Stade | Label | Description |
|---|---|---|
| 1 | Pot initial | Premiere fleur visible — BLOQUE si reste en pot |
| 2 | Pleine terre | Jeunes fruits — EVOLUE uniquement en terre |
| 3 | Croissance | Fruits grandissent |
| 4 | Maturation | Fruits en maturation, couleur change |
| 5 | Adulte productif | Fruits murs, recolte |

### Graines en mini-serre (route: miniserre) — 6 stades

| Stade | Label | Description |
|---|---|---|
| 1 | Graines | En mini-serre, chambre de culture |
| 2 | Premieres feuilles | Cotyledons |
| 3 | 2-3 feuilles vraies | Developpement |
| 4 | 4-5 feuilles vraies | Croissance |
| 5 | 5-6 feuilles vraies | Croissance vegetative |
| 6 | Pret a transplanter | Premiere fleur visible, max mini-serre |

### Arbres (route: tree) — 5 stades

| Stade | Label | Description |
|---|---|---|
| 1 | Scion ~20cm | En pot 20cm |
| 2 | Arbre jeune ~40cm | Developpement |
| 3 | ~80cm | Ramification definie |
| 4 | ~150cm | Fleurs/petits fruits |
| 5 | ~200cm | Production complete |

---

## Composants qui utilisent getStageImage

- `Pepiniere.tsx` — affiche les plants en mini-serre avec growthRoute
- `SerreJardinView.tsx` — dialog de detail des plantes avec growthRoute
-Tout component qui affiche un plant doit passer `plant.growthRoute` a getStageImage

---

## Ajouter de nouvelles images

1. Generer les fichiers PNG dans le bon dossier public
2. Nommer selon la convention : `{plantDefId}-stage-{N}.png`
3. Pour route `plant` : stages 1-5 dans `/public/plant/`
4. Pour route `miniserre` : stages 1-6 dans `/public/plantules/`
5. Pour route `jardin` : stages 1-6 dans `/public/plants/`
6. Regenerer les sprite sheets avec `scripts/generate-sprite-sheets.ts`