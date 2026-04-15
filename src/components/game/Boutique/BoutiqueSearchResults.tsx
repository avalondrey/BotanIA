'use client';

import { motion } from 'framer-motion';
import { Coins, Package, Leaf } from 'lucide-react';
import Image from 'next/image';
import type { SearchItem } from './useBoutiqueSearch';

interface BoutiqueSearchResultsProps {
  results: SearchItem[];
  query: string;
  coins: number;
  justBought: string | null;
  onBuyVariety: (id: string) => void;
  onBuySeeds: (plantDefId: string) => void;
  onBuyPlantule: (plantDefId: string) => void;
}

const TYPE_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'variety':     { label: 'Graine',    icon: <Package size={10} />, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  'plantule':    { label: 'Plantule',  icon: <Leaf size={10} />,   color: 'bg-green-100 text-green-700 border-green-200' },
  'seed-classic': { label: 'Paquet',   icon: <Package size={10} />, color: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export function BoutiqueSearchResults({
  results, query, coins, justBought,
  onBuyVariety, onBuySeeds, onBuyPlantule,
}: BoutiqueSearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-stone-400">
        <span className="text-3xl mb-2">🔍</span>
        <p className="text-sm font-bold">Aucun résultat pour « {query} »</p>
        <p className="text-[10px] mt-1">Essayez un autre terme de recherche</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-stone-500">
          {results.length} résultat{results.length > 1 ? 's' : ''} pour « {query} »
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {results.map((item) => {
          const canAfford = coins >= item.price;
          const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS['variety'];
          const boughtKey = `search-${item.id}`;
          const justBoughtThis = justBought === boughtKey;

          const handleBuy = () => {
            if (item.type === 'variety') onBuyVariety(item.id);
            else if (item.type === 'seed-classic') onBuySeeds(item.plantDefId);
            else onBuyPlantule(item.plantDefId);
          };

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className={`relative bg-white border-[3px] rounded-2xl overflow-hidden transition-all
                ${canAfford ? 'border-black shadow-[4px_4px_0_0_#000]' : 'border-stone-300 shadow-[2px_2px_0_0_#ccc]'}
                ${justBoughtThis ? 'ring-2 ring-green-400 ring-offset-2' : ''}`}
            >
              {/* Shop badge */}
              <div className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 px-1.5 py-0.5 bg-white/90 text-[7px] font-black rounded-md border border-stone-200 shadow-sm">
                <span>{item.shopEmoji}</span>
                <span className="truncate max-w-[80px]">{item.shopName}</span>
              </div>

              {/* Type badge */}
              <div className={`absolute top-1.5 right-1.5 z-10 flex items-center gap-0.5 px-1.5 py-0.5 text-[7px] font-black rounded-md border ${typeInfo.color}`}>
                {typeInfo.icon}
                {typeInfo.label}
              </div>

              {/* Image */}
              <div className="relative h-36 bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain drop-shadow-lg opacity-80"
                  />
                ) : (
                  <span className="text-4xl">{item.emoji}</span>
                )}

                {/* Price */}
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black text-white text-[10px] font-black rounded-lg flex items-center gap-1 shadow-[2px_2px_0_0_rgba(0,0,0,0.3)]">
                  <Coins className="w-3 h-3 text-yellow-400" />
                  {item.price}
                </div>

                {/* Owned count */}
                {item.owned && item.owned > 0 && (
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-white/90 text-[8px] font-black rounded border border-stone-200">
                    ×{item.owned}
                  </div>
                )}
              </div>

              {/* Info + Buy */}
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-black uppercase truncate">{item.name}</h3>
                    <p className="text-[8px] text-stone-400 truncate">{item.description}</p>
                  </div>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={!canAfford}
                  className={`w-full py-2 text-[10px] font-black uppercase rounded-xl border-2 transition-all
                    ${canAfford
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-black shadow-[2px_2px_0_0_#000] hover:shadow-[3px_3px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000]'
                      : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'}`}
                >
                  {canAfford ? '🛒 Acheter' : '🔒 Pas assez'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default BoutiqueSearchResults;