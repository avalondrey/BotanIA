/**
 * HarvestEntrySheet — Formulaire d'ajout/modification de récolte
 */

import { useState } from 'react';
import { useHarvestStore, HarvestEntry } from '@/store/harvest-store';
import { PLANTS } from '@/lib/ai-engine';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HarvestEntrySheetProps {
  entry?: HarvestEntry;
  defaultDate?: string;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const QUALITY_OPTIONS = [
  { value: 'excellent', label: 'Excellent', emoji: '⭐' },
  { value: 'good', label: 'Bon', emoji: '👍' },
  { value: 'fair', label: 'Moyen', emoji: '😐' },
  { value: 'poor', label: 'Médiocre', emoji: '👎' },
];

export function HarvestEntrySheet({ entry, defaultDate, trigger, onClose }: HarvestEntrySheetProps) {
  const { addHarvest, updateHarvest, deleteHarvest } = useHarvestStore();
  const isEditing = !!entry;

  const [date, setDate] = useState(entry?.date || defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [plantDefId, setPlantDefId] = useState(entry?.plantDefId || '');
  const [quantityKg, setQuantityKg] = useState(entry?.quantityKg?.toString() || '');
  const [quality, setQuality] = useState<HarvestEntry['quality']>(entry?.quality || 'good');
  const [rowLabel, setRowLabel] = useState(entry?.rowLabel || '');
  const [notes, setNotes] = useState(entry?.notes || '');
  const [open, setOpen] = useState(false);

  const selectedPlant = PLANTS.find(p => p.id === plantDefId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!plantDefId || !quantityKg) return;

    const plantData = PLANTS.find(p => p.id === plantDefId);

    const harvestData = {
      date,
      plantDefId,
      plantName: plantData?.name || plantDefId,
      plantEmoji: plantData?.emoji || '🌱',
      quantityKg: parseFloat(quantityKg),
      quality,
      rowLabel: rowLabel || undefined,
      notes: notes || undefined,
      photoIds: entry?.photoIds || [],
    };

    if (isEditing && entry) {
      updateHarvest(entry.id, harvestData);
    } else {
      addHarvest(harvestData);
    }

    setOpen(false);
    onClose?.();
  };

  const handleDelete = () => {
    if (entry && confirm('Supprimer cette récolte ?')) {
      deleteHarvest(entry.id);
      setOpen(false);
      onClose?.();
    }
  };

  const content = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date de récolte</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>

      {/* Plante */}
      <div className="space-y-2">
        <Label>Plante</Label>
        <Select value={plantDefId} onValueChange={setPlantDefId} required>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une plante..." />
          </SelectTrigger>
          <SelectContent>
            {PLANTS.filter(p => p.type !== 'tree').map(plant => (
              <SelectItem key={plant.id} value={plant.id}>
                {plant.emoji} {plant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Poids */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Poids (kg)</Label>
        <div className="relative">
          <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="quantity"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.0"
            value={quantityKg}
            onChange={e => setQuantityKg(e.target.value)}
            className="pl-10"
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            kg
          </span>
        </div>
      </div>

      {/* Qualité */}
      <div className="space-y-2">
        <Label>Qualité</Label>
        <div className="flex gap-2 flex-wrap">
          {QUALITY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setQuality(opt.value as HarvestEntry['quality'])}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                quality === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted'
              }`}
            >
              <span>{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Rang */}
      <div className="space-y-2">
        <Label htmlFor="row">Rang / Zone (optionnel)</Label>
        <Input
          id="row"
          placeholder="Ex: Rang 1, Zone A, Plante 3..."
          value={rowLabel}
          onChange={e => setRowLabel(e.target.value)}
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optionnel)</Label>
        <Textarea
          id="notes"
          placeholder="Observations, conditions météo, problèmes..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          {isEditing ? 'Modifier' : 'Ajouter'}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );

  if (trigger) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? 'Modifier la récolte' : 'Nouvelle récolte'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle>
          {isEditing ? 'Modifier la récolte' : 'Nouvelle récolte'}
        </SheetTitle>
      </SheetHeader>
      <div className="mt-4">
        {content}
      </div>
    </div>
  );
}

export default HarvestEntrySheet;
