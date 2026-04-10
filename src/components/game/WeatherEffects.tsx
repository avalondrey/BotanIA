'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/game-store';

export const WeatherEffects: React.FC = () => {
  const realWeather = useGameStore((s) => s.realWeather);
  const [rainDrops, setRainDrops] = useState<number[]>([]);

  // Generate rain drops
  useEffect(() => {
    if (realWeather?.current?.isRaining && (realWeather.current as any)?.precipProbability > 30) {
      const drops = Array.from({ length: 100 }, (_, i) => i);
      setRainDrops(drops);
    } else {
      setRainDrops([]);
    }
  }, [realWeather?.current?.isRaining]);

  if (!realWeather?.current) return null;

  const { windSpeed, temperature } = realWeather.current;
  const isRaining = realWeather.current.isRaining;
  const isCloudy = false; // Simplified
  const isSunny = (temperature ?? 0) > 15 && !isRaining;

  return (
    <div className="weather-effects-container">
      {/* SOLEIL */}
      {isSunny && (
        <motion.div
          className="sun-effect"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2 }}
        >
          <div className="sun-rays" />
        </motion.div>
      )}

      {/* NUAGES */}
      {isCloudy && (
        <div className="clouds-container">
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
        </div>
      )}

      {/* PLUIE */}
      {isRaining && (
        <div className="rain-container">
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
        </div>
      )}
    </div>
  );
};

export default WeatherEffects;
