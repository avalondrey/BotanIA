/**
 * HarvestTracker — Suivi des récoltes réelles + Marché dynamique
 * Affiche calendrier, stats, liste des récoltes, et prix du marché
 */

import { useState, useMemo } from 'react';
import { useHarvestStore, HarvestEntry } from '@/store/harvest-store';
import { useMarketStore } from '@/store/market-store';
import { useGameStore } from '@/store/game-store';
import { PLANTS } from '@/lib/plant-db';
import { HarvestEntrySheet } from './HarvestEntrySheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Scale, Calendar as CalendarIcon, TrendingUp, Download, Trash2, ShoppingCart, ArrowUpCircle, ArrowDownCircle, Minus } from 'lucide-react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

const QUALITY_COLORS = {
  excellent: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  good: 'bg-green-100 text-green-800 border-green-300',
  fair: 'bg-orange-100 text-orange-800 border-orange-300',
  poor: 'bg-red-100 text-red-800 border-red-300',
};

const QUALITY_EMOJI = {
  excellent: '⭐',
  good: '👍',
  fair: '😐',
  poor: '👎',
};

export function HarvestTracker() {
  const { harvests, getHarvestsForDateRange, deleteHarvest, exportData } = useHarvestStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Stats du mois courant
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthHarvests = useMemo(() => {
    return harvests.filter(h => {
      const date = parseISO(h.date);
      return isValid(date) && date >= monthStart && date <= monthEnd;
    });
  }, [harvests, currentMonth]);

  const monthTotalKg = monthHarvests.reduce((sum, h) => sum + h.quantityKg, 0);
  const monthCount = monthHarvests.length;

  // Harvests par jour du mois (pour le calendrier)
  const harvestByDay = useMemo(() => {
    const map: Record<string, number> = {};
    harvests.forEach(h => {
      map[h.date] = (map[h.date] || 0) + h.quantityKg;
    });
    return map;
  }, [harvests]);

  // Récoltes du jour sélectionné
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedHarvests = useMemo(() => {
    return harvests.filter(h => h.date === selectedDateStr);
  }, [harvests, selectedDateStr]);

  const handleExportCSV = () => {
    const csv = exportData('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recoltes-${format(new Date(), 'yyyy-MM')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportData('json');
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recoltes-${format(new Date(), 'yyyy-MM')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Stats du mois */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{monthTotalKg.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">kg ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{monthCount}</p>
                <p className="text-xs text-muted-foreground">récoltes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{format(currentMonth, 'MMMM', { locale: fr })}</p>
                <p className="text-xs text-muted-foreground">{format(currentMonth, 'yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          ← Précédent
        </Button>
        <span className="font-medium capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          Suivant →
        </Button>
      </div>

      {/* Calendrier avec indicateurs */}
      <Card>
        <CardContent className="pt-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="mx-auto"
            modifiers={{
              hasHarvest: Object.keys(harvestByDay).map(d => parseISO(d)),
            }}
            modifiersStyles={{
              hasHarvest: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderRadius: '50%',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Liste des récoltes du jour */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            Récoltes du {format(selectedDate, 'd MMMM', { locale: fr })}
          </CardTitle>
          <HarvestEntrySheet
            defaultDate={selectedDateStr}
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {selectedHarvests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune récolte ce jour
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plante</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Qualité</TableHead>
                  <TableHead>Rang</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedHarvests.map(h => (
                  <TableRow key={h.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{h.plantEmoji}</span>
                        <span className="font-medium">{h.plantName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{h.quantityKg} kg</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={QUALITY_COLORS[h.quality]}>
                        {QUALITY_EMOJI[h.quality]} {h.quality}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {h.rowLabel || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Export */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportJSON}>
          <Download className="h-4 w-4 mr-1" />
          Export JSON
        </Button>
      </div>

      {/* Marché dynamique */}
      <MarketSection />
    </div>
  );
}

export default HarvestTracker;

// ═══ Section Marché dynamique ═══

function MarketSection() {
  const { items, getCurrentPrice, getTrend, sellOnMarket } = useMarketStore();
  const coins = useGameStore((s) => s.coins);
  const addCoins = useGameStore((s) => s.addCoins);
  const gardenPlants = useGameStore((s) => s.gardenPlants);
  const [sellQty, setSellQty] = useState<Record<string, number>>({});

  // Plantes disponibles à vendre (celles du jardin avec stade >= 5)
  const harvestablePlants = useMemo(() => {
    const seen = new Set<string>();
    return gardenPlants
      .filter((gp) => gp.plant.stage >= 5 && !seen.has(gp.plantDefId) && seen.add(gp.plantDefId));
  }, [gardenPlants]);

  // Toutes les plantes du catalogue pour les prix
  const marketEntries = useMemo(() => {
    return Object.values(items).sort((a, b) => a.plantDefId.localeCompare(b.plantDefId));
  }, [items]);

  const handleSell = (plantDefId: string) => {
    const qty = sellQty[plantDefId] || 1;
    const earned = sellOnMarket(plantDefId, qty);
    if (earned > 0) {
      addCoins(earned);
    }
    setSellQty((prev) => ({ ...prev, [plantDefId]: 1 }));
  };

  const TREND_ICON = { rising: '📈', stable: '➡️', falling: '📉' } as const;
  const SEASON_LABEL: Record<string, string> = {
    '1.4': 'Primeur +40%', '1': 'Saison', '0.8': 'Après-saison -20%', '0.7': 'Hors saison -30%',
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-amber-600" />
          Marché dynamique
          <Badge variant="outline" className="text-[10px]">Prix saisonniers</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Plantes récoltables */}
        {harvestablePlants.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-amber-700 mb-2 uppercase">Vendre vos récoltes</p>
            <div className="space-y-2">
              {harvestablePlants.map((gp) => {
                const plantDef = PLANTS[gp.plantDefId];
                const price = getCurrentPrice(gp.plantDefId);
                const trend = getTrend(gp.plantDefId);
                const qty = sellQty[gp.plantDefId] || 1;

                return (
                  <div key={gp.plantDefId} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-amber-100">
                    <span className="text-lg">{plantDef?.emoji ?? '🌿'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{plantDef?.name ?? gp.plantDefId}</p>
                      <p className="text-[10px] text-amber-600">
                        {TREND_ICON[trend]} {price} pièces/u
                        {trend === 'rising' && <ArrowUpCircle className="inline h-3 w-3 ml-1 text-green-500" />}
                        {trend === 'falling' && <ArrowDownCircle className="inline h-3 w-3 ml-1 text-red-500" />}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="w-6 h-6 rounded bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center hover:bg-amber-200"
                        onClick={() => setSellQty((p) => ({ ...p, [gp.plantDefId]: Math.max(1, (p[gp.plantDefId] || 1) - 1) }))}
                      >
                        −
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{qty}</span>
                      <button
                        className="w-6 h-6 rounded bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center hover:bg-amber-200"
                        onClick={() => setSellQty((p) => ({ ...p, [gp.plantDefId]: (p[gp.plantDefId] || 1) + 1 }))}
                      >
                        +
                      </button>
                    </div>
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                      onClick={() => handleSell(gp.plantDefId)}
                    >
                      Vendre {qty} × {price} = {qty * price} 🪙
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grille des prix du marché */}
        <div>
          <p className="text-xs font-bold text-amber-700 mb-2 uppercase">Cours du marché</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
            {marketEntries.slice(0, 24).map((item) => {
              const plantDef = PLANTS[item.plantDefId];
              if (!plantDef) return null;
              const trendIcon = TREND_ICON[item.trend];
              const diff = item.currentPrice - item.basePrice;
              const pctDiff = item.basePrice > 0 ? Math.round((diff / item.basePrice) * 100) : 0;

              return (
                <div key={item.plantDefId} className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded-lg border border-amber-100">
                  <span className="text-sm">{plantDef.emoji ?? '🌿'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold truncate">{plantDef.name}</p>
                    <p className="text-[9px] text-amber-600">{trendIcon} {item.currentPrice} 🪙</p>
                  </div>
                  {pctDiff !== 0 && (
                    <span className={`text-[9px] font-bold ${pctDiff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {pctDiff > 0 ? '+' : ''}{pctDiff}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
