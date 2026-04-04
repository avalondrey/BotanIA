const fs = require('fs');
let c = fs.readFileSync('src/store/game-store.ts', 'utf8');

// 1. Ajouter l'interface pour les paquets fermés
const newInterfaces = 
export interface SeedPacket {
  id: string;           // 'packet-tomato-cokopelli-unique123'
  plantDefId: string;   // 'tomato', 'carrot', etc.
  varietyId?: string;   // optionnel, 'cherokee', 'rosedeberne', etc.
  seedCount: number;    // combien de graines dans ce paquet
  grams: number;
  isSealed: boolean;    // true = ferm\ufffd
  datePurchased: string; // quand achetu0011
}

export interface IndividualSeed {
  id: string;           // 'seed-tomato-unique456'
  packetId: string;     // vient de quel paquet
  plantDefId: string;
  varietyId?: string;
};

// Ajouter apr\ufffds l'interface SeedVariety
c = c.replace(/(export interface SeedVariety \{[\s\S]*?^\})/m, function(match) {
  return match + '\n' + newInterfaces;
});

// 2. Ajouter \ufffd l'interface GameState
const seedPacketState = 
  // Paquets de graines (ferm\ufffds/ouverts)
  seedPackets: Record<string, SeedPacket>;
  // Graines individuelles (issues des paquets ouverts)
  individualSeeds: IndividualSeed[];
  // Plantules en godet
  pottedSeedlings: PlantState[];;
  
c = c.replace(/(pepiniere: [^\n]*\n)/, function(m) {
  return m + seedPacketState + '\n';
});

// 3. Ajouter les fonctions au store
const packetFunctions = 
  /** Acheter un paquet de graines (rest\ufffd ferm\ufffd) */
  buySeedPacket: (packet: { varietyId?: string; plantDefId: string; seedCount: number; grams: number; }) => {
    const state = get();
    const variety = packet.varietyId
      ? SEED_VARIETIES.find(v => v.id === packet.varietyId)
      : null;
    const item = SEED_CATALOG.find(s => s.plantDefId === packet.plantDefId);
    const price = variety ? variety.price : (item ? item.price : 50);

    if (state.coins < price) return false;

    const packetId = 'packet-' + packet.plantDefId + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const newPacket: SeedPacket = {
      id: packetId,
      plantDefId: packet.plantDefId,
      varietyId: packet.varietyId,
      seedCount: packet.seedCount,
      grams: packet.grams,
      isSealed: true,
      datePurchased: new Date().toISOString()
    };

    const newPackets = { ...state.seedPackets, [packetId]: newPacket };
    const newCoins = state.coins - price;

    saveCoins(newCoins);
    set({ coins: newCoins, seedPackets: newPackets });
    return true;
  },

  /** Ouvrir un paquet de graines -> cr\ufffde des graines individuelles */
  openSeedPacket: (packetId: string) => {
    const state = get();
    const packet = state.seedPackets[packetId];
    if (!packet) return false;
    if (packet.seedCount <= 0) return false;

    // Cr\ufffde les graines individuelles
    const newSeeds: IndividualSeed[] = [];
    for (let i = 0; i < packet.seedCount; i++) {
      newSeeds.push({
        id: 'seed-' + packet.plantDefId + '-' + Date.now() + '-' + i,
        packetId: packetId,
        plantDefId: packet.plantDefId,
        varietyId: packet.varietyId,
      });
    }

    const newPackets = { ...state.seedPackets };
    delete newPackets[packetId];
    const newIndividualSeeds = [...state.individualSeeds, ...newSeeds];

    set({ seedPackets: newPackets, individualSeeds: newIndividualSeeds });
    return true;
  },

  /** Placer une graine individuelle en p\ufffdpini\ufffdre */
  plantSeedInPepiniere: (seedId: string) => {
    const state = get();
    const seed = state.individualSeeds.find(s => s.id === seedId);
    if (!seed) return false;

    const newSeeds = state.individualSeeds.filter(s => s.id !== seedId);
    const slotIdx = state.pepiniere.findIndex(s => !s);
    if (slotIdx === -1) {
      set({ individualSeeds: newSeeds }); // Pas de place, on rend la graine
      return false;
    }

    const newPlant: PlantState = createInitialPlantState(seed.plantDefId);
    if (seed.varietyId) newPlant.varietyId = seed.varietyId;

    const newPep = [...state.pepiniere];
    newPep[slotIdx] = newPlant;

    savePepiniere(newPep);
    set({ pepiniere: newPep, individualSeeds: newSeeds });
    return true;
  },

  /** Acheter un pot de plantule (godet) - pr\ufffdte \ufffd planter */
  buyPottedSeedling: (plantDefId: string) => {
    const state = get();
    const item = PLANTULE_CATALOG.find(p => p.plantDefId === plantDefId);
    if (!item) return false;
    if (state.coins < item.price) return false;

    const newPlant: PlantState = { ...createInitialPlantState(plantDefId) };
    newPlant.isPotted = true;
    newPlant.growthStage = 1; // D\ufffdj\ufffd commenc\ufffd

    const newPotted = [...state.pottedSeedlings, newPlant];
    const newCoins = state.coins - item.price;
    saveCoins(newCoins);
    set({ coins: newCoins, pottedSeedlings: newPotted });
    return true;
  },

  /** Planter un pot de plantule en p\ufffdpini\ufffdre */
  plantPottedSeedling: (plantIdx: number) => {
    const state = get();
    const plant = state.pottedSeedlings[plantIdx];
    if (!plant) return false;

    const slotIdx = state.pepiniere.findIndex(s => !s);
    if (slotIdx === -1) return false;

    const newPotted = state.pottedSeedlings.filter((_, i) => i !== plantIdx);
    const newPlant: PlantState = { ...plant, isPotted: false };
    const newPep = [...state.pepiniere];
    newPep[slotIdx] = newPlant;

    savePepiniere(newPep);
    set({ pottedSeedlings: newPotted, pepiniere: newPep });
    return true;
  },;

// Chercher buySeeds et ajouter les fonctions \ufffd sa suite
c = c.replace(/(buySeeds: \(plantDefId: string\) \=> \{[\s\S]*?return true;\n  \},)/, 
  function(m1) { return m1 + packetFunctions; });

// 4. Mettre \ufffd jour l'interface PlantState pour isPotted
c = c.replace(/(export interface PlantState \{[\s\S]*?varietyId\?: string;)/m, 
  function(m) { return m + '\n  isPotted?: boolean; // Si le plant est dans un pot/godet'; });

// 5. Valeurs par d\uffdfaut pour les nouveaux \uffftats
c = c.replace(/(pepiniere: \[[^\]]*\],\n)/, function(m) {
  return m + '  seedPackets: {},\n  individualSeeds: [],\n  pottedSeedlings: [],\n';
});

// 6. Mise \uffdd jour du load/save
c = c.replace(
  /(loadPepiniere: \(\)=>[^\n]*\n[  ]*"pepiniere"/,
  function(m) { return m + ',\n    "seedPackets": {},\n    "individualSeeds": [],\n    "pottedSeedlings": [\n    ],\n  };'; }
);

// 7. Mise \uffdd jour du persist
c = c.replace(
  /(partialize: \(state\) => {[\s\S]*?pepiniere: state\.pepiniere,)/m,
  function(m) { return m + '\n    seedPackets: state.seedPackets,\n    individualSeeds: state.individualSeeds,\n    pottedSeedlings: state.pottedSeedlings,'; }
);

// 8. Mise \uffdd jour du reset game
c = c.replace(
  /(pepiniere: Array\(24\)\.fill\(null\),)/g,
  function(m) { return m + '\n    seedPackets: {},\n    individualSeeds: [],\n    pottedSeedlings: [],'; }
);

fs.writeFileSync('src/store/game-store.ts', c, 'utf8');
console.log('GameStore updated with seed packets, individual seeds, and potted seedlings');