// app/theme.ts
'use client';
import { createThemes } from '@teispace/next-themes';

export const {
  ThemeProvider,
  useTheme,
  useThemeValue,
  useThemeEffect,
  ThemedImage,
  ThemedIcon,
  ScopedTheme,
} = createThemes({
  themes: ['light', 'dark', 'sepia', 'mint'] as const,   // ← literal tuple
  defaultTheme: 'system',
  attribute: 'class',
  storage: 'hybrid',
  // any ThemeProvider prop works as a default:
  disableTransitionOnChange: true,
  themeColor: { light: '#fff', dark: '#0f1115' },
});