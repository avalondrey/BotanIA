/**
 * GardenJournal — Journal de jardin avec calendrier et entrées
 */

import { useState, useMemo } from 'react';
import { useJournalStore, JournalEntry } from '@/store/journal-store';
import { JournalEntrySheet } from './JournalEntrySheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BookOpen, Image, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, isValid, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

const MOOD_COLORS = {
  great: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  good: 'bg-green-100 text-green-800 border-green-300',
  neutral: 'bg-gray-100 text-gray-800 border-gray-300',
  bad: 'bg-red-100 text-red-800 border-red-300',
};

const MOOD_EMOJI = {
  great: '🌟',
  good: '😊',
  neutral: '😐',
  bad: '😔',
};

export function GardenJournal() {
  const { entries, getEntriesForDate } = useJournalStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Dates avec entrées (pour le calendrier)
  const entryDates = useMemo(() => {
    const dates = new Set(entries.map(e => e.date));
    return Array.from(dates).map(d => parseISO(d)).filter(isValid);
  }, [entries]);

  // Entrées du jour sélectionné
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayEntries = useMemo(() => getEntriesForDate(selectedDateStr), [entries, selectedDateStr]);

  // Stats
  const totalEntries = entries.length;
  const thisMonthEntries = entries.filter(e => {
    const d = parseISO(e.date);
    return isValid(d) && d >= startOfMonth(currentMonth) && d <= endOfMonth(currentMonth);
  }).length;

  return (
    <div className="space-y-4 p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{totalEntries}</p>
                <p className="text-xs text-muted-foreground">entrées totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{thisMonthEntries}</p>
                <p className="text-xs text-muted-foreground">ce mois</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">
                  {entries.reduce((sum, e) => sum + e.photoIds.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">photos liées</p>
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
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>
        <span className="font-medium capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          Suivant
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Calendrier */}
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
              hasEntry: entryDates,
            }}
            modifiersStyles={{
              hasEntry: {
                fontWeight: 'bold',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '50%',
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Entrées du jour */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            Entrées du {format(selectedDate, 'd MMMM', { locale: fr })}
          </CardTitle>
          <JournalEntrySheet
            defaultDate={selectedDateStr}
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Nouvelle
              </Button>
            }
          />
        </CardHeader>
        <CardContent>
          {dayEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aucune entrée ce jour.{' '}
              <JournalEntrySheet
                defaultDate={selectedDateStr}
                trigger={
                  <Button variant="link" className="text-primary p-0 h-auto">
                    Créer une entrée
                  </Button>
                }
              />
            </p>
          ) : (
            <div className="space-y-3">
              {dayEntries.map(entry => (
                <JournalEntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{entry.title}</h4>
            {entry.mood && (
              <Badge className={MOOD_COLORS[entry.mood]} variant="outline">
                {MOOD_EMOJI[entry.mood]}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(parseISO(entry.date), 'EEEE d MMMM', { locale: fr })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {entry.photoIds.length > 0 && (
            <Badge variant="outline" className="text-xs">
              <Image className="h-3 w-3 mr-1" />
              {entry.photoIds.length}
            </Badge>
          )}
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-2" onClick={e => e.stopPropagation()}>
          {entry.content && (
            <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
          )}
          <JournalEntrySheet
            entry={entry}
            trigger={
              <Button variant="outline" size="sm">
                Modifier
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

export default GardenJournal;
