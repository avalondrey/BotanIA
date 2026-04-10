'use client';

import { BuilderContent } from './builder-content';
import { motion } from 'framer-motion';

/**
 * Boutique Content Section
 * Editable via Builder.io model: "boutique-content"
 * Use this to manage marketing content, promotions, featured items
 */
export function BoutiqueContent() {
  return (
    <BuilderContent model="boutique-content">
      <div className="boutique-builder-content">
        {/* Default content rendered when not connected to Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Placeholder content - replaced by Builder when connected */}
          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200">
            <h3 className="text-lg font-black text-amber-800 mb-2">🏪 Boutique BotanIA</h3>
            <p className="text-sm text-amber-600">
              Contenu géré via Builder.io — connectez votre API key pour activer l'édition visuelle.
            </p>
          </div>
        </motion.div>
      </div>
    </BuilderContent>
  );
}