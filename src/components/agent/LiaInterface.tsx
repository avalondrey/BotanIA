/**
 * LiaInterface — Chat interface for Lia (BotanIA AI assistant)
 *
 * When Super IA Locale is active: uses Ollama + Qdrant (RAG)
 * Otherwise: uses existing Groq/Ollama fallback chain
 */

'use client';

import { useRef, useState } from 'react';
import { useAgent } from '@/lib/hooks/useAgent';
import { useMissingSprites } from '@/hooks/useMissingSprites';
import { LiaStatusIndicator } from './LiaStatusIndicator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type LiaTab = 'chat' | 'suggestions' | 'tasks';

interface LiaInterfaceProps {
  initialOpen?: boolean;
  className?: string;
}

export function LiaInterface({ initialOpen = true, className = '' }: LiaInterfaceProps) {
  const { ask, messages, isThinking, isActive, modeLabel, runProactiveScan, pendingSuggestions, notifications } = useAgent();
  const { missingSprites } = useMissingSprites();
  const [generatingSprite, setGeneratingSprite] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<LiaTab>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    const question = input.trim();
    setInput('');
    await ask(question);
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const generateSprite = async (plantDefId: string, isTree = false) => {
    setGeneratingSprite(plantDefId);
    try {
      const res = await fetch('/api/generate-sprite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantDefId, stage: 1, isTree }),
      });
      const data = await res.json();
      if (data.success) {
        await ask(`J'ai généré le sprite pour ${plantDefId}. Le prompt est: "${data.prompt}". Utilise Qwen 3.5 ou une autre IA de génération d'image pour créer le sprite et enregistre-le dans /public/plants/`);
      }
    } finally {
      setGeneratingSprite(null);
    }
  };

  const analyzeHologram = async () => {
    // Appel direct Groq — contourne le RAG/embeddings (pas nécessaire ici)
    const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

    const res = await fetch('/api/analyze-hologram');
    const data = await res.json();

    if (data.error) {
      await ask(`Erreur lors de l'analyse de HologramEvolution: ${data.error}`);
      return;
    }

    // Résumé compact pour éviter de surcharger le contexte
    const plantIds = [...(data.hologramContent.matchAll(/^  (\w+):\s*\{/gm) || [])].map((m: RegExpMatchArray) => m[1]).slice(0, 30);
    const fnNames = [...(data.hologramContent.matchAll(/^export function (\w+)/gm) || [])].map((m: RegExpMatchArray) => m[1]);
    const prompt = `Tu es Lia, assistante BotanIA. Analyse rapide de HologramEvolution.tsx :

Plantes dans PLANT_CARDS (${plantIds.length}) : ${plantIds.join(', ')}

Fonctions exportées : ${fnNames.join(', ')}

Données semences (extrait) : ${(data.seedSummary || '').slice(0, 800)}

En 5 points max, liste les incohérences ou manques entre PLANT_CARDS et les fonctions. Sois concis.`;

    // Si Groq dispo : appel direct sans passer par RAG
    if (groqKey) {
      try {
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            max_tokens: 500,
            temperature: 0.3,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const reply = groqData.choices?.[0]?.message?.content?.trim() || 'Aucune réponse';
          // Injecter directement dans les messages sans passer par ask() → pas d'embedding
          const { addMessage } = await import('@/store/agent-store').then(m => ({ addMessage: m.useAgentStore.getState().addMessage }));
          addMessage({ role: 'user', content: '🔍 Lancer l\'analyse HologramEvolution' });
          addMessage({ role: 'assistant', content: reply, engine: 'groq' });
          return;
        }
      } catch { /* fallback ask */ }
    }

    // Fallback : passe par ask() (peut échouer si Ollama KO)
    await ask(prompt);
  };

  const unreadSuggestions = pendingSuggestions.length;
  const unreadNotifications = notifications.length;

  return (
    <div className={`flex flex-col bg-background border rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌿</span>
          <div>
            <p className="font-semibold text-sm">Lia</p>
            <div className="flex items-center gap-1">
              <LiaStatusIndicator />
              <span className="text-xs text-muted-foreground" suppressHydrationWarning>{modeLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={runProactiveScan}
            title="Analyser le jardin maintenant"
            className="text-xs"
          >
            🔄
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-muted/20">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 px-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'chat' ? 'border-green-500 text-green-700 bg-green-50' : 'border-transparent text-muted-foreground hover:bg-muted/30'
          }`}
        >
          💬 Chat
        </button>
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 py-2 px-3 text-xs font-bold border-b-2 transition-colors relative ${
            activeTab === 'suggestions' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : 'border-transparent text-muted-foreground hover:bg-muted/30'
          }`}
        >
          💡 Suggestions {unreadSuggestions > 0 && <Badge variant="destructive" className="ml-1 text-[8px] px-1 py-0">{unreadSuggestions}</Badge>}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2 px-3 text-xs font-bold border-b-2 transition-colors relative ${
            activeTab === 'tasks' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-transparent text-muted-foreground hover:bg-muted/30'
          }`}
        >
          📋 Tâches
        </button>
      </div>

      {/* Tab: Chat */}
      {activeTab === 'chat' && (
        <>
          <ScrollArea className="flex-1 min-h-0 p-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-2xl mb-2">🌿</p>
                <p className="text-sm text-muted-foreground">
                  Salut! Je suis Lia, ton assistante botanique.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isActive
                    ? 'Mon IA locale est active, pose-moi tes questions!'
                    : 'Active le mode Super IA Locale pour mes capacités complètes!'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === 'assistant' && <span>🌿</span>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                      🌿 Lia réfléchit...
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={scrollRef} />
          </ScrollArea>

          {/* Chat input */}
          <form onSubmit={handleSubmit} className="p-3 border-t bg-muted/20">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pose une question à Lia..."
                className="flex-1 min-h-[60px] text-sm resize-none"
                disabled={isThinking}
              />
              <Button type="submit" size="sm" disabled={isThinking || !input.trim()} className="self-end">
                →
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Tab: Suggestions */}
      {activeTab === 'suggestions' && (
        <ScrollArea className="flex-1 max-h-96 p-3">
          {pendingSuggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <p className="text-2xl mb-2">💡</p>
              <p className="text-sm text-muted-foreground">Aucune suggestion pour le moment</p>
              <p className="text-xs text-muted-foreground mt-1">Lia analyse ton jardin...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingSuggestions.map((sug) => {
                const categoryIcons: Record<string, string> = {
                  water: '💧', plant: '🌱', calendar: '📅', disease: '🦠', purchase: '🛒', harvest: '⚡',
                };
                const priorityColors: Record<string, string> = {
                  critical: 'border-l-red-500 bg-red-50',
                  high: 'border-l-orange-500 bg-orange-50',
                  medium: 'border-l-yellow-500 bg-yellow-50',
                  low: 'border-l-green-500 bg-green-50',
                };
                return (
                  <div key={sug.id} className={`p-2 rounded border-l-4 text-xs ${priorityColors[sug.priority] || 'border-l-gray-500'}`}>
                    <div className="flex items-center gap-1 font-bold">
                      <span>{categoryIcons[sug.category] || '💡'}</span>
                      <span>{sug.title}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{sug.description}</p>
                    {sug.reasoning && <p className="text-muted-foreground mt-0.5 italic text-[10px]">→ {sug.reasoning}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      )}

      {/* Tab: Tâches */}
      {activeTab === 'tasks' && (
        <ScrollArea className="flex-1 max-h-96 p-3">
          <div className="space-y-3">
            {/* Notifications alerts */}
            {notifications.length > 0 && (
              <div>
                <p className="text-xs font-bold text-red-600 mb-2 flex items-center gap-1">
                  🚨 Alertes ({notifications.length})
                </p>
                {notifications.map((n) => (
                  <div key={n.id} className="p-2 bg-red-50 border border-red-200 rounded text-xs mb-1">
                    <span className="font-bold">{n.title}</span>
                    <p className="text-muted-foreground mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Logiciel tasks — Lia proactively detects issues */}
            <div>
              <p className="text-xs font-bold text-blue-600 mb-2 flex items-center gap-1">
                💻 Tâches Logiciel
              </p>

              {/* Missing sprites */}
              {missingSprites.size > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-medium text-blue-700 mb-1">🖼️ Sprites manquants</p>
                  {[...missingSprites].map((plantDefId) => (
                    <div key={plantDefId} className="p-2 bg-blue-50 border border-blue-200 rounded text-xs mb-1">
                      <p className="font-medium">Sprite {plantDefId} manquant</p>
                      <p className="text-muted-foreground mt-0.5">Le sprite pour {plantDefId} n&apos;a pas été trouvé dans /public/plants/</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-1 text-[10px] h-auto py-1 px-2"
                        disabled={generatingSprite === plantDefId}
                        onClick={() => generateSprite(plantDefId)}
                      >
                        {generatingSprite === plantDefId ? '⏳...' : '🖼️ Générer le sprite'}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs mb-1">
                <p className="font-medium">Analyser HologramEvolution</p>
                <p className="text-muted-foreground mt-0.5">Vérifier que toutes les plantes du CARD_DATA sont bien intégrées dans le moteur de calcul.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-1 text-[10px] h-auto py-1 px-2"
                  onClick={() => analyzeHologram()}
                >
                  🔍 Lancer l&apos;analyse
                </Button>
              </div>

              {missingSprites.size === 0 && (
                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <p className="font-medium">✅ Tout sembleOK</p>
                  <p className="text-muted-foreground mt-0.5">Aucun sprite manquant détecté. Lia continue de scanner...</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
