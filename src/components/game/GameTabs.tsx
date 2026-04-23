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
import { OnboardingTracker } from "@/components/game/OnboardingTracker";
import { VarietyCatalog } from "@/components/game/VarietyCatalog";
import { PlantingCalendar } from "@/components/game/PlantingCalendar";
import { WeatherForecast } from "@/components/game/WeatherForecast";
import { PhotoTimeline } from "@/components/game/PhotoTimeline";
import { GrowthCurveChart } from "@/components/game/GrowthCurveChart";
import {
  TreePine, ShoppingBag, Sprout,
  Warehouse, Home, ScanSearch, BookOpen, Scale, Bug, Save, Droplets, Leaf,
  Flower2, CalendarDays, Camera, TrendingUp,
} from "lucide-react";

export function GameTabs() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const gardenPlants = useGameStore((s) => s.gardenPlants);

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
      <TabsList className="bg-white border-black rounded-xl p-1 h-auto flex-wrap gap-[3px]" style={{ borderWidth: 'var(--ui-border-width)', boxShadow: `var(--ui-shadow-offset) var(--ui-shadow-offset) 0 0 #000` }}>
        {/* Principaux */}
        <TabsTrigger
          value="jardin" style={tabStyle}
          className="data-[state=active]:bg-green-100 data-[state=active]:border-green-300 border-transparent rounded-lg font-black uppercase"
        >
          <TreePine style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🌿 Jardin</span>
          <span className="sm:hidden">🌿</span>
        </TabsTrigger>
        <TabsTrigger
          value="serre" style={tabStyle}
          className="data-[state=active]:bg-cyan-100 data-[state=active]:border-cyan-300 border-transparent rounded-lg font-black uppercase"
        >
          <Home style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🏡 Serre</span>
          <span className="sm:hidden">🏡</span>
        </TabsTrigger>
        <TabsTrigger
          value="pepiniere" style={tabStyle}
          className="data-[state=active]:bg-stone-100 data-[state=active]:border-stone-300 border-transparent rounded-lg font-black uppercase"
        >
          <Warehouse style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🏠 Culture</span>
          <span className="sm:hidden">🏠</span>
        </TabsTrigger>
        <TabsTrigger
          value="boutique" style={tabStyle}
          className="data-[state=active]:bg-amber-100 data-[state=active]:border-amber-300 border-transparent rounded-lg font-black uppercase"
        >
          <ShoppingBag style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🏪 Boutique</span>
          <span className="sm:hidden">🏪</span>
        </TabsTrigger>
        <TabsTrigger
          value="graines" style={tabStyle}
          className="data-[state=active]:bg-emerald-100 data-[state=active]:border-emerald-300 border-transparent rounded-lg font-black uppercase"
        >
          <Sprout style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🌱 Inventaire</span>
          <span className="sm:hidden">🌱</span>
        </TabsTrigger>
        <TabsTrigger
          value="identificateur" style={tabStyle}
          className="data-[state=active]:bg-violet-100 data-[state=active]:border-violet-300 border-transparent rounded-lg font-black uppercase"
        >
          <ScanSearch style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🔍 ID</span>
          <span className="sm:hidden">🔍</span>
        </TabsTrigger>
        {/* Outils */}
        <TabsTrigger
          value="journal" style={tabStyle}
          className="data-[state=active]:bg-indigo-100 data-[state=active]:border-indigo-300 border-transparent rounded-lg font-black uppercase"
        >
          <BookOpen style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">📔 Journal</span>
          <span className="sm:hidden">📔</span>
        </TabsTrigger>
        <TabsTrigger
          value="recoltes" style={tabStyle}
          className="data-[state=active]:bg-amber-100 data-[state=active]:border-amber-300 border-transparent rounded-lg font-black uppercase"
        >
          <Scale style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">⚖️ Récoltes</span>
          <span className="sm:hidden">⚖️</span>
        </TabsTrigger>
        <TabsTrigger
          value="maladies" style={tabStyle}
          className="data-[state=active]:bg-red-100 data-[state=active]:border-red-300 border-transparent rounded-lg font-black uppercase"
        >
          <Bug style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🦠 Maladies</span>
          <span className="sm:hidden">🦠</span>
        </TabsTrigger>
        <TabsTrigger
          value="sauvegardes" style={tabStyle}
          className="data-[state=active]:bg-blue-100 data-[state=active]:border-blue-300 border-transparent rounded-lg font-black uppercase"
        >
          <Save style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">💾 Save</span>
          <span className="sm:hidden">💾</span>
        </TabsTrigger>
        <TabsTrigger
          value="eau" style={tabStyle}
          className="data-[state=active]:bg-cyan-100 data-[state=active]:border-cyan-300 border-transparent rounded-lg font-black uppercase"
        >
          <Droplets style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">💧 Eau</span>
          <span className="sm:hidden">💧</span>
        </TabsTrigger>
        <TabsTrigger
          value="croissance" style={tabStyle}
          className="data-[state=active]:bg-lime-100 data-[state=active]:border-lime-300 border-transparent rounded-lg font-black uppercase"
        >
          <Leaf style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🌱 Croissance</span>
          <span className="sm:hidden">🌱</span>
        </TabsTrigger>
        <TabsTrigger
          value="catalogue" style={tabStyle}
          className="data-[state=active]:bg-emerald-100 data-[state=active]:border-emerald-300 border-transparent rounded-lg font-black uppercase"
        >
          <Flower2 style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">📖 Catalogue</span>
          <span className="sm:hidden">📖</span>
        </TabsTrigger>
        <TabsTrigger
          value="meteo" style={tabStyle}
          className="data-[state=active]:bg-sky-100 data-[state=active]:border-sky-300 border-transparent rounded-lg font-black uppercase"
        >
          <TrendingUp style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">🌦️ Météo</span>
          <span className="sm:hidden">🌦️</span>
        </TabsTrigger>
        <TabsTrigger
          value="photos" style={tabStyle}
          className="data-[state=active]:bg-purple-100 data-[state=active]:border-purple-300 border-transparent rounded-lg font-black uppercase"
        >
          <Camera style={tabIconStyle} />
          <span className="hidden sm:inline ml-1">📸 Photos</span>
          <span className="sm:hidden">📸</span>
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
        <div className="space-y-4">
          <HologramEvolution />
          {gardenPlants.length > 0 && (
            <div className="p-3 bg-white border-2 border-lime-200 rounded-xl">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-black text-lime-600 uppercase">Courbe de croissance</span>
              </div>
              <GrowthCurveChart
                plantDefId={gardenPlants[0].plantDefId}
                currentStage={gardenPlants[0].plant.stage}
                gddAccumulated={0}
              />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="catalogue" className="mt-4">
        <div className="space-y-4">
          <VarietyCatalog />
          <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border-[3px] border-green-400 rounded-2xl shadow-[4px_4px_0_0_#000]">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-green-600" />
              <span className="text-sm font-black uppercase text-green-700">Calendrier de plantation</span>
            </div>
            <PlantingCalendar />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="meteo" className="mt-4">
        <WeatherForecast />
      </TabsContent>

      <TabsContent value="photos" className="mt-4">
        <PhotoTimeline />
      </TabsContent>
    </Tabs>
    </>
  );
}