/**
 * Design tokens — single source of truth for colors, typography & spacing.
 * Import AppColors, FontSize, FontFamily instead of defining local hex constants.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// ─── App-wide colour palette ─────────────────────────────────────────────────
export const AppColors = {
  primary:      '#B31111',
  primaryLight: 'rgba(179, 17, 17, 0.08)',
  white:        '#FFFFFF',
  lightBg:      '#F9FAFB',
  bgElement:    '#F3F4F6',
  textDark:     '#1F2937',
  textMuted:    '#6B7280',
  border:       '#E5E7EB',
  success:      '#10B981',
  danger:       '#DC2626',
  warning:      '#D97706',
  info:         '#2563EB',
} as const;

// ─── Typography scale ─────────────────────────────────────────────────────────
export const FontSize = {
  xxs: 8,
  xs:  10,
  sm:  11,
  md:  12,
  base: 13,
  lg:  14,
  xl:  16,
  xxl: 18,
  h3:  20,
  h2:  22,
  h1:  26,
} as const;

// ─── Font families (Cairo loaded in _layout.tsx) ─────────────────────────────
export const FontFamily = {
  regular:  'Cairo-Regular',
  medium:   'Cairo-Medium',
  semiBold: 'Cairo-SemiBold',
  bold:     'Cairo-Bold',
} as const;
