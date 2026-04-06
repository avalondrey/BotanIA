#!/bin/bash
# Generate placeholder card images for BotanIA
# Uses ImageMagick (convert command)

CARDS_DIR="public/cards"

# Create a function to generate card
generate_card() {
    local filename="$1"
    local bg_color="$2"
    local emoji="$3"
    local text="$4"

    if [ -f "$CARDS_DIR/$filename" ]; then
        echo "Skipping $filename (exists)"
        return
    fi

    convert -size 400x300 xc:"$bg_color" \
        -gravity Center \
        -font "DejaVu-Sans" \
        -pointsize 48 \
        -annotate +0+0 "$emoji" \
        -pointsize 14 \
        -annotate +0+40 "$text" \
        "$CARDS_DIR/$filename"
    echo "Created $filename"
}

# Seed shops
generate_card "card-shop-guignard.png" "#d1fae5" "🌳" "Guignard"
generate_card "card-shop-inrae.png" "#dbeafe" "🔬" "INRAE"

# Tomato varieties
generate_card "card-tomato-cherokee.png" "#fee2e2" "🍅" "Cherokee"
generate_card "card-tomato-rosedeberne.png" "#fce7f3" "🍅" "Rose de Berne"
generate_card "card-tomato-marmade.png" "#fee2e2" "🍅" "Marmande"
generate_card "card-tomato-blackk.png" "#1f2937" "🍅" "Noire de Crimée"
generate_card "card-tomato-green-zebra.png" "#d1fae5" "🍅" "Green Zebra"

# Carrot varieties
generate_card "card-carrot-guerande.png" "#fed7aa" "🥕" "Grosse de Guérande"
generate_card "card-carrot-nantaise.png" "#fed7aa" "🥕" "Nantaise"
generate_card "card-carrot-robver.png" "#fed7aa" "🥕" "Rob Ver"

# Basil varieties
generate_card "card-basil-genoveois.png" "#d1fae5" "🌿" "Génovéois"
generate_card "card-basil-marseillais.png" "#d1fae5" "🌿" "Marseillais"

# Pepper varieties
generate_card "card-pepper-doux-france.png" "#fee2e2" "🌶️" "Doux d'Espagne"
generate_card "card-pepper-california.png" "#fef3c7" "🌶️" "California Wonder"

# Lettuce varieties
generate_card "card-lettuce-batavia.png" "#d1fae5" "🥬" "Batavia"
generate_card "card-lettuce-chene.png" "#d1fae5" "🥬" "Feuille de Chêne"

# Cucumber/Zucchini
generate_card "card-cucumber-marketer.png" "#d1fae5" "🥒" "Marketer"
generate_card "card-zucchini-black.png" "#1f2937" "🥒" "Black Beauty"

# Eggplant
generate_card "card-eggplant-long.png" "#ede9fe" "🍆" "Long"

# Squash varieties
generate_card "card-squash-butternut.png" "#fed7aa" "🎃" "Butternut"

# Bean varieties
generate_card "card-bean-coco.png" "#d1fae5" "🫘" "Coco"

# Cabbage varieties
generate_card "card-cabbage-milan.png" "#d1fae5" "🥬" "Milan"

# Strawberry varieties
generate_card "card-strawberry-ciflorette.png" "#fecdd3" "🍓" "Ciflorette"

# Fruit trees
generate_card "card-apple-golden.png" "#fef3c7" "🍎" "Golden"
generate_card "card-apple-gala.png" "#fee2e2" "🍎" "Gala"
generate_card "card-pear-williams.png" "#d1fae5" "🍐" "Williams"
generate_card "card-cherry-bing.png" "#fecdd3" "🍒" "Bing"

# Walnut
generate_card "card-walnut-franquette.png" "#d1fae5" "🌰" "Franquette"

echo "Done!"
