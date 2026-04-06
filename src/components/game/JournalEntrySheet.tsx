/**
 * JournalEntrySheet — Formulaire d'ajout/modification d'entrée journal
 */

import { useState } from 'react';
import { useJournalStore, JournalEntry } from '@/store/journal-store';
import { usePhotoStore } from '@/store/photo-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Plus, Edit, Trash2, Image, Link, Smile } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface JournalEntrySheetProps {
  entry?: JournalEntry;
  defaultDate?: string;
  trigger?: React.ReactNode;
  onClose?: () => void;
}

const MOOD_OPTIONS = [
  { value: 'great', label: 'Super !', emoji: '🌟' },
  { value: 'good', label: 'Bien', emoji: '😊' },
  { value: 'neutral', label: 'Neutre', emoji: '😐' },
  { value: 'bad', label: 'Mauvais', emoji: '😔' },
];

export function JournalEntrySheet({ entry, defaultDate, trigger, onClose }: JournalEntrySheetProps) {
  const { addEntry, updateEntry, deleteEntry } = useJournalStore();
  const { photos } = usePhotoStore();
  const isEditing = !!entry;

  const [date, setDate] = useState(entry?.date || defaultDate || format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState<JournalEntry['mood']>(entry?.mood);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(entry?.photoIds || []);
  const [open, setOpen] = useState(false);

  // Photos non liées à une entrée
  const availablePhotos = photos.filter(p => !p.journalEntryId || entry?.photoIds.includes(p.id));

  const handleTogglePhoto = (photoId: string) => {
    setSelectedPhotoIds(prev =>
      prev.includes(photoId)
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    const entryData = {
      date,
      title: title.trim(),
      content: content.trim(),
      mood,
      photoIds: selectedPhotoIds,
      linkedRowIds: entry?.linkedRowIds || [],
      weather: entry?.weather,
    };

    if (isEditing && entry) {
      updateEntry(entry.id, entryData);
    } else {
      addEntry(entryData);
    }

    setOpen(false);
    onClose?.();
  };

  const handleDelete = () => {
    if (entry && confirm('Supprimer cette entrée ?')) {
      deleteEntry(entry.id);
      setOpen(false);
      onClose?.();
    }
  };

  const content_form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>

      {/* Titre */}
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          placeholder="Titre de l'entrée..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Humeur */}
      <div className="space-y-2">
        <Label>Humeur du jardinier</Label>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setMood(mood === opt.value ? undefined : opt.value as JournalEntry['mood'])}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-sm transition-colors ${
                mood === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'hover:bg-muted'
              }`}
            >
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="space-y-2">
        <Label htmlFor="content">Notes</Label>
        <Textarea
          id="content"
          placeholder="Notes du jour, observations, travaux effectués..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
        />
      </div>

      {/* Photos */}
      {availablePhotos.length > 0 && (
        <div className="space-y-2">
          <Label>Photos liées</Label>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
            {availablePhotos.slice(0, 12).map(photo => (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleTogglePhoto(photo.id)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedPhotoIds.includes(photo.id)
                    ? 'border-primary'
                    : 'border-transparent'
                }`}
              >
                {photo.dataUrl ? (
                  <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                {selectedPhotoIds.includes(photo.id) && (
                  <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                    <Link className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {isEditing ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            {content_form}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle>
          {isEditing ? 'Modifier l\'entrée' : 'Nouvelle entrée'}
        </SheetTitle>
      </SheetHeader>
      <div className="mt-4">
        {content_form}
      </div>
    </div>
  );
}

export default JournalEntrySheet;
