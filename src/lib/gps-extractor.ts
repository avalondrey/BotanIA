// ─── GPS EXIF Extractor ───────────────────────────────────────────────────────
// Lit les métadonnées GPS d'un fichier image (EXIF),
// et si absent, utilise la géolocalisation du device.

export interface ExifGPS {
  lat: number;
  lon: number;
  source: 'exif' | 'device';
  accuracy?: number;
  altitude?: number;
}

// Convertir degrés/minutes/secondes en décimal
function dmsToDecimal(dms: number[], ref: string): number {
  const [deg, min, sec] = dms;
  const decimal = deg + min / 60 + sec / 3600;
  return (ref === 'S' || ref === 'W') ? -decimal : decimal;
}

// Lire les bytes EXIF d'un DataURL en ArrayBuffer
function dataUrlToBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1];
  const bin = atob(base64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}


// Parser EXIF minimal (cherche le marqueur GPS dans les bytes JPEG)
function parseExifGPS(buffer: ArrayBuffer): { lat: number; lon: number; altitude?: number } | null {
  try {
    const view = new DataView(buffer);
    // JPEG EXIF commence par FFD8 FFE1
    if (view.getUint16(0) !== 0xFFD8) return null;

    let offset = 2;
    while (offset < view.byteLength - 2) {
      const marker = view.getUint16(offset);
      offset += 2;
      if (marker === 0xFFE1) {
        // APP1 segment = EXIF
        const segLen = view.getUint16(offset);
        const exifStart = offset + 2;
        // Check 'Exif\0\0'
        const exifHeader = String.fromCharCode(
          view.getUint8(exifStart), view.getUint8(exifStart + 1),
          view.getUint8(exifStart + 2), view.getUint8(exifStart + 3)
        );
        if (exifHeader !== 'Exif') { offset += segLen; continue; }

        const tiffStart = exifStart + 6;
        const littleEndian = view.getUint16(tiffStart) === 0x4949;
        const readUint16 = (o: number) => littleEndian ? view.getUint16(tiffStart + o, true) : view.getUint16(tiffStart + o, false);
        const readUint32 = (o: number) => littleEndian ? view.getUint32(tiffStart + o, true) : view.getUint32(tiffStart + o, false);

        const ifd0Offset = readUint32(4);
        const ifd0Count = readUint16(ifd0Offset);

        let gpsIfdOffset = -1;
        for (let i = 0; i < ifd0Count; i++) {
          const entryOffset = ifd0Offset + 2 + i * 12;
          const tag = readUint16(entryOffset);
          if (tag === 0x8825) { gpsIfdOffset = readUint32(entryOffset + 8); break; }
        }
        if (gpsIfdOffset < 0) return null;

        const gpsCount = readUint16(gpsIfdOffset);
        const gpsData: Record<number, any> = {};

        for (let i = 0; i < gpsCount; i++) {
          const entryOffset = gpsIfdOffset + 2 + i * 12;
          const tag = readUint16(entryOffset);
          const type = readUint16(entryOffset + 2);
          const count = readUint32(entryOffset + 4);
          const valOffset = entryOffset + 8;

          if (type === 2) { // ASCII
            const off = count > 4 ? readUint32(valOffset) : valOffset;
            let str = '';
            for (let j = 0; j < count - 1; j++) str += String.fromCharCode(view.getUint8(tiffStart + off + j));
            gpsData[tag] = str;
          } else if (type === 5) { // RATIONAL
            const off = readUint32(valOffset);
            const vals = [];
            for (let j = 0; j < count; j++) {
              const num = readUint32(off + j * 8);
              const den = readUint32(off + j * 8 + 4);
              vals.push(den !== 0 ? num / den : 0);
            }
            gpsData[tag] = vals;
          }
        }

        // tag 1=LatRef, 2=Lat, 3=LonRef, 4=Lon, 5=AltRef, 6=Alt
        if (gpsData[2] && gpsData[4]) {
          const lat = dmsToDecimal(gpsData[2], gpsData[1] || 'N');
          const lon = dmsToDecimal(gpsData[4], gpsData[3] || 'E');
          const altitude = gpsData[6]?.[0];
          return { lat, lon, altitude };
        }
        return null;
      }
      const segLen = view.getUint16(offset);
      offset += segLen;
    }
    return null;
  } catch { return null; }
}


// ── API publique ──────────────────────────────────────────────────────────────

/**
 * Tente d'extraire le GPS depuis les métadonnées EXIF d'un dataUrl.
 * Retourne null si aucun GPS trouvé dans l'image.
 */
export async function extractGPSFromDataUrl(dataUrl: string): Promise<ExifGPS | null> {
  try {
    const buffer = dataUrlToBuffer(dataUrl);
    const result = parseExifGPS(buffer);
    if (result) {
      return { lat: result.lat, lon: result.lon, source: 'exif', altitude: result.altitude };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Demande la géolocalisation GPS du device (si pas d'EXIF).
 */
export async function getDeviceGPS(): Promise<ExifGPS | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        source: 'device',
        accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude ?? undefined,
      }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
    );
  });
}

/**
 * Stratégie complète : EXIF d'abord, puis device GPS en fallback.
 */
export async function getBestGPS(dataUrl: string): Promise<ExifGPS | null> {
  const exifGps = await extractGPSFromDataUrl(dataUrl);
  if (exifGps) return exifGps;
  return getDeviceGPS();
}
