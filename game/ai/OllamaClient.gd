extends Node
class_name OllamaClient

signal request_started
signal response_ready(text: String, meta: Dictionary)
signal request_failed(error: String)

const OLLAMA_URL := "http://localhost:11434/api/chat"
const TIMEOUT := 8.0
const CACHE_TTL := 300.0

var _http: HTTPRequest
var _cache: Dictionary = {}
var _active_requests: int = 0

func _ready():
_http = HTTPRequest.new()
_http.timeout = TIMEOUT
_http.request_completed.connect(_on_request_completed)
add_child(_http)

func send_chat(messages: Array, model: String = "llama3.2:3b", stream: bool = false) -> void:
var cache_key := str(messages.hash())
if _cache.has(cache_key) and Time.get_unix_time_from_system() - _cache[cache_key].time < CACHE_TTL:
response_ready.emit(_cache[cache_key].text, {"cached": true})
return

_active_requests += 1
request_started.emit()

var payload := {
"model": model,
"messages": messages,
"stream": stream,
"options": {"temperature": 0.6, "num_predict": 256}
}
var headers := ["Content-Type: application/json"]
var body := JSON.stringify(payload)
_http.request(OLLAMA_URL, headers, HTTPClient.METHOD_POST, body)

func _on_request_completed(result: int, code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
_active_requests = max(0, _active_requests - 1)
if code != 200:
request_failed.emit("HTTP %d" % code)
return

var json := JSON.parse_string(body.get_string_from_utf8())
if json and json.has("message") and json["message"].has("content"):
var text := json["message"]["content"]
_cache[str(messages.hash())] = {"text": text, "time": Time.get_unix_time_from_system()}
response_ready.emit(text, {"cached": false, "tokens": json.get("eval_count", 0)})
else:
request_failed.emit("Réponse IA invalide")
