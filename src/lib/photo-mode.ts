// ═══════════════════════════════════════════════════
//  Photo Mode — Capture garden screenshots
// ═══════════════════════════════════════════════════

export interface PhotoMetadata {
  id: string;
  timestamp: number;
  day: number;
  season: string;
  weather?: string;
  plantCount: number;
  harvested: number;
  score: number;
  dataUrl?: string;
}

// Photo gallery storage
const PHOTO_STORAGE_KEY = "botania-photos";

export function loadPhotos(): PhotoMetadata[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PHOTO_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return [];
}

export function savePhotos(photos: PhotoMetadata[]) {
  if (typeof window === "undefined") return;
  try {
    // Keep only last 50 photos
    const trimmed = photos.slice(-50);
    localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function addPhoto(metadata: Omit<PhotoMetadata, "id" | "timestamp">): PhotoMetadata {
  const photos = loadPhotos();
  const newPhoto: PhotoMetadata = {
    ...metadata,
    id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  photos.push(newPhoto);
  savePhotos(photos);
  return newPhoto;
}

export function deletePhoto(photoId: string) {
  const photos = loadPhotos();
  const filtered = photos.filter((p) => p.id !== photoId);
  savePhotos(filtered);
}

export function clearAllPhotos() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PHOTO_STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Capture a DOM element as a data URL
export async function captureElementAsDataUrl(
  element: HTMLElement,
  scale: number = 2
): Promise<string | null> {
  try {
    // Use Canvas to capture
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const rect = element.getBoundingClientRect();
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    // Create an SVG representation for better quality
    const data = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width * scale}" height="${rect.height * scale}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${element.outerHTML}
          </div>
        </foreignObject>
      </svg>
    `;

    const img = new Image();
    const blob = new Blob([data], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Fallback: try html2canvas-like approach
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}

// Download a photo
export function downloadPhoto(dataUrl: string, filename: string = "botania-garden") {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${filename}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Share photo (Web Share API)
export async function sharePhoto(
  dataUrl: string,
  title: string = "Mon Jardin BotanIA"
): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    // Convert dataUrl to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], "botania-garden.png", { type: "image/png" });

    await navigator.share({
      title,
      files: [file],
    });
    return true;
  } catch {
    return false;
  }
}

// Format photo date for display
export function formatPhotoDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
