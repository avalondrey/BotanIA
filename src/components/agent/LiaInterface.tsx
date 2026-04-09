/**
 * LiaInterface — Chat interface for Lia (BotanIA AI assistant)
 *
 * When Super IA Locale is active: uses Ollama + Qdrant (RAG)
 * Otherwise: uses existing Groq/Ollama fallback chain
 */

'use client';

import { useRef, useState } from 'react';
import { useAgent } from '@/lib/hooks/useAgent';
import { LiaPanel } from './LiaPanel';
import { LiaStatusIndicator } from './LiaStatusIndicator';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface LiaInterfaceProps {
  /** Initial open/closed state */
  initialOpen?: boolean;
  /** Class name */
  className?: string;
}

export function LiaInterface({ initialOpen = false, className = '' }: LiaInterfaceProps) {
  const { ask, messages, isThinking, isActive, modeLabel, runProactiveScan } = useAgent();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(initialOpen);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    const question = input.trim();
    setInput('');
    await ask(question);
    // Scroll to bottom after response
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
              <span className="text-xs text-muted-foreground">{modeLabel}</span>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs"
          >
            {isOpen ? '▼' : '▲'}
          </Button>
        </div>
      </div>

      {/* Suggestions (compact) */}
      {isOpen && <LiaPanel compact />}

      {/* Chat messages */}
      {isOpen && (
        <>
          <ScrollArea className="flex-1 max-h-80 p-3">
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
                        <div className="flex-1">
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          {msg.engine && msg.role === 'assistant' && (
                            <p className="text-xs mt-1 opacity-60">
                              via {msg.engine === 'ollama-qdrant' ? 'Ollama + Qdrant' : msg.engine}
                            </p>
                          )}
                        </div>
                        {msg.role === 'user' && <span>👤</span>}
                      </div>
                      <p className="text-xs mt-1 opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span>🌿</span>
                        <div className="flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce delay-75">.</span>
                          <span className="animate-bounce delay-150">.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pose une question à Lia..."
                className="min-h-[60px] text-sm resize-none"
                disabled={isThinking}
                rows={2}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isThinking}
                className="h-auto"
              >
                {isThinking ? '...' : 'Envoyer'}
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <QuickQuestion
                onClick={(q) => {
                  setInput(q);
                  ask(q);
                }}
                disabled={isThinking}
              />
            </div>
          </form>
        </>
      )}
    </div>
  );
}

// ─── Quick question buttons ─────────────────────────────────────────────────

function QuickQuestion({
  onClick,
  disabled,
}: {
  onClick: (q: string) => void;
  disabled: boolean;
}) {
  const questions = [
    { label: '🌱 Arrosage?', q: 'Mes tomates ont besoin de combien d\'eau?' },
    { label: '🦠 Maladie?', q: 'Pourquoi mes feuilles ont des taches jaunes?' },
    { label: '📅 Calendrier', q: 'Quest-ce que je dois semer ce mois-ci?' },
  ];

  return (
    <>
      {questions.map(({ label, q }) => (
        <Button
          key={q}
          variant="outline"
          size="sm"
          onClick={() => onClick(q)}
          disabled={disabled}
          className="text-xs"
        >
          {label}
        </Button>
      ))}
    </>
  );
}
