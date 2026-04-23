/**
 * Local Knowledge Base — Enrichissement RAG hors-ligne
 *
 * Base de connaissances botaniques structurées embarquées dans l'application.
 * Utilisée comme fallback quand Qdrant n'est pas disponible, et comme
 * enrichissement permanent du contexte RAG.
 *
 * Sources : INRAE, FAO, GNIS, CTIFL
 */

export interface KnowledgeEntry {
  topic: string;
  tags: string[];
  content: string;
}

export const LOCAL_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ── GDD / Croissance ──
  {
    topic: 'GDD — Degrés-jours de croissance',
    tags: ['gdd', 'croissance', 'température', 'stade'],
    content: `Le GDD (Growing Degree Days) mesure la chaleur accumulée disponible pour la croissance.
Formule FAO : GDD = max(0, min(Tmoyenne, Tplafond) - Tbase).
Exemples de Tbase : tomate 10°C, carotte 4°C, basilic 12°C, haricot 12°C.
Un tomate a besoin d'environ ~50 GDD pour germiner, ~200 pour la levée, ~400 pour la croissance végétative, ~800 pour la floraison.`,
  },
  {
    topic: 'Semis — Températures minimales de sol',
    tags: ['semis', 'température', 'sol', 'germination'],
    content: `Températures minimales de sol pour semer en pleine terre :
- 5°C : pois, épinard, radis, oseille
- 7°C : carotte, chou
- 10°C : tomate (en intérieur), haricot, maïs
- 12°C : concombre, courgette, basilic
- 15°C : melon, aubergine, piment
Semer à Trop bas = pourriture des graines ou levée irrégulière.`,
  },

  // ── Eau / Irrigation ──
  {
    topic: 'Besoins en eau FAO-56',
    tags: ['eau', 'irrigation', 'etc', 'et0', 'kc'],
    content: `ET0 = évapotranspiration de référence (herbe standard).
ETc = ET0 × Kc (coefficient cultural).
Kc exemples : tomate 1.05, carotte 1.00, salade 0.95, basilic 0.90, haricot 0.95.
Besoin journalier typique (été, ET0 = 5mm) : tomate 5.5mm/j, carotte 3.8mm/j.
1 mm sur 1 m² = 1 litre.
Paillage : réduit l'évaporation du sol de 40 à 80%.
Goutte-à-goutte : efficience 92%, arrosoir : 65%.`,
  },
  {
    topic: 'Arrosage — Quand et comment',
    tags: ['eau', 'arrosage', 'irrigation', 'conseil'],
    content: `Règles d'or de l'arrosage :
1. Mieux vaut un arrosage profond et espacé que fréquent et superficiel.
2. Arroser tôt le matin (6-9h) pour limiter l'évaporation et les maladies.
3. Éviter d'arroser le feuillage (risque de mildiou, oïdium).
4. Vérifier l'humidité du sol à 5-10 cm de profondeur avant d'arroser.
5. En canicule : arroser le soir pour éviter le stress thermique.
6. Pluie > 8mm = annule l'arrosage du jour.`,
  },

  // ── Compagnonnage ──
  {
    topic: 'Compagnonnage — Associations bénéfiques',
    tags: ['compagnonnage', 'association', 'plantes', 'inrae'],
    content: `Associations classiques validées INRAE :
- Tomate + Basilic : repousse pucerons et mouches blanches.
- Tomate + Carotte : améliore la croissance.
- Carotte + Oignon : repousse la mouche de la carotte.
- Haricot + Maïs + Courge (Three Sisters) : fixation azote + mulch naturel.
- Courgette + Haricot : le haricot fixe l'azote, la courge couvre le sol.
Plantes à NE PAS associer :
- Tomate + Chou : compétition racinaire.
- Tomate + Fenouil : inhibition de croissance.
- Carotte + Aneth : attire les mêmes ravageurs.`,
  },

  // ── Maladies ──
  {
    topic: 'Mildiou — Prévention et traitement',
    tags: ['maladie', 'mildiou', 'prévention', 'tomate', 'pluie'],
    content: `Mildiou (Phytophthora infestans) :
Conditions : HR > 90%, T 10-25°C, pluie ou rosée abondante.
Symptômes : taches brunes sur feuilles, duvet blanc au revers, fruits pourris.
Prévention : aérer les plants, éviter l'irrigation foliaire, espacer les plants, paillage au sol.
Traitement : Bordeaux (soufre + chaux), purin d'ortie, suppression des feuilles atteintes.
Résistance variétale : choisir des variétés marquées résistantes (ex: Tomate Saint-Pierre).`,
  },
  {
    topic: 'Oïdium — Prévention et traitement',
    tags: ['maladie', 'oïdium', 'prévention', 'chaleur'],
    content: `Oïdium (Erysiphe, Sphaerotheca) :
Conditions : HR 60-80%, T 15-25°C, faible ventilation.
Symptômes : duvet blanc farineux sur feuilles, tiges et fruits.
Prévention : bonne circulation d'air, variétés résistantes, éviter l'excès d'azote.
Traitement : lait écrémé dilué (1:10), bicarbonate de soude (5g/L), soufre mouillable.`,
  },

  // ── Ravageurs ──
  {
    topic: 'Puceron — Lutte biologique',
    tags: ['ravageur', 'puceron', 'lutte biologique', 'auxiliaire'],
    content: `Puceron (Aphidoidea) :
Méthodes biologiques :
- Lâcher de coccinelles (adultes ou larves) — 1 coccinelle / 50 pucerons.
- Pucerons parasitoïdes (Aphidius colemani).
- Purin d'ortie ou de rhubarbe (fermentation 3-5 jours).
- Savon noir dilué (20g/L) — spray direct sur colonies.
Prévention : planter des fleurs mellifères (capucine, cosmos, phacélie) pour attirer les auxiliaires.`,
  },

  // ── Calendrier / Saisons ──
  {
    topic: 'Calendrier de semis — Printemps',
    tags: ['calendrier', 'semis', 'printemps', 'mars', 'avril'],
    content: `Que semer en mars-avril (France métro) :
- Sous abri / intérieur : tomate, poivron, aubergine, piment, melon (mi-mars).
- En pleine terre : pois, fève, épinard, radis, carotte, salade, chou (dès que le sol est travaillable, T > 5°C).
- Mi-avril : betterave, oignon de garde, panais, navet.
À faire : préparer le sol (désherbage, amendement compost), installer les tuteurs pour tomates.`,
  },
  {
    topic: 'Calendrier de semis — Été',
    tags: ['calendrier', 'semis', 'été', 'juin', 'juillet'],
    content: `Que semer en juin-juillet :
- Juin : haricot, courgette, concombre, maïs (semis direct en pleine terre), basilic, salades d'été.
- Juillet : carottes de conservation, poireaux (semis en pépinière pour l'automne), radis, épinard d'automne.
Attention : en cas de canicule, privilégier les arrosages du soir et pailler fraîchement.`,
  },

  // ── Sol / Permaculture ──
  {
    topic: 'Paillage — Guide pratique',
    tags: ['paillage', 'sol', 'permaculture', 'eau', 'désherbage'],
    content: `Types de paillage et épaisseurs recommandées :
- Paille de blé : 5-10 cm — efficace, biodegradable, enrichit le sol.
- BRF (Bois Raméal Fragmenté) : 10-15 cm — excellent pour sols pauvres, libère azote lentement.
- Tontes de gazon : 3-5 cm — gratuit, attention au compactage.
- Carton : 2-3 couches — désherbage efficace, lasagne gardening.
- Graviers : 5 cm — zones très sèches, longue durée.
Effet : réduit évaporation 40-80%, supprime 90% des adventices, régule la température du sol.`,
  },
  {
    topic: 'Compost — Recette équilibrée',
    tags: ['compost', 'sol', 'fertilité', 'permaculture'],
    content: `Recette C/N équilibrée (ratio 25-30:1) :
- Matières azotées (vertes) : tontes, épluchures, marc de café, fumier frais.
- Matières carbonées (brunes) : feuilles mortes, paille, carton, branches broyées.
Règles : 1 partie verte pour 2-3 parties brunes. Humidité comme une éponge essorée. Retourner tous les 2-3 semaines. Compost mûr en 3-6 mois selon température.`,
  },

  // ── Récolte / Conservation ──
  {
    topic: 'Récolte — Signes de maturité',
    tags: ['récolte', 'maturité', 'fruit', 'légume'],
    content: `Signes de maturité par culture :
- Tomate : couleur uniforme, légèrement molle au toucher, détache facilement.
- Carotte : diamètre 2-3cm à la couronne, couleur vive.
- Salade : pomme bien formée, avant montée en graine.
- Haricot : gousses fermes et brillantes (haricot vert), craquantes (haricot sec).
- Courgette : 15-20 cm, peau brillante, avant épaississement des graines.
Récolter tôt le matin pour meilleure conservation.`,
  },

  // ── Rusticité / Climat ──
  {
    topic: 'Gel — Protection des cultures',
    tags: ['gel', 'froid', 'protection', 'hiver', 'rusticité'],
    content: `Protection anti-gel :
- Arroser avant le gel : l'eau libère de la chaleur en se solidifiant (80cal/g).
- Paillage épais (15-20cm de paille ou feuilles) sur racines.
- Voile d'hivernage (30g/m²) sur frame — gains 2-4°C.
- Bougies chauffe-plantes sous cloche : +2°C local.
- Haies brise-vent réduisent le refroidissement nocturne de 1-3°C.
Plantes rustiques (résistent à -15°C) : chou, poireau, épinard.
Plantes sensibles : tomate, basilic, piment, courgette (mort à 0°C).`,
  },
];

/**
 * Recherche simple dans la base de connaissances locale.
 * Retourne les entrées dont les tags ou le topic matchent les mots-clés.
 */
export function searchLocalKnowledge(query: string): KnowledgeEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];

  return LOCAL_KNOWLEDGE_BASE.filter(entry => {
    const haystack = `${entry.topic} ${entry.tags.join(' ')} ${entry.content}`.toLowerCase();
    return words.some(w => haystack.includes(w));
  }).slice(0, 5);
}

/**
 * Formate les entrées trouvées en contexte textuel pour le prompt RAG.
 */
export function formatLocalKnowledge(entries: KnowledgeEntry[]): string {
  if (entries.length === 0) return '';
  const lines = ['\n## 📚 Connaissances BotanIA (base locale)\n'];
  for (const entry of entries) {
    lines.push(`### ${entry.topic}`);
    lines.push(entry.content);
    lines.push('');
  }
  return lines.join('\n');
}
