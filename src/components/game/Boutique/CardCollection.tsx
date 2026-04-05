"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Lock, Star, X, Filter } from 'lucide-react';
import type { SeedCard, CardRarity } from './PacketOpener';
import { SEED_CATALOG } from '@/store/game-store';

interface CardCollectionProps {
  collectedCards: Record<string, SeedCard>;
  onClose: () => void;
}

const RARITY_ORDER: CardRarity[] = ['legendaire', 'epique', 'rare', 'commune'];
const RARITY_LABELS: Record<CardRarity, string> = {
  commune: 'Commune',
  rare: 'Rare',
  epique: 'Épique',
  legendaire: 'Légendaire',
};

const RARITY_COLORS: Record<CardRarity, { bg: string; border: string; glow: string }> = {
  commune:    { bg: '#f5f5f5', border: '#d4d4d4', glow: '#d4d4d4' },
  rare:       { bg: '#dbeafe', border: '#3b82f6', glow: '#3b82f6' },
  epique:     { bg: '#ede9fe', border: '#8b5cf6', glow: '#8b5cf6' },
  legendaire: { bg: '#fef3c7', border: '#f59e0b', glow: '#fbbf24' },
};

export function CardCollection({ collectedCards, onClose }: CardCollectionProps) {
  const [filter, setFilter] = useState<CardRarity | 'all'>('all');
  const [selectedCard, setSelectedCard] = useState<SeedCard | null>(null);

  const allCards = SEED_CATALOG.filter((s) => s.id.startsWith('packet-')).map((s) => ({
    id: s.id,
    name: s.name,
    emoji: s.emoji,
    brand: s.brand,
    plantDefId: s.plantDefId,
    cardAsset: s.cardImage,
    packetAsset: s.packetImage,
    rarity: getRarityForCard(s.id),
  }));

  const totalCards = allCards.length;
  const collectedCount = Object.keys(collectedCards).length;
  const completionPercent = totalCards > 0 ? Math.round((collectedCount / totalCards) * 100) : 0;

  const filteredCards = filter === 'all'
    ? allCards
    : allCards.filter((c) => c.rarity === filter);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl w-full max-w-4xl h-[90vh] overflow-hidden border-4 border-amber-900 shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-black tracking-tight">📖 Collection de Cartes</h2>
              <p className="text-amber-200 text-sm font-bold">
                {collectedCount}/{totalCards} cartes ({completionPercent}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-amber-600 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-3 bg-amber-900/20">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Filtres */}
        <div className="p-3 flex gap-2 flex-wrap border-b border-amber-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-amber-800 text-white shadow'
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            Toutes ({totalCards})
          </button>
          {RARITY_ORDER.map((rarity) => {
            const count = allCards.filter((c) => c.rarity === rarity).length;
            return (
              <button
                key={rarity}
                onClick={() => setFilter(rarity)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === rarity
                    ? 'text-white shadow'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: filter === rarity ? RARITY_COLORS[rarity].border : RARITY_COLORS[rarity].bg,
                  color: filter === rarity ? 'white' : RARITY_COLORS[rarity].border,
                }}
              >
                {RARITY_LABELS[rarity]} ({count})
              </button>
            );
          })}
        </div>

        {/* Grille de cartes */}
        <div className="p-4 overflow-y-auto h-[calc(100%-180px)]">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            <AnimatePresence>
              {filteredCards.map((card) => {
                const isCollected = !!collectedCards[card.id];
                const colors = RARITY_COLORS[card.rarity];

                return (
                  <motion.div
                    key={card.id}
                    layout
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: isCollected ? 1.1 : 1 }}
                    onClick={() => isCollected && setSelectedCard(card)}
                    className={`relative aspect-[3/4] rounded-xl border-2 overflow-hidden cursor-pointer transition-shadow ${
                      isCollected ? 'shadow-lg hover:shadow-xl' : 'grayscale opacity-50'
                    }`}
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                    }}
                  >
                    {isCollected ? (
                      <>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl">{card.emoji}</span>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <p className="text-[8px] text-white font-bold truncate text-center">
                            {card.name}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Carte sélectionnée */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCard(null)}
            >
              <motion.div
                className="relative w-64 h-80 rounded-2xl border-4 overflow-hidden"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                style={{
                  backgroundColor: RARITY_COLORS[selectedCard.rarity].bg,
                  borderColor: RARITY_COLORS[selectedCard.rarity].border,
                }}
              >
                <div className="text-center py-2 text-xs font-bold uppercase tracking-wider border-b-2"
                  style={{ borderColor: RARITY_COLORS[selectedCard.rarity].border }}>
                  {selectedCard.brand}
                </div>
                <div className="flex items-center justify-center h-48">
                  <img
                    src={selectedCard.cardAsset}
                    alt={selectedCard.name}
                    className="w-28 h-28 object-contain"
                  />
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 p-3 text-center"
                  style={{ backgroundColor: RARITY_COLORS[selectedCard.rarity].border }}
                >
                  <p className="text-white font-black">{selectedCard.name}</p>
                  <p className="text-2xl mt-1">{selectedCard.emoji}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Helper pour déterminer la rareté d'une carte
function getRarityForCard(cardId: string): CardRarity {
  // Légendaires
  if (cardId.includes('blackk') || cardId.includes('roseberne')) return 'legendaire';
  // Épiques
  if (cardId.includes('cherokee') || cardId.includes('ciflorette') || cardId.includes('genoveois')) return 'epique';
  // Rares
  if (cardId.includes('marmande') || cardId.includes('butternut') || cardId.includes('douxfrance')) return 'rare';
  // Commune (par défaut)
  return 'commune';
}
