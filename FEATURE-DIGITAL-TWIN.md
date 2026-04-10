# 🌱 FONCTIONNALITÉ : Jumeau Numérique de Plante Réelle

## 📋 Concept

**Scanner une vraie plante → L'IA l'analyse → Placer le jumeau numérique dans ta grille jardin virtuelle**

### Workflow complet

```
1. Photo de ta vraie plante (ex: tes poivrons)
   ↓
2. IA identifie + estime stade + santé
   ↓
3. Placement direct dans la GRILLE JARDIN (pas pépinière)
   ↓
4. Le plant virtuel a l'âge/stade/santé réels
   ↓
5. Bonus : graines rares, achievements, pièces
```

💡 **C'est quoi ?** Tu prends en photo tes vrais plants dans ton vrai jardin, l'IA les analyse, et ils apparaissent comme plants virtuels dans ton jardin de l'app !

---

## 🎯 Implémentation

### ÉTAPE 1 : Améliorer le prompt IA pour estimer le stade

**Fichier** : `src/app/api/identify-plant/route.ts`

**Modifier SYSTEM_PROMPT** pour ajouter l'estimation de croissance :

```typescript
const SYSTEM_PROMPT = `Tu es un botaniste expert. Analyse la plante et réponds UNIQUEMENT avec ce JSON valide :
{
  "plantName": "Nom commun français (Nom latin)",
  "confidence": 0.85,
  "description": "Description courte de la plante en 1-2 phrases.",
  "careAdvice": ["Conseil 1", "Conseil 2", "Conseil 3"],
  "healthStatus": {
    "isHealthy": true,
    "diseaseName": "Sain",
    "severity": "none",
    "treatment": [],
    "confidence": 0.9
  },
  "growthStage": {
    "stage": 2,
    "stageName": "Plantule 2 feuilles",
    "estimatedAge": 15,
    "description": "Description du stade actuel",
    "confidence": 0.8
  }
}

STAGES DE CROISSANCE (0-5) :
- 0 : Graine semée (terre, aucune pousse visible)
- 1 : Germination (monticule, première levée)
- 2 : Plantule 2 feuilles (cotylédons ouverts)
- 3 : Plantule 4 feuilles (vraies feuilles développées)
- 4 : Plant mature (5+ feuilles, robuste)
- 5 : Floraison/Fructification (fleurs ou fruits visibles)

Estime le stade en observant :
- Nombre de feuilles
- Taille du plant
- Présence de fleurs/fruits
- Développement des tiges

Si tu n'arrives pas à identifier, mets plantName "Plante non identifiée" et confidence 0.1.`;
```

---

### ÉTAPE 2 : Créer la fonction "createDigitalTwin" dans game-store

**Fichier** : `src/store/game-store.ts`

**Ajouter dans l'interface GameState** (vers ligne 1170) :

```typescript
createDigitalTwinFromScan: (
  plantDefId: string,
  scanData: {
    plantName: string;
    confidence: number;
    growthStage: { stage: number; estimatedAge: number };
    healthStatus: { isHealthy: boolean; diseaseName: string };
  }
) => { success: boolean; message: string; rewards: any };
```

**Implémentation** (après `importPlantsFromPhoto`, vers ligne 2300) :

```typescript
createDigitalTwinFromScan: (plantDefId, scanData) => {
  const state = get();
  
  // 1. Vérifier que la plante existe dans PLANTS
  const plantDef = PLANTS[plantDefId];
  if (!plantDef) {
    return {
      success: false,
      message: `❌ Type de plante "${plantDefId}" non reconnu dans le catalogue.`,
      rewards: null
    };
  }
  
  // 2. Créer un plant avec l'état scanné
  const newPlant: PlantState = {
    ...createInitialPlantState(plantDefId),
    stage: scanData.growthStage.stage,
    daysSincePlanting: scanData.growthStage.estimatedAge,
    daysInCurrentStage: Math.min(10, scanData.growthStage.estimatedAge),
    health: scanData.healthStatus.isHealthy ? 85 : 60,
    hasDisease: !scanData.healthStatus.isHealthy,
    diseaseDays: scanData.healthStatus.isHealthy ? 0 : 3,
    waterLevel: 70,
    fertilizerLevel: 50,
  };
  
  // 3. Ajouter à la pépinière (chambre de culture)
  const newPepiniere = [...state.pepiniere, newPlant];
  savePepiniere(newPepiniere);
  
  // 4. Calculer les récompenses
  const rewards = {
    coins: 50,
    xp: 100,
    achievement: null as string | null,
    bonusSeeds: null as { plantDefId: string; count: number } | null,
  };
  
  // Bonus si scan de haute qualité (confidence > 0.8)
  if (scanData.confidence > 0.8) {
    rewards.coins += 25;
    rewards.xp += 50;
  }
  
  // Bonus graines rares si plante à stade avancé
  if (scanData.growthStage.stage >= 4) {
    rewards.bonusSeeds = { plantDefId, count: 3 };
    const newVarieties = { ...state.seedVarieties };
    // Trouver une variété de cette plante
    const variety = SEED_VARIETIES.find(v => v.plantDefId === plantDefId);
    if (variety) {
      newVarieties[variety.id] = (newVarieties[variety.id] || 0) + 3;
      saveSeedVarieties(newVarieties);
      set({ seedVarieties: newVarieties });
    }
  }
  
  // 5. Débloquer achievement "Botaniste Confirmé"
  if (state.pepiniere.length + 1 >= 5) {
    rewards.achievement = 'botaniste_confirme';
    useAchievementStore.getState().unlockAchievement('botaniste_confirme');
  }
  
  // 6. Ajouter coins et XP
  const newCoins = state.coins + rewards.coins;
  saveCoins(newCoins);
  
  // 7. Alert de succès
  const alerts = [
    ...state.alerts.slice(-25),
    {
      id: `digital-twin-${Date.now()}`,
      type: "success" as const,
      message: `🌱 Jumeau numérique créé ! ${plantDef.emoji} ${plantDef.name} (stade ${scanData.growthStage.stage})`,
      emoji: "✨",
      cellX: 0,
      cellY: 0,
      timestamp: Date.now(),
      severity: "info" as const,
    },
  ];
  
  set({
    pepiniere: newPepiniere,
    coins: newCoins,
    alerts,
  });
  
  return {
    success: true,
    message: `✅ Jumeau numérique créé avec succès !
    
🌱 ${plantDef.emoji} ${plantDef.name}
📊 Stade : ${scanData.growthStage.stage}/5
💚 Santé : ${scanData.healthStatus.isHealthy ? 'Saine' : scanData.healthStatus.diseaseName}
🎁 Récompenses :
  • +${rewards.coins} 🪙 pièces
  • +${rewards.xp} ⭐ XP
${rewards.bonusSeeds ? `  • +3 graines ${plantDef.emoji} ${plantDef.name}` : ''}
${rewards.achievement ? `  • 🏆 Achievement débloqué : Botaniste Confirmé` : ''}`,
    rewards,
  };
},
```

---

### ÉTAPE 3 : Bouton "Créer Jumeau Numérique" dans PlantIdentifier

**Fichier** : `src/components/game/PlantIdentifier.tsx`

**Ajouter après l'affichage du résultat d'identification** :

```tsx
{selectedPhoto?.identificationResult && (
  <div className="pi-twin-actions">
    <button
      className="pi-twin-btn"
      onClick={() => createTwin(selectedPhoto)}
      disabled={!selectedPhoto.identificationResult.growthStage}
    >
      ✨ Créer Jumeau Numérique
    </button>
    <p className="pi-twin-hint">
      Ajoute cette plante réelle à ta chambre de culture virtuelle
    </p>
  </div>
)}
```

**Fonction createTwin** :

```typescript
import { useGameStore } from '@/store/game-store';

const createDigitalTwinFromScan = useGameStore((s) => (s as any).createDigitalTwinFromScan);

const createTwin = (photo: GardenPhoto) => {
  if (!photo.identificationResult) return;
  
  // Mapper le nom de plante vers plantDefId
  const plantDefId = mapPlantNameToDefId(photo.identificationResult.plantName);
  
  if (!plantDefId) {
    alert('❌ Cette plante n\'est pas encore dans notre catalogue.\n\nPlantes disponibles : tomate, poivron, laitue, carotte, basilic, fraise.');
    return;
  }
  
  const result = createDigitalTwinFromScan(plantDefId, {
    plantName: photo.identificationResult.plantName,
    confidence: photo.identificationResult.confidence,
    growthStage: photo.identificationResult.growthStage || { stage: 2, estimatedAge: 15 },
    healthStatus: photo.identificationResult.healthStatus || { isHealthy: true, diseaseName: 'Sain' },
  });
  
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
};

// Helper pour mapper nom → plantDefId
function mapPlantNameToDefId(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower.includes('tomate')) return 'tomato';
  if (lower.includes('poivron') || lower.includes('piment')) return 'pepper';
  if (lower.includes('laitue') || lower.includes('salade')) return 'lettuce';
  if (lower.includes('carotte')) return 'carrot';
  if (lower.includes('basilic')) return 'basil';
  if (lower.includes('fraise')) return 'strawberry';
  return null;
}
```

---

### ÉTAPE 4 : Ajouter l'achievement "Botaniste Confirmé"

**Fichier** : `src/store/achievement-store.ts`

Ajouter dans `ACHIEVEMENT_DEFINITIONS` :

```typescript
botaniste_confirme: {
  id: 'botaniste_confirme',
  name: 'Botaniste Confirmé',
  description: 'Scanner 5 plantes réelles et créer leurs jumeaux numériques',
  emoji: '🔬',
  unlocked: false,
  unlockedAt: null,
  category: 'scan',
},
```

---

## 🎁 Récompenses

- **+50 🪙** par scan
- **+100 ⭐ XP** par scan
- **Bonus qualité** : +25🪙 +50⭐ si confidence > 0.8
- **Graines rares** : +3 graines si stade ≥ 4
- **Achievement** : "Botaniste Confirmé" après 5 scans

---

## 🧪 Test

1. Va dans l'onglet **Identificateur**
2. Prends une photo d'une vraie plante (tomate, basilic...)
3. Clique **Analyser** avec Groq/Ollama
4. Vérifie que le JSON contient `growthStage`
5. Clique **✨ Créer Jumeau Numérique**
6. Va dans **Chambre de Culture** → vérifie que le plant est ajouté
7. Vérifie les récompenses dans les alertes

---

## 📌 Notes d'implémentation

- Le prompt IA analyse la photo et estime le stade (0-5)
- Le jumeau est créé dans la pépinière avec l'état exact scanné
- Les récompenses encouragent l'usage régulier
- Le mapping nom→plantDefId est manuel pour l'instant

Prêt à implémenter ? 🚀
