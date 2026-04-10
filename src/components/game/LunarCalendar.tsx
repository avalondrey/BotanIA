/**
 * LunarCalendar Component
 * Affiche les phases lunaires, calendrier annuel et conseils jardinage
 */

import { useState, useEffect, useMemo } from 'react';
import { getLunarPhase, LunarPhase, getMoonIllumination } from '@/lib/lunar-calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Droplets,
  Scissors,
  Shovel,
  Sprout,
  AlertCircle,
  CalendarDays,
  SproutIcon,
  Apple,
  Leaf,
  TreePine,
  Bug,
  Warehouse,
} from 'lucide-react';
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  getDay,
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Activités de jardinage par catégorie
const GARDEN_ACTIVITIES = {
  semis: {
    label: 'Semis',
    icon: '🌱',
    color: 'bg-green-100 text-green-800 border-green-300',
    activities: [
      { moonPhase: 'new', desc: 'Semis sous abri' },
      { moonPhase: 'waxing', desc: 'Tous semis' },
      { moonPhase: 'full', desc: 'Éviter semis' },
      { moonPhase: 'waning', desc: 'Semis directs' },
    ],
  },
  recolte: {
    label: 'Récolte',
    icon: '🧺',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    activities: [
      { moonPhase: 'new', desc: 'Roots' },
      { moonPhase: 'waxing', desc: 'Fruits' },
      { moonPhase: 'full', desc: 'Racines' },
      { moonPhase: 'waning', desc: 'Feuilles' },
    ],
  },
  taille: {
    label: 'Taille',
    icon: '✂️',
    color: 'bg-red-100 text-red-800 border-red-300',
    activities: [
      { moonPhase: 'new', desc: 'Éviter' },
      { moonPhase: 'waxing', desc: 'Légère' },
      { moonPhase: 'full', desc: 'Éviter' },
      { moonPhase: 'waning', desc: 'Favorable' },
    ],
  },
  compost: {
    label: 'Compost',
    icon: '♻️',
    color: 'bg-brown-100 text-brown-800 border-brown-300',
    activities: [
      { moonPhase: 'new', desc: 'Retourner' },
      { moonPhase: 'waxing', desc: 'Ajouter' },
      { moonPhase: 'full', desc: 'Mélanger' },
      { moonPhase: 'waning', desc: 'Utiliser' },
    ],
  },
  haies: {
    label: 'Taille haies',
    icon: '🌿',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    activities: [
      { moonPhase: 'new', desc: 'Éviter' },
      { moonPhase: 'waxing', desc: 'Favorable' },
      { moonPhase: 'full', desc: 'Croissance' },
      { moonPhase: 'waning', desc: 'Favorable' },
    ],
  },
  traitement: {
    label: 'Traitements',
    icon: '🦠',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    activities: [
      { moonPhase: 'new', desc: 'Préventif' },
      { moonPhase: 'waxing', desc: 'Éviter' },
      { moonPhase: 'full', desc: 'Traiter' },
      { moonPhase: 'waning', desc: 'Favorable' },
    ],
  },
};

// Activités détaillées par phase lunaire
const MOON_PHASE_TASKS: Record<string, { category: string; task: string; emoji: string }[]> = {
  '0': [
    { category: 'travail', task: 'Désherbage', emoji: '🌿' },
    { category: 'sol', task: 'Bêchage', emoji: '🔨' },
    { category: 'planning', task: 'Planification', emoji: '📝' },
  ],
  '1': [
    { category: 'semis', task: 'Laitue, Épinard', emoji: '🥬' },
    { category: 'semis', task: 'Cresson', emoji: '🌱' },
  ],
  '2': [
    { category: 'semis', task: 'Choux, Brocoli', emoji: '🥦' },
    { category: 'recolte', task: 'Feuilles', emoji: '🍃' },
  ],
  '3': [
    { category: 'semis', task: 'Poireau, Céleri', emoji: '🧅' },
  ],
  '4': [
    { category: 'taille', task: 'Taille légère', emoji: '✂️' },
    { category: 'semis', task: 'Betterave', emoji: '🍎' },
  ],
  '5': [
    { category: 'semis', task: 'Tomate, Poivron', emoji: '🍅' },
    { category: 'semis', task: 'Haricot', emoji: '🫘' },
  ],
  '6': [
    { category: 'semis', task: 'Courge, Melon', emoji: '🎃' },
    { category: 'fruit', task: 'Fruits', emoji: '🍎' },
  ],
  '7': [
    { category: 'semis', task: 'Concombre', emoji: '🥒' },
    { category: 'recolte', task: 'Fruits', emoji: '🍓' },
  ],
  '8': [
    { category: 'recolte', task: 'Pommes de terre', emoji: '🥔' },
    { category: 'recolte', task: 'Carottes', emoji: '🥕' },
    { category: 'travail', task: 'Compostage', emoji: '♻️' },
  ],
  '9': [
    { category: 'transplant', task: 'Repiquage', emoji: '🌿' },
    { category: 'sol', task: 'Binage', emoji: '🔨' },
  ],
  '10': [
    { category: 'travail', task: 'Paillage', emoji: '🍂' },
    { category: 'sol', task: 'Mulching', emoji: '🌾' },
  ],
  '11': [
    { category: 'recolte', task: 'Conservation', emoji: '🏠' },
    { category: 'travail', task: 'Nettoyage', emoji: '🧹' },
  ],
  '12': [
    { category: 'taille', task: 'Fruitiers', emoji: '🍎' },
    { category: 'travail', task: 'Clôtures', emoji: '🪵' },
  ],
  '13': [
    { category: 'desherbage', task: 'Désherbage', emoji: '🌿' },
    { category: 'travail', task: 'Haies', emoji: '🌳' },
  ],
  '14': [
    { category: 'recolte', task: 'Racines', emoji: '🥕' },
    { category: 'semis', task: 'Ail, Échalote', emoji: '🧄' },
  ],
};

interface LunarCalendarProps {
  onClose?: () => void;
}

export function LunarCalendar({ onClose }: LunarCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);

  useEffect(() => {
    setLunarPhase(getLunarPhase(currentDate));
  }, [currentDate]);

  // Navigation semaine
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 7));
  };

  // Navigation mois pour calendrier annuel
  const navigateMonth = (direction: number) => {
    setSelectedMonth(addMonths(selectedMonth, direction));
  };

  // Jours du mois sélectionné
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [selectedMonth]);

  // Obtient la phase de lune et vérifie si favorable
  const getMoonPhaseType = (moonAge: number): string => {
    if (moonAge < 1) return 'new';
    if (moonAge < 7.4) return 'waxing';
    if (moonAge < 8) return 'full';
    if (moonAge < 14.8) return 'waning';
    if (moonAge < 15.5) return 'full';
    return 'waning';
  };

  // Tâches pour un jour donné
  const getTasksForDay = (date: Date): string[] => {
    const moonAge = Math.floor(getMoonAge(date));
    const tasks = MOON_PHASE_TASKS[moonAge.toString()] || [];
    return tasks.map((t) => `${t.emoji} ${t.task}`);
  };

  // Vérifie si une activité est favorable ce jour
  const isActivityGood = (activityKey: string): boolean => {
    if (!lunarPhase) return false;
    const moonAge = Math.floor(lunarPhase.moonAge);
    const phaseType = getMoonPhaseType(lunarPhase.moonAge);

    const activityData = GARDEN_ACTIVITIES[activityKey as keyof typeof GARDEN_ACTIVITIES];
    if (!activityData) return false;

    const activity = activityData.activities.find((a) => a.moonPhase === phaseType);
    return activity?.desc !== 'Éviter';
  };

  function getMoonAge(date: Date): number {
    const SYNODIC_MONTH = 29.53058867;
    const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();
    const daysSinceNewMoon = (date.getTime() - KNOWN_NEW_MOON) / (1000 * 60 * 60 * 24);
    return daysSinceNewMoon % SYNODIC_MONTH;
  }

  if (!lunarPhase) return null;

  const phaseType = getMoonPhaseType(lunarPhase.moonAge);

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{lunarPhase.emoji}</span>
          <div>
            <h3 className="text-lg font-bold">{lunarPhase.name}</h3>
            <p className="text-sm text-muted-foreground">
              {format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        )}
      </div>

      {/* Barre d'illumination */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Illumination</span>
          <span className="font-medium">{Math.round(lunarPhase.illumination)}%</span>
        </div>
        <Progress value={lunarPhase.illumination} className="h-2" />
      </div>

      {/* Signe zodiacal */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <span className="text-2xl">♈</span>
        <div>
          <p className="font-medium">{lunarPhase.zodiacSign}</p>
          <p className="text-xs text-muted-foreground">Élément: {lunarPhase.zodiacElement}</p>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">📅 Calendrier</TabsTrigger>
          <TabsTrigger value="activities">🌱 Activités</TabsTrigger>
          <TabsTrigger value="month">🗓️ Mois</TabsTrigger>
        </TabsList>

        {/* Onglet Calendrier semaine */}
        <TabsContent value="calendar" className="space-y-4">
          {/* Navigation semaine */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Semaine du {format(weekStart, 'd MMM', { locale: fr })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Vue semaine avec phases */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => {
              const phase = getLunarPhase(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 rounded-lg ${isToday ? 'bg-amber-100 border border-amber-400' : 'bg-muted/50'}`}
                >
                  <p className="text-xs text-muted-foreground">
                    {format(day, 'EEE', { locale: fr })}
                  </p>
                  <p className="text-xl">{phase?.emoji}</p>
                  <p className="text-xs">{format(day, 'd')}</p>
                </div>
              );
            })}
          </div>

          {/* Tâches du jour */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Tâches du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {getTasksForDay(currentDate).map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Activités */}
        <TabsContent value="activities" className="space-y-4">
          {/* Grille d'activités */}
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(GARDEN_ACTIVITIES).map(([key, activity]) => (
              <div
                key={key}
                className={`p-3 rounded-lg border ${activity.color} ${isActivityGood(key) ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{activity.icon}</span>
                  <span className="font-medium text-sm">{activity.label}</span>
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {phaseType === 'new' && 'Éviter'}{' '}
                  {phaseType === 'waxing' && activity.activities[1]?.desc}{' '}
                  {phaseType === 'full' && activity.activities[2]?.desc}{' '}
                  {phaseType === 'waning' && activity.activities[3]?.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Conseil actuel */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="pt-4">
              <p className="text-center font-medium text-amber-800">
                "{lunarPhase.gardeningAdvice}"
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Mois - Calendrier annuel */}
        <TabsContent value="month" className="space-y-4">
          {/* Navigation mois */}
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(selectedMonth, 'MMMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* En-têtes jours */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du mois */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const phase = getLunarPhase(day);
              const isCurrentMonth = isSameMonth(day, selectedMonth);
              const isToday = isSameDay(day, new Date());
              const tasks = getTasksForDay(day);
              const isGoodDay = phase.isGoodForPlanting || phase.isGoodForSoilWork;

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    min-h-[80px] p-1 rounded border text-xs
                    ${isCurrentMonth ? 'bg-white' : 'bg-muted/30'}
                    ${isToday ? 'border-amber-400 bg-amber-50' : 'border-muted'}
                    ${isGoodDay && isCurrentMonth ? 'border-green-300' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <span className={`font-medium ${!isCurrentMonth ? 'text-muted-foreground' : ''}`}>
                      {format(day, 'd')}
                    </span>
                    <span className="text-sm">{phase.emoji}</span>
                  </div>
                  {isCurrentMonth && tasks.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {tasks.slice(0, 2).map((task, i) => (
                        <div
                          key={i}
                          className="text-[10px] truncate text-muted-foreground"
                          title={task}
                        >
                          {task}
                        </div>
                      ))}
                      {tasks.length > 2 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{tasks.length - 2}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Légende */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌑</span>
                  <span>Nouvelle Lune</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌒</span>
                  <span>Croissant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌓</span>
                  <span>Premier Quartier</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌔</span>
                  <span>Gibbeuse</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌕</span>
                  <span>Pleine Lune</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌖</span>
                  <span>Gibbeuse</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌗</span>
                  <span>Dernier Quartier</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌘</span>
                  <span>Dernier Croissant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Jours favorables */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-green-800">
            <Sprout className="h-5 w-5" />
            <span className="font-medium">Bonnes périodes</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-green-700">
            {lunarPhase.isGoodForPlanting && <li>• Semis et plantations favorables</li>}
            {lunarPhase.isGoodForRootHarvest && <li>• Récolte des racines recommandée</li>}
            {lunarPhase.isGoodForLeafHarvest && <li>• Récolte des feuilles favorable</li>}
            {lunarPhase.isGoodForSoilWork && <li>• Travail du sol préconisé</li>}
            {lunarPhase.isGoodForPruning && <li>• Taille possible</li>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default LunarCalendar;
