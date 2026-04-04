extends Node2D

@export var ollama: OllamaClient
@export var context_builder: ContextBuilder

@onready var dialogue_label: Label = /Bubble/Text
@onready var loading_icon: Control = /Bubble/Loading
@onready var bubble: PanelContainer = /Bubble

var _current_season: String = "Printemps"

func _ready():
if ollama:
ollama.request_started.connect(func(): bubble.show(); loading_icon.show(); dialogue_label.text = "Flore réfléchit...")
ollama.response_ready.connect(_on_response)
ollama.request_failed.connect(_on_error)

func ask_health(plant_name: String, symptoms: PackedStringArray) -> void:
var messages := context_builder.build_diagnosis_prompt(plant_name, symptoms, _current_season)
ollama.send_chat(messages)

func _on_response(text: String, meta: Dictionary) -> void:
loading_icon.hide()
dialogue_label.text = text

func _on_error(err: String) -> void:
loading_icon.hide()
dialogue_label.text = "Flore consulte son herbier... (réessaie plus tard 🌱)"
push_warning("Ollama error: ", err)
