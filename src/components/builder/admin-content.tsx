'use client';

import { BuilderContent } from './builder-content';
import { motion } from 'framer-motion';

/**
 * Admin Content Section
 * Editable via Builder.io model: "admin-content"
 * Use this for admin panel content, documentation links, configuration
 */
export function AdminContent() {
  return (
    <BuilderContent model="admin-content">
      <div className="admin-builder-content">
        {/* Default admin content - replaced by Builder when connected */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-stone-100 rounded-xl border-2 border-stone-200"
        >
          <h3 className="text-sm font-black text-stone-700 mb-2">⚙️ Administration BotanIA</h3>
          <p className="text-xs text-stone-500">
            Contenu géré via Builder.io — connectez votre API key pour activer l'édition visuelle.
          </p>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-stone-400">• Modèle: admin-content</p>
            <p className="text-xs text-stone-400">• Statut: Non connecté</p>
          </div>
        </motion.div>
      </div>
    </BuilderContent>
  );
}