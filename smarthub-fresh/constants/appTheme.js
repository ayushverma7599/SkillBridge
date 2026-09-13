// Shared design tokens for the SkillBridge app.
// One palette, one spacing scale, one shadow set — every screen pulls from here
// so the app reads as one product instead of five separately-styled screens.

export const colors = {
  primary: '#6C5CE7',
  primaryDark: '#4B3FCF',
  primaryLight: '#A9A0FF',
  primarySoft: '#EFECFF',

  accent: '#00C2A8',
  accentSoft: '#DFFBF5',

  background: '#F7F6FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F0FA',

  text: '#1B1730',
  textMuted: '#6E6A85',
  textFaint: '#A6A2BC',
  border: '#E9E7F5',

  success: '#22C55E',
  successSoft: '#E7F9EE',
  warning: '#F5A524',
  warningSoft: '#FEF3DE',
  danger: '#EF4444',
  dangerSoft: '#FDEAEA',

  white: '#FFFFFF',
};

export const gradients = {
  hero: ['#6C5CE7', '#4B3FCF'],
  primary: ['#7C6DF2', '#6C5CE7'],
  accent: ['#00D2AE', '#00A88E'],
  success: ['#34D07E', '#1DAE64'],
  warning: ['#FFB84D', '#F5A524'],
  danger: ['#FF6B6B', '#EF4444'],
  card: ['#F7F6FC', '#EFECFF'],
};

export const statusColors = {
  normal: { color: colors.success, soft: colors.successSoft, gradient: gradients.success },
  reduced: { color: colors.warning, soft: colors.warningSoft, gradient: gradients.warning },
  exam_lockdown: { color: colors.danger, soft: colors.dangerSoft, gradient: gradients.danger },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, full: 999 };

export const shadow = {
  sm: {
    shadowColor: '#3D2E8C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#3D2E8C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: '#3D2E8C',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 10,
  },
};

// Bold/dark palette used only by the pre-login landing page — a deliberate
// break from the light in-app theme, matching a big-type editorial marketing
// site rather than a functional dashboard.
export const dark = {
  bg: '#0A0A0F',
  bgAlt: '#111116',
  surface: '#17171F',
  text: '#FFFFFF',
  textMuted: '#9C9CAE',
  pink: '#FF1E7A',
  cyan: '#2FD3FF',
  border: 'rgba(255,255,255,0.1)',
};

export const typography = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  h2: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  bodyBold: { fontSize: 15, fontWeight: '600' },
  caption: { fontSize: 12.5, fontWeight: '500' },
};

// react-native-paper theme override so Paper components (Card, Button,
// Chip, TextInput, Menu...) match the same palette without per-screen props.
export const paperTheme = {
  colors: {
    primary: colors.primary,
    onPrimary: colors.white,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.danger,
    outline: colors.border,
    onSurface: colors.text,
    onSurfaceVariant: colors.textMuted,
  },
  roundness: radius.md,
};
