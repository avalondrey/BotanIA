/**
 * LunarCalendar Component
 * Affiche les phases lunaires et conseils jardinage
 */

import { useState, useEffect } from 'react';
import { getLunarPhase, LunarPhase } from '@/lib/lunar-calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight, Moon, Sun, Droplets, Scissors, Shovel, Sprout, AlertCircle } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fr as frLocale } from 'date-fns/locale/fr';

interface LunarCalendarProps {
  onClose?: () => void;
}

export function LunarCalendar({ onClose }: LunarCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lunarPhase, setLunarPhase] = useState<LunarPhase | null>(null);

  useEffect(() => {
    setLunarPhase(getLunarPhase(currentDate));
  }, [currentDate]);

  // Generate week view starting from today
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const navigateWeek = (direction: number) => {
    setCurrentDate(addDays(currentDate, direction * 7));
  };

  if (!lunarPhase) return null;

  const getAdviceIcon = (good: boolean) => {
    if (good) return <Sprout className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-400" />;
  };

  const getAdviceColor = (good: boolean) => {
    if (good) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-red-50 text-red-600 border-red-200';
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header avec phase actuelle */}
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

      {/* Conseils de jardinage */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Conseils de jardinage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground italic">
            "{lunarPhase.gardeningAdvice}"
          </p>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getAdviceColor(lunarPhase.isGoodForPlanting)}`}>
              {getAdviceIcon(lunarPhase.isGoodForPlanting)}
              <div className="text-xs">
                <Shovel className="h-3 w-3 inline mr-1" />
                Semis
              </div>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getAdviceColor(lunarPhase.isGoodForRootHarvest)}`}>
              {getAdviceIcon(lunarPhase.isGoodForRootHarvest)}
              <div className="text-xs">
                <Moon className="h-3 w-3 inline mr-1" />
                Récolte racines
              </div>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getAdviceColor(lunarPhase.isGoodForLeafHarvest)}`}>
              {getAdviceIcon(lunarPhase.isGoodForLeafHarvest)}
              <div className="text-xs">
                <Sprout className="h-3 w-3 inline mr-1" />
                Récolte feuilles
              </div>
            </div>

            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getAdviceColor(lunarPhase.isGoodForPruning)}`}>
              {getAdviceIcon(lunarPhase.isGoodForPruning)}
              <div className="text-xs">
                <Scissors className="h-3 w-3 inline mr-1" />
                Taille
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
