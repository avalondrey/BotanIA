/**
 * GardenJournalLunar — Journal + Calendrier Lunaire Unifié
 * ======================================================
 *
 * Fusionne le journal de jardin avec le calendrier lunaire :
 * - Boîte lune compacte (côté gauche)
 * - Grand calendrier mensuel (centre)
 * - Historique plantations 2024 vs 2025
 * - Tâches et conseils journaliers
 */

import { useState, useMemo } from 'react';
import { useJournalStore, JournalEntry } from '@/store/journal-store';
import { useGameStore } from '@/store/game-store';
import { usePhotoStore, GardenPhoto } from '@/store/photo-store';
import { getLunarPhase, getMoonIllumination } from '@/lib/lunar-calendar';
import { JournalEntrySheet } from './JournalEntrySheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  BookOpen,
  Image,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Droplets,
  Sprout,
  Scissors,
  Shovel,
  AlertCircle,
  Thermometer,
  CloudRain,
  Wind,
  Eye,
} from 'lucide-react';
import {
  format,
  parseISO,
  isValid,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  getDay,
  addDays,
  startOfWeek,
  getYear,
} from 'date-fns';
import { fr } from 'date-fns/locale';

// ═══════════════════════════════════════════════════════════════
//  DONNÉES DE CONSEILS DE JARDINAGE RÉELS (INRAE, Calendriers populaires)
// ═══════════════════════════════════════════════════════════════

interface DayTask {
  emoji: string;
  label: string;
  category: 'semis' | 'recolte' | 'taille' | 'travail' | 'Entretien';
  isUrgent?: boolean;
}

// Tâches par mois (janvier = 0, décembre = 11)
const MONTHLY_TASKS: Record<number, { tasks: DayTask[]; description: string }> = {
  0: { // Janvier
    description: 'Taille des arbres fruitiers, prévision des semis',
    tasks: [
      { emoji: '✂️', label: 'Taille pommiers/poiriers', category: 'taille' },
      { emoji: '📋', label: 'Commande graines', category: 'travail' },
      { emoji: '🔍', label: 'Vérifier conservation', category: 'Entretien' },
      { emoji: '🧹', label: 'Nettoyage outils', category: 'Entretien' },
    ],
  },
  1: { // Février
    description: 'Semis sous abri, préparation du sol',
    tasks: [
      { emoji: '🌱', label: 'Semis tomates (abri)', category: 'semis', isUrgent: true },
      { emoji: '🌶️', label: 'Semis piments (abri)', category: 'semis' },
      { emoji: '🥬', label: 'Semis laitues (abri)', category: 'semis' },
      { emoji: '🔬', label: 'Test germination', category: 'travail' },
    ],
  },
  2: { // Mars
    description: 'Semis en pleine terre, taille douce',
    tasks: [
      { emoji: '🥕', label: 'Semis carotte', category: 'semis', isUrgent: true },
      { emoji: '🫛', label: 'Semis pois', category: 'semis' },
      { emoji: '🥬', label: 'Semis choux', category: 'semis' },
      { emoji: '🌿', label: 'Semis basilic (fin mars)', category: 'semis' },
      { emoji: '✂️', label: 'Taille haies', category: 'taille' },
    ],
  },
  3: { // Avril
    description: 'Plantation, semis directs, paillage',
    tasks: [
      { emoji: '🍅', label: 'Plantation tomates', category: 'semis', isUrgent: true },
      { emoji: '🥒', label: 'Semis courgette', category: 'semis' },
      { emoji: '🌱', label: 'Repiquage plants', category: 'travail' },
      { emoji: '🍂', label: 'Paillage', category: 'travail' },
      { emoji: '💧', label: 'Installation goutte-à-goutte', category: 'travail' },
    ],
  },
  4: { // Mai
    description: 'Plantation, binage, surveillance ravageurs',
    tasks: [
      { emoji: '🫑', label: 'Plantation poivrons', category: 'semis' },
      { emoji: '🥬', label: 'Plantation choux', category: 'semis' },
      { emoji: '🔍', label: 'Surveillance pucerons', category: 'Entretien', isUrgent: true },
      { emoji: '🧹', label: 'Binage', category: 'travail' },
    ],
  },
  5: { // Juin
    description: 'Récoltes précoces, taille tomates, pause taille haies',
    tasks: [
      { emoji: '🍓', label: 'Récolte fraise', category: 'recolte', isUrgent: true },
      { emoji: '✂️', label: 'Taille tomates (gourmands)', category: 'taille' },
      { emoji: '🚫', label: 'Éviter taille haies (nids)', category: 'taille' },
      { emoji: '💧', label: 'Arrosage régulier', category: 'Entretien' },
    ],
  },
  6: { // Juillet
    description: 'Récoltes, taille, boutures',
    tasks: [
      { emoji: '🍅', label: 'Récolte tomates', category: 'recolte', isUrgent: true },
      { emoji: '🥕', label: 'Récolte carotte', category: 'recolte' },
      { emoji: '✂️', label: 'Taille tomates', category: 'taille' },
      { emoji: '🌿', label: 'Boutures basilic', category: 'travail' },
    ],
  },
  7: { // Août
    description: 'Récoltes, conservation, semis d\'automne',
    tasks: [
      { emoji: '🧅', label: 'Récolte oignon', category: 'recolte', isUrgent: true },
      { emoji: '🧄', label: 'Récolte ail', category: 'recolte' },
      { emoji: '🥬', label: 'Semis laitue d\'automne', category: 'semis' },
      { emoji: '🌱', label: 'Semis épinard', category: 'semis' },
    ],
  },
  8: { // Septembre
    description: "Récoltes, plantation ail, taille haies à nouveau",
    tasks: [
      { emoji: '🍇', label: 'Récolte raisin', category: 'recolte' },
      { emoji: '🫐', label: 'Récolte myrtilles', category: 'recolte' },
      { emoji: '🌿', label: 'Plantation ail', category: 'semis' },
      { emoji: '✂️', label: 'Taille haies (nids terminés)', category: 'taille' },
    ],
  },
  9: { // Octobre
    description: 'Plantation, labour, plantation bulbes',
    tasks: [
      { emoji: '🌷', label: 'Plantation bulbes printemps', category: 'semis' },
      { emoji: '🧄', label: 'Plantation ail', category: 'semis' },
      { emoji: '🍂', label: 'Nettoyage massif', category: 'travail' },
      { emoji: '🌿', label: 'Paillage protecteur', category: 'travail' },
    ],
  },
  10: { // Novembre
    description: 'Plantation arbres, protection hivernal',
    tasks: [
      { emoji: '🌳', label: 'Plantation arbres fruitiers', category: 'semis', isUrgent: true },
      { emoji: '🍁', label: 'Feuilles mortes → compost', category: 'travail' },
      { emoji: '🧤', label: 'Protection plantes fragiles', category: 'Entretien' },
      { emoji: '🔧', label: 'Rangement outils', category: 'Entretien' },
    ],
  },
  11: { // Décembre
    description: 'Repos, planification, taille sèche',
    tasks: [
      { emoji: '✂️', label: 'Taille arbres fruitiers', category: 'taille' },
      { emoji: '📋', label: 'Bilan annuel', category: 'travail' },
      { emoji: '📦', label: 'Commande catalogues', category: 'travail' },
      { emoji: '🔍', label: 'Vérifier stocks', category: 'travail' },
    ],
  },
};

// Catégories avec couleurs
const CATEGORY_COLORS: Record<string, string> = {
  semis: 'bg-green-100 text-green-800 border-green-300',
  recolte: 'bg-amber-100 text-amber-800 border-amber-300',
  taille: 'bg-red-100 text-red-800 border-red-300',
  travail: 'bg-blue-100 text-blue-800 border-blue-300',
  Entretien: 'bg-gray-100 text-gray-800 border-gray-300',
};

// Mois en français
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Jours de la semaine
const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface PlantingHistory {
  date: string;
  plantDefId: string;
  location: 'jardin' | 'mini-serre';
  year: number;
  quantity?: number;
}

export function GardenJournalLunar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState('calendar');

  const { entries } = useJournalStore();
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const miniSerres = useGameStore((s) => s.miniSerres);
  const photos = usePhotoStore((s) => s.photos);

  // Phase lunaire actuelle
  const currentPhase = getLunarPhase(new Date());

  // Phase lunaire pour une date
  const getPhaseForDate = (date: Date) => getLunarPhase(date);

  // Jours du mois avec navigation semaine
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Tâches du jour sélectionnée
  const getTasksForDate = (date: Date): DayTask[] => {
    const monthData = MONTHLY_TASKS[date.getMonth()];
    return monthData?.tasks || [];
  };

  // Vérifier si date a des entrées journal
  const hasJournalEntry = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.some(e => e.date === dateStr);
  };

  // Vérifier si date a des photos
  const hasPhotos = (date: Date): boolean => {
    const dateStart = date.getTime();
    const dateEnd = dateStart + 24 * 60 * 60 * 1000;
    return photos.some(p => p.takenAt >= dateStart && p.takenAt < dateEnd);
  };

  // Récupérer entrées pour une date
  const getEntriesForDate = (date: Date): JournalEntry[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entries.filter(e => e.date === dateStr);
  };

  // Historique des plantations (simulation 2024 vs 2025)
  const getPlantingHistory = (date: Date): PlantingHistory[] => {
    // Simulation basée sur les données réelles du jeu
    // En réalité, ça viendra du journal de culture
    const histories: PlantingHistory[] = [];
    const currentYear = getYear(date);
    const month = date.getMonth();
    const day = date.getDate();

    // Simuler quelques plantations pour la démo
    if (month === 2 && day === 15 && currentYear === 2025) {
      histories.push({
        date: '2024-03-15',
        plantDefId: 'tomato',
        location: 'jardin',
        year: 2024,
      });
    }
    if (month === 3 && day === 1) {
      histories.push({
        date: `${currentYear - 1}-04-01`,
        plantDefId: 'carrot',
        location: 'jardin',
        year: currentYear - 1,
        quantity: 30,
      });
    }
    if (month === 1 && day >= 1 && day <= 28) {
      histories.push({
        date: `2024-02-${day.toString().padStart(2, '0')}`,
        plantDefId: 'pepper',
        location: 'mini-serre',
        year: 2024,
      });
    }

    return histories;
  };

  const selectedDateEntries = getEntriesForDate(selectedDate);
  const selectedDateTasks = getTasksForDate(selectedDate);
  const selectedDateHistory = getPlantingHistory(selectedDate);
  const selectedDatePhase = getPhaseForDate(selectedDate);

  return (
    <div className="space-y-4 p-4">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xl font-bold">{entries.length}</p>
                <p className="text-[10px] text-muted-foreground">entrées</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xl font-bold">{photos.length}</p>
                <p className="text-[10px] text-muted-foreground">photos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Sprout className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-xl font-bold">{gardenPlants.length}</p>
                <p className="text-[10px] text-muted-foreground">plants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-200">
          <CardContent className="pt-3 pb-2">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-indigo-600" />
              <div>
                <p className="text-xl font-bold">{currentPhase.emoji}</p>
                <p className="text-[10px] text-muted-foreground">{currentPhase.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal : lune compacte + calendrier */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Colonne gauche : Lune compacte */}
        <div className="lg:col-span-1 space-y-3">
          {/* Boîte lune compacte */}
          <Card className="bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-5xl mb-2">{currentPhase.emoji}</p>
                <p className="font-bold text-indigo-900">{currentPhase.name}</p>
                <p className="text-sm text-indigo-700 mb-2">
                  {format(new Date(), 'EEEE d MMMM', { locale: fr })}
                </p>
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${i < currentPhase.illumination / 15 ? 'bg-indigo-600' : 'bg-indigo-300'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-indigo-600">{Math.round(currentPhase.illumination)}% illumination</p>
              </div>

              {/* Signe zodiacal */}
              <div className="mt-3 p-2 bg-white/50 rounded-lg">
                <p className="text-center text-sm font-medium">
                  ♈ {currentPhase.zodiacSign}
                </p>
                <p className="text-center text-xs text-muted-foreground">
                  Élément: {currentPhase.zodiacElement}
                </p>
              </div>

              {/* Conseils lune */}
              <div className="mt-3 space-y-1">
                <div className={`flex items-center gap-2 text-xs p-1.5 rounded ${currentPhase.isGoodForPlanting ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-600'}`}>
                  {currentPhase.isGoodForPlanting ? <Sprout className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>Semis</span>
                </div>
                <div className={`flex items-center gap-2 text-xs p-1.5 rounded ${currentPhase.isGoodForRootHarvest ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-600'}`}>
                  {currentPhase.isGoodForRootHarvest ? <Shovel className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>Récolte racines</span>
                </div>
                <div className={`flex items-center gap-2 text-xs p-1.5 rounded ${currentPhase.isGoodForPruning ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-600'}`}>
                  {currentPhase.isGoodForPruning ? <Scissors className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                  <span>Taille</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertes lune */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-3">
              <p className="text-xs font-bold text-amber-800 mb-2">🌙 Conseil du jour</p>
              <p className="text-xs text-amber-700 italic">"{currentPhase.gardeningAdvice}"</p>
            </CardContent>
          </Card>

          {/* Prochaines pleine/nouvelle lune */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-3">
              <p className="text-xs font-bold text-purple-800 mb-2">📅 Prochaines lunes</p>
              <div className="space-y-1 text-xs">
                <p>🌕 Pleine lune: {getNextFullMoon()}</p>
                <p>🌑 Nouvelle lune: {getNextNewMoon()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite : Calendrier + Détails */}
        <div className="lg:col-span-3 space-y-3">
          {/* Navigation mois */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-bold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Grille calendrier */}
          <Card>
            <CardContent className="pt-4">
              {/* En-têtes jours */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Jours */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day) => {
                  const phase = getPhaseForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);
                  const hasEntry = hasJournalEntry(day);
                  const dayHasPhotos = hasPhotos(day);
                  const tasks = getTasksForDate(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        min-h-[70px] p-1 rounded border text-left transition-all
                        ${isSelected ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300' : ''}
                        ${isToday && !isSelected ? 'border-amber-400 bg-amber-50' : ''}
                        ${!isCurrentMonth ? 'bg-muted/30 opacity-50' : 'bg-white'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-sm font-medium ${isToday ? 'text-amber-700 font-bold' : ''}`}>
                          {format(day, 'd')}
                        </span>
                        <span className="text-sm">{phase.emoji}</span>
                      </div>

                      {/* Indicateurs */}
                      <div className="flex items-center gap-0.5 mt-1">
                        {hasEntry && <span className="text-[8px]">📝</span>}
                        {dayHasPhotos && <span className="text-[8px]">📷</span>}
                      </div>

                      {/* Tâches urgentes */}
                      {isCurrentMonth && tasks.filter(t => t.isUrgent).length > 0 && (
                        <div className="mt-1">
                          <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded">
                            {tasks.find(t => t.isUrgent)?.emoji} urgent
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Détails du jour sélectionné */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  📅 {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  {selectedDatePhase && (
                    <span className="ml-2">{selectedDatePhase.emoji}</span>
                  )}
                </CardTitle>
                <JournalEntrySheet
                  defaultDate={format(selectedDate, 'yyyy-MM-dd')}
                  trigger={
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Entrée
                    </Button>
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tâches du jour */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Shovel className="h-4 w-4 text-green-600" />
                  Tâches ({MONTHS[selectedDate.getMonth()]})
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedDateTasks.map((task, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs ${CATEGORY_COLORS[task.category]}`}
                    >
                      <span className="text-lg">{task.emoji}</span>
                      <span className="flex-1">{task.label}</span>
                      {task.isUrgent && (
                        <Badge variant="destructive" className="text-[8px]">!</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Historique plantation 2024 vs 2025 */}
              {selectedDateHistory.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4 text-amber-600" />
                    Historique plantation
                  </p>
                  <div className="space-y-2">
                    {selectedDateHistory.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                        <span className="text-lg">
                          {h.plantDefId === 'tomato' ? '🍅' :
                           h.plantDefId === 'carrot' ? '🥕' :
                           h.plantDefId === 'pepper' ? '🌶️' : '🌱'}
                        </span>
                        <div className="flex-1">
                          <p className="font-medium capitalize">{h.plantDefId}</p>
                          <p className="text-muted-foreground">
                            {h.location === 'mini-serre' ? '🌱 Mini-serre' : '🌍 Jardin'} • {h.year}
                          </p>
                        </div>
                        {h.year < getYear(selectedDate) && (
                          <Badge variant="outline" className="text-[10px]">
                            vs {getYear(selectedDate)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entrées journal */}
              <div>
                <p className="text-sm font-medium mb-2">📔 Entrées journal</p>
                {selectedDateEntries.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Aucune entrée ce jour
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedDateEntries.map(entry => (
                      <div key={entry.id} className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{entry.title}</p>
                          {entry.mood && <span>{
                            entry.mood === 'great' ? '🌟' :
                            entry.mood === 'good' ? '😊' :
                            entry.mood === 'neutral' ? '😐' : '😔'
                          }</span>}
                        </div>
                        {entry.content && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.content}</p>
                        )}
                        {entry.photoIds.length > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Image className="h-3 w-3 text-blue-500" />
                            <span className="text-xs text-blue-600">{entry.photoIds.length} photo(s)</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos du jour */}
              <div>
                <p className="text-sm font-medium mb-2">📷 Photos</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {photos
                    .filter(p => {
                      const photoDate = new Date(p.takenAt);
                      return isSameDay(photoDate, selectedDate);
                    })
                    .slice(0, 4)
                    .filter(photo => photo.dataUrl)
                    .map(photo => (
                      <div key={photo.id} className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                        <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  {photos.filter(p => isSameDay(new Date(p.takenAt), selectedDate)).length === 0 && (
                    <p className="text-xs text-muted-foreground">Aucune photo ce jour</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper pour calculer la prochaine pleine lune
function getNextFullMoon(): string {
  const today = new Date();
  const SYNODIC_MONTH = 29.53058867;
  const KNOWN_FULL_MOON = new Date('2026-04-07').getTime(); // Pleine lune récente

  let daysUntil = SYNODIC_MONTH / 2 - ((today.getTime() - KNOWN_FULL_MOON) / (1000 * 60 * 60 * 24)) % SYNODIC_MONTH;
  if (daysUntil < 0) daysUntil += SYNODIC_MONTH;

  const nextFull = addDays(today, Math.ceil(daysUntil));
  return format(nextFull, 'd MMM');
}

// Helper pour calculer la prochaine nouvelle lune
function getNextNewMoon(): string {
  const today = new Date();
  const SYNODIC_MONTH = 29.53058867;
  const KNOWN_NEW_MOON = new Date('2026-03-29').getTime(); // Nouvelle lune récente

  let daysUntil = SYNODIC_MONTH - ((today.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24)) % SYNODIC_MONTH;
  if (daysUntil < 0) daysUntil += SYNODIC_MONTH;

  const nextNew = addDays(today, Math.ceil(daysUntil));
  return format(nextNew, 'd MMM');
}

export default GardenJournalLunar;
