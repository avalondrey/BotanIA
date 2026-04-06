/**
 * HOLOGRAMME 3D SINGLE - Une seule image en projection
 * Affiche UNE image avec effets holographiques avancés
 */

"use client";

import { useState, useEffect, useRef } from 'react';

interface HologramSingleProps {
  imagePath: string;
  title?: string;
  description?: string;
  status?: string;
  days?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export function HologramSingle({ 
  imagePath,
  title = "Plant de Tomate",
  description = "Fruits mûrs prêts à récolter",
  status = "Fructification",
  days = 75
}: HologramSingleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [auraIntensity, setAuraIntensity] = useState(0.8);
  const [rotationSpeed, setRotationSpeed] = useState(0.01);
  
  const imageRef = useRef<HTMLImageElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rotationRef = useRef(0);
  
  // Charger l'image
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Erreur chargement:', imagePath);
    };
    img.src = imagePath;
    imageRef.current = img;
  }, [imagePath]);
  
  // Animation hologramme
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animFrame: number;
    
    const createParticle = (centerX: number, centerY: number): Particle => ({
      x: centerX + (Math.random() - 0.5) * 140,
      y: centerY - 80 + (Math.random() - 0.5) * 140,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * -3 - 1,
      life: 1,
      size: Math.random() * 4 + 1,
      color: Math.random() > 0.5 ? '#FF6347' : '#FFD700'
    });
    
    const updateParticle = (p: Particle) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // Gravité
      p.life -= 0.015;
    };
    
    const drawParticle = (p: Particle, ctx: CanvasRenderingContext2D) => {
      const rgb = p.color === '#FF6347' ? '255, 99, 71' : '255, 215, 0';
      ctx.fillStyle = `rgba(${rgb}, ${p.life * 0.7})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    
    const render = () => {
      // Clear
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Plateforme
      const platformGrad = ctx.createRadialGradient(centerX, 520, 0, centerX, 520, 180);
      platformGrad.addColorStop(0, `rgba(255, 99, 71, ${auraIntensity * 0.5})`);
      platformGrad.addColorStop(0.5, `rgba(255, 99, 71, ${auraIntensity * 0.2})`);
      platformGrad.addColorStop(1, 'rgba(255, 99, 71, 0)');
      ctx.fillStyle = platformGrad;
      ctx.beginPath();
      ctx.arc(centerX, 520, 180, 0, Math.PI * 2);
      ctx.fill();
      
      // Anneaux
      for (let i = 4; i > 0; i--) {
        const pulse = Math.sin(Date.now() / 1000 + i * 0.5) * 5;
        ctx.strokeStyle = `rgba(255, 99, 71, ${0.2 * i * auraIntensity})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, 520, 90 + i * 25 + pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Grille rotative
      ctx.save();
      ctx.translate(centerX, centerY);
      if (rotationEnabled) rotationRef.current += rotationSpeed;
      ctx.rotate(rotationRef.current);
      
      ctx.strokeStyle = `rgba(255, 99, 71, ${0.2 * auraIntensity})`;
      ctx.lineWidth = 1.5;
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 50, -250);
        ctx.lineTo(i * 50, 250);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(-250, i * 50);
        ctx.lineTo(250, i * 50);
        ctx.stroke();
      }
      ctx.restore();
      
      // IMAGE
      const img = imageRef.current;
      if (img?.complete) {
        ctx.save();
        ctx.translate(centerX, centerY - 80);
        
        // Ombre
        const shadowGrad = ctx.createRadialGradient(0, 150, 0, 0, 150, 140);
        shadowGrad.addColorStop(0, `rgba(255, 99, 71, ${0.4 * auraIntensity})`);
        shadowGrad.addColorStop(1, 'rgba(255, 99, 71, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(0, 150, 140, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Aura
        const pulse = Math.sin(Date.now() / 600) * 20;
        const auraSize = 180 + pulse;
        const auraGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, auraSize);
        auraGrad.addColorStop(0, `rgba(255, 99, 71, ${0.5 * auraIntensity})`);
        auraGrad.addColorStop(0.4, `rgba(255, 127, 80, ${0.3 * auraIntensity})`);
        auraGrad.addColorStop(0.7, `rgba(255, 215, 0, ${0.15 * auraIntensity})`);
        auraGrad.addColorStop(1, 'rgba(255, 99, 71, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, auraSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Aberration chromatique
        ctx.globalAlpha = 0.25;
        ctx.drawImage(img, -82, -82, 160, 160);
        
        ctx.globalAlpha = 0.25;
        ctx.filter = 'hue-rotate(180deg)';
        ctx.drawImage(img, -78, -78, 160, 160);
        ctx.filter = 'none';
        
        // Image principale
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#FF6347';
        ctx.shadowBlur = 35;
        ctx.drawImage(img, -80, -80, 160, 160);
        ctx.shadowBlur = 0;
        
        ctx.restore();
      }
      
      // Rayons
      ctx.save();
      ctx.translate(centerX, centerY - 80);
      for (let i = 0; i < 6; i++) {
        const angle = Date.now() / 2000 + i * Math.PI / 3;
        const rayLength = 120 + Math.sin(Date.now() / 500 + i) * 20;
        
        const rayGrad = ctx.createLinearGradient(0, 0, Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        rayGrad.addColorStop(0, `rgba(255, 99, 71, ${0.6 * auraIntensity})`);
        rayGrad.addColorStop(1, 'rgba(255, 99, 71, 0)');
        
        ctx.strokeStyle = rayGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        ctx.stroke();
      }
      ctx.restore();
      
      // Particules
      if (particlesEnabled && Math.random() > 0.65) {
        particlesRef.current.push(createParticle(centerX, centerY));
      }
      
      particlesRef.current = particlesRef.current.filter(p => {
        updateParticle(p);
        drawParticle(p, ctx);
        return p.life > 0;
      });
      
      animFrame = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animFrame);
  }, [imageLoaded, rotationEnabled, particlesEnabled, auraIntensity, rotationSpeed]);
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setRotationEnabled(!rotationEnabled)}
            className="px-3 py-1.5 text-sm font-medium rounded bg-red-500 text-white"
          >
            {rotationEnabled ? '⏸' : '▶'} Rotation
          </button>
          <button
            onClick={() => setParticlesEnabled(!particlesEnabled)}
            className={`px-3 py-1.5 text-sm rounded ${particlesEnabled ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}
          >
            ✨
          </button>
        </div>
      </div>
      
      <div className="relative rounded-lg overflow-hidden" style={{ background: 'radial-gradient(circle, #0a0a0a, #000)' }}>
        <canvas ref={canvasRef} width={700} height={600} className="block" />
        
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500">
            Chargement...
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs mb-2 text-gray-500">Intensité Aura</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={auraIntensity * 100}
            onChange={e => setAuraIntensity(+e.target.value / 100)}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-xs mb-2 text-gray-500">Vitesse Rotation</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={rotationSpeed * 5000}
            onChange={e => setRotationSpeed(+e.target.value / 5000)}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="bg-stone-100 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">État</div>
            <div className="text-lg font-medium">{status}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Maturité</div>
            <div className="text-lg font-medium">100%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Jours</div>
            <div className="text-lg font-medium">{days}</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-red-50 rounded border-l-4 border-red-500">
          <div className="text-xs text-gray-500">Description</div>
          <div className="text-sm mt-1">🍅 {description}</div>
        </div>
      </div>
    </div>
  );
}
