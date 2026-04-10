'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, BookOpen, Plus, Calendar } from 'lucide-react';
import { generateTip, type LiaTip } from '@/lib/lia-data';
import {
  loadAllPlantMemories, addObservationRecord,
  getPersonalizedTip, getDiseaseWarning, getPhenologicalSummary,
  getSeasonContext, getPlantEventSummary, addPhenologicalEvent,
  type PlantMemory, type PhenologicalEventType
} from '@/lib/garden-memory';
import {
  isINatEnabled, getINatApiKey,
} from '@/components/game/INatConsentPanel';
import INatConsentPanel from '@/components/game/INatConsentPanel';
import {
  getINatTaxonId, submitObservation, buildPhenologyDescription,
  type PhenologicalEventType as INatEventType
} from '@/lib/inaturalist';

const PHENO_TYPES: { value: PhenologicalEventType; label: string; icon: string }[] = [
  { value: 'sowing', label: '🌱 Semis', icon: '🌱' },
  { value: 'germination', label: '🌿 Levée', icon: '🌿' },
  { value: 'transplant', label: '🪴 Repiquage', icon: '🪴' },
  { value: 'flowering', label: '🌸 Floraison', icon: '🌸' },
  { value: 'fruiting', label: '🍅 Fructification', icon: '🍅' },
  { value: 'harvest', label: '🌾 Récolte', icon: '🌾' },
  { value: 'frost', label: '❄️ Gel', icon: '❄️' },
  { value: 'pest', label: '🐛 Ravageur', icon: '🐛' },
];

const OBS_CATEGORIES: { value: 'growth' | 'problem' | 'treatment' | 'weather' | 'general'; label: string }[] = [
  { value: 'growth', label: '🌱 Croissance' },
  { value: 'problem', label: '⚠️ Problème' },
  { value: 'treatment', label: '💊 Traitement' },
  { value: 'weather', label: '🌤️ Météo' },
  { value: 'general', label: '💬 Général' },
];

export default function LiaAssistant({ plants = [], weather }: { plants?: any[]; weather?: { temperature?: number; isRaining?: boolean } }) {
  const [messages, setMessages] = useState<LiaTip[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [memories, setMemories] = useState<PlantMemory[]>([]);
  const [showMemory, setShowMemory] = useState(false);
  const [showPhenology, setShowPhenology] = useState(false);
  const [memoryNote, setMemoryNote] = useState('');
  const [memoryCategory, setMemoryCategory] = useState<'growth' | 'problem' | 'treatment' | 'weather' | 'general'>('general');
  const [phenotype, setPhenotype] = useState<PhenologicalEventType>('sowing');
  const [phenodate, setPhenodate] = useState(new Date().toISOString().split('T')[0]);
  const [phenonotes, setPhenonotes] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('general');
  const [showINatPanel, setShowINatPanel] = useState(false);
  const [inatAskShown, setInatAskShown] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-give tip on init
  useEffect(() => {
    if (plants.length > 0 && messages.length === 0) {
      try {
        const tip = generateTip({ plants, weather });
        addMessage(tip);
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Periodic monitoring
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      try {
        const newTip = generateTip({ plants, weather });
        const exists = messages.find((m) => m.id === newTip.id);
        if (!exists && newTip.priority !== 'low') addMessage(newTip);
      } catch (e) { /* ignore */ }
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen, plants, weather]);

  // Load garden memories on mount
  useEffect(() => {
    loadAllPlantMemories().then(setMemories).catch(() => {});
  }, []);

  // Add personalized memory tip when memories are loaded
  useEffect(() => {
    if (memories.length === 0) return;
    const hasMemoryTip = messages.some(m => m.id.startsWith('mem-'));
    if (hasMemoryTip) return;
    for (const mem of memories) {
      if (mem.harvests.length >= 2) {
        const tip = getPersonalizedTip(mem.name, memories);
        if (tip) {
          const msg: LiaTip = { id: 'mem-' + Date.now(), type: 'general', priority: 'low', title: '📖 Mémoire du jardin', message: tip, icon: '📖' };
          setTimeout(() => addMessage(msg), 2000);
        }
        break;
      }
    }
    const warnTip = getDiseaseWarning(memories);
    if (warnTip) {
      const msg: LiaTip = { id: 'warn-' + Date.now(), type: 'disease', priority: 'medium', title: '⚠️ Alerte historique', message: warnTip, icon: '📖' };
      setTimeout(() => addMessage(msg), 3500);
    }
  }, [memories]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMessage = (tip: LiaTip) => {
    setIsTyping(true);
    setTimeout(() => { setMessages((prev) => [...prev, tip]); setIsTyping(false); }, 800);
  };

  const saveObservation = async () => {
    if (!memoryNote.trim()) return;
    const entry = { date: new Date().toISOString().split('T')[0], text: memoryNote.trim(), category: memoryCategory };
    await addObservationRecord('general', entry);
    const mems = await loadAllPlantMemories();
    setMemories(mems);
    setMemoryNote('');
    addMessage({ id: 'confirm-' + Date.now(), type: 'general', priority: 'low', title: '✅ Mémoire enregistrée', message: `Observation notée: "${entry.text}"`, icon: '📖' });
  };

  const savePhenologyEvent = async () => {
    const event = {
      type: phenotype,
      date: phenodate,
      notes: phenonotes.trim() || undefined,
    };
    await addPhenologicalEvent(selectedPlant, event);
    const mems = await loadAllPlantMemories();
    setMemories(mems);
    setPhenonotes('');
    setShowPhenology(false);
    addMessage({ id: 'phconf-' + Date.now(), type: 'general', priority: 'low', title: '📅 Événement phénologique', message: `${PHENO_TYPES.find(t => t.value === phenotype)?.label} enregistré(e) pour ${selectedPlant === 'general' ? 'une plante' : selectedPlant} le ${phenodate}.`, icon: '🌸' });

    // Ask about iNaturalist once
    if (!inatAskShown && isINatEnabled()) {
      const apiKey = getINatApiKey();
      if (apiKey) {
        const taxonId = getINatTaxonId(selectedPlant);
        if (taxonId) {
          submitObservation({
            species_guess: selectedPlant,
            taxon_id: taxonId,
            observed_on: phenodate,
            description: buildPhenologyDescription(phenotype, phenonotes),
            latitude: 0, // TODO: from GPS
            longitude: 0,
          }, apiKey).then(() => {}).catch(() => {});
        }
      }
    } else if (!inatAskShown) {
      setInatAskShown(true);
    }
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg: LiaTip = { id: 'user-' + Date.now(), type: 'general', priority: 'low', title: 'Toi', message: chatInput, icon: '👤' };
    setMessages(p => [...p, userMsg]);
    const q = chatInput;
    setChatInput('');
    setIsTyping(true);

    // ── Appel Groq (llama-3.3-70b) via ia-jardinier ──
    try {
      const key = process.env.NEXT_PUBLIC_GROQ_API_KEY;
      if (key) {
        const memCtx = memories.length > 0
          ? `\n\nMémoire jardin : ${memories.slice(0, 3).map(m => `${m.name}: ${m.averages.avgDaysToMaturity}j maturité, ${m.harvests.length} saisons`).join(' | ')}`
          : '';
        const plantCtx = plants.length > 0
          ? `\n\nPlantes actuelles : ${plants.slice(0, 5).map((p: any) => `${p.plantDefId || p.name || '?'} (J${p.daysSincePlanting || 0}, eau ${p.waterLevel || 0}%)`).join(', ')}`
          : '';
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 200,
            temperature: 0.4,
            messages: [
              { role: 'system', content: `Tu es Lia, assistante de jardinage bio française. Réponds en 2-3 phrases max, pratique et bienveillant. Tu connais la permaculture et le maraîchage.${memCtx}${plantCtx}` },
              { role: 'user', content: q }
            ]
          })
        });
        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content?.trim() || '';
          if (reply) {
            setMessages(p => [...p, { id: 'lia-' + Date.now(), type: 'general', priority: 'medium', title: '🌱 Lia', message: reply, icon: '🌱' }]);
            setIsTyping(false);
            return;
          }
        }
      }
    } catch { /* fallback local */ }

    // ── Fallback local si Groq indisponible ──
    setTimeout(() => {
      setMessages(p => [...p, genResponse(q, plants, memories)]);
      setIsTyping(false);
    }, 600);
  };

  const borderMap: Record<string, string> = {
    urgent: 'border-l-4 border-l-red-500',
    high: 'border-l-4 border-l-orange-500',
    medium: 'border-l-4 border-l-yellow-500',
    low: '',
  };

  return (<>
    <INatConsentPanel isOpen={showINatPanel} onClose={() => setShowINatPanel(false)} onConsented={() => {}} />

    {/* Floating button */}
    {!isOpen && (
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl flex items-center justify-center border-2 border-white/20"
      >
        <span className="text-2xl">🌱</span>
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{messages.length}</span>
        )}
      </motion.button>
    )}

    {/* Chat window */}
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-20 right-6 z-50 w-[360px] max-h-[500px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div className="flex-1"><h3 className="text-white font-bold">Lia</h3><p className="text-green-100 text-xs">Assistante de jardinage</p></div>
            <button onClick={() => setShowMemory(v => !v)} className="text-white/80 hover:text-white mr-1" title="Mémoire du jardin"><BookOpen className="w-4 h-4" /></button>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[260px] max-h-[320px] bg-gradient-to-b from-green-50/30 to-white">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, x: msg.icon === '👤' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} className={`flex ${msg.icon === '👤' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start gap-2 max-w-[85%] ${msg.icon === '👤' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.icon === '👤' ? 'bg-blue-500' : 'bg-green-500'}`}>{msg.icon}</div>
                  <div className={`px-3 py-2 rounded-xl text-sm ${msg.icon === '👤' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-100 shadow-sm ' + (borderMap[msg.priority] || '')}`}>
                    <p className={`text-xs mb-0.5 ${msg.icon === '👤' ? 'text-white/70' : 'text-gray-500'}`}>{msg.title}</p>
                    <p className="leading-relaxed">{msg.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">🌱</div>
                <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <motion.span animate={{ y: [-2, 0, -2] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <motion.span animate={{ y: [-2, 0, -2] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <motion.span animate={{ y: [-2, 0, -2] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Memory panel */}
          {showMemory && (
            <div className="p-3 border-t border-gray-200 bg-gradient-to-b from-amber-50/50 to-white max-h-[280px] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold flex items-center gap-1"><BookOpen className="w-4 h-4" /> Mémoire</h4>
                <button onClick={() => setShowPhenology(v => !v)} className="text-xs text-green-600 hover:text-green-700 flex items-center gap-0.5"><Calendar className="w-3 h-3" /> 📅 Événement</button>
                <button onClick={() => setShowMemory(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>

              {/* Phenological event form */}
              {showPhenology && (
                <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200 space-y-2">
                  <p className="text-xs font-medium text-green-700">📅 Nouvel événement phénologique</p>
                  <select value={selectedPlant} onChange={e => setSelectedPlant(e.target.value)}
                    className="w-full px-2 py-1 text-xs border rounded">
                    <option value="general">Général</option>
                    {plants.slice(0, 10).map((p: any) => <option key={p.plantDefId} value={p.plantDefId}>{p.name}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-1">
                    {PHENO_TYPES.map(pt => (
                      <button key={pt.value} onClick={() => setPhenotype(pt.value)}
                        className={`px-2 py-0.5 rounded text-xs ${phenotype === pt.value ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border'}`}>
                        {pt.icon}
                      </button>
                    ))}
                  </div>
                  <input type="date" value={phenodate} onChange={e => setPhenodate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border rounded" />
                  <input type="text" value={phenonotes} onChange={e => setPhenonotes(e.target.value)}
                    placeholder="Notes (optionnel)"
                    className="w-full px-2 py-1 text-xs border rounded" />
                  <div className="flex gap-1">
                    <button onClick={savePhenologyEvent} className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 text-xs font-medium">Enregistrer</button>
                    <button onClick={() => setShowPhenology(false)} className="px-2 py-1 text-xs text-gray-500">Annuler</button>
                  </div>
                  {inatAskShown && !isINatEnabled() && (
                    <button onClick={() => setShowINatPanel(true)} className="w-full text-xs text-amber-600 hover:text-amber-700 font-medium mt-1">
                      🦉 Activer le partage iNaturalist ?
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-1 flex-wrap mb-2">
                {OBS_CATEGORIES.map(cat => (
                  <button key={cat.value} onClick={() => setMemoryCategory(cat.value)}
                    className={`px-2 py-0.5 rounded text-xs ${memoryCategory === cat.value ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <input type="text" value={memoryNote} onChange={e => setMemoryNote(e.target.value)}
                  placeholder="Ex: Tomate du rang 3, jaunissement..."
                  className="flex-1 px-2 py-1.5 border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                  onKeyDown={e => e.key === 'Enter' && saveObservation()} />
                <button onClick={saveObservation} className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-2 py-1.5"><Plus className="w-4 h-4" /></button>
              </div>
              {memories.length > 0 && (
                <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                  {memories.slice(0, 8).map(mem => (
                    <div key={mem.plantId} className="text-xs p-1.5 bg-white rounded border">
                      <span className="font-medium">{mem.name}</span>
                      <span className="text-gray-400 ml-1">({mem.harvests.length} rép.)</span>
                      {mem.events.length > 0 && <span className="ml-1 text-green-500">📅{mem.events.length}</span>}
                      {mem.harvests.length >= 2 && <span className="text-green-600 ml-1">→ {mem.averages.avgDaysToMaturity}j</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="p-2.5 border-t border-gray-200 flex gap-2">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Pose une question à Lia..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-sm" />
            <button onClick={handleSend} disabled={!chatInput.trim()} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg px-3 transition"><Send className="w-4 h-4" /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>);
}

function genResponse(input: string, plants: any[], memories: PlantMemory[]): LiaTip {
  const l = input.toLowerCase();

  // Phenological questions
  const phenKeywords = ['fleur', 'floraison', 'semis', 'levée', 'récolte', 'gel', 'phénolog'];
  for (const kw of phenKeywords) {
    if (l.includes(kw)) {
      for (const mem of memories) {
        // What type of event was asked about?
        let targetType: PhenologicalEventType | null = null;
        if (l.includes('fleur') || l.includes('floraison')) targetType = 'flowering';
        else if (l.includes('semis')) targetType = 'sowing';
        else if (l.includes('levée') || l.includes('germin')) targetType = 'germination';
        else if (l.includes('gel')) targetType = 'frost';
        else if (l.includes('récolte')) targetType = 'harvest';
        else if (l.includes('phénolog')) targetType = null;

        if (targetType) {
          const summary = getPlantEventSummary(mem.name, targetType, memories);
          if (summary) return { id: 'phen-' + Date.now(), type: 'general', priority: 'medium', title: '📅 Phénologie', message: summary, icon: '🌸' };
        } else {
          const summary = getPhenologicalSummary(mem.name, memories);
          if (summary) return { id: 'phen-' + Date.now(), type: 'general', priority: 'medium', title: '📅 Phénologie', message: summary, icon: '🌸' };
        }
      }
    }
  }

  // Season context
  if (l.includes('saison') || l.includes('combien de')) {
    for (const mem of memories) {
      const ctx = getSeasonContext(mem.name, memories);
      if (ctx) return { id: 'season-' + Date.now(), type: 'general', priority: 'low', title: '📆 Saisons', message: ctx, icon: '🌱' };
    }
  }

  // Plant with memory
  for (const mem of memories) {
    if (l.includes(mem.name.toLowerCase()) && mem.harvests.length >= 2) {
      return { id: 'memres-' + Date.now(), type: 'general', priority: 'low', title: `📖 ${mem.name}`, message: `D'après ${mem.harvests.length} saisons sur ton terrain: maturité en ~${mem.averages.avgDaysToMaturity}j, rendement ~${mem.averages.avgYield} kg/m².`, icon: '📖' };
    }
  }

  const r: [string[], LiaTip][] = [
    [['arroser', 'eau', 'water'], { id: 'rw', type: 'water', priority: 'medium', title: '💧 Arrosage', message: "Arrose tôt le matin ou tard le soir pour limiter l'évaporation.", icon: '🌱' }],
    [['maladie', 'malade'], { id: 'rd', type: 'disease', priority: 'high', title: '🦠 Maladies', message: "Isole les plantes atteintes et vérifie l'humidité.", icon: '🌱' }],
    [['récolte', 'recolt'], { id: 'rh', type: 'harvest', priority: 'medium', title: '🌾 Récolte', message: "Récolte quand les fruits sont colorés et légèrement souples.", icon: '🌱' }],
    [['serre', 'intérieur'], { id: 'rg', type: 'general', priority: 'medium', title: '🏡 Serre', message: "Aère quotidiennement. Maintiens 18-25°C.", icon: '🌱' }],
    [['mémoire', 'historique', 'saison'], { id: 'rm', type: 'general', priority: 'low', title: '📖 Mémoire', message: "Je retiens tout ce que tu me dis sur tes plantes. Plus j'ai de données, plus mes conseils sont personnalisés !", icon: '🌱' }],
  ];
  for (const [ks, v] of r) if (ks.some((k) => l.includes(k))) return v;
  return { id: 'rd-' + Date.now(), type: 'general', priority: 'low', title: '🌱 Lia', message: ['Questionne-moi sur le jardinage !', 'Le jardinage demande de la patience.', 'As-tu arrosé tes tes plantes ?'][Math.floor(Math.random() * 3)], icon: '🌱' };
}
