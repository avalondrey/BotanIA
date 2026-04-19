/**
 * AchievementBadge — Composant d'affichage d'un achievement
 */
import React from 'react';
import { getRarityColor, type Achievement } from '@/store/achievements-store';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  showDetails?: boolean;
  onClick?: () => void;
}

export function AchievementBadge({ achievement, unlocked, showDetails = false, onClick }: AchievementBadgeProps) {
  const rarityColor = getRarityColor(achievement.rarity);
  const borderColor = unlocked ? rarityColor : '#e5e7eb';

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0.75rem',
        borderRadius: '12px',
        border: `2px solid ${borderColor}`,
        background: unlocked ? `${rarityColor}15` : '#f9fafb',
        cursor: onClick ? 'pointer' : 'default',
        opacity: unlocked ? 1 : 0.5,
        transition: 'all 0.2s',
        minWidth: '100px',
      }}
    >
      <span style={{ fontSize: '2rem', filter: unlocked ? 'none' : 'grayscale(100%)' }}>
        {achievement.emoji}
      </span>
      <span style={{
        fontSize: '0.7rem',
        fontWeight: 700,
        color: unlocked ? rarityColor : '#9ca3af',
        marginTop: '0.25rem',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {achievement.name}
      </span>
      {showDetails && (
        <span style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '0.25rem', textAlign: 'center' }}>
          {achievement.description}
        </span>
      )}
      <span style={{
        fontSize: '0.6rem',
        color: '#9ca3af',
        marginTop: '0.25rem',
        background: '#f3f4f6',
        borderRadius: '4px',
        padding: '0 4px',
      }}>
        {achievement.points} pts
      </span>
    </div>
  );
}

/**
 * AchievementPanel — Panneau complet des achievements
 */
export function AchievementPanel() {
  // This is a placeholder — actual implementation would use the store
  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        🏆 Achievements
      </h2>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
        Panneau des achievements à intégrer dans l'UI du jeu.
      </p>
    </div>
  );
}
