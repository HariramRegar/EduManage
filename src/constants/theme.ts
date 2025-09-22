export const theme = {
  colors: {
    primary: '#00897B',        // Teal (primary action buttons, active indicators)
    primaryDark: '#00796B',
    secondary: '#0D47A1',      // Deep Blue (top bar, sidebars, headers)
    accent: '#00897B',         // Align accent with primary for consistency
    success: '#00897B',
    warning: '#F39C12',
    error: '#E74C3C',
    background: '#E0E0E0',     // Light Gray (main backgrounds)
    surface: '#E0E0E0',        // Panels/cards use light gray per spec
    surfaceVariant: '#D6D6D6',
    text: '#212121',           // Dark Gray (primary text)
    textSecondary: '#757575',  // Subtle text on light bg
    textLight: '#B0BEC5',
    border: '#D0D0D0',
    borderLight: '#ECECEC',
    white: '#ffffff',          // Text on deep blue backgrounds
    black: '#000000',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  layout: {
    containerMaxWidth: 1200,
    breakpoints: { sm: 480, md: 768, lg: 1024, xl: 1280 },
  },
};

export type Theme = typeof theme;
