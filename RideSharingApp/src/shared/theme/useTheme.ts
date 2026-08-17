import { useActiveTheme, useThemeStore, ThemePreference, ActiveTheme } from '@/store/themeStore';

export interface ThemeTokens {
  mode: ActiveTheme;
  isDark: boolean;
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  cardBorder: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholderText: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
  accentText: string;
  border: string;
  divider: string;
  headerBg: string;
  headerText: string;
  headerSubtitle: string;
  tabBg: string;
  tabBorder: string;
  tabInactive: string;
  tabActive: string;
  success: string;
  danger: string;
  warning: string;
}

export const lightTokens: ThemeTokens = {
  mode: 'light',
  isDark: false,
  background: '#FFFFFF',
  surface: '#F9FAFB',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E5E7EB',
  inputBg: '#F9FAFB',
  inputBorder: '#E5E7EB',
  inputText: '#111111',
  placeholderText: '#9CA3AF',
  textPrimary: '#111111',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  accent: '#F5C400',
  accentLight: '#FFFBEB',
  accentBorder: '#F5C400',
  accentText: '#7A5800',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  headerBg: '#FFFFFF',
  headerText: '#111111',
  headerSubtitle: '#6B7280',
  tabBg: '#FFFFFF',
  tabBorder: '#E5E7EB',
  tabInactive: '#9CA3AF',
  tabActive: '#F5C400',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export const darkTokens: ThemeTokens = {
  mode: 'dark',
  isDark: true,
  background: '#111111',
  surface: '#1A1A1A',
  surfaceElevated: '#242424',
  card: '#1E1E1E',
  cardBorder: '#2E2E2E',
  inputBg: '#1A1A1A',
  inputBorder: '#333333',
  inputText: '#FFFFFF',
  placeholderText: '#8E8E93',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  accent: '#F5C400',
  accentLight: '#262100',
  accentBorder: '#F5C400',
  accentText: '#F5C400',
  border: '#2E2E2E',
  divider: '#282828',
  headerBg: '#111111',
  headerText: '#FFFFFF',
  headerSubtitle: '#9CA3AF',
  tabBg: '#181818',
  tabBorder: '#2A2A2A',
  tabInactive: '#8E8E93',
  tabActive: '#F5C400',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
};

export function useTheme() {
  const activeTheme = useActiveTheme();
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);
  const isDark = activeTheme === 'dark';
  const theme = isDark ? darkTokens : lightTokens;

  return {
    theme,
    isDark,
    activeTheme,
    preference,
    setPreference,
  };
}
