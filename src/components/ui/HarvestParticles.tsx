"use client";
import { useEffect, useState, useRef, useCallback } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type: "coin" | "sparkle" | "confetti";
  rotation: number;
  rotSpeed: number;
}

interface HarvestParticlesProps {
  trigger: number;      // increment to trigger
  originX: number;      // screen X of harvest source
  originY: number;      // screen Y of harvest source
  targetX?: number;     // screen X of coin counter
  targetY?: number;     // screen Y of coin counter
  reward?: number;      // number of coins
}

const GOLD = ["#FFD700", "#FFA500", "#FFEC8B", "#FFE4B5"];
const GREEN = ["#22C55E", "#4ADE80", "#86EFAC"];
const CONFETTI = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

export default function HarvestParticles({ trigger, originX, originY, targetX, targetY, reward = 0 }: HarvestParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const idRef = useRef(0);

  const spawnParticles = useCallback(() => {
    const newP: Particle[] = [];
    // Confetti burst
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5;
      const speed = 3 + Math.random() * 6;
      newP.push({
        id: idRef.current++,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        color: CONFETTI[Math.floor(Math.random() * CONFETTI.length)],
        size: 3 + Math.random() * 4,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        type: "confetti",
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
      });
    }
    // Flying coins toward target
    for (let i = 0; i < Math.min(reward, 10); i++) {
      newP.push({
        id: idRef.current++,
        x: originX + (Math.random() - 0.5) * 20,
        y: originY + (Math.random() - 0.5) * 20,
        vx: (targetX ?? originX + 200 - originX) / 60,
        vy: (targetY ?? originY - 100 - originY) / 60 - 2,
        color: GOLD[Math.floor(Math.random() * GOLD.length)],
        size: 5 + Math.random() * 3,
        life: 0,
        maxLife: 55,
        type: "coin",
        rotation: 0,
        rotSpeed: 10,
      });
    }
    // Sparkles
    for (let i = 0; i < 15; i++) {
      newP.push({
        id: idRef.current++,
        x: originX + (Math.random() - 0.5) * 100,
        y: originY + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 3,
        color: GREEN[Math.floor(Math.random() * GREEN.length)],
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        type: "sparkle",
        rotation: 0,
        rotSpeed: 0,
      });
    }
    setParticles(prev => [...prev, ...newP]);
  }, [originX, originY, targetX, targetY, reward]);

  useEffect(() => {
    if (trigger > 0) spawnParticles();
  }, [trigger, spawnParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive: Particle[] = [];

      setParticles(prev => {
        for (const p of prev) {
          p.life++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // gravite
          p.rotation += p.rotSpeed;
          const alpha = Math.max(0, 1 - p.life / p.maxLife);

          if (p.life < p.maxLife) {
            alive.push(p);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.globalAlpha = alpha;

            if (p.type === "coin") {
              ctx.rotate(p.rotation * Math.PI / 180);
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(0, 0, p.size, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = "#B8860B";
              ctx.lineWidth = 1.5;
              ctx.stroke();
              // petit symbole
              ctx.fillStyle = "#B8860B";
              ctx.font = `${p.size}px sans-serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText("$", 0, 0);
            } else if (p.type === "sparkle") {
              ctx.fillStyle = p.color;
              ctx.beginPath();
              // 4-point star
              for (let i = 0; i < 8; i++) {
                const r = i % 2 === 0 ? p.size : p.size * 0.4;
                const a = (Math.PI * 2 * i) / 8;
                if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
              }
              ctx.closePath();
              ctx.fill();
            } else {
              ctx.rotate(p.rotation * Math.PI / 180);
              ctx.fillStyle = p.color;
              ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }
            ctx.restore();
          }
        }
        return alive;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}