/**
 * HOLOGRAMME 3D - Card Évolution avec vraies images
 * Utilise les sprites réels de /public/images/pepiniere/
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface HologramProps {
  plantType?: 'tomato' | 'carrot' | 'lettuce';
}

export function HologramEvolution({ plantType = 'tomato' }: HologramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  const plantData = {
    tomato: {
      name: 'Tomate',
      color: '#FF6347',
      stages: [
        { name: 'Graine semée', days: 0, desc: 'Semis en terre' },
        { name: 'Germination', days: 4, desc: 'Première levée' },
        { name: 'Plantule', days: 15, desc: 'Cotylédons ouverts' },
        { name: 'Croissance', days: 30, desc: 'Premières vraies feuilles' },
        { name: 'Floraison', days: 50, desc: 'Boutons floraux' },
        { name: 'Fructification', days: 75, desc: 'Tomates mûres' }
      ]
    }
  };
  
  const plant = plantData[plantType];
  
  // Charger images
  useEffect(() => {
    const loadImages = async () => {
      const imgs: HTMLImageElement[] = [];
      let loaded = 0;
      
      for (let i = 0; i <= 5; i++) {
        const img = new window.Image();
        img.onload = () => {
          loaded++;
          if (loaded === 6) setImagesLoaded(true);
        };
        img.src = `/images/pepiniere/${plantType}/stage-${i}.png`;
        imgs.push(img);
      }
      
      imagesRef.current = imgs;
    };
    
    loadImages();
  }, [plantType]);
  
  // Render hologramme
  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animFrame: number;
    let rotation = 0;
    
    const render = () => {
      // Clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Plateforme
      const platformGrad = ctx.createRadialGradient(centerX, 420, 0, centerX, 420, 150);
      platformGrad.addColorStop(0, `${plant.color}66`);
      platformGrad.addColorStop(0.7, `${plant.color}1A`);
      platformGrad.addColorStop(1, `${plant.color}00`);
      ctx.fillStyle = platformGrad;
      ctx.beginPath();
      ctx.arc(centerX, 420, 150, 0, Math.PI * 2);
      ctx.fill();
      
      // Image holographique
      const img = imagesRef.current[currentStage];
      if (img?.complete) {
        ctx.save();
        ctx.translate(centerX, centerY - 50);
        
        // Aura
        const pulse = Math.sin(Date.now() / 500) * 15;
        const auraSize = 140 + pulse;
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
        auraGrad.addColorStop(0, `${plant.color}66`);
        auraGrad.addColorStop(1, `${plant.color}00`);
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Image avec glow
        ctx.shadowColor = plant.color;
        ctx.shadowBlur = 25;
        ctx.drawImage(img, -60, -60, 120, 120);
        ctx.shadowBlur = 0;
        
        ctx.restore();
      }
      
      rotation += 0.01;
      animFrame = requestAnimationFrame(render);
    };
    
    render();
    
    return () => cancelAnimationFrame(animFrame);
  }, [imagesLoaded, currentStage, plant.color]);
  
  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentStage(prev => (prev + 1) % 6);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [autoPlay]);
  
  return (
    <div className="space-y-4">
      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden"
        style={{ background: 'radial-gradient(circle, #0a0a0a, #000)' }}>
        <canvas 
          ref={canvasRef}
          width={680}
          height={500}
          className="block"
        />
        
        {!imagesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm" style={{ color: plant.color }}>
              Chargement sprites...
            </p>
          </div>
        )}
      </div>
      
      {/* Contrôles */}
      <div className="flex gap-3 items-center">
        <button
          onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
          className="px-4 py-2 text-sm font-medium rounded"
          disabled={currentStage === 0}
        >
          ◀ Précédent
        </button>
        
        <div className="flex-1 text-center">
          <div className="text-base font-medium">Stade {currentStage}/5</div>
          <div className="text-xs text-gray-500">{plant.stages[currentStage].name}</div>
        </div>
        
        <button
          onClick={() => setCurrentStage(Math.min(5, currentStage + 1))}
          className="px-4 py-2 text-sm font-medium rounded"
          disabled={currentStage === 5}
        >
          Suivant ▶
        </button>
      </div>
      
      {/* Stats */}
      <div className="bg-stone-100 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">Stade</div>
            <div className="text-lg font-medium">{plant.stages[currentStage].name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Jours</div>
            <div className="text-lg font-medium">{plant.stages[currentStage].days}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Progression</div>
            <div className="text-lg font-medium">{Math.round((currentStage / 5) * 100)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
