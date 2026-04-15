"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Star, Zap, Crown } from 'lucide-react';

// Types
export type CardRarity = 'commune' | 'rare' | 'epique' | 'legendaire';

export interface SeedCard {
  id: string;
  name: string;
  emoji: string;
  brand: string;
  plantDefId: string;
  cardAsset: string;
  packetAsset: string;
  rarity: CardRarity;
}

export interface SeedPacket {
  id: string;
  name: string;
  packetAsset: string;
  cardData: SeedCard;
  price: number;
}

interface PacketOpenerProps {
  packet: SeedPacket;
  onCardCollected: (card: SeedCard) => void;
  onClose: () => void;
}

// Couleurs par rareté
const RARITY_COLORS: Record<CardRarity, { bg: string; border: string; glow: string; text: string }> = {
  commune:    { bg: '#f5f5f5', border: '#d4d4d4', glow: '#d4d4d4', text: '#525252' },
  rare:       { bg: '#dbeafe', border: '#3b82f6', glow: '#3b82f6', text: '#1e40af' },
  epique:     { bg: '#ede9fe', border: '#8b5cf6', glow: '#8b5cf6', text: '#5b21b6' },
  legendaire: { bg: '#fef3c7', border: '#f59e0b', glow: '#fbbf24', text: '#92400e' },
};

// Configuration gacha par type de pack
const GACHA_RATES = {
  standard: { commune: 70, rare: 25, epique: 4.5, legendaire: 0.5 },
  bio:      { commune: 50, rare: 35, epique: 12, legendaire: 3 },
};

function rollRarity(packType: 'standard' | 'bio' = 'standard'): CardRarity {
  const rates = GACHA_RATES[packType];
  const roll = Math.random() * 100;
  let cumulative = 0;
  for (const [rarity, chance] of Object.entries(rates)) {
    cumulative += chance;
    if (roll < cumulative) return rarity as CardRarity;
  }
  return 'commune';
}

export function PacketOpener({ packet, onCardCollected, onClose }: PacketOpenerProps) {
  const [stage, setStage] = useState<'closed' | 'opening' | 'revealed'>('closed');
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  // Générer des particules
  const generateSparkles = () => {
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      emoji: ['✨', '🌱', '💫', '⭐', '🌿'][Math.floor(Math.random() * 5)],
    }));
    setSparkles(newSparkles);
    setTimeout(() => setSparkles([]), 1500);
  };

  const handleOpen = () => {
    setStage('opening');
    generateSparkles();

    // 800ms d'animation sparkle
    setTimeout(() => {
      setStage('revealed');
      onCardCollected(packet.cardData);
    }, 1200);
  };

  const rarity = packet.cardData.rarity;
  const colors = RARITY_COLORS[rarity];

  // Animation spéciale pour légendaire
  const isLegendary = rarity === 'legendaire';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Bouton fermer */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-8 h-8" />
      </button>

      <AnimatePresence mode="wait">
        {/* 📦 Paquet fermé */}
        {stage === 'closed' && (
          <motion.div
            key="closed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative cursor-pointer"
            onClick={handleOpen}
          >
            <motion.img
              src={packet.packetAsset}
              alt={packet.name}
              className="object-contain drop-shadow-2xl" style={{ width: 'var(--ui-packet-image)', height: 'var(--ui-packet-image)' }}
              whileHover={{ scale: 1.08, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
            />
            <motion.p
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white font-bold text-sm"
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Cliquez pour ouvrir !
            </motion.p>
          </motion.div>
        )}

        {/* ✨ Animation d'ouverture */}
        {stage === 'opening' && (
          <motion.div
            key="opening"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 0] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative" style={{ width: 'var(--ui-packet-image)', height: 'var(--ui-packet-image)' }}
          >
            <img
              src={packet.packetAsset}
              alt={packet.name}
              className="w-full h-full object-contain"
            />

            {/* Particules sparkle */}
            {sparkles.map((s) => (
              <motion.span
                key={s.id}
                className="absolute text-2xl pointer-events-none"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {s.emoji}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* 🃏 Card révélée */}
        {stage === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative"
          >
            {/* Badge rareté */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white font-black text-sm uppercase tracking-wider shadow-lg"
              style={{ backgroundColor: colors.border, boxShadow: `0 0 20px ${colors.glow}` }}
            >
              {rarity === 'legendaire' && <Crown className="w-4 h-4 inline mr-1" />}
              {rarity === 'epique' && <Zap className="w-4 h-4 inline mr-1" />}
              {rarity === 'rare' && <Star className="w-4 h-4 inline mr-1" />}
              {rarity}
            </motion.div>

            {/* Glow effect pour légendaire */}
            {isLegendary && (
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{
                  boxShadow: [
                    '0 0 20px #fbbf24, 0 0 40px #fbbf24, 0 0 60px #fbbf24',
                    '0 0 40px #fbbf24, 0 0 80px #fbbf24, 0 0 120px #fbbf24',
                    '0 0 20px #fbbf24, 0 0 40px #fbbf24, 0 0 60px #fbbf24',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}

            {/* La carte */}
            <motion.div
              className="relative w-72 h-96 rounded-3xl border-4 overflow-hidden"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                boxShadow: `0 0 30px ${colors.glow}`,
              }}
            >
              {/* Header avec marque */}
              <div
                className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider"
                style={{ color: colors.text, borderBottom: `2px solid ${colors.border}` }}
              >
                {packet.cardData.brand}
              </div>

              {/* Image centrale */}
              <div className="relative w-full h-48 flex items-center justify-center bg-gradient-to-b from-transparent to-black/5">
                <img
                  src={packet.cardData.cardAsset}
                  alt={packet.cardData.name}
                  className="object-contain drop-shadow-lg" style={{ width: 'calc(var(--ui-packet-image) * 0.5625)', height: 'calc(var(--ui-packet-image) * 0.5625)' }}
                />
              </div>

              {/* Info carte */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center" style={{ backgroundColor: colors.border }}>
                <p className="text-xl font-black text-white drop-shadow-lg">{packet.cardData.name}</p>
                <p className="text-3xl mt-1">{packet.cardData.emoji}</p>
              </div>

              {/* Effets décoratifs */}
              {rarity === 'legendaire' && (
                <>
                  <Star className="absolute top-8 right-4 w-6 h-6 text-yellow-400 animate-pulse" />
                  <Star className="absolute top-16 right-8 w-4 h-4 text-yellow-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
                  <Star className="absolute bottom-20 left-4 w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
                </>
              )}
            </motion.div>

            {/* Badge NOUVELLE CARTE */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', damping: 30 }}
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-xs font-black rounded-full uppercase tracking-wider"
            >
              ✨ Nouvelle Carte ! ✨
            </motion.div>

            {/* Bouton fermer */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className="mt-16 mx-auto block px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors"
            >
              Fermer
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Hook pour gérer l'inventaire des cartes
export function useCardCollection() {
  const [collection, setCollection] = useState<Record<string, SeedCard>>({});

  const addCard = (card: SeedCard) => {
    setCollection((prev) => ({
      ...prev,
      [card.id]: { ...card, collectedAt: Date.now() } as SeedCard & { collectedAt: number },
    }));
  };

  const isCollected = (cardId: string) => !!collection[cardId];

  const completionRate = (total: number) =>
    total > 0 ? Math.round((Object.keys(collection).length / total) * 100) : 0;

  return { collection, addCard, isCollected, completionRate };
}
