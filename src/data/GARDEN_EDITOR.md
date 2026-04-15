# BotanIA — Éditeur de Jardin Professionnel

> Documentation technique de l'éditeur de grille (Vue Plan), v0.21.0

## Architecture

L'éditeur de jardin est composé de 4 fichiers principaux :

| Fichier | Rôle |
|---------|------|
| `Jardin.tsx` | Container : vues (Plan/Cartes/Rangs), state undo/redo, raccourcis clavier |
| `GardenPlanView.tsx` | Grille 2D : placement, drag, snap, guides, zoom, coordonnées, panneau propriétés |
| `JardinPlacementControls.tsx` | Barre d'outils : mode, zones, structures, snap, grille, undo/redo |
| `SeedRowPainter.tsx` | Dessin de rangs : canvas tactile, lissage Douglas-Peucker |

### Hook externe
- `src/hooks/useUndoHistory.ts` — Pile undo/redo générique (max 50 actions)

## Grille

### Dimensions
- Grille : 1000cm × 600cm (10m × 6m)
- Unité d'affichage : `displayScale` (px/cm, calculé selon la largeur du container)
- Fond : crème `#faf8f4`

### Lignes majeures/mineures
- **Mineures** : tous les 25cm, `rgba(0,0,0,0.05)`, 1px
- **Majeures** : tous les 1m (100cm), `rgba(0,0,0,0.14)`, 1px
- Implémentation : 4 `linear-gradient` empilés en `background-image` avec `backgroundSize` dynamique

```css
.garden-grid {
  background-image:
    linear-gradient(rgba(0,0,0,0.14) 1px, transparent 1px),      /* majeure H */
    linear-gradient(90deg, rgba(0,0,0,0.14) 1px, transparent 1px), /* majeure V */
    linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),        /* mineure H */
    linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px); /* mineure V */
}
```

### Modes d'affichage
| Classe | Effet |
|--------|-------|
| (aucune) | Grille complète (majeure + mineure) |
| `.grid-minor-hidden` | Majeures uniquement |
| `.grid-hidden` | Grille masquée |

## Snap-to-Grid

### Modes
| Mode | Arrondi | Utilisation |
|------|---------|-------------|
| `off` | Aucun arrondi | Placement libre |
| `25` | `Math.round(cm / 25) * 25` | Précision quart-mètre |
| `50` | `Math.round(cm / 50) * 50` | Précision demi-mètre |
| `100` | `Math.round(cm / 100) * 100` | Précision mètre |

### Fonctionnement
- La fonction `snapCm(valueCm)` applique l'arrondi selon le mode actif
- Utilisée dans `handleGridClick` (placement) et `onMove` (drag)
- Les coordonnées affichées sont les valeurs snapées

## Guides d'Alignement

### Détection
Pendant un drag (`onMove`), pour chaque axe (X, Y) :
1. Calculer le centre et les 4 bords de l'élément draggé
2. Comparer avec les centres et bords de tous les autres éléments
3. Si la distance est < `ALIGN_THRESHOLD` (5px display), afficher une ligne guide

### Types de guides
- **Centre H** : centre X aligné avec un autre élément
- **Centre V** : centre Y aligné
- **Bords H** : gauche ou droite aligné
- **Bords V** : haut ou bas aligné

### Rendu
- Lignes bleues `#3b82f6`, 1px, positionnées en absolu sur l'overlay
- Disparaissent au release du drag (`onMouseUp` / `onTouchEnd`)

## Panneau Propriétés

### Contenu
Quand un élément est sélectionné (`selectedElement`) :
- **Position** : X/Y éditables (input number, en cm)
- **Dimensions** : largeur × hauteur (lecture seule pour structures, éditable pour zones)
- **Type** : emoji + nom français
- **Capacité** : pour les cuves (litres) et cabanes
- **Actions** : boutons Supprimer / Dupliquer

### Animation
- `AnimatePresence` de Framer Motion
- Slide-in depuis la droite (x: 240 → 0)
- Largeur fixe : 240px

## Ghost Preview

Quand un outil est actif (`activeTool !== 'none'`) et que le curseur est sur la grille :
- Affichage d'un rectangle translucide (opacité 0.4) aux dimensions de l'élément
- Border dashed colorée selon le type de zone
- Suit le curseur avec snap appliqué

## Zoom

### Fonctionnement
- `onWheel` sur le div de la grille
- Delta cumulé dans `wheelAccum` (seuil 50 pour éviter les micro-zooms)
- Facteur de zoom : `displayScale * 0.9` (dézoom) ou `* 1.1` (zoom)
- Plage : `[5, 200]` pixels par mètre
- Le zoom est centré sur la position du curseur

## Undo/Redo

### Hook `useUndoHistory`
```typescript
interface UndoAction {
  type: string;        // ex: 'place-zone', 'move-struct', 'delete-obj'
  description: string; // ex: 'Placer zone Culture à (150, 200)'
  undo: () => void;    // callback d'annulation
  redo: () => void;    // callback de rétablissement
}
```

- Pile max : 50 actions
- `push(action)` : empile et vide la pile redo
- `undo()` : dépile la dernière action, exécute `action.undo()`, empile dans redo
- `redo()` : dépile la dernière action redo, exécute `action.redo()`, empile dans undo

### Raccourcis
| Touche | Action |
|--------|---------|
| Ctrl+Z | Annuler |
| Ctrl+Shift+Z / Ctrl+Y | Rétablir |

## Barre d'Outils (JardinPlacementControls)

### Groupes
| Groupe | Outils | Icônes |
|--------|--------|--------|
| Mode | Placer / Sélection | MousePointer2 |
| Zones | Culture, Haie, Eau, Herbe, Fleurs | Square, Leaf, Waves, Wheat, Flower2 |
| Structures | Serre, Arbre, Haie, Cuve, Fût, Cabane | Home, TreePine, Fence, Droplets, CircleDot, Warehouse |
| Snap | OFF / 25 / 50 / 1m | Magnet |
| Grille | Complète / Majeure / Masquée | Grid3X3, Grid2X2 |
| Undo/Redo | ↩ / ↪ | Undo2, Redo2 |

### CSS
Préfixe `pc-*` pour tous les styles (`.placement-controls-v2`, `.pc-group`, `.pc-tool-btn`, etc.)

## SeedRowPainter — Lissage

### Douglas-Peucker
```typescript
function simplifyPath(points: Point[], epsilon: number): Point[]
```
- `epsilon = 2` pour souris, `3` pour tactile
- Appliqué au `onMouseUp` / `onTouchEnd`
- Réduit le nombre de points tout en conservant la forme

### Undo par trait
- Bouton "↩️ Annuler" : `setRows(prev => prev.slice(0, -1))`
- Chaque trait est indépendant et réversible

## Types Exportés

```typescript
// JardinPlacementControls.tsx
type ActiveTool = 'none' | 'zone' | 'zone_hedge' | 'zone_water' | 'zone_grass' | 'zone_fleur'
  | 'serre' | 'tree' | 'hedge' | 'tank' | 'drum' | 'shed';
type EditMode = 'place' | 'select';
type GridSnapMode = 'off' | '25' | '50' | '100';
type GridShowMode = 'full' | 'major' | 'hidden';

// SeedRowPainter.tsx
interface SeedRow {
  points: { x: number; y: number }[];
  color: string;
  label: string;
  plantCount?: number;
}
```

## Influences & Références

L'éditeur s'inspire des outils professionnels de plan de jardin :
- **GardenPlanner.net** — snap-to-grid, barre d'outils structurée
- **smallblueprinter.com** — grille majeure/mineure, coordonnées
- **VegPlotter** — panneau propriétés, guides d'alignement
- **Plant Anywhere** — ghost preview au curseur
- **Palia Garden Planner** — zoom fluide, undo/redo