import { BRAND_COLORS } from '../config/vehicles';

export const colors = {
  background: '#050505', // Deep Black
  surface: '#121212', // Anthracite
  surfaceHighlight: '#1A1A1A',
  card: '#181818',
  border: '#2A2A2A',
  
  // Dynamic Brand Colors
  primary: BRAND_COLORS.primary,
  primaryDark: BRAND_COLORS.primaryDark,
  accent: BRAND_COLORS.accent,
  secondary: BRAND_COLORS.accent, // Use accent as secondary fallback
  
  // Standard UI
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  
  success: '#10B981',
  warning: '#E63946', // BMW M Red (replaces yellow)
  error: '#EF4444',
  
  // Silver / Chrome
  silver: '#C0C0C0',
  platinum: '#E5E4E2',
  
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
};
