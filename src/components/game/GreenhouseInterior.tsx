'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Leaf, Package, ChevronUp, ChevronDown } from 'lucide-react';

interface ShelfItem {
  id: string;
  name: string;
  emoji: string;
  quantity: number;
  type: 'seed' | 'plant' | 'tool';
}

interface Shelf {
  id: string;
  name: string;
  slots: number;
  items: (ShelfItem | null)[];
}

export interface GreenhouseData {
  name: string;
  temperature: number;
  humidity: number;
  shelves: Shelf[];
  inventory: ShelfItem[];
}

interface GreenhouseInteriorProps {
  greenhouse: GreenhouseData | null;
  onClose: () => void;
  onUpdate: (data: GreenhouseData) => void;
}

const DEFAULT_GREENHOUSE: GreenhouseData = {
  name: 'Ma Serre',
  temperature: 22,
  humidity: 65,
  shelves: [
    { id: 's1', name: 'Étagère haute', slots: 6, items: Array(6).fill(null) },
    { id: 's2', name: 'Étagère milieu', slots: 6, items: Array(6).fill(null) },
    { id: 's3', name: 'Étagère basse', slots: 6, items: Array(6).fill(null) },
  ],
  inventory: [
    { id: 'i1', name: 'Graines tomate', emoji: '🍅', quantity: 10, type: 'seed' },
    { id: 'i2', name: 'Graines basilic', emoji: '🌿', quantity: 8, type: 'seed' },
    { id: 'i3', name: 'Bouture menthe', emoji: '🌱', quantity: 3, type: 'plant' },
  ],
};

export default function GreenhouseInterior({ greenhouse, onClose, onUpdate }: GreenhouseInteriorProps) {
  const [data, setData] = useState<GreenhouseData>(greenhouse || DEFAULT_GREENHOUSE);
  const [dragItem, setDragItem] = useState<{ source: string; item: ShelfItem } | null>(null);
  const [inventoryOpen, setInventoryOpen] = useState(true);

  // Place item from inventory to shelf slot
  const placeOnShelf = useCallback((shelfId: string, slotIndex: number) => {
    setData((prev) => {
      const shelf = prev.shelves.find((s) => s.id === shelfId);
      if (!shelf || shelf.items[slotIndex] !== null || prev.inventory.length === 0) return prev;
      const invItem = prev.inventory[0];
      const newShelves = prev.shelves.map((s) =>
        s.id === shelfId
          ? { ...s, items: s.items.map((it, idx) => idx === slotIndex ? { ...invItem, quantity: 1 } : it) }
          : s
      );
      const newInventory = invItem.quantity > 1
        ? prev.inventory.map((it, i) => i === 0 ? { ...it, quantity: it.quantity - 1 } : it)
        : prev.inventory.slice(1);
      const newData = { ...prev, shelves: newShelves, inventory: newInventory };
      setTimeout(() => onUpdate(newData), 0);
      return newData;
    });
  }, [onUpdate]);

  // Pick item from shelf back to inventory
  const pickFromShelf = useCallback((shelfId: string, slotIndex: number) => {
    setData((prev) => {
      const shelf = prev.shelves.find((s) => s.id === shelfId);
      if (!shelf || !shelf.items[slotIndex]) return prev;
      const item = shelf.items[slotIndex]!;
      const newShelves = prev.shelves.map((s) =>
        s.id === shelfId ? { ...s, items: s.items.map((it, idx) => idx === slotIndex ? null : it) } : s
      );
      const existingIdx = prev.inventory.findIndex((it) => it.id === item.id);
      const newInventory = existingIdx >= 0
        ? prev.inventory.map((it, i) => i === existingIdx ? { ...it, quantity: it.quantity + item.quantity } : it)
        : [...prev.inventory, { ...item }];
      const newData = { ...prev, shelves: newShelves, inventory: newInventory };
      setTimeout(() => onUpdate(newData), 0);
      return newData;
    });
  }, [onUpdate]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-amber-50 to-green-50/50 rounded-t-3xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-white">🏠 {data.name}</h2>
                <p className="text-green-100 text-sm">Intérieur de serre</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Climate stats */}
          <div className="flex gap-4 mt-3">
            <div className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-sm">🌡️</span>
              <span className="text-white font-medium text-sm">{data.temperature}°C</span>
            </div>
            <div className="bg-white/15 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-sm">💧</span>
              <span className="text-white font-medium text-sm">{data.humidity}%</span>
            </div>
          </div>
        </div>

        {/* 3D Serre interior visual */}
        <div className="relative h-40 bg-gradient-to-b from-sky-100 to-amber-100/50 flex items-end justify-center overflow-hidden border-b border-amber-200">
          {/* Glass roof effect */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.3)_75%)] bg-[length:20px_20px] opacity-30" />

          {/* Serre shelves visual */}
          <div className="relative z-10 flex gap-8 items-end pb-4 px-4">
            {data.shelves.map((shelf, si) => (
              <div key={shelf.id} className="flex flex-col items-center">
                {/* Shelf level label */}
                <span className="text-xs text-amber-700 font-medium mb-1">{shelf.name}</span>
                {/* Shelf board */}
                <div className="w-24 h-1.5 bg-amber-700 rounded-sm shadow" />
                {/* Items on shelf */}
                <div className="flex gap-1 mt-1">
                  {shelf.items.slice(0, 4).map((item, ii) => (
                    item ? (
                      <motion.span
                        key={ii}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-lg cursor-pointer hover:scale-110 transition"
                        title={`${item.name} (x${item.quantity})`}
                        onClick={() => pickFromShelf(shelf.id, ii)}
                      >
                        {item.emoji}
                      </motion.span>
                    ) : (
                      <span key={ii} className="text-lg opacity-20">📦</span>
                    )
                  ))}
                </div>
                {/* Shelf supports */}
                <div className="w-1 h-8 bg-amber-800/40 rounded-full mx-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Shelf details + inventory */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Shelves detail grid */}
          {data.shelves.map((shelf) => (
            <div key={shelf.id} className="bg-white rounded-xl p-3 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <Package className="w-4 h-4" /> {shelf.name}
                </h3>
                <span className="text-xs text-amber-600">{shelf.items.filter(Boolean).length}/{shelf.slots}</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {shelf.items.map((item, ii) => (
                  <motion.button
                    key={ii}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => item ? pickFromShelf(shelf.id, ii) : placeOnShelf(shelf.id, ii)}
                    className="aspect-square rounded-lg border-2 flex items-center justify-center text-lg transition-all bg-amber-50/50 hover:bg-green-50
                      ${item ? 'border-green-300 shadow-sm' : 'border-dashed border-amber-200 hover:border-green-300'}"
                  >
                    {item ? (
                      <span title={`${item.name} (x${item.quantity})`} className="relative">
                        {item.emoji}
                        {item.quantity > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-amber-300 text-sm">+</span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          {/* Inventory */}
          <div className="bg-white rounded-xl shadow-sm border border-amber-100 overflow-hidden">
            <button
              onClick={() => setInventoryOpen(!inventoryOpen)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-amber-50/50 transition"
            >
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <Leaf className="w-4 h-4" /> Inventaire
              </h3>
              {inventoryOpen ? <ChevronUp className="w-4 h-4 text-amber-600" /> : <ChevronDown className="w-4 h-4 text-amber-600" />}
            </button>
            <AnimatePresence>
              {inventoryOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 pt-0 grid grid-cols-4 gap-2">
                    {data.inventory.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.03 }}
                        className="bg-gradient-to-br from-green-50 to-amber-50 rounded-lg p-2.5 text-center border border-green-100"
                      >
                        <span className="text-2xl block">{item.emoji}</span>
                        <p className="text-[10px] text-amber-700 font-medium mt-1 truncate">{item.name}</p>
                        <p className="text-[10px] text-green-600">×{item.quantity}</p>
                      </motion.div>
                    ))}
                    {data.inventory.length === 0 && (
                      <div className="col-span-4 text-center py-4 text-amber-400 text-sm">Inventaire vide</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-amber-200 bg-white/50 text-center text-xs text-amber-600">
          Clique sur un emplacement vide pour y placer un objet · Clique sur un objet pour le récupérer
        </div>
      </motion.div>
    </div>
  );
}
