/**
 * GardenStats — Tableau de bord des statistiques du jardin
 * Affiche rendements, GDD, consommation d'eau, maladies
 */
'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getJournalStats, getJournalEntries } from '@/lib/garden-journal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface YieldData {
  plantName: string;
  yieldPerM2: number;
  inraeNorm: number;
  harvestCount: number;
  totalQuantity: number;
}

// ─── Reference INRAE (rendements kg/m²) ──────────────────────────────────────

const INRAE_YIELDS: Record<string, { name: string; norm: number }> = {
  tomato:     { name: 'Tomate', norm: 6.0 },
  carrot:     { name: 'Carotte', norm: 4.5 },
  lettuce:   { name: 'Salade', norm: 2.5 },
  strawberry:{ name: 'Fraise', norm: 1.8 },
  pepper:    { name: 'Piment', norm: 2.0 },
  cucumber:  { name: 'Concombre', norm: 4.0 },
  zucchini:  { name: 'Courgette', norm: 5.0 },
  bean:      { name: 'Haricot', norm: 2.5 },
  pea:       { name: 'Pois', norm: 1.5 },
  spinach:   { name: 'Épinard', norm: 2.0 },
  radish:    { name: 'Radis', norm: 1.5 },
  cabbage:   { name: 'Chou', norm: 4.0 },
  eggplant:  { name: 'Aubergine', norm: 3.5 },
  squash:    { name: 'Courge', norm: 6.0 },
  parsley:   { name: 'Persil', norm: 1.0 },
};

// ─── Mock GDD history (à remplacer par vraies données du simulation store) ────

const GDD_HISTORY = [
  { date: 'J-28', gdd: 120, stage: 'Levée' },
  { date: 'J-21', gdd: 185, stage: 'Croissance' },
  { date: 'J-14', gdd: 290, stage: 'Croissance' },
  { date: 'J-7',  gdd: 420, stage: 'Floraison' },
  { date: 'J0',   gdd: 580, stage: 'Récolte' },
];

// ─── Water consumption mock ───────────────────────────────────────────────────

const WATER_HISTORY = [
  { date: 'J-28', actual: 18, expected: 20 },
  { date: 'J-21', actual: 22, expected: 21 },
  { date: 'J-14', actual: 25, expected: 24 },
  { date: 'J-7',  actual: 20, expected: 23 },
  { date: 'J0',   actual: 19, expected: 22 },
];

// ─── Composants ──────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      marginBottom: '1.5rem',
    }}>
      <h3 style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color: '#374151',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Rendements ───────────────────────────────────────────────────────────────

function YieldPerM2Chart() {
  // Calcul depuis le journal
  const stats = getJournalStats();
  const harvests = getJournalEntries({ type: 'harvest', limit: 500 });

  // Aggréger par plante
  const byPlant: Record<string, { quantity: number; count: number }> = {};
  for (const h of harvests) {
    if (!h.plantDefId) continue;
    byPlant[h.plantDefId] = byPlant[h.plantDefId] || { quantity: 0, count: 0 };
    byPlant[h.plantDefId].quantity += h.quantity ?? 1;
    byPlant[h.plantDefId].count += 1;
  }

  const yieldData: YieldData[] = Object.entries(byPlant).map(([id, data]) => {
    const ref = INRAE_YIELDS[id];
    const GARDEN_AREA_M2 = 10; // À remplacer par vraie valeur
    return {
      plantName: ref?.name ?? id,
      yieldPerM2: Math.round((data.quantity / GARDEN_AREA_M2) * 10) / 10,
      inraeNorm: ref?.norm ?? 3.0,
      harvestCount: data.count,
      totalQuantity: data.quantity,
    };
  }).filter(d => d.yieldPerM2 > 0).sort((a, b) => b.yieldPerM2 - a.yieldPerM2);

  if (yieldData.length === 0) {
    // Données de démonstration
    yieldData.push(
      { plantName: 'Tomate', yieldPerM2: 4.2, inraeNorm: 6.0, harvestCount: 8, totalQuantity: 42 },
      { plantName: 'Carotte', yieldPerM2: 3.8, inraeNorm: 4.5, harvestCount: 5, totalQuantity: 38 },
      { plantName: 'Salade', yieldPerM2: 2.1, inraeNorm: 2.5, harvestCount: 12, totalQuantity: 21 },
    );
  }

  return (
    <div style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yieldData} layout="vertical" margin={{ left: 20, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" tickFormatter={(v) => `${v}kg`} tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis type="category" dataKey="plantName" tick={{ fontSize: 11, fill: '#374151' }} width={70} />
          <Tooltip
            formatter={(value: number, name: string) => [`${value} kg/m²`, name === 'yieldPerM2' ? 'Rendement' : 'Norme INRAE']}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          />
          <Legend formatter={(value) => value === 'yieldPerM2' ? 'Votre rendement' : 'Norme INRAE'} />
          <Bar dataKey="yieldPerM2" fill="#16a34a" radius={[0, 4, 4, 0]} name="yieldPerM2" />
          <Bar dataKey="inraeNorm" fill="#d1d5db" radius={[0, 4, 4, 0]} name="inraeNorm" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── GDD History ───────────────────────────────────────────────────────────────

function GDDHistoryChart() {
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={GDD_HISTORY} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${v}°`} />
          <Tooltip
            formatter={(value: number, name: string) => [`${value} GDD`, name === 'gdd' ? 'Accumulation' : name]}
            labelFormatter={(label) => `Jour: ${label}`}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Line type="monotone" dataKey="gdd" stroke="#16a34a" strokeWidth={2} dot={{ fill: '#16a34a', r: 4 }} name="GDD accumulés" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Water Consumption ─────────────────────────────────────────────────────────

function WaterConsumptionChart() {
  return (
    <div style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={WATER_HISTORY} margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => `${v}L`} />
          <Tooltip
            formatter={(value: number, name: string) => [`${value} L`, name === 'actual' ? 'Consommé' : 'Prévu']}
            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          />
          <Legend />
          <Bar dataKey="actual" fill="#3b82f6" radius={[4, 4, 0, 0]} name="actual" />
          <Bar dataKey="expected" fill="#d1d5db" radius={[4, 4, 0, 0]} name="expected" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KPICard({ label, value, unit, emoji, color }: {
  label: string; value: string | number; unit?: string; emoji: string; color: string;
}) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      flex: 1,
      minWidth: 140,
    }}>
      <span style={{ fontSize: '1.75rem' }}>{emoji}</span>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>
          {value}{unit && <span style={{ fontSize: '0.75rem', fontWeight: 400, marginLeft: 2 }}>{unit}</span>}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Disease/Loss Rate ─────────────────────────────────────────────────────────

function DiseaseLossSection() {
  const [lossRate] = useState(3.2); // À remplacer par vraies données
  const [diseaseRate] = useState(1.8);

  const kpiColor = lossRate > 10 ? '#ef4444' : lossRate > 5 ? '#f59e0b' : '#16a34a';

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <KPICard
          label="Taux de perte"
          value={lossRate}
          unit="%"
          emoji="💀"
          color={kpiColor}
        />
        <KPICard
          label="Maladies"
          value={diseaseRate}
          unit="%"
          emoji="🦠"
          color={diseaseRate > 5 ? '#f59e0b' : '#16a34a'}
        />
      </div>
      <div style={{
        background: '#f9fafb',
        borderRadius: '8px',
        padding: '0.75rem',
        fontSize: '0.8rem',
        color: '#6b7280',
      }}>
        💡 <strong>Conseil :</strong> Le paillage et la rotation des cultures réduisent les risques de maladie de 40%.
      </div>
    </div>
  );
}

// ─── Stats Summary ─────────────────────────────────────────────────────────────

function StatsSummary() {
  const stats = getJournalStats();
  const totalPlantings = stats.byType.planting ?? 0;

  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <KPICard
        label="Récoltes totales"
        value={stats.totalHarvests}
        emoji="🧺"
        color="#16a34a"
      />
      <KPICard
        label="Plantations"
        value={totalPlantings}
        emoji="🌱"
        color="#22c55e"
      />
      <KPICard
        label="Ventes"
        value={stats.totalSales}
        emoji="💰"
        color="#3b82f6"
      />
      <KPICard
        label="Gagné (pièces)"
        value={stats.totalCoinsEarned.toLocaleString('fr-FR')}
        emoji="💵"
        color="#f59e0b"
      />
      <KPICard
        label="Espèces cultivées"
        value={stats.plantsGrown.size}
        emoji="🌿"
        color="#16a34a"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'yield' | 'water' | 'gdd';

export function GardenStats() {
  const [tab, setTab] = useState<Tab>('overview');

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', emoji: '📊' },
    { id: 'yield', label: 'Rendements', emoji: '📈' },
    { id: 'water', label: 'Eau', emoji: '💧' },
    { id: 'gdd', label: 'GDD', emoji: '🌡️' },
  ];

  return (
    <div style={{ padding: '1rem', maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#1a1a1a',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        📊 Tableau de Bord du Jardin
      </h2>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: 'none',
              background: tab === t.id ? '#16a34a' : '#f3f4f6',
              color: tab === t.id ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s',
            }}
          >
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && (
        <>
          <StatsSummary />
          <SectionCard title="📈 Rendements vs Normes INRAE">
            <YieldPerM2Chart />
          </SectionCard>
          <SectionCard title="🦠 Maladies & Pertes">
            <DiseaseLossSection />
          </SectionCard>
        </>
      )}

      {tab === 'yield' && (
        <SectionCard title="📈 Rendements par plante (kg/m²)">
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
            Comparez vos rendements aux normes agronomiques INRAE. Un rendement supérieur à la norme indique une culture performante.
          </p>
          <YieldPerM2Chart />
        </SectionCard>
      )}

      {tab === 'water' && (
        <SectionCard title="💧 Consommation d'eau (L/semaine)">
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
            Suivi de votre consommation d'eau vs les besoins théoriques FAO-56. Différences importantes peuvent indiquer un problème d'irrigation.
          </p>
          <WaterConsumptionChart />
        </SectionCard>
      )}

      {tab === 'gdd' && (
        <SectionCard title="🌡️ Accumulation GDD (Degrés-Jours)">
          <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
            Progression de vos cultures basée sur la chaleur accumulée. Chaque plante nécessite un total GDD pour atteindre chaque stade.
          </p>
          <GDDHistoryChart />
        </SectionCard>
      )}
    </div>
  );
}
