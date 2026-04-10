'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Scale, Bug, Moon } from 'lucide-react';

const ComingSoon = ({ title, icon: Icon, description }: { title: string; icon: any; description: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center space-y-4">
    <div className="p-6 bg-white border-4 border-black rounded-full shadow-[4px_4px_0_0_#000]">
      <Icon className="w-12 h-12 text-stone-600" />
    </div>
    <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
    <p className="text-stone-500 max-w-md">{description}</p>
    <div className="px-4 py-2 bg-amber-100 text-amber-800 text-xs font-bold uppercase rounded-full border border-amber-300 animate-pulse">
      En cours de développement 🛠️
    </div>
  </div>
);

export function HarvestTracker() {
  return (
    <Card className="border-4 border-black shadow-[4px_4px_0_0_#000]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase font-black">
          <Scale className="w-5 h-5" /> Suivi des Récoltes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComingSoon
          title="Suivi des Récoltes"
          icon={Scale}
          description="Analyse detailed de vos rendements, poids récoltés et statistiques de productivité par rang."
        />
      </CardContent>
    </Card>
  );
}

export function GardenJournal() {
  return (
    <Card className="border-4 border-black shadow-[4px_4px_0_0_#000]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase font-black">
          <BookOpen className="w-5 h-5" /> Journal du Jardin
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComingSoon
          title="Journal de Bord"
          icon={BookOpen}
          description="Notez vos observations quotidiennes, liez vos photos et gardez une trace de l'évolution de vos cultures."
        />
      </CardContent>
    </Card>
  );
}

export default function DiseaseDetector() {
  return (
    <Card className="border-4 border-black shadow-[4px_4px_0_0_#000]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase font-black">
          <Bug className="w-5 h-5" /> Détecteur de Maladies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComingSoon
          title="Analyse Phytosanitaire"
          icon={Bug}
          description="Utilisez l'IA pour diagnostiquer les maladies et ravageurs. (Accédez aussi via l'onglet Identificateur)"
        />
      </CardContent>
    </Card>
  );
}

export function LunarCalendar() {
  return (
    <Card className="border-4 border-black shadow-[4px_4px_0_0_#000]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 uppercase font-black">
          <Moon className="w-5 h-5" /> Calendrier Lunaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ComingSoon
          title="Cycles Lunaires"
          icon={Moon}
          description="Planifiez vos semis et récoltes selon les phases de la lune pour optimiser la croissance."
        />
      </CardContent>
    </Card>
  );
}
