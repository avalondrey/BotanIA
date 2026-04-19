# BotanIA — Companions & Ennemies Plants Reference

> Reference for companion planting in BotanIA. Based on INRAE, FAO, and traditional polyculture knowledge.

---

## The Three Sisters (Milpa)

The classic companion trio from Mesoamerican agriculture:

| Plant | Role | Companion | Effect |
|-------|------|----------|--------|
| Corn | Structure | Bean | Beans fix nitrogen, corn provides support |
| Bean | Nitrogen fixer | Corn, Squash | Provides N to heavy feeders |
| Squash | Ground cover | Corn | Shades soil, retains moisture |

In BotanIA: `corn.companions` includes `bean` (beneficial) and `squash` (beneficial).

---

## Valid Companion Types

Each companion entry has:
```typescript
companions: [
  {
    plantId: 'companion_plant_id',
    type: 'beneficial' | 'harmful',
    reason: 'Scientific or traditional explanation'
  }
]
```

### Rules
- `plantId` must exist in PLANT_CARDS or TREE_CARDS
- `type` must be `'beneficial'` (positive interaction) or `'harmful'` (negative interaction)
- `reason` must be at least 5 characters explaining the interaction

---

## Beneficial Companions

| Plant | Companion | Reason |
|-------|-----------|--------|
| Tomato | Basil | Repels aphids, whiteflies; improves flavor |
| Tomato | Carrot | Loose soil from carrot cultivation helps tomatoes |
| Lettuce | Radish | Radishes mark rows and break soil crust |
| Carrot | Onion | Onion repels carrot fly (Delia spp.) |
| Cabbage | Dill | Dill attracts beneficial wasps |
| Bean | Corn | Three Sisters polyculture |
| Corn | Sunflower | Sunflower acts as windbreak |
| Melon | Corn | Corn provides partial shade and wind protection |
| Strawberry | Bean | Beans fix nitrogen for strawberry |
| Apple | Chives | Chives repel aphids and apple scab |

---

## Harmful Companions (Antagonists)

| Plant | Antagonist | Reason |
|-------|------------|--------|
| Tomato | Cabbage | Both are heavy feeders, competition for nutrients |
| Bean | Onion | Onion inhibits bean growth (allelopathy) |
| Strawberry | Cabbage | Brassicas inhibit strawberry growth |
| Walnut | Most plants | Juglone toxicity (black walnut only in game) |
| Fennel | Most vegetables | Strong allelopathic compounds |

---

## Family-Based Antagonists

Plants from the same family often compete or share pests:

| Family | Allelopathic Risk |
|--------|-------------------|
| Solanaceae (tomato, pepper, eggplant) | Don't plant near each other |
| Brassicaceae (cabbage, radish) | Shared pest pressure |
| Allium (onion, leek) | Inhibits legumes |
| Umbelliferae (carrot, parsley) | Similar pest profiles |

---

## Hedge Companions

Hedges in BotanIA (`photinia`, `eleagnus`, `thuya`, etc.) generally:
- Have no strong positive or negative companions
- Provide windbreak and biodiversity corridors
- `companions: []` is acceptable for hedge plants

---

## Current Validation

Run validation to check companion data:

```bash
npm run validate-plant-data
```

The validation checks:
1. All `plantId` references exist in PLANT_CARDS/TREE_CARDS
2. All `type` values are `'beneficial'` or `'harmful'`
3. All `reason` strings are at least 5 characters

---

## Adding New Companions

When adding a new plant to `HologramEvolution.tsx`:

1. Research the plant's companions from INRAE/FAO sources
2. Add entries to `companions: []` array
3. Run `npm run validate-plant-data` to check
4. If companion has no PlantCard yet, add with `companions: []` initially

**Example:**
```typescript
// In HologramEvolution.tsx
photinia: {
  id: 'photinia',
  plantCategory: 'hedge',
  companions: [
    {
      plantId: 'eleagnus',
      type: 'beneficial',
      reason: 'Both fix nitrogen, dense hedge effect',
    },
  ],
  // ...
}
```
