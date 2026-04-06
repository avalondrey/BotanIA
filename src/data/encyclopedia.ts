/**
 * ENCYCLOPÉDIE BOTANIQUE & MATÉRIEL (Hardcore Simulation)
 * 
 * Ce fichier centralise les données réelles (INRAE, GNIS, fabricants) pour :
 * - Les besoins physiologiques des plantes (températures, espacements, stades).
 * - Les caractéristiques techniques du matériel (serres, LEDs, etc.).
 * 
 * Ces données dictent les règles physiques et biologiques du jeu.
 */

// ═══════════════════════════════════════════════════
// 1. Interfaces TypeScript
// ═══════════════════════════════════════════════════

/** Données techniques liées à l'éclairage (LED/HPS/etc) */
export interface LightingSpecs {
  type: "LED" | "HPS" | "CMH" | "FLUO";
  wattage: number; // Puissance réelle (W)
  ppfdAt30cm: number; // Densité de flux de photons photosynthétiques (µmol/m²/s)
  ppfdAt60cm: number;
  spectrum: "Full Spectrum" | "Warm White (3000K)" | "Daylight (6500K)" | "Red/Blue";
  heatOutputPercentage: number; // % de la puissance convertie en chaleur
  lifespanHours: number; // Durée de vie en heures (ex: 50 000 pour LED)
  dimmable: boolean;
}

export interface StructureSpecs {
  footprintCm: [number, number]; // [largeur, longueur]
  heightMinCm: number;
  heightMaxCm: number;
  materialFrame: "Acier" | "Alu" | "Bois" | "PVC";
  coveringMaterial: "Polyéthylène" | "Verre" | "Mylar";
  insulationFactor: number; // Coefficient approximatif de conservation de la chaleur
}

export interface EquipmentSpecs {
  id: string; // ex: 'gorilla_60', 'led_panel_240w'
  category: "greenhouse" | "grow_tent" | "lighting" | "tool";
  name: string;
  brand: string;
  realPriceEuros: number;
  
  lighting?: LightingSpecs;
  structure?: StructureSpecs;
}

/** Données biologiques d'une variété (Tomate Carotte, etc.) */
export interface PlantEncyclopediaEntry {
  plantDefId: string; // "tomato", "carrot", etc.
  botanicalName: string; // "Solanum lycopersicum", "Daucus carota", etc.
  
  // Températures (Celcius)
  tempBaseC: number; // Température minimale de croissance
  tempOptimalC: number; // Température idéale
  tempMaxC: number; // Température de stress
  frostResistance: number; // Température avant mort (souvent 0 ou < 0)
  
  // Semis (Profondeur en cm, et mois idéaux 0-11)
  sowingDepthCm: number;
  sowingMonthsIndoor: number[]; // Semis sous abri (ex: Fév-Mar-Avr -> [1, 2, 3])
  sowingMonthsOutdoor: number[]; // Pleine terre
  
  // Stades (en jours réels moyens)
  daysToGermination: number;
  daysToTransplant: number; // Prêt à être repiqué
  daysToHarvest: number; // Récolte depuis le semis
  
  // Espace (en cm)
  spacingBetweenPlantsCm: number; // Distance entre 2 plants
  spacingBetweenRowsCm: number; // Distance entre 2 lignes
  
  // Association (Compagnonnage)
  companions: string[]; // "basil", "lettuce" (aide à la croissance)
  enemies: string[]; // "pepper" (attirent les mêmes maladies)
  
  // Besoins
  waterNeeds: "low" | "medium" | "high";
  lightNeedsLUX: number; // Besoin approximatif en Lux
  nutrientsNPK: [number, number, number]; // Ratio Azote-Phosphore-Potassium
}

// ═══════════════════════════════════════════════════
// 2. Données Plantes (Réel / INRAE)
// ═══════════════════════════════════════════════════

export const PLANT_DATA: Record<string, PlantEncyclopediaEntry> = {
  tomato: {
    plantDefId: "tomato",
    botanicalName: "Solanum lycopersicum",
    
    // T°: Gèle à 0, pousse à 18, idéal à 25, stoppe à 35
    tempBaseC: 12, tempOptimalC: 24, tempMaxC: 35, frostResistance: 0,
    
    // Semis: Profond 0.5cm. Intérieur Fév-Avr, Extérieur Avr-Mai
    sowingDepthCm: 0.5,
    sowingMonthsIndoor: [1, 2, 3],
    sowingMonthsOutdoor: [3, 4, 5],
    
    // Stades: Germ 7-10j, Repiq 40-60j, Récolte 90-120j
    daysToGermination: 8,
    daysToTransplant: 50,
    daysToHarvest: 110,
    
    // Espace: 50-70cm entre plants
    spacingBetweenPlantsCm: 60,
    spacingBetweenRowsCm: 80,
    
    companions: ["basil", "lettuce", "carrot"],
    enemies: ["potato", "pepper"],
    
    waterNeeds: "high", lightNeedsLUX: 40000, nutrientsNPK: [2, 1, 3] // Besoin fort en K pour les fruits
  },

  carrot: {
    plantDefId: "carrot",
    botanicalName: "Daucus carota",
    
    // T°: Plante rustique,支持 -5, idéal 18-20
    tempBaseC: 7, tempOptimalC: 18, tempMaxC: 28, frostResistance: -5,
    
    // Semis: Profond 1cm. Direct en terre.
    sowingDepthCm: 1.0,
    sowingMonthsIndoor: [], // Pas de repiquage possible pour les carottes (racine pivot)
    sowingMonthsOutdoor: [2, 3, 4, 5, 6, 7, 8],
    
    // Stades: Lent
    daysToGermination: 14,
    daysToTransplant: 999, // Impossible
    daysToHarvest: 110,
    
    // Espace
    spacingBetweenPlantsCm: 5,
    spacingBetweenRowsCm: 25,
    
    companions: ["tomato", "lettuce", "onion"],
    enemies: ["dill"],
    
    waterNeeds: "medium", lightNeedsLUX: 30000, nutrientsNPK: [1, 2, 2]
  },

  lettuce: {
    plantDefId: "lettuce",
    botanicalName: "Lactuca sativa",
    
    // T°: Froid ok, monte en graine si trop chaud
    tempBaseC: 5, tempOptimalC: 16, tempMaxC: 25, frostResistance: -4,
    
    // Semis: Très léger (0.2cm)
    sowingDepthCm: 0.2,
    sowingMonthsIndoor: [1, 2, 8, 9],
    sowingMonthsOutdoor: [3, 4, 5, 6, 7, 8, 9],
    
    // Stades: Très rapide (Salade = 45 jours)
    daysToGermination: 4,
    daysToTransplant: 25,
    daysToHarvest: 55,
    
    // Espace
    spacingBetweenPlantsCm: 25,
    spacingBetweenRowsCm: 30,
    
    companions: ["carrot", "strawberry"],
    enemies: ["sunflower"], // Allélopathie
    
    waterNeeds: "medium", lightNeedsLUX: 20000, nutrientsNPK: [2, 1, 1] // Besoin azoté (feuilles)
  },

  strawberry: {
    plantDefId: "strawberry",
    botanicalName: "Fragaria × ananassa",
    
    // T°: Plante pérenne
    tempBaseC: 8, tempOptimalC: 20, tempMaxC: 30, frostResistance: -10,
    
    // Semis/Plant: Fraisier s'obtient souvent par stolons
    sowingDepthCm: 0, // Collationnée au niveau du sol, sinon pourrit
    sowingMonthsIndoor: [2, 3],
    sowingMonthsOutdoor: [3, 4, 8, 9],
    
    // Stades
    daysToGermination: 20,
    daysToTransplant: 60,
    daysToHarvest: 120, // Souvent récolte l'année suivante
    
    // Espace
    spacingBetweenPlantsCm: 30,
    spacingBetweenRowsCm: 50,
    
    companions: ["lettuce", "borage"],
    enemies: ["cabbage"],
    
    waterNeeds: "high", lightNeedsLUX: 30000, nutrientsNPK: [1, 2, 3]
  },

  basil: {
    plantDefId: "basil",
    botanicalName: "Ocimum basilicum",
    
    // T°: FRILEUX ! < 10°C meurt
    tempBaseC: 12, tempOptimalC: 22, tempMaxC: 30, frostResistance: 0,
    
    sowingDepthCm: 0.5,
    sowingMonthsIndoor: [2, 3, 4],
    sowingMonthsOutdoor: [4, 5, 6],
    
    daysToGermination: 7,
    daysToTransplant: 30,
    daysToHarvest: 60,
    
    spacingBetweenPlantsCm: 25,
    spacingBetweenRowsCm: 30,
    
    companions: ["tomato", "pepper"], // Repousse parasites sur tomates
    enemies: [],
    
    waterNeeds: "medium", lightNeedsLUX: 40000, nutrientsNPK: [2, 1, 1]
  },

  pepper: {
    plantDefId: "pepper",
    botanicalName: "Capsicum annuum",
    
    // T°: Très chaud
    tempBaseC: 18, tempOptimalC: 26, tempMaxC: 35, frostResistance: 0,
    
    sowingDepthCm: 0.5,
    sowingMonthsIndoor: [1, 2, 3], // Très long à germer
    sowingMonthsOutdoor: [4, 5],
    
    daysToGermination: 14,
    daysToTransplant: 60,
    daysToHarvest: 120,
    
    spacingBetweenPlantsCm: 40,
    spacingBetweenRowsCm: 60,
    
    companions: ["basil", "carrot"],
    enemies: ["eggplant"],

    waterNeeds: "medium", lightNeedsLUX: 40000, nutrientsNPK: [1, 2, 3]
  },

  // ═══════════════════════════════════════════════════
  // ARBRES FRUITIERS
  // ═══════════════════════════════════════════════════

  apple: {
    plantDefId: "apple",
    botanicalName: "Malus domestica",

    // Arbre fruitier rustique
    tempBaseC: 8, tempOptimalC: 18, tempMaxC: 35, frostResistance: -25,

    // Arbre - pas de semis direct, plantation en pot
    sowingDepthCm: 0,
    sowingMonthsIndoor: [], // Acheté en pot
    sowingMonthsOutdoor: [10, 11, 2, 3], // Plantation racines nues

    // Croissance très lente - 5 stages sur plusieurs années
    daysToGermination: 0, // N/A - planté en pot
    daysToTransplant: 0, // N/A
    daysToHarvest: 730, // 2 ans pour première récolte (accéléré jeu)

    spacingBetweenPlantsCm: 400, // 4m entre pommiers
    spacingBetweenRowsCm: 500,

    companions: [],
    enemies: ["walnut"], // Juglone

    waterNeeds: "medium", lightNeedsLUX: 50000, nutrientsNPK: [1, 1, 2]
  },

  pear: {
    plantDefId: "pear",
    botanicalName: "Pyrus communis",

    tempBaseC: 10, tempOptimalC: 18, tempMaxC: 35, frostResistance: -25,

    sowingDepthCm: 0,
    sowingMonthsIndoor: [],
    sowingMonthsOutdoor: [10, 11, 2, 3],

    daysToGermination: 0,
    daysToTransplant: 0,
    daysToHarvest: 800, // 2+ ans

    spacingBetweenPlantsCm: 400,
    spacingBetweenRowsCm: 500,

    companions: ["apple"], // Pollinisation croisée
    enemies: ["walnut"],

    waterNeeds: "medium", lightNeedsLUX: 50000, nutrientsNPK: [1, 1, 2]
  },

  cherry: {
    plantDefId: "cherry",
    botanicalName: "Prunus avium",

    tempBaseC: 10, tempOptimalC: 18, tempMaxC: 35, frostResistance: -20,

    sowingDepthCm: 0,
    sowingMonthsIndoor: [],
    sowingMonthsOutdoor: [10, 11],

    daysToGermination: 0,
    daysToTransplant: 0,
    daysToHarvest: 900, // 2+ ans

    spacingBetweenPlantsCm: 600, // 6m
    spacingBetweenRowsCm: 700,

    companions: [],
    enemies: [],

    waterNeeds: "medium", lightNeedsLUX: 55000, nutrientsNPK: [1, 1, 2]
  },

  lemon: {
    plantDefId: "lemon",
    botanicalName: "Citrus limon",

    // Agrume - gélif
    tempBaseC: 12, tempOptimalC: 22, tempMaxC: 38, frostResistance: -5,

    sowingDepthCm: 1,
    sowingMonthsIndoor: [2, 3, 4],
    sowingMonthsOutdoor: [4, 5],

    daysToGermination: 21,
    daysToTransplant: 90,
    daysToHarvest: 1095, // 3 ans

    spacingBetweenPlantsCm: 300, // Culture intensive
    spacingBetweenRowsCm: 400,

    companions: [],
    enemies: [],

    waterNeeds: "high", lightNeedsLUX: 60000, nutrientsNPK: [1, 1, 2]
  },

  orange: {
    plantDefId: "orange",
    botanicalName: "Citrus sinensis",

    tempBaseC: 12, tempOptimalC: 22, tempMaxC: 38, frostResistance: -5,

    sowingDepthCm: 1,
    sowingMonthsIndoor: [2, 3, 4],
    sowingMonthsOutdoor: [4, 5],

    daysToGermination: 21,
    daysToTransplant: 90,
    daysToHarvest: 1095, // 3 ans

    spacingBetweenPlantsCm: 350,
    spacingBetweenRowsCm: 450,

    companions: [],
    enemies: [],

    waterNeeds: "high", lightNeedsLUX: 60000, nutrientsNPK: [1, 1, 2]
  },

  // ═══════════════════════════════════════════════════
  // ARBRES FORESTIERS & ORNEMENT
  // ═══════════════════════════════════════════════════

  walnut: {
    plantDefId: "walnut",
    botanicalName: "Juglans regia",

    // Arbre forestier très rustique
    tempBaseC: 8, tempOptimalC: 18, tempMaxC: 38, frostResistance: -30,

    sowingDepthCm: 3,
    sowingMonthsIndoor: [],
    sowingMonthsOutdoor: [10, 11],

    daysToGermination: 60,
    daysToTransplant: 180,
    daysToHarvest: 1095, // 3 ans (noix)

    spacingBetweenPlantsCm: 1000, // 10m
    spacingBetweenRowsCm: 1200,

    companions: [],
    enemies: ["apple", "pear", "cherry"], // Juglone

    waterNeeds: "medium", lightNeedsLUX: 45000, nutrientsNPK: [1, 1, 1]
  },

  oak: {
    plantDefId: "oak",
    botanicalName: "Quercus robur",

    tempBaseC: 8, tempOptimalC: 18, tempMaxC: 38, frostResistance: -25,

    sowingDepthCm: 2,
    sowingMonthsIndoor: [],
    sowingMonthsOutdoor: [10, 11],

    daysToGermination: 45,
    daysToTransplant: 120,
    daysToHarvest: 1455, // 4 ans

    spacingBetweenPlantsCm: 1500, // 15m
    spacingBetweenRowsCm: 2000,

    companions: [],
    enemies: [],

    waterNeeds: "medium", lightNeedsLUX: 40000, nutrientsNPK: [1, 1, 1]
  },

  maple: {
    plantDefId: "maple",
    botanicalName: "Acer platanoides",

    tempBaseC: 5, tempOptimalC: 16, tempMaxC: 35, frostResistance: -30,

    sowingDepthCm: 2,
    sowingMonthsIndoor: [],
    sowingMonthsOutdoor: [3, 4, 9, 10],

    daysToGermination: 30,
    daysToTransplant: 90,
    daysToHarvest: 1200, // ornemental

    spacingBetweenPlantsCm: 800,
    spacingBetweenRowsCm: 1000,

    companions: [],
    enemies: [],

    waterNeeds: "medium", lightNeedsLUX: 35000, nutrientsNPK: [1, 1, 1]
  },

  birch: {
    plantDefId: "birch",
    botanicalName: "Betula pendula",

    tempBaseC: 5, tempOptimalC: 15, tempMaxC: 35, frostResistance: -40,

    sowingDepthCm: 0.5,
    sowingMonthsIndoor: [],
    sowingMonthsOutdoor: [3, 4, 9, 10],

    daysToGermination: 21,
    daysToTransplant: 60,
    daysToHarvest: 970, // ornemental

    spacingBetweenPlantsCm: 600,
    spacingBetweenRowsCm: 800,

    companions: [],
    enemies: [],

    waterNeeds: "medium", lightNeedsLUX: 40000, nutrientsNPK: [1, 1, 1]
  },

  pine: {
    plantDefId: "pine",
    botanicalName: "Pinus sylvestris",

    tempBaseC: 5, tempOptimalC: 15, tempMaxC: 38, frostResistance: -40,

    sowingDepthCm: 1,
    sowingMonthsIndoor: [],
    sowingMonthsOutdoor: [3, 4, 9, 10],

    daysToGermination: 28,
    daysToTransplant: 90,
    daysToHarvest: 1475,

    spacingBetweenPlantsCm: 500,
    spacingBetweenRowsCm: 700,

    companions: [],
    enemies: [],

    waterNeeds: "low", lightNeedsLUX: 50000, nutrientsNPK: [1, 1, 1]
  },

  magnolia: {
    plantDefId: "magnolia",
    botanicalName: "Magnolia grandiflora",

    tempBaseC: 10, tempOptimalC: 18, tempMaxC: 35, frostResistance: -15,

    sowingDepthCm: 2,
    sowingMonthsIndoor: [2, 3],
    sowingMonthsOutdoor: [4, 5],

    daysToGermination: 45,
    daysToTransplant: 120,
    daysToHarvest: 1660, // très lent

    spacingBetweenPlantsCm: 400,
    spacingBetweenRowsCm: 500,

    companions: [],
    enemies: [],

    waterNeeds: "high", lightNeedsLUX: 40000, nutrientsNPK: [2, 1, 1]
  }
};

// ═══════════════════════════════════════════════════
// 3. Données Matériel (Spécifications Réalistes)
// ═══════════════════════════════════════════════════

export const EQUIPMENT_DATA: EquipmentSpecs[] = [
  // --- ÉCLAIRAGE LED ---
  {
    id: "led_grow_panel_100",
    category: "lighting",
    name: "Panneau LED Horti 100W",
    brand: "Mars Hydro",
    realPriceEuros: 120,
    lighting: {
      type: "LED",
      wattage: 100,
      ppfdAt30cm: 450,
      ppfdAt60cm: 220,
      spectrum: "Full Spectrum",
      heatOutputPercentage: 10, // Chauffe peu comparé à HPS
      lifespanHours: 50000,
      dimmable: true
    }
  },
  {
    id: "led_grow_panel_240",
    category: "lighting",
    name: "Panneau LED Pro 240W",
    brand: "Spider Farmer",
    realPriceEuros: 280,
    lighting: {
      type: "LED",
      wattage: 240,
      ppfdAt30cm: 850, // Suffisant pour la floraison tomate
      ppfdAt60cm: 450,
      spectrum: "Full Spectrum",
      heatOutputPercentage: 15,
      lifespanHours: 60000,
      dimmable: true
    }
  },

  // --- TENTES DE CULTURE (GROW TENTS) ---
  {
    id: "tent_gorilla_60",
    category: "grow_tent",
    name: "Gorilla Grow Tent 60x60",
    brand: "Gorilla",
    realPriceEuros: 290,
    structure: {
      footprintCm: [60, 60],
      heightMinCm: 160,
      heightMaxCm: 235, // Extensible
      materialFrame: "Acier",
      coveringMaterial: "Mylar", // Mylar 1680D
      insulationFactor: 0.9 // Très bonne isolation
    }
  },
  {
    id: "tent_gorilla_90",
    category: "grow_tent",
    name: "Gorilla Grow Tent 90x90",
    brand: "Gorilla",
    realPriceEuros: 490,
    structure: {
      footprintCm: [90, 90],
      heightMinCm: 160,
      heightMaxCm: 235,
      materialFrame: "Acier",
      coveringMaterial: "Mylar",
      insulationFactor: 0.9
    }
  },

  // --- SERRES PRO ---
  {
    id: "greenhouse_tunnel_3x4",
    category: "greenhouse",
    name: "Serre Tunnel Pro 3x4",
    brand: "Generic Pro",
    realPriceEuros: 450,
    structure: {
      footprintCm: [300, 400],
      heightMinCm: 200,
      heightMaxCm: 250,
      materialFrame: "Acier", // Tube Ø32 galvanisé
      coveringMaterial: "Polyéthylène", // 200 microns
      insulationFactor: 0.4 // Chauffe au soleil, perd la nuit
    }
  }
];
