/**
 * Image Prompt Utils — Pure functions, no fs/path imports
 * Extracted from plant-integrator.ts to avoid bundle bloat
 */

export type ImageAssetType =
  | 'plant-stage'
  | 'packet'
  | 'card'
  | 'pot'
  | 'tree-stage'
  | 'evolution-card'
  | 'equipment'
  | 'plantule-stage'
  | 'plantule-mature';

export interface CardDataInfo {
  id: string;
  plantDefId: string;
  shopId: string;
  category: 'vegetable' | 'fruit-tree' | 'hedge' | 'forest-tree';
  name: string;
  emoji: string;
  packetImage?: string;
  cardImage?: string;
  potImage?: string;
  stages: string[];
}

const COLUMNAR_TREES = ['apple-colonnaire-amboise', 'plum-colonnaire-atlanta', 'pear-colonnaire-londres'];

export function buildImagePrompt(type: ImageAssetType, cardData: CardDataInfo, stageNumber?: number): string {
  const plantName = cardData.name;
  const shop = cardData.shopId;
  const emoji = cardData.emoji;

  if (type === 'plant-stage') {
    const descs: Record<number, string> = {
      1: 'tiny seed just planted, barely visible, soil surface, miniature sprout',
      2: 'small sprout with 2 cotyledon leaves breaking soil, pale green, 2-3cm tall',
      3: '4-6 true leaves, delicate stem, more established, 5-8cm tall',
      4: 'full foliage, 8-10 leaves, stronger stem, bushy appearance, 15-20cm tall',
      5: 'mature plant with first flowers or fruits visible, full structure, harvest ready',
    };
    return `manga-style plant growth stage ${stageNumber} of 5,
${plantName} ${emoji} in terracotta pot, ${descs[stageNumber || 1]},
cel-shaded, thick black manga borders, beige background,
kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  if (type === 'tree-stage') {
    const descs: Record<number, string> = {
      1: '~20cm mini scion in 20cm terracotta pot, just planted, single small stem',
      2: '~40cm young tree in pot, small branches beginning, fresh green leaves',
      3: '~80cm tree in pot, defined branching structure, leaves filling out',
      4: '~150cm tree in pot, flowers or small fruits appearing, full canopy',
      5: '~200cm mature tree in pot, full production with visible fruits, majestic',
    };
    const isColumnar = COLUMNAR_TREES.includes(cardData.plantDefId || '');
    const formModifier = isColumnar ? ', columnar compact form, narrow vertical silhouette, no lateral branches' : '';
    return `manga-style ${plantName} fruit tree growth stage ${stageNumber} of 5,
in 20cm terracotta pot, ${descs[stageNumber || 1]}${formModifier},
cel-shaded, thick black manga borders, beige background,
kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  if (type === 'packet') {
    return `manga-style seed packet illustration,
${shop} brand logo at top, "${plantName}" variety text,
drawing of a ${plantName} ${emoji} on the front of the packet,
cel-shaded, thick black manga borders, beige kraft paper background,
isometric angle, kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  if (type === 'card') {
    return `manga-style collectible card illustration,
${plantName} ${emoji} ${emoji}, ${shop} brand badge,
cel-shaded, thick black manga borders, beige kraft paper background,
kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  if (type === 'pot') {
    return `manga-style ${plantName} ${emoji} tree in 20cm terracotta pot,
young fruit tree ready for sale, cel-shaded, thick black manga borders,
beige kraft background, kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  if (type === 'evolution-card') {
    return `manga-style ${plantName} ${emoji} evolution card illustration,
${emoji} growth stages sequence showing development,
plant in terracotta pot progression, cel-shaded, thick black manga borders,
beige kraft background, kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  if (type === 'plantule-stage') {
    const n = stageNumber || 1;
    const stageDescs: Record<number, string> = {
      1: 'tiny seedling just germinated, 2 cotyledon leaves, in small 5cm terracotta pot, mini greenhouse tray slot',
      2: 'small plant with first true leaves developing, in 7cm terracotta pot, mini greenhouse environment',
      3: 'established seedling with 4-6 true leaves, healthy green, in 10cm individual mini-pot',
      4: 'young plant with 8-10 leaves, strong stem, 2-3 small side shoots, in 12cm mini-pot ready for transplant',
      5: 'mature plant with first flower buds visible, ready to transplant, lush foliage, in 15cm individual pot',
    };
    return `manga-style seedling growth stage ${n} of 5 for ${plantName} ${emoji},
${stageDescs[n]},
cel-shaded, thick black manga borders, beige kraft paper background,
kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  if (type === 'plantule-mature') {
    const n = stageNumber || 1;
    const stageDescs: Record<number, string> = {
      1: 'first young fruits forming, small green tomatoes/fruits visible, plant with open flower, in ground soil',
      2: 'fruits growing and developing, green fruits increasing in size, plant in full growth phase',
      3: 'fruits changing color, veraison beginning, some fruits turning orange or yellow, others still green',
      4: 'fruits nearly mature, most fruits colored and sized, some ready to harvest soon, plant at peak production',
      5: 'plant fully productive, abundant ripe fruits ready to harvest, lush mature plant with full yield',
    };
    return `manga-style fruit maturation stage ${n} of 5 for ${plantName} ${emoji},
${stageDescs[n]},
cel-shaded, thick black manga borders, beige kraft paper background,
kawaii aesthetic, 512x512px, BotanIA game style`;
  }

  return `${plantName} ${emoji} -- ${type} asset for BotanIA game`;
}
