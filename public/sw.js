/**
 * BotanIA Service Worker — Mode Hors-ligne Amélioré
 * =================================================
 * Cache les assets pour usage au jardin sans réseau
 * Strategies:
 * - Cache-First pour assets statiques (JS, CSS, images)
 * - Network-First pour pages (avec fallback offline)
 * - Stale-While-Revalidate pour données météo
 */

const CACHE_NAME = 'botania-v4';
const OFFLINE_URL = '/offline.html';

const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/cards/card-akebia.png',
  '/cards/card-akebia.webp',
  '/cards/card-alert.png',
  '/cards/card-alert.webp',
  '/cards/card-amaranth.png',
  '/cards/card-amaranth.webp',
  '/cards/card-amelanchier.png',
  '/cards/card-amelanchier.webp',
  '/cards/card-apple-gala.png',
  '/cards/card-apple-gala.webp',
  '/cards/card-apple-golden.png',
  '/cards/card-apple-golden.webp',
  '/cards/card-apple.png',
  '/cards/card-apple.webp',
  '/cards/card-arbousier.png',
  '/cards/card-arbousier.webp',
  '/cards/card-baco-noir.png',
  '/cards/card-baco-noir.webp',
  '/cards/card-basil.png',
  '/cards/card-basil.webp',
  '/cards/card-bean.png',
  '/cards/card-bean.webp',
  '/cards/card-birch.png',
  '/cards/card-birch.webp',
  '/cards/card-blackberry.png',
  '/cards/card-blackberry.webp',
  '/cards/card-blackcurrant.png',
  '/cards/card-blackcurrant.webp',
  '/cards/card-cabbage.png',
  '/cards/card-cabbage.webp',
  '/cards/card-carrot.png',
  '/cards/card-carrot.webp',
  '/cards/card-casseille.png',
  '/cards/card-casseille.webp',
  '/cards/card-chambre-large.png',
  '/cards/card-chambre-large.webp',
  '/cards/card-chambre-medium.png',
  '/cards/card-chambre-medium.webp',
  '/cards/card-chambre-small.png',
  '/cards/card-chambre-small.webp',
  '/cards/card-cherry.png',
  '/cards/card-cherry.webp',
  '/cards/card-corn.png',
  '/cards/card-corn.webp',
  '/cards/card-cornus.png',
  '/cards/card-cornus.webp',
  '/cards/card-cucumber.png',
  '/cards/card-cucumber.webp',
  '/cards/card-custom-plant.png',
  '/cards/card-custom-plant.webp',
  '/cards/card-disease.png',
  '/cards/card-disease.webp',
  '/cards/card-eggplant.png',
  '/cards/card-eggplant.webp',
  '/cards/card-eleagnus.png',
  '/cards/card-eleagnus.webp',
  '/cards/card-fertilizer.png',
  '/cards/card-fertilizer.webp',
  '/cards/card-garden.png',
  '/cards/card-garden.webp',
  '/cards/card-goji.png',
  '/cards/card-goji.webp',
  '/cards/card-greenhouse.png',
  '/cards/card-greenhouse.webp',
  '/cards/card-hazelnut.png',
  '/cards/card-hazelnut.webp',
  '/cards/card-josta.png',
  '/cards/card-josta.webp',
  '/cards/card-kokopelli-semences-fr.png',
  '/cards/card-kokopelli-semences-fr.webp',
  '/cards/card-kokopelli.png',
  '/cards/card-kokopelli.webp',
  '/cards/card-laurus.png',
  '/cards/card-laurus.webp',
  '/cards/card-lemon.png',
  '/cards/card-lemon.webp',
  '/cards/card-lettuce.png',
  '/cards/card-lettuce.webp',
  '/cards/card-lycium.png',
  '/cards/card-lycium.webp',
  '/cards/card-magnolia.png',
  '/cards/card-magnolia.webp',
  '/cards/card-maple.png',
  '/cards/card-maple.webp',
  '/cards/card-melon.png',
  '/cards/card-melon.webp',
  '/cards/card-mini-serre.png',
  '/cards/card-mini-serre.webp',
  '/cards/card-mirabellier.png',
  '/cards/card-mirabellier.webp',
  '/cards/card-oak.png',
  '/cards/card-oak.webp',
  '/cards/card-olive.png',
  '/cards/card-olive.webp',
  '/cards/card-orange.png',
  '/cards/card-orange.webp',
  '/cards/card-parsley.png',
  '/cards/card-parsley.webp',
  '/cards/card-pea.png',
  '/cards/card-pea.webp',
  '/cards/card-pear.png',
  '/cards/card-pear.webp',
  '/cards/card-pepper.png',
  '/cards/card-pepper.webp',
  '/cards/card-pest.png',
  '/cards/card-pest.webp',
  '/cards/card-photinia.png',
  '/cards/card-photinia.webp',
  '/cards/card-pine.png',
  '/cards/card-pine.webp',
  '/cards/card-planter.png',
  '/cards/card-planter.webp',
  '/cards/card-quinoa.png',
  '/cards/card-quinoa.webp',
  '/cards/card-radish.png',
  '/cards/card-radish.webp',
  '/cards/card-rain.png',
  '/cards/card-rain.webp',
  '/cards/card-seeds-tomato.png',
  '/cards/card-seeds-tomato.webp',
  '/cards/card-shop-clause.png',
  '/cards/card-shop-clause.webp',
  '/cards/card-shop-vilmorin.png',
  '/cards/card-shop-vilmorin.webp',
  '/cards/card-soil.png',
  '/cards/card-soil.webp',
  '/cards/card-sorrel.png',
  '/cards/card-sorrel.webp',
  '/cards/card-spinach.png',
  '/cards/card-spinach.webp',
  '/cards/card-squash.png',
  '/cards/card-squash.webp',
  '/cards/card-strawberry.png',
  '/cards/card-strawberry.webp',
  '/cards/card-sunflower.png',
  '/cards/card-sunflower.webp',
  '/cards/card-sunlight.png',
  '/cards/card-sunlight.webp',
  '/cards/card-tomato-aneas.png',
  '/cards/card-tomato-aneas.webp',
  '/cards/card-tomato-cocktail.png',
  '/cards/card-tomato-cocktail.webp',
  '/cards/card-tomato-evolution.png',
  '/cards/card-tomato-evolution.webp',
  '/cards/card-tomato.png',
  '/cards/card-tomato.webp',
  '/cards/card-treatment.png',
  '/cards/card-treatment.webp',
  '/cards/card-walnut.png',
  '/cards/card-walnut.webp',
  '/cards/card-watering.png',
  '/cards/card-watering.webp',
  '/cards/card-zucchini.png',
  '/cards/card-zucchini.webp',
  '/cards/packet-cucumber-marketer.png',
  '/cards/packet-cucumber-marketer.webp',
  '/cards/seeds/clause/card-cucumber-marketer.png',
  '/cards/seeds/clause/card-cucumber-marketer.webp',
  '/cards/seeds/clause/card-lettuce-batavia.png',
  '/cards/seeds/clause/card-lettuce-batavia.webp',
  '/cards/seeds/clause/card-pepper-california-wonder.png',
  '/cards/seeds/clause/card-pepper-california-wonder.webp',
  '/cards/seeds/clause/card-zucchini-black-beauty.png',
  '/cards/seeds/clause/card-zucchini-black-beauty.webp',
  '/cards/seeds/kokopelli/card-eggplant-long-violette.png',
  '/cards/seeds/kokopelli/card-eggplant-long-violette.webp',
  '/cards/seeds/kokopelli/card-squash-butternut-coco.png',
  '/cards/seeds/kokopelli/card-squash-butternut-coco.webp',
  '/cards/seeds/kokopelli/card-tomato-blackk.png',
  '/cards/seeds/kokopelli/card-tomato-blackk.webp',
  '/cards/seeds/kokopelli/card-tomato-cherokee-purple.png',
  '/cards/seeds/kokopelli/card-tomato-cherokee-purple.webp',
  '/cards/seeds/kokopelli/card-tomato-green-zebra.png',
  '/cards/seeds/kokopelli/card-tomato-green-zebra.webp',
  '/cards/seeds/kokopelli/card-tomato-rose-de-berne.png',
  '/cards/seeds/kokopelli/card-tomato-rose-de-berne.webp',
  '/cards/seeds/leaderplant/thuya-smaragd.png',
  '/cards/seeds/lebiau/card-bean-coco.png',
  '/cards/seeds/lebiau/card-bean-coco.webp',
  '/cards/seeds/lebiau/card-cabbage-milan.png',
  '/cards/seeds/lebiau/card-cabbage-milan.webp',
  '/cards/seeds/lebiau/card-carrot-guerande.png',
  '/cards/seeds/lebiau/card-carrot-guerande.webp',
  '/cards/seeds/lebiau/card-carrot-robver.png',
  '/cards/seeds/lebiau/card-carrot-robver.webp',
  '/cards/seeds/lebiau/card-lettuce-chene.png',
  '/cards/seeds/lebiau/card-lettuce-chene.webp',
  '/cards/seeds/lebiau/card-tomato-marmande.png',
  '/cards/seeds/lebiau/card-tomato-marmande.webp',
  '/cards/seeds/sainte-marthe/card-basil-genoveois.png',
  '/cards/seeds/sainte-marthe/card-basil-genoveois.webp',
  '/cards/seeds/sainte-marthe/card-basil-marseillais.png',
  '/cards/seeds/sainte-marthe/card-basil-marseillais.webp',
  '/cards/seeds/sainte-marthe/card-pepper-doux-france.png',
  '/cards/seeds/sainte-marthe/card-pepper-doux-france.webp',
  '/cards/seeds/sainte-marthe/card-strawberry-ciflorette.png',
  '/cards/seeds/sainte-marthe/card-strawberry-ciflorette.webp',
  '/cards/seeds/thuya.png',
  '/cards/shops/card-shop-arbres-tissot.png',
  '/cards/shops/card-shop-arbres-tissot.webp',
  '/cards/shops/card-shop-clause.png',
  '/cards/shops/card-shop-clause.webp',
  '/cards/shops/card-shop-fruitiers-forest.png',
  '/cards/shops/card-shop-fruitiers-forest.webp',
  '/cards/shops/card-shop-guignard.png',
  '/cards/shops/card-shop-guignard.webp',
  '/cards/shops/card-shop-inrae.png',
  '/cards/shops/card-shop-inrae.webp',
  '/cards/shops/card-shop-kokopelli.png',
  '/cards/shops/card-shop-kokopelli.webp',
  '/cards/shops/card-shop-lebiau.png',
  '/cards/shops/card-shop-lebiau.webp',
  '/cards/shops/card-shop-pepinieres-bordas.png',
  '/cards/shops/card-shop-pepinieres-bordas.webp',
  '/cards/shops/card-shop-sainte-marthe.png',
  '/cards/shops/card-shop-sainte-marthe.webp',
  '/cards/shops/card-shop-vilmorin.png',
  '/cards/shops/card-shop-vilmorin.webp',
  '/cards/src/components/game/Boutique/packet-cucumber-marketer.png',
  '/cards/src/components/game/Boutique/packet-cucumber-marketer.webp',
  '/cards/thuya-evolution.png',
  '/packets/card-basil-genoveois.png',
  '/packets/card-basil-genoveois.webp',
  '/packets/card-basil.png',
  '/packets/card-basil.webp',
  '/packets/card-carrot-guerande.png',
  '/packets/card-carrot-guerande.webp',
  '/packets/card-carrot.png',
  '/packets/card-carrot.webp',
  '/packets/card-lettuce.png',
  '/packets/card-lettuce.webp',
  '/packets/card-pepper-doux-france.png',
  '/packets/card-pepper-doux-france.webp',
  '/packets/card-pepper.png',
  '/packets/card-pepper.webp',
  '/packets/card-seeds-tomato.png',
  '/packets/card-seeds-tomato.webp',
  '/packets/card-strawberry.png',
  '/packets/card-strawberry.webp',
  '/packets/card-tomato-cherokee.png',
  '/packets/card-tomato-cherokee.webp',
  '/packets/card-tomato-marmade.png',
  '/packets/card-tomato-marmade.webp',
  '/packets/card-tomato-rosedeberne.png',
  '/packets/card-tomato-rosedeberne.webp',
  '/packets/card-tomato.png',
  '/packets/card-tomato.webp',
  '/packets/clause/packet-carrot-nantaise.png',
  '/packets/clause/packet-carrot-nantaise.webp',
  '/packets/clause/packet-cucumber-marketer.png',
  '/packets/clause/packet-cucumber-marketer.webp',
  '/packets/clause/packet-lettuce-batavia.png',
  '/packets/clause/packet-lettuce-batavia.webp',
  '/packets/clause/packet-pepper-california-wonder.png',
  '/packets/clause/packet-pepper-california-wonder.webp',
  '/packets/clause/packet-zucchini-black-beauty.png',
  '/packets/clause/packet-zucchini-black-beauty.webp',
  '/packets/inrae/packet-walnut-franquette.png',
  '/packets/kokopelli/packet-amaranth-red-garnet.png',
  '/packets/kokopelli/packet-amaranth-red-garnet.webp',
  '/packets/kokopelli/packet-bean-coco-rouge.png',
  '/packets/kokopelli/packet-bean-coco-rouge.webp',
  '/packets/kokopelli/packet-corn-miel-jaune.png',
  '/packets/kokopelli/packet-corn-miel-jaune.webp',
  '/packets/kokopelli/packet-eggplant-long-violette.png',
  '/packets/kokopelli/packet-eggplant-long-violette.webp',
  '/packets/kokopelli/packet-quinoa-tempe.png',
  '/packets/kokopelli/packet-quinoa-tempe.webp',
  '/packets/kokopelli/packet-sorrel-commune.png',
  '/packets/kokopelli/packet-sorrel-commune.webp',
  '/packets/kokopelli/packet-squash-butternut-coco.png',
  '/packets/kokopelli/packet-squash-butternut-coco.webp',
  '/packets/kokopelli/packet-sunflower-titania.png',
  '/packets/kokopelli/packet-sunflower-titania.webp',
  '/packets/kokopelli/packet-tomato-blackk.png',
  '/packets/kokopelli/packet-tomato-blackk.webp',
  '/packets/kokopelli/packet-tomato-cherokee-purple.png',
  '/packets/kokopelli/packet-tomato-cherokee-purple.webp',
  '/packets/kokopelli/packet-tomato-green-zebra.png',
  '/packets/kokopelli/packet-tomato-green-zebra.webp',
  '/packets/kokopelli/packet-tomato-rose-de-berne.png',
  '/packets/kokopelli/packet-tomato-rose-de-berne.webp',
  '/packets/leaderplant/packet-casseille-hedge.png',
  '/packets/leaderplant/packet-cornus-alba.png',
  '/packets/leaderplant/packet-escallonia-iveyi.png',
  '/packets/leaderplant/packet-laurus-nobilis.png',
  '/packets/leaderplant/packet-photinia-louise.png',
  '/packets/leaderplant/packet-thuya-smaragd.png',
  '/packets/lebiau/packet-bean-coco-paimpol.png',
  '/packets/lebiau/packet-bean-coco-paimpol.webp',
  '/packets/lebiau/packet-bean-coco.png',
  '/packets/lebiau/packet-bean-coco.webp',
  '/packets/lebiau/packet-cabbage-milan.png',
  '/packets/lebiau/packet-cabbage-milan.webp',
  '/packets/lebiau/packet-carrot-guerande.png',
  '/packets/lebiau/packet-carrot-guerande.webp',
  '/packets/lebiau/packet-carrot-robver.png',
  '/packets/lebiau/packet-carrot-robver.webp',
  '/packets/lebiau/packet-chard-vert-lyon.png',
  '/packets/lebiau/packet-chard-vert-lyon.webp',
  '/packets/lebiau/packet-cucumber-le-genereux.png',
  '/packets/lebiau/packet-cucumber-le-genereux.webp',
  '/packets/lebiau/packet-cucumber-rollisons-telegraph.png',
  '/packets/lebiau/packet-cucumber-rollisons-telegraph.webp',
  '/packets/lebiau/packet-eggplant-longue-violette.png',
  '/packets/lebiau/packet-eggplant-longue-violette.webp',
  '/packets/lebiau/packet-lettuce-chene.png',
  '/packets/lebiau/packet-lettuce-chene.webp',
  '/packets/lebiau/packet-pepper-ariane.png',
  '/packets/lebiau/packet-pepper-ariane.webp',
  '/packets/lebiau/packet-pepper-chocolat.png',
  '/packets/lebiau/packet-pepper-chocolat.webp',
  '/packets/lebiau/packet-pepper-doux-espagne.png',
  '/packets/lebiau/packet-pepper-doux-espagne.webp',
  '/packets/lebiau/packet-poppy-californie.png',
  '/packets/lebiau/packet-poppy-californie.webp',
  '/packets/lebiau/packet-squash-musquee.png',
  '/packets/lebiau/packet-squash-musquee.webp',
  '/packets/lebiau/packet-squash-striped-cushaw.png',
  '/packets/lebiau/packet-sunflower-velours.png',
  '/packets/lebiau/packet-sunflower-velours.webp',
  '/packets/lebiau/packet-tomato-cerisette-brin-muguet.png',
  '/packets/lebiau/packet-tomato-cerisette-brin-muguet.webp',
  '/packets/lebiau/packet-tomato-evergreen.png',
  '/packets/lebiau/packet-tomato-evergreen.webp',
  '/packets/lebiau/packet-tomato-kumato.png',
  '/packets/lebiau/packet-tomato-kumato.webp',
  '/packets/lebiau/packet-tomato-marmande.png',
  '/packets/lebiau/packet-tomato-marmande.webp',
  '/packets/lebiau/packet-tomato-raisin-vert.png',
  '/packets/lebiau/packet-tomato-raisin-vert.webp',
  '/packets/lebiau/packet-tomato-saint-pierre.png',
  '/packets/lebiau/packet-tomato-saint-pierre.webp',
  '/packets/lebiau/packet-zucchini-verte-italie.png',
  '/packets/lebiau/packet-zucchini-verte-milan-black-beauty.png',
  '/packets/sainte-marthe/packet-basil-genoveois.png',
  '/packets/sainte-marthe/packet-basil-genoveois.webp',
  '/packets/sainte-marthe/packet-basil-marseillais.png',
  '/packets/sainte-marthe/packet-basil-marseillais.webp',
  '/packets/sainte-marthe/packet-pepper-doux-france.png',
  '/packets/sainte-marthe/packet-pepper-doux-france.webp',
  '/packets/sainte-marthe/packet-strawberry-ciflorette.png',
  '/packets/sainte-marthe/packet-strawberry-ciflorette.webp',
  '/packets/vilmorin/packet-basil-loki.png',
  '/packets/vilmorin/packet-basil-loki.webp',
  '/packets/vilmorin/packet-cucumber-bella.jpg',
  '/packets/vilmorin/packet-cucumber-marketer.jpg',
  '/packets/vilmorin/packet-melon-stellio.jpg',
  '/packets/vilmorin/packet-parsley-lion.png',
  '/packets/vilmorin/packet-parsley-lion.webp',
  '/packets/vilmorin/packet-radis-expo.png',
  '/packets/vilmorin/packet-radis-expo.webp',
  '/packets/vilmorin/packet-spinach-soyuz.png',
  '/packets/vilmorin/packet-spinach-soyuz.webp',
  '/packets/vilmorin/packet-tomato-aneas.png',
  '/packets/vilmorin/packet-tomato-aneas.webp',
  '/packets/vilmorin/packet-tomato-cocktail.jpg',
  '/packets/vilmorin/packet-tomato-lanterna.jpg',
  '/packets/vilmorin/packet-zucchini-boldenice.jpg',
  '/plants/basil-stage-1.png',
  '/plants/basil-stage-2.png',
  '/plants/basil-stage-3.png',
  '/plants/basil-stage-4.png',
  '/plants/basil-stage-5.png',
  '/plants/carrot-stage-1.png',
  '/plants/carrot-stage-2.png',
  '/plants/carrot-stage-3.png',
  '/plants/carrot-stage-4.png',
  '/plants/carrot-stage-5.png',
  '/plants/casseille-stage-1.png',
  '/plants/casseille-stage-2.png',
  '/plants/casseille-stage-3.png',
  '/plants/casseille-stage-4.png',
  '/plants/casseille-stage-5.png',
  '/plants/cornus-stage-1.png',
  '/plants/cornus-stage-2.png',
  '/plants/cornus-stage-3.png',
  '/plants/cornus-stage-4.png',
  '/plants/cornus-stage-5.png',
  '/plants/cucumber-stage-1.png',
  '/plants/cucumber-stage-2.png',
  '/plants/cucumber-stage-3.png',
  '/plants/cucumber-stage-4.png',
  '/plants/cucumber-stage-5.png',
  '/plants/custom-plant-stage-1.png',
  '/plants/custom-plant-stage-1.webp',
  '/plants/custom-plant-stage-2.png',
  '/plants/custom-plant-stage-2.webp',
  '/plants/custom-plant-stage-3.png',
  '/plants/custom-plant-stage-3.webp',
  '/plants/custom-plant-stage-4.png',
  '/plants/custom-plant-stage-4.webp',
  '/plants/custom-plant-stage-5.png',
  '/plants/custom-plant-stage-5.webp',
  '/plants/eleagnus-stage-1.png',
  '/plants/eleagnus-stage-2.png',
  '/plants/eleagnus-stage-3.png',
  '/plants/eleagnus-stage-4.png',
  '/plants/eleagnus-stage-5.png',
  '/plants/escallonia-stage-1.png',
  '/plants/escallonia-stage-2.png',
  '/plants/escallonia-stage-3.png',
  '/plants/escallonia-stage-4.png',
  '/plants/escallonia-stage-5.png',
  '/plants/laurus-stage-1.png',
  '/plants/laurus-stage-2.png',
  '/plants/laurus-stage-3.png',
  '/plants/laurus-stage-4.png',
  '/plants/laurus-stage-5.png',
  '/plants/melon-stage-1.png',
  '/plants/melon-stage-2.png',
  '/plants/melon-stage-3.png',
  '/plants/melon-stage-4.png',
  '/plants/melon-stage-5.png',
  '/plants/melon-stage-5.webp',
  '/plants/parsley-stage-1.png',
  '/plants/parsley-stage-2.png',
  '/plants/parsley-stage-3.png',
  '/plants/parsley-stage-4.png',
  '/plants/parsley-stage-5.png',
  '/plants/photinia-stage-1.png',
  '/plants/photinia-stage-2.png',
  '/plants/photinia-stage-3.png',
  '/plants/photinia-stage-4.png',
  '/plants/photinia-stage-5.png',
  '/plants/radish-stage-1.png',
  '/plants/radish-stage-2.png',
  '/plants/radish-stage-3.png',
  '/plants/radish-stage-4.png',
  '/plants/radish-stage-5.png',
  '/plants/spinach-stage-1.png',
  '/plants/spinach-stage-2.png',
  '/plants/spinach-stage-3.png',
  '/plants/spinach-stage-4.png',
  '/plants/spinach-stage-5.png',
  '/plants/squash-stage-1.png',
  '/plants/squash-stage-2.png',
  '/plants/squash-stage-3.png',
  '/plants/squash-stage-4.png',
  '/plants/squash-stage-5.png',
  '/plants/thuya-pot.png',
  '/plants/thuya-stage-1.png',
  '/plants/thuya-stage-2.png',
  '/plants/thuya-stage-3.png',
  '/plants/thuya-stage-4.png',
  '/plants/thuya-stage-5.png',
  '/plants/tomato-stage-1.png',
  '/plants/tomato-stage-2.png',
  '/plants/tomato-stage-3.png',
  '/plants/tomato-stage-4.png',
  '/plants/tomato-stage-5.png',
  '/plants/zucchini-stage-1.png',
  '/plants/zucchini-stage-2.png',
  '/plants/zucchini-stage-3.png',
  '/plants/zucchini-stage-4.png',
  '/plants/zucchini-stage-5.png',
  '/plantules/basil-stage-1.png',
  '/plantules/basil-stage-1.webp',
  '/plantules/basil-stage-2.png',
  '/plantules/basil-stage-2.webp',
  '/plantules/basil-stage-3.png',
  '/plantules/basil-stage-3.webp',
  '/plantules/basil-stage-4.png',
  '/plantules/basil-stage-4.webp',
  '/plantules/basil-stage-5.png',
  '/plantules/basil-stage-5.webp',
  '/plantules/basil-stage-6.png',
  '/plantules/basil-stage-6.webp',
  '/plantules/carrot-stage-1.png',
  '/plantules/carrot-stage-2.png',
  '/plantules/carrot-stage-3.png',
  '/plantules/carrot-stage-4.png',
  '/plantules/carrot-stage-5.png',
  '/plantules/carrot-stage-6.png',
  '/plantules/cucumber-stage-1.png',
  '/plantules/cucumber-stage-1.webp',
  '/plantules/cucumber-stage-2.png',
  '/plantules/cucumber-stage-2.webp',
  '/plantules/cucumber-stage-3.png',
  '/plantules/cucumber-stage-3.webp',
  '/plantules/cucumber-stage-4.png',
  '/plantules/cucumber-stage-4.webp',
  '/plantules/cucumber-stage-5.png',
  '/plantules/cucumber-stage-5.webp',
  '/plantules/cucumber-stage-6.png',
  '/plantules/cucumber-stage-6.webp',
  '/plantules/eggplant-stage-1.png',
  '/plantules/eggplant-stage-1.webp',
  '/plantules/eggplant-stage-2.png',
  '/plantules/eggplant-stage-2.webp',
  '/plantules/eggplant-stage-3.png',
  '/plantules/eggplant-stage-3.webp',
  '/plantules/eggplant-stage-4.png',
  '/plantules/eggplant-stage-4.webp',
  '/plantules/eggplant-stage-5.png',
  '/plantules/eggplant-stage-6.png',
  '/plantules/melon-stage-1.png',
  '/plantules/melon-stage-1.webp',
  '/plantules/melon-stage-2.png',
  '/plantules/melon-stage-2.webp',
  '/plantules/melon-stage-3.png',
  '/plantules/melon-stage-4.png',
  '/plantules/melon-stage-5.png',
  '/plantules/melon-stage-6.png',
  '/plantules/parsley-stage-1.png',
  '/plantules/parsley-stage-1.webp',
  '/plantules/parsley-stage-2.png',
  '/plantules/parsley-stage-2.webp',
  '/plantules/parsley-stage-3.png',
  '/plantules/parsley-stage-3.webp',
  '/plantules/parsley-stage-4.png',
  '/plantules/parsley-stage-4.webp',
  '/plantules/parsley-stage-5.png',
  '/plantules/parsley-stage-5.webp',
  '/plantules/parsley-stage-6.png',
  '/plantules/parsley-stage-6.webp',
  '/plantules/plantule-cassis-blanc.png',
  '/plantules/spinach-stage-1.png',
  '/plantules/spinach-stage-1.webp',
  '/plantules/spinach-stage-2.png',
  '/plantules/spinach-stage-2.webp',
  '/plantules/spinach-stage-3.png',
  '/plantules/spinach-stage-3.webp',
  '/plantules/spinach-stage-4.png',
  '/plantules/spinach-stage-4.webp',
  '/plantules/spinach-stage-5.png',
  '/plantules/spinach-stage-5.webp',
  '/plantules/spinach-stage-6.png',
  '/plantules/spinach-stage-6.webp',
  '/plantules/squash-stage-1.png',
  '/plantules/squash-stage-2.png',
  '/plantules/squash-stage-3.png',
  '/plantules/squash-stage-4.png',
  '/plantules/squash-stage-5.png',
  '/plantules/squash-stage-6.png',
  '/plantules/tomato-stage-1.png',
  '/plantules/tomato-stage-1.webp',
  '/plantules/tomato-stage-2.png',
  '/plantules/tomato-stage-2.webp',
  '/plantules/tomato-stage-3.png',
  '/plantules/tomato-stage-3.webp',
  '/plantules/tomato-stage-4.png',
  '/plantules/tomato-stage-5.png',
  '/plantules/tomato-stage-6.png',
  '/plantules/zucchini-stage-1.png',
  '/plantules/zucchini-stage-1.webp',
  '/plantules/zucchini-stage-2.png',
  '/plantules/zucchini-stage-2.webp',
  '/plantules/zucchini-stage-3.png',
  '/plantules/zucchini-stage-3.webp',
  '/plantules/zucchini-stage-4.png',
  '/plantules/zucchini-stage-4.webp',
  '/plantules/zucchini-stage-5.png',
  '/plantules/zucchini-stage-5.webp',
  '/plantules/zucchini-stage-6.png',
  '/plantules/zucchini-stage-6.webp',
];

const STATIC_EXTENSIONS = /\.(js|css|png|jpg|jpeg|svg|webp|woff2?|ttf|eot|ico)$/;
const NEXT_ASSETS = /\/_next\//;
const IMAGE_ASSETS = /\/images\/|\/cards\/|\/plants\/|\/plantules\/|\/trees\//;

// ─── Installation ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Pré-cache les assets critiques
      try {
        await cache.addAll(PRECACHE_URLS);
      } catch (err) {
        console.warn('SW: some precache URLs failed', err);
      }
    })
  );
  self.skipWaiting();
});

// ─── Activation ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name.startsWith('botania-'))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Stratégie de routage ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Skip cross-origin (sauf fonts Google, CDN)
  if (url.origin !== self.location.origin &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // API routes — network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithCache(request, CACHE_NAME));
    return;
  }

  // Météo — stale-while-revalidate
  if (url.pathname.includes('open-meteo.com') || url.pathname.includes('/api/weather')) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // Images de plantes — cache first
  if (IMAGE_ASSETS.test(url.pathname) || url.pathname.includes('/cards/')) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
    return;
  }

  // Assets statiques (JS, CSS, fonts) — cache first
  if (STATIC_EXTENSIONS.test(url.pathname) || NEXT_ASSETS.test(url.pathname)) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
    return;
  }

  // Pages (navigation) — network first avec offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request, CACHE_NAME));
    return;
  }

  // Tout le reste — cache first
  event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
});

// ─── Stratégies de cache ───

/**
 * Cache-First — pour assets statiques qui changent rarement
 */
async function cacheFirstWithNetwork(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return cached || new Response('Asset not available offline', { status: 503 });
  }
}

/**
 * Network-First — pour les pages et API
 */
async function networkFirstWithCache(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Network-First avec offline fallback HTML
 */
async function networkFirstWithOfflineFallback(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Try offline page
    const offlinePage = await cache.match(OFFLINE_URL);
    if (offlinePage) return offlinePage;

    // Final fallback — page minimale
    return new Response(
      `<!DOCTYPE html><html><head><title>BotanIA — Hors ligne</title></head>
       <body style="font-family:sans-serif;padding:2rem;text-align:center;background:#faf8f4">
       <h1>🌱 BotanIA</h1>
       <p>Vous êtes hors ligne. Réessayez quand vous aurez du réseau.</p>
       <button onclick="location.reload()" style="padding:0.5rem 1rem;cursor:pointer">
         Réessayer
       </button></body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

/**
 * Stale-While-Revalidate — pour données météo (rapide mais frais)
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  return cached || fetchPromise || new Response('{}', { status: 200 });
}

// ─── Notifications Push ───
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || '',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [100, 50, 100],
    tag: 'botania-notif',
    requireInteraction: data.urgent || false,
    data: { url: data.url || '/' },
    actions: data.actions || [
      { action: 'open', title: 'Ouvrir' },
      { action: 'dismiss', title: 'Ignorer' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🌱 BotanIA', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// ─── Background Sync ───
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-journal') {
    event.waitUntil(syncJournal());
  }
});

async function syncJournal() {
  // Sync journal entries when back online
  // Implementation depends on backend
  console.log('SW: sync-journal event fired');
}
