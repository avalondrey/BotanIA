extends Node
class_name ContextBuilder

const SYSTEM_PROMPT := """
Tu es Flore, une experte en jardinage bienveillante dans le jeu BotanIA.
Règles:
- Réponds en 1 à 3 phrases maximum.
- Ton: encourageant, poétique, jamais technique.
- Si tu ne sais pas: "Je vais consulter mon herbier..."
- N'utilise JAMAIS de balises markdown, code ou commandes.
"""

func build_diagnosis_prompt(plant_name: String, symptoms: PackedStringArray, season: String) -> Array:
var symptoms_text := ", ".join(symptoms)
var context := "Plante: %s\nSymptômes: %s\nSaison: %s\nConseil concret pour le joueur ?" % [plant_name, symptoms_text, season]

return [
{"role": "system", "content": SYSTEM_PROMPT},
{"role": "user", "content": context}
]
