'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, BookOpen, Plus } from 'lucide-react';
import { generateTip, type LiaTip } from '@/lib/lia-data';
import { loadAllPlantMemories, addObservationRecord, getPersonalizedTip, getDiseaseWarning, type PlantMemory } from '@/lib/garden-memory';

export default function LiaAssistant({ plants = [], weather }: { plants?: any[]; weather?: { temperature?: number; isRaining?: boolean } }) {
  const [messages, setMessages] = useState<LiaTip[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [memories, setMemories] = useState<PlantMemory[]>([]);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryNote, setMemoryNote] = useState('');
  const [memoryCategory, setMemoryCategory] = useState<'growth' | 'problem' | 'treatment' | 'weather' | 'general'>('general');
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
    // Check if we already added a memory tip recently
    const hasMemoryTip = messages.some(m => m.id.startsWith('mem-'));
    if (hasMemoryTip) return;
    // Add personalized tip for first plant with data
    for (const mem of memories) {
      if (mem.harvests.length >= 2) {
        const tip = getPersonalizedTip(mem.name, memories);
        if (tip) {
          const msg: LiaTip = {
            id: 'mem-' + Date.now(),
            type: 'general',
            priority: 'low',
            title: '📖 Mémoire du jardin',
            message: tip,
            icon: '📖',
          };
          setTimeout(() => addMessage(msg), 2000);
        }
        break;
      }
    }
    const warnTip = getDiseaseWarning(memories);
    if (warnTip) {
      const msg: LiaTip = {
        id: 'warn-' + Date.now(),
        type: 'disease',
        priority: 'medium',
        title: '⚠️ Alerte historique',
        message: warnTip,
        icon: '📖',
      };
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
    const confirmMsg: LiaTip = {
      id: 'confirm-' + Date.now(), type: 'general', priority: 'low',
      title: '✅ Mémoire enregistrée', message: `Observation notée: "${entry.text}"`, icon: '📖',
    };
    addMessage(confirmMsg);
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const userMsg: LiaTip = {
      id: 'user-' + Date.now(),
      type: 'general', priority: 'low', title: 'Toi', message: chatInput, icon: '👤',
    };
    setMessages((p) => [...p, userMsg]);
    setChatInput('');
    setIsTyping(true);
    setTimeout(() => {
      setMessages((p) => [...p, genResponse(chatInput, plants, memories)]);
      setIsTyping(false);
    }, 1200);
  };

  const borderMap: Record<string, string> = {
    urgent: 'border-l-4 border-l-red-500',
    high: 'border-l-4 border-l-orange-500',
    medium: 'border-l-4 border-l-yellow-500',
    low: '',
  };

  return (<>
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
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {messages.length}
          </span>
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
            {messages.map((msg, idx) => (
              <motion.div key={msg.id} initial={{ opacity: 0, x: msg.icon === '👤' ? 20 : -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={`flex ${msg.icon === '👤' ? 'justify-end' : 'justify-start'}`}>
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
            <div className="p-3 border-t border-gray-200 bg-gradient-to-b from-amber-50/50 to-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold flex items-center gap-1"><BookOpen className="w-4 h-4" /> Mémoire du jardin</h4>
                <button onClick={() => setShowMemory(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-gray-500 mb-2">Note une observation pour que Lia apprenne de ton jardin.</p>
              <div className="flex gap-1 flex-wrap mb-2">
                {(['general', 'growth', 'problem', 'treatment', 'weather'] as const).map(cat => (
                  <button key={cat} onClick={() => setMemoryCategory(cat)}
                    className={`px-2 py-0.5 rounded text-xs ${memoryCategory === cat ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    {cat === 'growth' ? '🌱 Croissance' : cat === 'problem' ? '⚠️ Problème' : cat === 'treatment' ? '💊 Traitement' : cat === 'weather' ? '🌤️ Météo' : '💬 Général'}
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
                <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                  {memories.slice(0, 5).map(mem => (
                    <div key={mem.plantId} className="text-xs p-1.5 bg-white rounded border">
                      <span className="font-medium">{mem.name}</span>
                      <span className="text-gray-400 ml-1">({mem.harvests.length} récolte{mem.harvests.length !== 1 ? 's' : ''})</span>
                      {mem.harvests.length >= 2 && (
                        <span className="text-green-600 ml-1">→ {mem.averages.avgDaysToMaturity}j avg</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="p-2.5 border-t border-gray-200 flex gap-2">
            <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Pose une question à Lia..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-sm" />
            <button onClick={handleSend} disabled={!chatInput.trim()} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg px-3 transition">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </>);
}

function genResponse(input: string, plants: any[], memories: PlantMemory[]): LiaTip {
  const l = input.toLowerCase();

  // Check if user asks about a plant that has memory data
  for (const mem of memories) {
    if (l.includes(mem.name.toLowerCase()) && mem.harvests.length >= 2) {
      return {
        id: 'memres-' + Date.now(),
        type: 'general',
        priority: 'low',
        title: `📖 ${mem.name}`,
        message: `D'après ${mem.harvests.length} saisons sur ton terrain: maturité en ~${mem.averages.avgDaysToMaturity}j, rendement ~${mem.averages.avgYield} kg/m².`,
        icon: '📖',
      };
    }
  }

  const r: [string[], LiaTip][] = [
    [['arroser', 'eau', 'water'], { id: 'rw', type: 'water', priority: 'medium', title: '💧 Arrosage', message: "Arrose tôt le matin ou tard le soir pour limiter l'évaporation.", icon: '🌱' }],
    [['maladie', 'malade'], { id: 'rd', type: 'disease', priority: 'high', title: '🦠 Maladies', message: "Isole les plantes atteintes et vérifie l'humidité.", icon: '🌱' }],
    [['récolte', 'recolt'], { id: 'rh', type: 'harvest', priority: 'medium', title: '🌾 Récolte', message: "Récolte quand les fruits sont colorés et légèrement souples.", icon: '🌱' }],
    [['serre', 'intérieur'], { id: 'rg', type: 'general', priority: 'medium', title: '🏡 Serre', message: "Aère quotidiennement. Maintiens 18-25°C.", icon: '🌱' }],
    [['mémoire', 'historique', 'saison'], { id: 'rm', type: 'general', priority: 'low', title: '📖 Mémoire', message: "Je retiens tout ce que tu me dis sur tes plantes. Plus j'ai de données, plus mes conseils sont personnalisés !", icon: '📖' }],
  ];
  for (const [ks, v] of r) if (ks.some((k) => l.includes(k))) return v;
  return { id: 'rd-' + Date.now(), type: 'general', priority: 'low', title: '🌱 Lia', message: ['Questionne-moi sur le jardinage !', 'Le jardinage demande de la patience.', 'As-tu arrosé tes plantes ?'][Math.floor(Math.random() * 3)], icon: '🌱' };
}
