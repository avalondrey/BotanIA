"use client";

import { useState } from "react";
import {
  PLANTS,
  STAGE_IMAGES,
} from "@/lib/ai-engine";
import { SEED_SHOPS, SEED_VARIETIES, CHAMBRE_CATALOG } from "@/store/game-store";

const STAGE_NAMES = ["Monticule de terre", "Petite plantule", "Plantule 2 feuilles", "Plantule 4 feuilles", "Plantule 5 feuilles", "Floraison"];
const MONTH_NAMES_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

type CardType = "plante" | "variete" | "graine" | "environnement" | "action" | "ressource" | "boutique" | "chambre";

const CARD_TYPE_OPTIONS: { key: CardType; label: string; emoji: string }[] = [
  { key: "plante", label: "Plante", emoji: "🌱" },
  { key: "variete", label: "Variété", emoji: "🏷️" },
  { key: "environnement", label: "Environnement", emoji: "🏠" },
  { key: "action", label: "Action", emoji: "⚔️" },
  { key: "ressource", label: "Ressource", emoji: "📦" },
  { key: "boutique", label: "Boutique", emoji: "🏪" },
  { key: "chambre", label: "Chambre", emoji: "🏗️" },
];

function InputField({ label, value, onChange, placeholder, type = "text", small = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; small?: boolean;
}) {
  return (
    <div className={small ? "" : "flex flex-col gap-1"}>
      <label className="text-[10px] font-black uppercase text-stone-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border-2 border-stone-300 rounded-lg text-sm font-bold
          focus:outline-none focus:border-black focus:ring-2 focus:ring-black/10
          ${small ? "text-xs py-1 px-2" : ""}`}
      />
    </div>
  );
}

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 border-t-2 border-stone-200 mt-4">
      <span className="text-lg">{emoji}</span>
      <h2 className="text-sm font-black uppercase">{title}</h2>
    </div>
  );
}

interface SearchResultItem {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
}

interface SearchData {
  description?: string;
  type?: string;
  origine?: string;
  specialites?: string[];
  nbVarietes?: string;
  color?: string;
  borderColor?: string;
  harvestDays?: number;
  tempMin?: number;
  tempMax?: number;
  waterNeed?: number;
  lightNeed?: number;
  diseaseRes?: number;
  pestRes?: number;
  optimalMonths?: number[];
}

export default function AdminPage() {
  const [cardType, setCardType] = useState<CardType>("plante");
  const [form, setForm] = useState<Record<string, string>>({});
  const [codeOutput, setCodeOutput] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [searchAiData, setSearchAiData] = useState<SearchData>({});
  const [searchError, setSearchError] = useState("");
  const [applyFlash, setApplyFlash] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [savedCards, setSavedCards] = useState<any>(null);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const f = (field: string) => form[field] || "";

  const cardId = f("id").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  const imagePath = `/cards/card-${cardId}.png`;

  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setShowSearch(true);
    setSearchAiData({});
    setSearchResults([]);
    setSearchError("");
    try {
      const res = await fetch("/api/admin/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, type: cardType }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.searchResults || []);
        setSearchAiData(data.aiData || {});
      } else if (data.error) {
        setSearchError(data.error);
      }
    } catch (err) {
      setSearchError("Erreur de connexion au serveur");
    }
    setSearching(false);
  };

  const applySearchData = () => {
    const updates: Record<string, string> = {};
    // Auto-fill name and id from search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      updates.name = q.charAt(0).toUpperCase() + q.slice(1);
      updates.id = q.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    }
    // Auto-fill emoji based on type
    if (cardType === "boutique") updates.emoji = "🏪";
    else if (cardType === "plante" || cardType === "variete") updates.emoji = "🌱";
    // Apply AI data
    if (searchAiData.description) updates.description = searchAiData.description;
    if (searchAiData.harvestDays) updates.harvestDays = String(searchAiData.harvestDays);
    if (searchAiData.tempMin) updates.tempMin = String(searchAiData.tempMin);
    if (searchAiData.tempMax) updates.tempMax = String(searchAiData.tempMax);
    if (searchAiData.waterNeed) updates.waterNeed = String(searchAiData.waterNeed);
    if (searchAiData.lightNeed) updates.lightNeed = String(searchAiData.lightNeed);
    if (searchAiData.diseaseRes) updates.diseaseRes = String(searchAiData.diseaseRes);
    if (searchAiData.pestRes) updates.pestRes = String(searchAiData.pestRes);
    if (searchAiData.optimalMonths) updates.optimalMonths = searchAiData.optimalMonths.join(",");
    if (searchAiData.color) updates.color = searchAiData.color;
    if (searchAiData.borderColor) updates.borderColor = searchAiData.borderColor;
    if (searchAiData.nbVarietes && cardType === "boutique") {
      updates.description = (updates.description || "") + ` (~${searchAiData.nbVarietes} variétés)`;
    }
    if (Object.keys(updates).length > 0) {
      setForm((prev) => ({ ...prev, ...updates }));
      setApplyFlash(true);
      setTimeout(() => setApplyFlash(false), 2000);
    }
  };

  const handleSave = async () => {
    if (!f("id") || !f("name")) {
      setSaveStatus("❌ Remplis au moins l'ID et le Nom");
      return;
    }
    setSaveStatus("💾 Sauvegarde en cours...");

    let card: any = {};
    let saveType = cardType;

    if (cardType === "boutique") {
      card = {
        id: f("id"), name: f("name"), emoji: f("emoji") || "🏪",
        color: f("color") || "from-orange-50 to-amber-50",
        borderColor: f("borderColor") || "border-orange-200",
        image: imagePath,
        description: f("description") || "",
      };
    } else if (cardType === "variete") {
      card = {
        id: f("id"), plantDefId: f("parentPlant") || f("id"),
        shopId: f("shopId"), name: f("name"), emoji: f("emoji") || "🌱",
        price: Number(f("price")) || 0, grams: Number(f("grams")) || 0,
        description: f("description") || "", image: imagePath, unlocked: true,
        stageDurations: [Number(f("stage1"))||10, Number(f("stage2"))||20, Number(f("stage3"))||20, Number(f("stage4"))||20],
        realDaysToHarvest: Number(f("harvestDays")) || 90,
        optimalTemp: [Number(f("tempMin"))||15, Number(f("tempMax"))||25],
        waterNeed: Number(f("waterNeed")) || 4, lightNeed: Number(f("lightNeed")) || 8,
      };
    } else if (cardType === "plante") {
      // For plants, save as both plante definition and graine
      card = {
        id: f("id"), plantDefId: f("id"), name: f("name"),
        emoji: f("emoji") || "🌱", price: Number(f("price")) || 50,
        description: f("description") || "", image: imagePath,
        realDaysToHarvest: Number(f("harvestDays")) || 90,
        optimalMonths: (f("optimalMonths") || "").split(",").map(Number).filter(n => !isNaN(n)),
      };
      saveType = "graine";
    }

    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: saveType, card }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus(`✅ ${data.message}`);
        setSavedCards(data.cards);
      } else {
        setSaveStatus(`❌ ${data.error}`);
      }
    } catch {
      setSaveStatus("❌ Erreur de sauvegarde");
    }
  };

  const generateCode = () => {
    let code = "// ═══ GÉNÉRÉ PAR ADMIN — CARTE MOTEUR ═══\n\n";
    code += `// === Carte: ${f("name") || cardId} ===\n`;
    code += `// Type: ${cardType}\n`;
    code += `// ID: ${cardId}\n\n`;

    if (cardType === "plante" || cardType === "variete") {
      const plantId = f("parentPlant") || cardId;
      const stageDurs = [f("stage1"), f("stage2"), f("stage3"), f("stage4")].map(Number);
      code += `// ── ai-engine PLANTS entry ──\n`;
      code += `  "${plantId}": {\n`;
      code += `    id: "${plantId}", name: "${f("name")}", emoji: "${f("emoji")}",\n`;
      code += `    image: "${imagePath}",\n`;
      code += `    stageDurations: [${stageDurs.join(", ")}],\n`;
      code += `    optimalTemp: [${f("tempMin")}, ${f("tempMax")}],\n`;
      code += `    waterNeed: ${f("waterNeed")},\n`;
      code += `    lightNeed: ${f("lightNeed")},\n`;
      code += `    harvestEmoji: "${f("emoji")}",\n`;
      code += `    cropCoefficient: 1.05,\n`;
      code += `    optimalPlantMonths: [${f("optimalMonths")}],\n`;
      code += `    optimalSeasons: ["spring", "summer"],\n`;
      code += `    diseaseResistance: ${f("diseaseRes")},\n`;
      code += `    pestResistance: ${f("pestRes")},\n`;
      code += `    realDaysToHarvest: ${f("harvestDays")},\n`;
      code += `  },\n\n`;

      code += `// ── STAGE_IMAGES entry ──\n`;
      code += `  "${plantId}": [\n`;
      for (let i = 0; i < 6; i++) {
        code += `    "/stages/${plantId}/${i}.png",\n`;
      }
      code += `  ],\n\n`;
    }

    if (cardType === "variete") {
      code += `// ── SEED_VARIETIES entry ──\n`;
      code += `  {\n`;
      code += `    id: "${cardId}",\n`;
      code += `    plantDefId: "${f("parentPlant")}",\n`;
      code += `    shopId: "${f("shopId")}",\n`;
      code += `    name: "${f("name")}",\n`;
      code += `    emoji: "${f("emoji")}",\n`;
      code += `    price: ${f("price")},\n`;
      code += `    grams: ${f("grams")},\n`;
      code += `    description: "${f("description")}",\n`;
      code += `    image: "${imagePath}",\n`;
      code += `    unlocked: true,\n`;
      code += `    stageDurations: [${[f("stage1"), f("stage2"), f("stage3"), f("stage4")].map(Number).join(", ")}],\n`;
      code += `    realDaysToHarvest: ${f("harvestDays")},\n`;
      code += `    optimalTemp: [${f("tempMin")}, ${f("tempMax")}],\n`;
      code += `    waterNeed: ${f("waterNeed")},\n`;
      code += `    lightNeed: ${f("lightNeed")},\n`;
      code += `  },\n\n`;
    }

    if (cardType === "boutique") {
      code += `// ── SEED_SHOPS entry ──\n`;
      code += `  {\n`;
      code += `    id: "${cardId}",\n`;
      code += `    name: "${f("name")}",\n`;
      code += `    emoji: "${f("emoji")}",\n`;
      code += `    color: "${f("color")}",\n`;
      code += `    borderColor: "${f("borderColor")}",\n`;
      code += `    image: "${imagePath}",\n`;
      code += `    description: "${f("description")}",\n`;
      code += `  },\n\n`;
    }

    if (cardType === "chambre") {
      code += `// ── CHAMBRE_CATALOG entry ──\n`;
      code += `  {\n`;
      code += `    id: "${cardId}",\n`;
      code += `    name: "${f("name")}",\n`;
      code += `    widthCm: ${f("widthCm")}, heightCm: ${f("heightCm")}, depthCm: ${f("depthCm")},\n`;
      code += `    maxMiniSerres: ${f("maxMiniSerres")},\n`;
      code += `    price: ${f("price")},\n`;
      code += `    image: "${imagePath}",\n`;
      code += `    emoji: "${f("emoji")}",\n`;
      code += `    description: "${f("description")}",\n`;
      code += `    color: "${f("color")}",\n`;
      code += `  },\n\n`;
    }

    // Console commands for image generation
    code += `// ── Console Commands ──\n`;
    const prompt = `Manga style card for ${f("name") || cardId}, ${cardType} type, bold black borders, white background, cute chibi style, premium quality seed packet card, French botanical illustration`;
    code += `z-ai-generate -p "${prompt}" -o "./public${imagePath}" -s 1024x1024\n\n`;
    if (cardType === "plante" || cardType === "variete") {
      const plantId = f("parentPlant") || cardId;
      const stageLabels = ["dirt mound seed in terracotta pot", "seedling 1 leaf in terracotta pot", "seedling 2 leaves in terracotta pot", "seedling 3 leaves slightly bigger", "seedling 4 leaves in terracotta pot", "seedling 5 leaves ready to transplant"];
      for (let i = 0; i < 6; i++) {
        code += `z-ai-generate -p "Manga cel-shaded cross-hatching ${stageLabels[i]} for ${f("name") || cardId}, white background" -o "./public/stages/${plantId}/${i}.png" -s 1024x1024\n`;
      }
    }

    setCodeOutput(code);
    setShowCode(true);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codeOutput);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white p-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              🔧 Admin — Moteur de Cartes
            </h1>
            <p className="text-[10px] text-stone-400 font-bold mt-1">
              Créez des cartes pour le système BotanIA
            </p>
          </div>
          <div className="px-3 py-1.5 bg-red-600 rounded-lg border-2 border-red-400">
            <p className="text-[10px] font-black uppercase">⚠️ Page d&apos;administration — Accès restreint</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-4">
        {/* Section 1: Card Type */}
        <SectionHeader title="Type de carte" emoji="📋" />
        <div className="flex flex-wrap gap-2">
          {CARD_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setCardType(opt.key)}
              className={`px-4 py-2 rounded-xl border-2 font-black text-sm uppercase transition-all flex items-center gap-1.5
                ${cardType === opt.key
                  ? "bg-black text-white border-black shadow-[2px_2px_0_0_#000]"
                  : "bg-white text-stone-500 border-stone-200 hover:border-stone-400"
                }`}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Section 1.5: Web Search */}
        <SectionHeader title="Recherche Web IA" emoji="🔍" />
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 space-y-3">
          <p className="text-[10px] font-bold text-indigo-500 uppercase">
            Tapez un nom de boutique, variété ou plante — l'IA cherche sur le web et pré-remplit les champs
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={cardType === "boutique" ? "Ex: Kokopelli, Clause, Vilmorin..." : cardType === "variete" ? "Ex: Noire de Crimée, Géante Marmande..." : "Ex: Tomate, Carotte..."}
              className="flex-1 px-3 py-2 border-2 border-indigo-300 rounded-xl text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              onKeyDown={(e) => e.key === "Enter" && handleWebSearch()}
            />
            <button
              onClick={handleWebSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-4 py-2 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-xl border-2 border-indigo-700 font-black text-sm uppercase hover:from-indigo-400 hover:to-indigo-500 disabled:opacity-50 shadow-[2px_2px_0_0_#000] flex items-center gap-1.5"
            >
              {searching ? (
                <><span className="animate-spin">⏳</span> Recherche...</>
              ) : (
                <>🔍 Chercher</>
              )}
            </button>
            {showSearch && (
              <button
                onClick={() => { setShowSearch(false); setSearchResults([]); setSearchAiData({}); }}
                className="px-3 py-2 bg-stone-200 text-stone-600 rounded-xl border-2 border-stone-300 font-black text-xs uppercase hover:bg-stone-300"
              >
                ✕ Fermer
              </button>
            )}
          </div>

          {/* AI extracted data */}
          {searchAiData.description && (
            <div className="bg-white border-2 border-emerald-300 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-lg uppercase">🤖 Données IA</span>
              </div>
              {searchAiData.description && (
                <div className="text-xs text-stone-600">
                  <span className="font-black text-stone-800">Description:</span> {searchAiData.description}
                </div>
              )}
              {searchAiData.type && (
                <div className="text-xs text-stone-600">
                  <span className="font-black text-stone-800">Type:</span> {searchAiData.type}
                  {searchAiData.origine && <span className="text-stone-400"> · {searchAiData.origine}</span>}
                </div>
              )}
              {searchAiData.specialites && searchAiData.specialites.length > 0 && (
                <div className="text-xs text-stone-600">
                  <span className="font-black text-stone-800">Spécialités:</span>{" "}
                  {searchAiData.specialites.map((s, i) => (
                    <span key={i} className="inline-block px-1.5 py-0.5 bg-indigo-50 border border-indigo-200 rounded text-[9px] font-bold mr-1 mb-1">{s}</span>
                  ))}
                </div>
              )}
              {searchAiData.nbVarietes && (
                <div className="text-xs text-stone-600">
                  <span className="font-black text-stone-800">Variétés:</span> ~{searchAiData.nbVarietes}
                </div>
              )}
              {searchAiData.harvestDays && (
                <div className="text-xs text-stone-600">
                  <span className="font-black text-stone-800">Récolte:</span> ~{searchAiData.harvestDays}j
                  {searchAiData.tempMin && searchAiData.tempMax && <span className="text-stone-400"> · {searchAiData.tempMin}-{searchAiData.tempMax}°C</span>}
                </div>
              )}
              <button
                onClick={applySearchData}
                className={`mt-2 px-4 py-1.5 text-white rounded-xl border-2 font-black text-[10px] uppercase shadow-[2px_2px_0_0_#000] transition-all
                  ${applyFlash
                    ? "bg-gradient-to-b from-green-400 to-green-500 border-green-600 scale-105"
                    : "bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-700 hover:from-emerald-400 hover:to-emerald-500"
                  }`}
              >
                {applyFlash ? "✅ Appliqué !" : "✅ Appliquer ces données au formulaire"}
              </button>
            </div>
          )}

          {/* Search results links */}
          {showSearch && searchError && (
            <div className="px-3 py-2 bg-amber-50 border-2 border-amber-300 rounded-xl">
              <p className="text-xs font-bold text-amber-700">⚠️ {searchError}</p>
            </div>
          )}

          {showSearch && searchResults.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] font-bold text-stone-400 uppercase">Sources trouvées:</p>
              {searchResults.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 bg-white border border-indigo-100 rounded-lg hover:border-indigo-300 transition-all"
                >
                  <p className="text-[11px] font-bold text-indigo-700 truncate">{r.name}</p>
                  <p className="text-[9px] text-stone-400 truncate">{r.host_name} — {r.snippet.slice(0, 100)}...</p>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Basic Info (all cards) */}
        <SectionHeader title="Informations de base" emoji="📝" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InputField label="ID (anglais)" value={f("id")} onChange={(v) => updateField("id", v)} placeholder="tomato" />
          <InputField label="Nom (français)" value={f("name")} onChange={(v) => updateField("name", v)} placeholder="Tomate" />
          <InputField label="Emoji" value={f("emoji")} onChange={(v) => updateField("emoji", v)} placeholder="🍅" />
          <InputField label="Description" value={f("description")} onChange={(v) => updateField("description", v)} placeholder="Description..." />
        </div>

        {/* Section 3: Plant/Variety specific */}
        {(cardType === "plante" || cardType === "variete") && (
          <>
            <SectionHeader title="Plante / Variété" emoji="🌱" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {cardType === "variete" && (
                <>
                  <InputField label="Plante parent" value={f("parentPlant")} onChange={(v) => updateField("parentPlant", v)} placeholder="tomato" />
                  <InputField label="Boutique" value={f("shopId")} onChange={(v) => updateField("shopId", v)} placeholder="vilmorin" />
                  <InputField label="Grammes" value={f("grams")} onChange={(v) => updateField("grams", v)} placeholder="0.5" type="number" />
                  <InputField label="Prix (🪙)" value={f("price")} onChange={(v) => updateField("price", v)} placeholder="40" type="number" />
                </>
              )}
              <InputField label="Espacement plant (cm)" value={f("plantSpacing")} onChange={(v) => updateField("plantSpacing", v)} placeholder="50" type="number" />
              <InputField label="Espacement rang (cm)" value={f("rowSpacing")} onChange={(v) => updateField("rowSpacing", v)} placeholder="70" type="number" />
              <InputField label="Temp min (°C)" value={f("tempMin")} onChange={(v) => updateField("tempMin", v)} placeholder="18" type="number" />
              <InputField label="Temp max (°C)" value={f("tempMax")} onChange={(v) => updateField("tempMax", v)} placeholder="28" type="number" />
              <InputField label="Eau (mm/jour)" value={f("waterNeed")} onChange={(v) => updateField("waterNeed", v)} placeholder="5.0" type="number" />
              <InputField label="Lumière (h/j)" value={f("lightNeed")} onChange={(v) => updateField("lightNeed", v)} placeholder="8" type="number" />
              <InputField label="Récolte (jours)" value={f("harvestDays")} onChange={(v) => updateField("harvestDays", v)} placeholder="109" type="number" />
              <InputField label="Rés. maladies (%)" value={f("diseaseRes")} onChange={(v) => updateField("diseaseRes", v)} placeholder="45" type="number" />
              <InputField label="Rés. ravageurs (%)" value={f("pestRes")} onChange={(v) => updateField("pestRes", v)} placeholder="40" type="number" />
              <InputField label="Mois optimaux (0-11)" value={f("optimalMonths")} onChange={(v) => updateField("optimalMonths", v)} placeholder="2,3,4" />
            </div>

            <div className="mt-3">
              <label className="text-[10px] font-black uppercase text-stone-500 mb-1 block">
                Durées stades (jours): {STAGE_NAMES.map((n, i) => `${i + 1}. ${n}`).join(" / ")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <InputField
                    key={i}
                    label={STAGE_NAMES[i]}
                    value={f(`stage${i + 1}`)}
                    onChange={(v) => updateField(`stage${i + 1}`, v)}
                    placeholder={String(i === 0 ? 10 : 20)}
                    type="number"
                    small
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Section 4: Environnement specific */}
        {cardType === "environnement" && (
          <>
            <SectionHeader title="Environnement" emoji="🏠" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField label="Largeur (cm)" value={f("widthCm")} onChange={(v) => updateField("widthCm", v)} placeholder="100" type="number" />
              <InputField label="Hauteur (cm)" value={f("heightCm")} onChange={(v) => updateField("heightCm", v)} placeholder="100" type="number" />
              <InputField label="Profondeur (cm)" value={f("depthCm")} onChange={(v) => updateField("depthCm", v)} placeholder="100" type="number" />
              <InputField label="Température (°C)" value={f("temperature")} onChange={(v) => updateField("temperature", v)} placeholder="20" type="number" />
              <InputField label="Humidité (%)" value={f("humidity")} onChange={(v) => updateField("humidity", v)} placeholder="65" type="number" />
              <InputField label="Lumière (h/j)" value={f("sunlight")} onChange={(v) => updateField("sunlight", v)} placeholder="8" type="number" />
              <InputField label="Max mini serres" value={f("maxMiniSerres")} onChange={(v) => updateField("maxMiniSerres", v)} placeholder="2" type="number" />
            </div>
          </>
        )}

        {/* Section 5: Boutique specific */}
        {cardType === "boutique" && (
          <>
            <SectionHeader title="Boutique" emoji="🏪" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField label="Nom de la boutique" value={f("name")} onChange={(v) => updateField("name", v)} placeholder="Vilmorin" />
              <InputField label="Couleur gradient" value={f("color")} onChange={(v) => updateField("color", v)} placeholder="from-red-50 to-orange-50" />
              <InputField label="Couleur bordure" value={f("borderColor")} onChange={(v) => updateField("borderColor", v)} placeholder="border-red-200" />
              <InputField label="Description" value={f("description")} onChange={(v) => updateField("description", v)} placeholder="Leader français..." />
            </div>
          </>
        )}

        {/* Section 6: Chambre specific */}
        {cardType === "chambre" && (
          <>
            <SectionHeader title="Chambre de Culture" emoji="🏗️" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InputField label="Largeur (cm)" value={f("widthCm")} onChange={(v) => updateField("widthCm", v)} placeholder="60" type="number" />
              <InputField label="Hauteur (cm)" value={f("heightCm")} onChange={(v) => updateField("heightCm", v)} placeholder="140" type="number" />
              <InputField label="Profondeur (cm)" value={f("depthCm")} onChange={(v) => updateField("depthCm", v)} placeholder="60" type="number" />
              <InputField label="Max mini serres" value={f("maxMiniSerres")} onChange={(v) => updateField("maxMiniSerres", v)} placeholder="2" type="number" />
              <InputField label="Prix (🪙)" value={f("price")} onChange={(v) => updateField("price", v)} placeholder="250" type="number" />
              <InputField label="Couleur gradient" value={f("color")} onChange={(v) => updateField("color", v)} placeholder="from-green-100 to-emerald-100" />
              <InputField label="Description" value={f("description")} onChange={(v) => updateField("description", v)} placeholder="Chambre de culture..." />
            </div>
          </>
        )}

        {/* Section 7: Image Generation */}
        <SectionHeader title="Génération d&apos;images" emoji="🎨" />
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (!f("name")) return;
              setGenerating(true);
              setGenStatus("Génération en cours...");
              try {
                const prompt = `Manga style card for ${f("name")}, ${cardType} type, bold black borders, white background, cute chibi style, premium quality seed packet card, French botanical illustration`;
                const res = await fetch("/api/admin/generate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ prompt, outputPath: imagePath }),
                });
                const data = await res.json();
                setGenStatus(data.success ? `✅ ${data.output}` : `❌ ${data.error}`);
              } catch {
                setGenStatus("❌ Erreur de génération");
              }
              setGenerating(false);
            }}
            disabled={generating || !f("name")}
            className="px-4 py-2 bg-gradient-to-b from-purple-500 to-purple-600 text-white rounded-xl border-2 border-purple-700 font-black text-sm uppercase hover:from-purple-400 hover:to-purple-500 disabled:opacity-50 shadow-[2px_2px_0_0_#000]"
          >
            🎨 Générer l&apos;image principale
          </button>

          {(cardType === "plante" || cardType === "variete") && (
            <button
              onClick={async () => {
                if (!f("name")) return;
                setGenerating(true);
                setGenStatus("Génération des 6 stades...");
                const stageLabels = ["dirt mound seed in terracotta pot", "seedling 1 leaf in terracotta pot", "seedling 2 leaves in terracotta pot", "seedling 3 leaves slightly bigger", "seedling 4 leaves in terracotta pot", "seedling 5 leaves ready to transplant"];
                const plantId = f("parentPlant") || cardId;
                let statuses: string[] = [];
                for (let i = 0; i < 6; i++) {
                  try {
                    const res = await fetch("/api/admin/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        prompt: `Manga cel-shaded cross-hatching ${stageLabels[i]} for ${f("name")}, white background`,
                        outputPath: `/stages/${plantId}/${i}.png`,
                      }),
                    });
                    const data = await res.json();
                    statuses.push(data.success ? `✅ Stade ${i}` : `❌ Stade ${i}`);
                  } catch {
                    statuses.push(`❌ Stade ${i}`);
                  }
                }
                setGenStatus(statuses.join(" | "));
                setGenerating(false);
              }}
              disabled={generating || !f("name")}
              className="px-4 py-2 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white rounded-xl border-2 border-emerald-700 font-black text-sm uppercase hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 shadow-[2px_2px_0_0_#000]"
            >
              🎨 Générer les 6 stades
            </button>
          )}
        </div>
        {genStatus && (
          <div className="mt-2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-stone-600">
            {genStatus}
          </div>
        )}

        {/* Section 7.5: Save to game */}
        <SectionHeader title="Sauvegarder dans le jeu" emoji="💾" />
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 space-y-3">
          <p className="text-[10px] font-bold text-green-600 uppercase">
            Sauvegarde directement dans le jeu — pas besoin de modifier le code !
          </p>
          <button
            onClick={handleSave}
            disabled={!f("id") || !f("name")}
            className="px-4 py-2 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-xl border-2 border-green-700 font-black text-sm uppercase hover:from-green-400 hover:to-green-500 disabled:opacity-50 shadow-[2px_2px_0_0_#000]"
          >
            💾 Sauvegarder dans le jeu
          </button>
          {saveStatus && (
            <div className={`px-3 py-2 rounded-xl text-xs font-bold ${saveStatus.startsWith("✅") ? "bg-green-100 text-green-700 border border-green-300" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {saveStatus}
            </div>
          )}
          {savedCards && (
            <div className="text-[9px] text-stone-400 font-bold">
              {savedCards.shops?.length || 0} boutiques · {savedCards.varieties?.length || 0} variétés · {savedCards.plantules?.length || 0} plantules · {savedCards.seeds?.length || 0} graines
            </div>
          )}
        </div>

        {/* Section 8: Code Output */}
        <SectionHeader title="Code généré" emoji="📋" />
        <div className="flex gap-2">
          <button
            onClick={generateCode}
            className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 text-white rounded-xl border-2 border-blue-700 font-black text-sm uppercase hover:from-blue-400 hover:to-blue-500 shadow-[2px_2px_0_0_#000]"
          >
            📋 Voir le code
          </button>
          {showCode && (
            <button
              onClick={handleCopyAll}
              className="px-4 py-2 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-xl border-2 border-green-700 font-black text-sm uppercase hover:from-green-400 hover:to-green-500 shadow-[2px_2px_0_0_#000]"
            >
              📋 Copier tout
            </button>
          )}
        </div>
        {showCode && codeOutput && (
          <div className="mt-2 bg-black text-green-400 rounded-xl p-4 max-h-96 overflow-y-auto font-mono text-[11px] leading-relaxed">
            <pre className="whitespace-pre-wrap">{codeOutput}</pre>
          </div>
        )}

        {/* Section 9: Existing Cards Reference */}
        <SectionHeader title="Cartes existantes" emoji="📚" />
        <div className="space-y-4">
          {/* Existing Plants */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-400 mb-2">🌱 Plantes ({Object.keys(PLANTS).length})</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(PLANTS).map((p) => (
                <div key={p.id} className="px-2 py-1 bg-green-50 border border-green-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                  <span className="text-green-600">({p.id})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Varieties */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-400 mb-2">🏷️ Variétés ({SEED_VARIETIES.length})</h3>
            <div className="flex flex-wrap gap-2">
              {SEED_VARIETIES.map((v) => (
                <div key={v.id} className="px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <span>{v.emoji}</span>
                  <span>{v.name}</span>
                  <span className="text-amber-600">({v.id} → {v.shopId})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Shops */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-400 mb-2">🏪 Boutiques ({SEED_SHOPS.length})</h3>
            <div className="flex flex-wrap gap-2">
              {SEED_SHOPS.map((s) => (
                <div key={s.id} className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <span>{s.emoji}</span>
                  <span>{s.name}</span>
                  <span className="text-purple-600">({s.id})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Existing Chambres */}
          <div>
            <h3 className="text-xs font-black uppercase text-stone-400 mb-2">🏗️ Chambres ({CHAMBRE_CATALOG.length})</h3>
            <div className="flex flex-wrap gap-2">
              {CHAMBRE_CATALOG.map((c) => (
                <div key={c.id} className="px-2 py-1 bg-cyan-50 border border-cyan-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                  <span>{c.emoji}</span>
                  <span>{c.name}</span>
                  <span className="text-cyan-600">({c.widthCm}×{c.depthCm}×{c.heightCm}cm)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
