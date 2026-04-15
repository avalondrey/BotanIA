// ═══════════════════════════════════════════════════════════
//  💧 Hydro-Modifiers — Réducteurs ET0 agronomiques & permaculture
//
//  Chaque technique réduit l'évapotranspiration réelle (ETc)
//  en agissant sur : évaporation sol, transpiration foliaire,
//  apports hydriques passifs (brouillard, rosée, condensation)
//
//  Sources :
//   - FAO-56 (Allen et al. 1998) — coefficients officiels
//   - INRAE — paillage et couverture sol
//   - Rao et al. 2018 — ollas (irrigation par oyas)
//   - Mollison 1988 / Holmgren 2002 — permaculture
//   - WMO Guide — brouillard, rosée, condensation
// ═══════════════════════════════════════════════════════════

// ─── Types ────────────────────────────────────────────────────────────────────

export type MulchType =
  | 'paille'         // Paille de blé/seigle — le plus courant
  | 'brf'            // Bois Raméal Fragmenté — permaculture
  | 'tontes'         // Tontes de gazon
  | 'feuilles'       // Feuilles mortes broyées
  | 'toile'          // Toile de paillage géotextile
  | 'carton'         // Carton plat (lasagne)
  | 'graviers'       // Graviers / galets (zone sèche)
  | 'compost';       // Couverture compost mature

export type IrrigationTech =
  | 'arrosoir'       // Arrosage manuel surface
  | 'goutte_a_goutte'// Goutte-à-goutte
  | 'oya'            // Oyas (pot en terre cuite enterré)
  | 'aspersion'      // Aspersion / sprinkler
  | 'submersion'     // Submersion (rizière, planches inondées)
  | 'capillarite';   // Mèches / bandes capillaires

export type PermacultureElement =
  | 'swale'          // Ligne de niveau (talweg creusé)
  | 'keyline'        // Keyline design (contours légèrement off)
  | 'hugelkultur'    // Butte en bois (hugel) — forte rétention
  | 'agroforesterie' // Arbres intercalaires — ombrage + cycle eau
  | 'couverture_vivante' // Couvre-sol vivant (trèfle, phacélie)
  | 'bocage';        // Haies brise-vent — réduit evapotranspiration

export interface SoilProfile {
  texture: 'sableux' | 'limoneux' | 'argileux' | 'humifere';
  /** Teneur en matière organique (%) */
  organicMatter: number;
  /** pH mesuré (4-9) */
  ph: number;
  /** Profondeur utile (cm) */
  depth: number;
}

export interface AtmosphericInputs {
  /** Précipitations du jour (mm) */
  precipMm: number;
  /** Humidité relative (%) */
  humidity: number;
  /** Brouillard / brouillard givrant : fréquence (0-1) */
  fogFrequency: number;
  /** Température min nocturne (°C) — rosée si < point de rosée */
  tMin: number;
  /** Température de l'air (°C) */
  tMean: number;
  /** Vent (km/h) */
  windSpeed: number;
  /** Insolation (h/jour) */
  sunHours: number;
}

export interface HydroContext {
  /** Profil sol du terrain */
  soil: SoilProfile;
  /** Paillage actif et épaisseur (cm) */
  mulch?: { type: MulchType; thicknessCm: number };
  /** Système d'irrigation */
  irrigation: IrrigationTech;
  /** Éléments permaculture actifs */
  permaElements: PermacultureElement[];
  /** Surface en ombre (0-1 = % de la culture à l'ombre) */
  shadeFraction: number;
  /** Système d'oya : nombre d'oyas pour cette culture */
  oyaCount?: number;
  /** Surface cultivée (m²) */
  surfaceM2: number;
}

export interface HydroResult {
  /** ET0 de base (mm/jour) */
  et0Base: number;
  /** ETc avant corrections (mm/jour) */
  etcRaw: number;
  /** Apports passifs : brouillard + rosée + condensation (mm/jour) */
  passiveInputMm: number;
  /** Réduction paillage (mm économisés/jour) */
  mulchSavingMm: number;
  /** Réduction technique irrigation (facteur 0-1) */
  irrigFactor: number;
  /** Réduction éléments permaculture (mm économisés/jour) */
  permaSavingMm: number;
  /** Réduction sol (capacité rétention) (facteur) */
  soilFactor: number;
  /** ETc final ajusté (mm/jour) — besoin réel */
  etcFinal: number;
  /** Besoin en litres par m² par jour */
  needLPerM2PerDay: number;
  /** Détail des réductions pour affichage */
  breakdown: HydroBreakdown[];
}

export interface HydroBreakdown {
  source: string;
  emoji: string;
  savingMm: number;   // mm économisés
  pct: number;        // % de réduction sur ET0
  description: string;
}

// ─── 1. Apports passifs atmosphériques ───────────────────────────────────────

/**
 * Calcule les apports hydriques passifs :
 * brouillard, rosée, condensation nocturne.
 *
 * Sources :
 *  - Brouillard : WMO 2009 — 0.1–0.5 mm/h en zone de brouillard côtier/montagne
 *  - Rosée : Pedro 1981 — jusqu'à 0.5 mm/nuit si delta_T > 5°C et RH > 85%
 *  - Condensation : FAO-56 Ch.5 — facteur D (humidity-based)
 */
export function calcPassiveInputs(atmo: AtmosphericInputs): {
  fogMm: number;
  dewMm: number;
  condensationMm: number;
  totalMm: number;
} {
  // ── Brouillard ──
  // 0.3 mm/heure × fréquence × ~4h (durée typique matinale)
  // Uniquement si humidité > 90% ET vent < 10 km/h (brouillard stagnant)
  const fogMm = atmo.fogFrequency > 0 && atmo.humidity >= 90 && atmo.windSpeed < 10
    ? atmo.fogFrequency * 0.3 * 4
    : 0;

  // ── Rosée / condensation nocturne ──
  // Condition : T_min < point de rosée = T_mean - (100 - RH)/5 (approx Magnus)
  const dewPoint = atmo.tMean - (100 - atmo.humidity) / 5;
  const hasDew = atmo.tMin <= dewPoint + 1;
  // Intensité rosée : 0.05–0.4mm selon delta_T et humidité (Pedro 1981)
  const dewDelta = Math.max(0, dewPoint - atmo.tMin);
  const dewMm = hasDew
    ? Math.min(0.4, dewDelta * 0.04 * (atmo.humidity / 100))
    : 0;

  // ── Condensation atmosphérique ──
  // Humidité élevée (>80%) réduit l'évaporation — effet "tampon" ≈ 0.1-0.3mm
  const condensationMm = atmo.humidity > 80
    ? (atmo.humidity - 80) / 100 * 0.2
    : 0;

  const totalMm = fogMm + dewMm + condensationMm;
  return { fogMm, dewMm, condensationMm, totalMm };
}

// ─── 2. Coefficients paillage ─────────────────────────────────────────────────

/**
 * Réduction de l'évaporation sol par le paillage.
 * Un paillage réduit l'évaporation directe du sol (Ke dans FAO-56),
 * PAS la transpiration foliaire (Kcb inchangé).
 *
 * Sources : INRAE 2020, Chakraborty et al. 2008
 * Réductions validées sur sol nu (Ke ≈ 1.0 non paillé)
 */
export const MULCH_REDUCTION: Record<MulchType, { factor: number; desc: string }> = {
  paille:    { factor: 0.60, desc: 'Paille 5-10cm : -60% évaporation sol (INRAE)' },
  brf:       { factor: 0.65, desc: 'BRF 10-15cm : -65% + améliore rétention long terme' },
  tontes:    { factor: 0.45, desc: 'Tontes 3-5cm : -45% (se tasse rapidement)' },
  feuilles:  { factor: 0.50, desc: 'Feuilles broyées 5cm : -50%' },
  toile:     { factor: 0.80, desc: 'Toile géotextile : -80% évaporation directe' },
  carton:    { factor: 0.70, desc: 'Carton + couverture : -70% (lasagne)' },
  graviers:  { factor: 0.55, desc: 'Graviers 5cm : -55% + condensation nocturne ++' },
  compost:   { factor: 0.40, desc: 'Compost 3cm : -40% + améliore rétention' },
};

/**
 * Calcule la réduction d'évaporation sol par le paillage (en mm/j).
 * Le paillage agit sur Ke (évaporation sol), pas sur Kcb (transpiration).
 * Ke ≈ 30% de ET0 en sol nu bien arrosé.
 */
export function calcMulchSaving(
  et0: number,
  mulch: { type: MulchType; thicknessCm: number } | undefined
): number {
  if (!mulch) return 0;
  const cfg = MULCH_REDUCTION[mulch.type];
  if (!cfg) return 0;

  // Épaisseur module l'efficacité (max à 10cm, diminue au delà)
  const thickFactor = Math.min(1, mulch.thicknessCm / 10);
  // Ke ≈ 0.3 × ET0 (part evaporation sol dans ET totale)
  const soilEvap = et0 * 0.30;
  return soilEvap * cfg.factor * thickFactor;
}

// ─── 3. Efficience des techniques d'irrigation ───────────────────────────────

/**
 * Facteur d'efficience de l'irrigation.
 * Ratio eau utile / eau apportée.
 * L'arrosoir arrose en surface → pertes par évaporation.
 * Les oyas diffusent directement dans la rhizosphère → quasi zéro perte.
 *
 * Sources : FAO-56 Tab.11, Rao et al. 2018 (oyas), ICID 2020
 */
export const IRRIGATION_EFFICIENCY: Record<IrrigationTech, { factor: number; desc: string }> = {
  arrosoir:       { factor: 0.65, desc: 'Arrosoir surface : 65% efficience, 35% perte' },
  goutte_a_goutte:{ factor: 0.92, desc: 'Goutte-à-goutte : 92% — direct racines' },
  oya:            { factor: 0.95, desc: 'Oyas : 95% — diffusion lente, 70% eau en moins' },
  aspersion:      { factor: 0.75, desc: 'Aspersion : 75% — perte vent et évaporation' },
  submersion:     { factor: 0.50, desc: 'Submersion : 50% — fortes pertes latérales' },
  capillarite:    { factor: 0.88, desc: 'Capillarité/mèches : 88% efficience' },
};

/**
 * Les oyas (ollas) méritent une mention spéciale :
 * Un oya de 2L enterré irrigue 0.5-1m² pendant 3-7 jours.
 * La diffusion suit la demande de la plante (tension sol).
 * Réduction du besoin total : -40 à -70% vs arrosage surface.
 * Source : Rao et al. 2018 "Clay pot irrigation"
 */
export function calcOyaContribution(
  oyaCount: number,
  surfaceM2: number
): number {
  if (oyaCount <= 0) return 0;
  // Chaque oya 2L couvre ~0.75m², libère ~0.3L/jour en condition normale
  const oyaCoverage = oyaCount * 0.3; // litres/jour libérés
  // Limité par la surface couverte
  const maxCoverage = surfaceM2 * 0.5; // 0.5L/m²/jour max par oyas
  return Math.min(oyaCoverage, maxCoverage);
}

// ─── 4. Rétention sol ────────────────────────────────────────────────────────

/**
 * Capacité de rétention eau selon texture sol.
 * Sol humifère / riche en MO retient beaucoup plus.
 * Source : INRAE — Eau disponible pour les plantes (AWC)
 */
const SOIL_AWC: Record<SoilProfile['texture'], number> = {
  sableux:   60,  // mm/m de sol — sèche vite
  limoneux:  150, // mm/m — excellent équilibre
  argileux:  180, // mm/m — retient mais peut asphyxier
  humifere:  220, // mm/m — meilleure rétention
};

/**
 * Facteur de rétention sol : moins le sol retient, plus on doit arroser souvent.
 * Aussi : matière organique améliore la capacité de rétention.
 * Source : FAO-56, Hudson 1994 (MO et rétention eau)
 */
export function calcSoilRetentionFactor(soil: SoilProfile): number {
  const baseAwc = SOIL_AWC[soil.texture];
  // +2.5% de rétention par % de MO supplémentaire (au delà de 2%)
  const moBonus = Math.max(0, soil.organicMatter - 2) * 0.025;
  // Profondeur : sol profond = plus de réserve
  const depthBonus = Math.min(0.3, (soil.depth - 30) / 100);
  // On normalise : limoneux = référence (1.0)
  const normalized = (baseAwc * (1 + moBonus + depthBonus)) / SOIL_AWC.limoneux;
  // Plus le sol retient → moins on arrose (facteur de BESOIN diminue)
  // Factor 0.7 = sol humifère profond (30% moins d'arrosage)
  // Factor 1.3 = sol sableux pauvre (30% plus d'arrosage)
  return Math.max(0.5, Math.min(1.5, 1 / normalized));
}

// ─── 5. Éléments permaculture ────────────────────────────────────────────────

/**
 * Savings par élément de permaculture (mm/jour économisés sur ET0).
 * Sources : Mollison 1988, Holmgren 2002, Yeomans 1954 (keyline)
 */
export function calcPermaSavings(
  elements: PermacultureElement[],
  et0: number,
  shadeFraction: number
): number {
  let totalSaving = 0;

  for (const el of elements) {
    switch (el) {
      case 'swale':
        // Ligne de niveau retient l'eau de ruissellement — réduit besoins
        totalSaving += et0 * 0.10; // -10%
        break;
      case 'keyline':
        // Infiltration profonde — réserve souterraine disponible plus longtemps
        totalSaving += et0 * 0.15; // -15%
        break;
      case 'hugelkultur':
        // Butte en bois décomposé — éponge hydrique exceptionnelle
        // Une butte mature peut se passer d'arrosage pendant 3-4 semaines
        totalSaving += et0 * 0.35; // -35% besoin externe
        break;
      case 'agroforesterie':
        // Arbres créent un micro-climat (ombre, vent réduit, cycle eau)
        // Ombrage = moins de transpiration = moins d'arrosage
        totalSaving += et0 * shadeFraction * 0.4;
        break;
      case 'couverture_vivante':
        // Trèfle, phacélie sous les cultures — réduit évaporation sol + capte humidité
        totalSaving += et0 * 0.12; // -12%
        break;
      case 'bocage':
        // Haies brise-vent : vent réduit → transpiration réduite
        // Haie à 50m réduit ETc de ~15% dans la zone sous le vent
        totalSaving += et0 * 0.15; // -15%
        break;
    }
  }

  // Plafond : on ne peut pas réduire de plus de 65% (plante a quand même besoin d'eau)
  return Math.min(totalSaving, et0 * 0.65);
}

// ─── 6. Moteur principal ─────────────────────────────────────────────────────

/**
 * Calcule le besoin hydrique réel d'une culture avec TOUS les modificateurs.
 *
 * Pipeline de calcul :
 *  ET0 base (Penman-Monteith simplifié)
 *  → × Kc (coefficient cultural FAO)
 *  → - Apports passifs (brouillard, rosée, condensation)
 *  → - Paillage (réduction évaporation sol)
 *  → - Permaculture (swale, hugel, bocage...)
 *  → × Facteur sol (rétention AWC)
 *  → × Facteur irrigation (efficience)
 *  → - Précipitations du jour
 *  = ETc final (besoin réel en L/m²/jour)
 */
export function calcFullHydroNeed(params: {
  kc: number;               // coefficient cultural FAO
  et0Daily: number;         // ET0 de base (mm/jour depuis météo)
  atmo: AtmosphericInputs;  // données atmosphériques complètes
  ctx: HydroContext;        // contexte terrain
}): HydroResult {
  const { kc, et0Daily, atmo, ctx } = params;

  const et0Base = et0Daily;
  const etcRaw  = et0Base * kc;

  // ── Apports passifs ──
  const passive = calcPassiveInputs(atmo);
  const passiveInputMm = passive.totalMm;

  // ── Paillage ──
  const mulchSavingMm = calcMulchSaving(et0Base, ctx.mulch);

  // ── Permaculture ──
  const permaSavingMm = calcPermaSavings(ctx.permaElements, et0Base, ctx.shadeFraction);

  // ── Sol ──
  const soilFactor = calcSoilRetentionFactor(ctx.soil);

  // ── Oyas ──
  const oyaContribL = calcOyaContribution(ctx.oyaCount ?? 0, ctx.surfaceM2);
  // Convertir L → mm (1L/m² = 1mm)
  const oyaMm = ctx.surfaceM2 > 0 ? oyaContribL / ctx.surfaceM2 : 0;

  // ── Efficience irrigation ──
  const irrigCfg = IRRIGATION_EFFICIENCY[ctx.irrigation];
  const irrigFactor = 1 / irrigCfg.factor; // si 92% efficience → on distribue 8% de plus

  // ── ETc final ──
  const etcReduced = Math.max(0,
    etcRaw
    - passiveInputMm
    - mulchSavingMm
    - permaSavingMm
    - oyaMm
    - atmo.precipMm   // pluie directe
  ) * soilFactor;

  // ETc final = besoin net × facteur efficience irrigation
  // (ex: arrosoir à 65% → on doit apporter 1/0.65 = 1.54× plus)
  const etcFinal = Math.max(0, etcReduced * irrigFactor);

  // ── Breakdown pour affichage ──
  const breakdown: HydroBreakdown[] = [];
  if (mulchSavingMm > 0.01) breakdown.push({
    source: 'Paillage',
    emoji: '🌾',
    savingMm: mulchSavingMm,
    pct: (mulchSavingMm / et0Base) * 100,
    description: MULCH_REDUCTION[ctx.mulch!.type].desc,
  });
  if (passive.fogMm > 0.01) breakdown.push({
    source: 'Brouillard',
    emoji: '🌫️',
    savingMm: passive.fogMm,
    pct: (passive.fogMm / et0Base) * 100,
    description: `Apport brouillard : ${passive.fogMm.toFixed(2)}mm/j`,
  });
  if (passive.dewMm > 0.01) breakdown.push({
    source: 'Rosée',
    emoji: '💦',
    savingMm: passive.dewMm,
    pct: (passive.dewMm / et0Base) * 100,
    description: `Condensation nocturne : ${passive.dewMm.toFixed(2)}mm/j`,
  });
  if (passive.condensationMm > 0.01) breakdown.push({
    source: 'Humidité ambiante',
    emoji: '🌡️',
    savingMm: passive.condensationMm,
    pct: (passive.condensationMm / et0Base) * 100,
    description: `Humidité ${atmo.humidity}% — réduction évaporation`,
  });
  if (permaSavingMm > 0.01) breakdown.push({
    source: 'Permaculture',
    emoji: '🌿',
    savingMm: permaSavingMm,
    pct: (permaSavingMm / et0Base) * 100,
    description: ctx.permaElements.join(', '),
  });
  if (oyaMm > 0.01) breakdown.push({
    source: 'Oyas',
    emoji: '🏺',
    savingMm: oyaMm,
    pct: (oyaMm / et0Base) * 100,
    description: `${ctx.oyaCount} oya(s) — diffusion lente directe racines`,
  });
  if (atmo.precipMm > 0.01) breakdown.push({
    source: 'Pluie du jour',
    emoji: '🌧️',
    savingMm: atmo.precipMm,
    pct: (atmo.precipMm / et0Base) * 100,
    description: `${atmo.precipMm.toFixed(1)}mm tombés sur le terrain`,
  });

  return {
    et0Base,
    etcRaw,
    passiveInputMm,
    mulchSavingMm,
    irrigFactor,
    permaSavingMm,
    soilFactor,
    etcFinal,
    needLPerM2PerDay: etcFinal, // 1mm = 1L/m²
    breakdown,
  };
}

// ─── 7. Preset profils terrain ───────────────────────────────────────────────

/**
 * Profils sol par défaut selon type déclaré.
 * Permet à l'utilisateur de choisir son sol sans entrer tous les paramètres.
 */
export const SOIL_PRESETS: Record<string, SoilProfile> = {
  'sableux_pauvre':  { texture: 'sableux',  organicMatter: 1,  ph: 6.5, depth: 40 },
  'sableux_amendé':  { texture: 'sableux',  organicMatter: 3,  ph: 6.8, depth: 50 },
  'limoneux_std':    { texture: 'limoneux', organicMatter: 3,  ph: 6.8, depth: 60 },
  'limoneux_riche':  { texture: 'limoneux', organicMatter: 5,  ph: 6.5, depth: 70 },
  'argileux_lourd':  { texture: 'argileux', organicMatter: 2,  ph: 7.0, depth: 80 },
  'argileux_amendé': { texture: 'argileux', organicMatter: 4,  ph: 6.7, depth: 80 },
  'humifere':        { texture: 'humifere', organicMatter: 8,  ph: 6.2, depth: 60 },
  'jardin_bio':      { texture: 'humifere', organicMatter: 10, ph: 6.5, depth: 80 },
};

/**
 * Contexte terrain par défaut — minimal, sans techniques.
 */
export function defaultHydroContext(surfaceM2 = 1): HydroContext {
  return {
    soil: SOIL_PRESETS['limoneux_std'],
    irrigation: 'arrosoir',
    permaElements: [],
    shadeFraction: 0,
    surfaceM2,
  };
}

/**
 * Résumé textuel du résultat pour l'IA Jardinier.
 */
export function hydroResultSummary(r: HydroResult): string {
  const savings = r.et0Base - r.etcFinal;
  const pctSaved = r.et0Base > 0 ? (savings / r.et0Base * 100) : 0;
  const lines = [
    `ET0 base : ${r.et0Base.toFixed(1)}mm/j → Besoin réel : ${r.etcFinal.toFixed(1)}mm/j (−${pctSaved.toFixed(0)}%)`,
    ...r.breakdown.map(b => `  ${b.emoji} ${b.source} : −${b.savingMm.toFixed(2)}mm/j (−${b.pct.toFixed(0)}%)`),
  ];
  return lines.join('\n');
}

// ─── 8. Intégration dans calcWeeklyBudget ────────────────────────────────────

/**
 * Calcule le besoin hebdomadaire d'une culture avec le moteur hydro complet.
 * Remplace calcCropWeeklyNeed() quand un HydroContext est disponible.
 */
export function calcCropWeeklyNeedHydro(params: {
  kc: number;
  et0Daily: number;
  atmo: AtmosphericInputs;
  ctx: HydroContext;
  days?: number;
}): { needL: number; dailyResult: HydroResult } {
  const result = calcFullHydroNeed({
    kc: params.kc,
    et0Daily: params.et0Daily,
    atmo: params.atmo,
    ctx: params.ctx,
  });
  const days = params.days ?? 7;
  return {
    needL: result.needLPerM2PerDay * params.ctx.surfaceM2 * days,
    dailyResult: result,
  };
}
