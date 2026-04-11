"use client";

import { useGameStore } from "@/store/game-store";
import { Pepiniere } from "@/components/game/Pepiniere";
import { SerreJardinView } from "@/components/game/SerreJardinView";
import { Boutique } from "@/components/game/Boutique";
import { GrainCollection } from "@/components/game/GrainCollection";
import { IAJardinier } from "@/components/game/IAJardinier";
import { Jardin } from "@/components/game/Jardin";
import PlantIdentifier from "@/components/game/PlantIdentifier";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { HarvestTracker } from "@/components/game/HarvestTracker";
import { GardenJournalLunar } from "@/components/game/GardenJournalLunar";
import DiseaseDetector from "@/components/game/DiseaseDetector";
import { GardenSaveManager } from "@/components/game/GardenSaveManager";
import WaterBudget from "@/components/game/WaterBudget";
import { HologramEvolution } from "@/components/game/HologramEvolutionCard";
import { GameConsole } from "@/components/game/GameConsole";
import {
  TreePine, ShoppingBag, Sprout,
  Warehouse, Home, ScanSearch, BookOpen, Scale, Bug, Save, Droplets, Leaf,
} from "lucide-react";

export function GameTabs() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
      <TabsList className="bg-white border-2 border-black rounded-xl shadow-[3px_3px_0_0_#000] p-1 h-auto flex-wrap">
        {/* Ligne 1 : principaux */}
        <TabsTrigger
          value="jardin"
          className="data-[state=active]:bg-green-100 data-[state=active]:border-green-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <TreePine className="w-3.5 h-3.5" />
          🌿 Jardin
        </TabsTrigger>
        <TabsTrigger
          value="serre"
          className="data-[state=active]:bg-cyan-100 data-[state=active]:border-cyan-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Home className="w-3.5 h-3.5" />
          🏡 Serre
        </TabsTrigger>
        <TabsTrigger
          value="pepiniere"
          className="data-[state=active]:bg-stone-100 data-[state=active]:border-stone-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Warehouse className="w-3.5 h-3.5" />
          🏠 Culture
        </TabsTrigger>
        <TabsTrigger
          value="boutique"
          className="data-[state=active]:bg-amber-100 data-[state=active]:border-amber-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          🏪 Boutique
        </TabsTrigger>
        <TabsTrigger
          value="graines"
          className="data-[state=active]:bg-emerald-100 data-[state=active]:border-emerald-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Sprout className="w-3.5 h-3.5" />
          🌱 Graines
        </TabsTrigger>
        <TabsTrigger
          value="identificateur"
          className="data-[state=active]:bg-violet-100 data-[state=active]:border-violet-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <ScanSearch className="w-3.5 h-3.5" />
          🔍 ID
        </TabsTrigger>
        {/* Ligne 2 : outils */}
        <TabsTrigger
          value="journal"
          className="data-[state=active]:bg-indigo-100 data-[state=active]:border-indigo-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          📔 Journal
        </TabsTrigger>
        <TabsTrigger
          value="recoltes"
          className="data-[state=active]:bg-amber-100 data-[state=active]:border-amber-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Scale className="w-3.5 h-3.5" />
          ⚖️ Récoltes
        </TabsTrigger>
        <TabsTrigger
          value="maladies"
          className="data-[state=active]:bg-red-100 data-[state=active]:border-red-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Bug className="w-3.5 h-3.5" />
          🦠 Maladies
        </TabsTrigger>
        <TabsTrigger
          value="sauvegardes"
          className="data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Save className="w-3.5 h-3.5" />
          💾 Save
        </TabsTrigger>
        <TabsTrigger
          value="eau"
          className="data-[state=active]:bg-cyan-100 data-[state=active]:border-cyan-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Droplets className="w-3.5 h-3.5" />
          💧 Eau
        </TabsTrigger>
        <TabsTrigger
          value="croissance"
          className="data-[state=active]:bg-lime-100 data-[state=active]:border-lime-300 border-2 border-transparent rounded-lg px-3 py-1.5 text-[13px] font-black uppercase gap-1"
        >
          <Leaf className="w-3.5 h-3.5" />
          🌱 Croissance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="jardin" className="mt-4">
        <div className="space-y-4">
          <div className="border border-muted-foreground/20 rounded-lg p-2 bg-muted/10">
            <div className="grid grid-cols-2 gap-2">
              <IAJardinier />
              <GameConsole />
            </div>
          </div>
          <Jardin />
        </div>
      </TabsContent>

      <TabsContent value="serre" className="mt-4">
        <SerreJardinView />
      </TabsContent>

      <TabsContent value="pepiniere" className="mt-4">
        <Pepiniere />
      </TabsContent>

      <TabsContent value="boutique" className="mt-4">
        <Boutique />
      </TabsContent>

      <TabsContent value="graines" className="mt-4">
        <GrainCollection />
      </TabsContent>

      <TabsContent value="identificateur" className="mt-4">
        <PlantIdentifier />
      </TabsContent>

      <TabsContent value="journal" className="mt-4">
        <GardenJournalLunar />
      </TabsContent>

      <TabsContent value="recoltes" className="mt-4">
        <HarvestTracker />
      </TabsContent>

      <TabsContent value="maladies" className="mt-4">
        <DiseaseDetector />
      </TabsContent>

      <TabsContent value="sauvegardes" className="mt-4">
        <GardenSaveManager />
      </TabsContent>

      <TabsContent value="eau" className="mt-4">
        <WaterBudget />
      </TabsContent>

      <TabsContent value="croissance" className="mt-4">
        <HologramEvolution />
      </TabsContent>
    </Tabs>
  );
}