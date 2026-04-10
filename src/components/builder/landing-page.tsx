'use client';

import { BuilderContent } from './builder-content';
import { motion } from 'framer-motion';

/**
 * Landing Page Hero Section
 * Editable via Builder.io model: "landing-page"
 * Use this for marketing pages, feature showcases, screenshots
 */
export function LandingPage() {
  return (
    <BuilderContent model="landing-page">
      <div className="landing-page-builder-content">
        {/* Default hero content - replaced by Builder when connected */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #000 0.5px, transparent 0.5px)", backgroundSize: "5px 5px", opacity: 0.03 }} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 max-w-[1400px] mx-auto px-3 py-12 md:py-20"
          >
            <div className="text-center space-y-6">
              <motion.h1
                className="text-4xl md:text-6xl font-black tracking-tight"
                style={{ WebkitTextStroke: "2px #000", textShadow: "4px 4px 0 #000" }}
              >
                🌱 BotanIA
              </motion.h1>
              <p className="text-xl md:text-2xl font-bold text-stone-600">
                Application de Jardinage Botanique Scientifique
              </p>
              <p className="text-sm text-stone-500 max-w-xl mx-auto">
                Données agronomiques réelles (FAO, INRAE) • Météo en temps réel • IA Advisor
              </p>
            </div>

            {/* Feature highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000]"
              >
                <span className="text-3xl">🌿</span>
                <h3 className="text-lg font-black mt-2">Jardin Intelligent</h3>
                <p className="text-sm text-stone-500 mt-1">GDD, besoins en eau, compagnonnage</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000]"
              >
                <span className="text-3xl">🌤️</span>
                <h3 className="text-lg font-black mt-2">Météo Réelle</h3>
                <p className="text-sm text-stone-500 mt-1">Open-Meteo + GPS + 7 jours</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 bg-white rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000]"
              >
                <span className="text-3xl">🤖</span>
                <h3 className="text-lg font-black mt-2">IA Advisor</h3>
                <p className="text-sm text-stone-500 mt-1">Conseils personnalisés en temps réel</p>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </div>
    </BuilderContent>
  );
}