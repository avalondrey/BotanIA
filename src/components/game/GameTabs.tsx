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
import { DailyBonusPopup } from "@/components/game/DailyBonusPopup";
import { QuestTracker } from "@/components/game/QuestTracker";
import {
  TreePine, ShoppingBag, Sprout,
  Warehouse, Home, ScanSearch, BookOpen, Scale, Bug, Save, Droplets, Leaf,
} from "lucide-react";

export function GameTabs() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  const tabStyle = {
    fontSize: 'var(--ui-tab-font)',
    paddingTop: 'var(--ui-tab-padding-y)',
    paddingBottom: 'var(--ui-tab-padding-y)',
    paddingLeft: 'var(--ui-tab-padding-x)',
    paddingRight: 'var(--ui-tab-padding-x)',
    borderWidth: '2px',
  } as React.CSSProperties;

  const tabIconStyle = { width: 'var(--ui-tab-icon)', height: 'var(--ui-tab-icon)' } as React.CSSProperties;

  return (
    <>
      <DailyBonusPopup />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
      <TabsList className="bg-white border-black rounded-xl p-1 h-auto flex-wrap" style={{ borderWidth: 'var(--ui-border-width)', boxShadow: `var(--ui-shadow-offset) var(--ui-shadow-offset) 0 0 #000`, gap: 'var(--ui-tab-gap)' }}>
        {/* Ligne 1 : principaux */}
        <TabsTrigger
          value="jardin" style={tabStyle}
          className="data-[state=active]:bg-green-100 data-[state=active]:border-green-300 border-transparent rounded-lg font-black uppercase"
        >
          <TreePine style={tabIconStyle} />
          🌿 Jardin
        </TabsTrigger>
        <TabsTrigger
          value="serre" style={tabStyle}
          className="data-[state=active]:bg-cyan-100 data-[state=active]:border-cyan-300 border-transparent rounded-lg font-black uppercase"
        >
          <Home style={tabIconStyle} />
          🏡 Serre
        </TabsTrigger>
        <TabsTrigger
          value="pepiniere" style={tabStyle}
          className="data-[state=active]:bg-stone-100 data-[state=active]:border-stone-300 border-transparent rounded-lg font-black uppercase"
        >
          <Warehouse style={tabIconStyle} />
          🏠 Culture
        </TabsTrigger>
        <TabsTrigger
          value="boutique" style={tabStyle}
          className="data-[state=active]:bg-amber-100 data-[state=active]:border-amber-300 border-transparent rounded-lg font-black uppercase"
        >
          <ShoppingBag style={tabIconStyle} />
          🏪 Boutique
        </TabsTrigger>
        <TabsTrigger
          value="graines" style={tabStyle}
          className="data-[state=active]:bg-emerald-100 data-[state=active]:border-emerald-300 border-transparent rounded-lg font-black uppercase"
        >
          <Sprout style={tabIconStyle} />
          🌱 Inventaire
        </TabsTrigger>
        <TabsTrigger
          value="identificateur" style={tabStyle}
          className="data-[state=active]:bg-violet-100 data-[state=active]:border-violet-300 border-transparent rounded-lg font-black uppercase"
        >
          <ScanSearch style={tabIconStyle} />
          🔍 ID
        </TabsTrigger>
        {/* Ligne 2 : outils */}
        <TabsTrigger
          value="journal" style={tabStyle}
          className="data-[state=active]:bg-indigo-100 data-[state=active]:border-indigo-300 border-transparent rounded-lg font-black uppercase"
        >
          <BookOpen style={tabIconStyle} />
          📔 Journal
        </TabsTrigger>
        <TabsTrigger
          value="recoltes" style={tabStyle}
          className="data-[state=active]:bg-amber-100 data-[state=active]:border-amber-300 border-transparent rounded-lg font-black uppercase"
        >
          <Scale style={tabIconStyle} />
          ⚖️ Récoltes
        </TabsTrigger>
        <TabsTrigger
          value="maladies" style={tabStyle}
          className="data-[state=active]:bg-red-100 data-[state=active]:border-red-300 border-transparent rounded-lg font-black uppercase"
        >
          <Bug style={tabIconStyle} />
          🦠 Maladies
        </TabsTrigger>
        <TabsTrigger
          value="sauvegardes" style={tabStyle}
          className="data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300 border-transparent rounded-lg font-black uppercase"
        >
          <Save style={tabIconStyle} />
          💾 Save
        </TabsTrigger>
        <TabsTrigger
          value="eau" style={tabStyle}
          className="data-[state=active]:bg-cyan-100 data-[state=active]:border-cyan-300 border-transparent rounded-lg font-black uppercase"
        >
          <Droplets style={tabIconStyle} />
          💧 Eau
        </TabsTrigger>
        <TabsTrigger
          value="croissance" style={tabStyle}
          className="data-[state=active]:bg-lime-100 data-[state=active]:border-lime-300 border-transparent rounded-lg font-black uppercase"
        >
          <Leaf style={tabIconStyle} />
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
    </>
  );
}