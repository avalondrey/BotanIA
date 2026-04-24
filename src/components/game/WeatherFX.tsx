'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

type GameWeather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'heatwave' | 'frost' | string;

export const WeatherEffects: React.FC = () => {
  const realWeather = useGameStore((s) => s.realWeather);
  const [rainDrops, setRainDrops] = useState<number[]>([]);

  const gameWeather: GameWeather = realWeather?.current?.gameWeather || 'sunny';
  const temp = realWeather?.current?.temperature ?? 20;
  const isRaining = realWeather?.current?.isRaining ?? false;

  useEffect(() => {
    if (isRaining || gameWeather === 'rainy' || gameWeather === 'stormy') {
      const drops = Array.from({ length: 100 }, (_, i) => i);
      setRainDrops(drops);
    } else {
      setRainDrops([]);
    }
  }, [isRaining, gameWeather]);

  if (!realWeather?.current) return null;

  return (
    <div className="weather-effects-container pointer-events-none">
      <AnimatePresence mode="wait">
        {/* SOLEIL / CHALEUR */}
        {(gameWeather === 'sunny' || gameWeather === 'heatwave') && (
          <motion.div
            key="sun"
            className="sun-effect"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <div className="sun-rays" />
            {gameWeather === 'heatwave' && (
              <div className="heat-shimmer" />
            )}
          </motion.div>
        )}

        {/* NUAGES */}
        {(gameWeather === 'cloudy' || gameWeather === 'rainy' || gameWeather === 'stormy' || gameWeather === 'frost') && (
          <motion.div
            key="clouds"
            className="clouds-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="cloud cloud-1"
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="cloud cloud-2"
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 80, repeat: Infinity, ease: 'linear', delay: 10 }}
            />
            <motion.div
              className="cloud cloud-3"
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 100, repeat: Infinity, ease: 'linear', delay: 20 }}
            />
          </motion.div>
        )}

        {/* PLUIE */}
        {(gameWeather === 'rainy' || gameWeather === 'stormy') && rainDrops.length > 0 && (
          <motion.div key="rain" className="rain-container">
            {rainDrops.map((drop) => (
              <motion.div
                key={drop}
                className="rain-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
                initial={{ y: -20, opacity: 0.8 }}
                animate={{ y: '100vh', opacity: 0 }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: 'linear',
                }}
              />
            ))}
          </motion.div>
        )}

        {/* ORAGE — éclairs */}
        {gameWeather === 'stormy' && (
          <motion.div
            key="storm"
            className="storm-overlay"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0, 0.6, 0, 0.2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatDelay: Math.random() * 6 + 2,
              ease: 'linear',
            }}
          />
        )}

        {/* GIVRE */}
        {gameWeather === 'frost' && (
          <motion.div
            key="frost"
            className="frost-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
          >
            <div className="frost-crystals" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeatherEffects;
