/**
 * FILESYSTEM MANAGER - Stockage local des données BotanIA
 * Utilise Filesystem pour persistence locale
 */

export interface JournalEntry {
  date: string;
  day: number;
  actions: string[];
  observations: string;
  meteo: {
    temperature: number;
    precipitation: number;
    conditions: string;
  };
  aiAdvice?: string;
}

export interface PlantPhoto {
  id: string;
  plantName: string;
  date: string;
  path: string;
  notes?: string;
}

const DATA_DIR = 'C:/Users/Administrateur/Desktop/BotanIA/data';

/**
 * Initialiser les dossiers de données
 */
export async function initDataDirectories() {
  // Les dossiers seront créés au premier write
  console.log('Data directories initialized at:', DATA_DIR);
}

/**
 * Sauvegarder une entrée dans le journal
 */
export async function saveJournalEntry(entry: JournalEntry): Promise<boolean> {
  try {
    const filePath = `${DATA_DIR}/journal/${entry.date}.json`;
    const content = JSON.stringify(entry, null, 2);
    
    // Note: Desktop Commander créera automatiquement le dossier si besoin
    await fetch('/api/save-journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content }),
    });
    
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde journal:', error);
    return false;
  }
}

/**
 * Charger l'historique du journal
 */
export async function loadJournal(days: number = 7): Promise<JournalEntry[]> {
  try {
    const response = await fetch(`/api/load-journal?days=${days}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.entries || [];
  } catch (error) {
    console.error('Erreur chargement journal:', error);
    return [];
  }
}

/**
 * Sauvegarder un conseil IA
 */
export async function saveAIAdvice(date: string, advice: string): Promise<boolean> {
  try {
    const filePath = `${DATA_DIR}/ai-advice/${date}.txt`;
    
    await fetch('/api/save-ai-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content: advice }),
    });
    
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde conseil IA:', error);
    return false;
  }
}

/**
 * Charger cache météo
 */
export async function loadWeatherCache(): Promise<any> {
  try {
    const response = await fetch('/api/load-weather-cache');
    if (!response.ok) return null;
    
    return await response.json();
  } catch (error) {
    console.error('Erreur chargement cache météo:', error);
    return null;
  }
}

/**
 * Sauvegarder cache météo
 */
export async function saveWeatherCache(data: any): Promise<boolean> {
  try {
    const filePath = `${DATA_DIR}/weather-cache.json`;
    const content = JSON.stringify(data, null, 2);
    
    await fetch('/api/save-weather-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, content }),
    });
    
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde cache météo:', error);
    return false;
  }
}
