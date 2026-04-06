/**
 * HarvestTracker — Suivi des récoltes réelles
 * Affiche calendrier, stats, liste des récoltes
 */

import { useState, useMemo } from 'react';
import { useHarvestStore, HarvestEntry } from '@/store/harvest-store';
import { HarvestEntrySheet } from './HarvestEntrySheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Scale, Calendar as CalendarIcon, TrendingUp, Download, Trash2 } from 'lucide-react';
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
    </div>
  );
}

export default HarvestTracker;
