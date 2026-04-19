'use client';
/**
 * ResponsiveImage — Composant image responsive avec srcset
 * =====================================================
 *
 * Utilise Next.js Image pour:
 * - Conversion automatique WebP/AVIF
 * - Lazy loading
 * - srcset pour 400px / 800px / 1200px
 *
 * Usage:
 *   <ResponsiveImage
 *     src="/plants/tomato-stage-1.png"
 *     alt="Tomate stade 1"
 *     width={128}
 *     height={128}
 *   />
 *
 *   // Avec priority (above the fold)
 *   <ResponsiveImage
 *     src="/cards/card-tomato.webp"
 *     alt="Carte tomate"
 *     priority
 *     sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 *   />
 */
import React, { useState } from 'react';
import Image from 'next/image';

interface ResponsiveImageProps {
  /** URL de l'image (sans extension = auto .webp) */
  src: string;
  alt: string;
  /** Taille intrinsèque de l'image source (pour calcul du ratio) */
  width?: number;
  height?: number;
  /** Sizes HTML (comme pour img srcset) */
  sizes?: string;
  /** Pour les images above the fold (désactive lazy load) */
  priority?: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** Style additionnel */
  style?: React.CSSProperties;
  /** Callback quand l'image charge */
  onLoad?: () => void;
  /** Fitting: cover | contain | fill */
  fit?: 'cover' | 'contain' | 'fill';
  /** Qualité de l'image (défaut: auto par Next.js) */
  quality?: number;
}

/**
 * Génère les URLs srcset pour différenteslargeurs
 * Next.js Image génère automatiquement les variants si le loader est configuré
 */
function buildSrcSet(baseSrc: string, widths: number[] = [400, 800, 1200, 1600]): string {
  // Si c'est déjà une URL externe (CDN, etc.), on ne peut pas faire de srcset
  if (baseSrc.startsWith('http://') || baseSrc.startsWith('https://')) {
    return baseSrc;
  }

  // Pour les images locales, Next.js génère automatiquement les variants
  // Ici on retourne juste l'URL de base — Next.js Image s'occupe du reste
  return baseSrc;
}

/**
 * Convertit les URLs PNG en WebP si disponible
 * Les PNGs ont été convertis en WebP par optimize-images.ts
 */
function toWebP(src: string): string {
  if (src.endsWith('.png')) {
    return src.replace(/\.png$/, '.webp');
  }
  return src;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className,
  style,
  onLoad,
  fit = 'cover',
  quality,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Convertir PNG → WebP si disponible
  const webpSrc = toWebP(src);

  // Pour les sprites sheets, on utilise le format background-image CSS
  // donc on retourne un div, pas un Image
  if (src.includes('/sprites/')) {
    return (
      <div
        className={className}
        style={{
          width: width ?? '100%',
          height: height ?? '100%',
          backgroundImage: `url(${webpSrc})`,
          backgroundSize: fit === 'contain' ? 'contain' : 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transition: 'opacity 0.3s ease',
          opacity: isLoaded ? 1 : 0,
          ...style,
        }}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
      />
    );
  }

  // Fallback pour les URLs externes
  if (webpSrc.startsWith('http')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={webpSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        className={className}
        style={style}
        onLoad={onLoad}
      />
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: width ?? '100%',
        height: height ?? 'auto',
        overflow: 'hidden',
        ...style,
      }}
      className={className}
    >
      <Image
        src={webpSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={quality}
        fill={!width || !height}
        style={{
          objectFit: fit,
          transition: 'opacity 0.3s ease',
          opacity: isLoaded ? 1 : 0,
        }}
        className={className}
        onLoad={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
      />
    </div>
  );
}

/**
 * ResponsivePicture — Picture element avec sources multiples
 * =========================================================
 *
 * Utilise <picture> pour:
 * - AVIF en premier (meilleur compression)
 * - WebP en second
 * - PNG/JPG fallback
 *
 * Usage:
 *   <ResponsivePicture
 *     baseSrc="/plants/tomato-stage-1"
 *     formats={['avif', 'webp', 'png']}
 *     sizes="(max-width: 640px) 100vw"
 *     alt="Tomate"
 *     width={128}
 *     height={128}
 *   />
 */
interface ResponsivePictureProps {
  /** URL de base (sans extension) */
  baseSrc: string;
  /** Extensions à utiliser (dans l'ordre de priorité) */
  formats?: string[];
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  fit?: 'cover' | 'contain' | 'fill';
}

const DEFAULT_FORMATS = ['avif', 'webp', 'png'];

export function ResponsivePicture({
  baseSrc,
  formats = DEFAULT_FORMATS,
  alt,
  width,
  height,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  className,
  style,
  fit = 'cover',
}: ResponsivePictureProps) {
  // Build source URLs
  const sources = formats
    .filter(ext => ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg')
    .map(ext => ({
      type: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      srcSet: `${baseSrc}.${ext} ${width ?? 800}w`,
      src: `${baseSrc}.${ext}`,
    }));

  const fallbackSrc = `${baseSrc}.${formats.includes('png') ? 'png' : formats[0]}`;

  // Pour les sprites sheets
  if (baseSrc.includes('/sprites/')) {
    return (
      <div
        className={className}
        style={{
          width: width ?? '100%',
          height: height ?? '100%',
          backgroundImage: `url(${baseSrc}.webp)`,
          backgroundSize: fit === 'contain' ? 'contain' : 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          ...style,
        }}
      />
    );
  }

  return (
    <picture>
      {sources.map((source, i) => (
        <source
          key={i}
          type={source.type}
          srcSet={source.srcSet}
          sizes={sizes}
        />
      ))}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        className={className}
        style={{
          objectFit: fit,
          ...style,
        }}
      />
    </picture>
  );
}

/**
 * AvatarImage — pour les avatars de profil
 * ========================================
 */
export function AvatarImage({
  src,
  size = 40,
  ...props
}: Omit<ResponsiveImageProps, 'width' | 'height'> & { size?: number }) {
  return (
    <ResponsiveImage
      src={src}
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      fit="cover"
      {...props}
    />
  );
}

/**
 * PlantSprite — Affiche un sprite de plante avec position CSS
 * ===========================================================
 *
 * Utilise le sprite sheet généré par generate-sprite-sheets.ts
 *
 * Usage:
 *   <PlantSprite plantId="tomato" stage={3} size={128} />
 */
interface PlantSpriteProps {
  plantId: string;
  stage: number;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PlantSprite({ plantId, stage, size = 128, className, style }: PlantSpriteProps) {
  // Import dynamique pour éviter les erreurs SSR
  const [position, setPosition] = React.useState<{ x: number; y: number } | null>(null);

  React.useEffect(() => {
    // Charger les données du sprite sheet
    fetch('/sprites/sprite-sheets.json')
      .then(r => r.json())
      .then((sheets: any[]) => {
        const sheet = sheets.find((s: any) => s.plantName === plantId);
        if (!sheet) return;
        const stageData = sheet.stages.find((s: any) => s.index === stage);
        if (!stageData) return;
        setPosition({ x: stageData.x, y: stageData.y });
      })
      .catch(() => {
        // Fallback: utiliser le chemin direct
        setPosition({ x: (stage - 1) * size, y: 0 });
      });
  }, [plantId, stage, size]);

  if (!position) {
    // Placeholder pendant le chargement
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          backgroundColor: '#f0fdf4',
          borderRadius: 8,
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/sprites/${plantId}-stages.webp)`,
        backgroundSize: `${size * 6}px ${size}px`,
        backgroundPosition: `-${position.x}px -${position.y}px`,
        imageRendering: 'pixelated', // Pour les sprites pixel art
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
