// ═══════════════════════════════════════════════════════════════
// Script: Créer sauvegarde "Mon Jardin Réel"
// À exécuter dans la console navigateur (F12) sur localhost:3000
// ═══════════════════════════════════════════════════════════════

(async function creerJardinReel() {
  console.log('🌱 Création sauvegarde "Mon Jardin Réel"...');
  
  // Import de save-manager
  const { saveToSlot } = await import('./src/lib/save-manager.ts');
  const store = useGameStore.getState();
  
  // État de base
  const jardinReel = {
    ...store,
    
    // Dimensions 14m × 39m
    gardenWidthCm: 1400,
    gardenHeightCm: 3900,
    
    // Haies : toute la largeur (1400cm), épaisseur 80cm
    // Positionnées en haut et en bas du jardin
    gardenHedges: [
      {
        id: 'haie-nord',
        x: 0,
        y: 0,
        width: 1400,  // toute la largeur
        height: 80,   // épaisseur 80cm
        type: 'hedge',
      },
      {
        id: 'haie-sud',
        x: 0,
        y: 3900 - 80,  // en bas (39m - 80cm)
        width: 1400,
        height: 80,
        type: 'hedge',
      },
    ],
    
    // Cuves 1000L : dimensions standard ~120cm × 100cm
    // Positionnées provisoirement (tu ajusteras avec les vraies mesures)
    gardenTanks: [
      {
        id: 'cuve-1',
        x: 200,
        y: 200,
        width: 120,
        height: 100,
        capacity: 1000,  // 1000L
        type: 'tank',
      },
      {
        id: 'cuve-2',
        x: 500,
        y: 200,
        width: 120,
        height: 100,
        capacity: 1000,
        type: 'tank',
      },
      {
        id: 'cuve-3',
        x: 800,
        y: 200,
        width: 120,
        height: 100,
        capacity: 1000,
        type: 'tank',
      },
    ],
    
    // Plantes de test (tu peux les supprimer)
    gardenPlants: [
      {
        id: 'test-tomate-1',
        plantDefId: 'tomato',
        x: 300,
        y: 500,
        plant: {
          id: 'tomato',
          stage: 2,
          daysSincePlanting: 15,
          waterLevel: 70,
          isHarvestable: false,
        }
      }
    ],
    
    // Pépinière et mini-serres vides
    pepiniere: [],
    miniSerres: [],
    
    // Argent de départ
    coins: 1000,
    
    // Jour 1 du printemps
    day: 80,  // ~21 mars
    season: 'spring',
  };
  
  // Sauvegarder dans slot-1
  await saveToSlot('slot-1', jardinReel, 'Mon jardin réel', true);
  
  console.log('✅ Sauvegarde "Mon jardin réel" créée dans Slot 1 !');
  console.log('📐 Dimensions:', jardinReel.gardenWidthCm, '×', jardinReel.gardenHeightCm, 'cm');
  console.log('🌿 Haies:', jardinReel.gardenHedges.length);
  console.log('💧 Cuves:', jardinReel.gardenTanks.length);
  console.log('');
  console.log('👉 Va sur l\'onglet "💾 Sauvegardes" et clique "📂 Charger" sur Slot 1');
  
})().catch(err => {
  console.error('❌ Erreur:', err);
});
