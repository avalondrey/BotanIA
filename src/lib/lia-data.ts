// 🤖 Lia - Assistant IA Data
export interface LiaTip {
  id: string;
  type: 'water' | 'disease' | 'pest' | 'harvest' | 'transplant' | 'weather' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  icon: string;
}

export const generalTips: LiaTip[] = [
  { id: 'general-1', type: 'general', priority: 'low', title: '🌱 Bienvenue !', message: "Je suis Lia, ton assistante de jardinage !", icon: '🌸' },
  { id: 'general-2', type: 'general', priority: 'low', title: '💡 Astuce', message: "La rotation des cultures évite l'épuisement du sol.", icon: '🔄' },
  { id: 'general-3', type: 'transplant', priority: 'medium', title: '🌿 Transplantation', message: "Transplante quand les semis ont 4-6 vraies feuilles.", icon: '✨' },
];

export const plantTips: Record<string, LiaTip[]> = {
  tomate: [{ id: 't1', type: 'general', priority: 'medium', title: '🍅 Conseil Tomate', message: "Les tomates adorent le basilic ! Plante-les ensemble.", icon: '🌿' }],
  carotte: [{ id: 'c1', type: 'general', priority: 'medium', title: '🥕 Conseil Carotte', message: "Sol léger et sablonneux pour des carottes droites !", icon: '🪨' }],
  salade: [{ id: 's1', type: 'general', priority: 'medium', title: '🥬 Conseil Salade', message: "Récolte les feuilles extérieures en premier.", icon: '✂️' }],
  basilic: [{ id: 'b1', type: 'general', priority: 'medium', title: '🌿 Conseil Basilic', message: "Pince les fleurs pour garder tout l'arôme.", icon: '🌸' }],
  fraise: [{ id: 'f1', type: 'general', priority: 'medium', title: '🍓 Conseil Fraisier', message: "Replante les stolons pour créer de nouveaux plants.", icon: '🌱' }],
  piment: [{ id: 'p1', type: 'general', priority: 'medium', title: '🌶️ Conseil Piment', message: "Plus un piment est stressé, plus il est piquant !", icon: '🔥' }],
};

export function generateTip(context: { plants: any[]; weather: any }): LiaTip {
  const { plants, weather } = context;
  if (plants.some((p: any) => p.health && p.health < 20)) {
    return { id: 'urgent-health', type: 'disease', priority: 'urgent', title: '🦠 Plante en danger !', message: 'Des plantes vont très mal ! Traite-les rapidement.', icon: '🚨' };
  }
  if (weather && weather.temperature > 30) {
    return { id: 'hot-1', type: 'water', priority: 'high', title: '🌡️ Chaleur extrême !', message: "Arrose plus fréquemment aujourd'hui.", icon: '💧' };
  }
  if (weather && weather.temperature < 5) {
    return { id: 'cold-1', type: 'weather', priority: 'high', title: '🥶 Froid détecté !', message: "Attention au gel ! Protege tes plantes.", icon: '❄️' };
  }
  if (plants.some((p: any) => p.readyToHarvest)) {
    return { id: 'harvest', type: 'harvest', priority: 'medium', title: '🫙 Récolte prête !', message: 'Des plantes sont prêtes à être récoltées !', icon: '🌾' };
  }
  return generalTips[Math.floor(Math.random() * generalTips.length)];
}
