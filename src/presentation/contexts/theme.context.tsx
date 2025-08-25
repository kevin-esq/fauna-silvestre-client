import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { SecureStorageService } from '../../services/storage/secure-storage.service';
import { THEME_KEY } from '../../services/storage/storage-keys';

interface ThemeColors {
  // Colores principales
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  tertiary: string;

  // Fondo y superficies
  background: string;
  surface: string;
  surfaceVariant: string;

  // Texto
  text: string;
  textSecondary: string;
  textOnPrimary: string;
  textOnSecondary: string;

  // Estados y feedback
  success: string;
  warning: string;
  error: string;
  info: string;

  // Elementos UI
  border: string;
  divider: string;
  placeholder: string;
  shadow: string;

  // Botones
  primaryButton: string;
  primaryButtonText: string;
  secondaryButton: string;
  secondaryButtonText: string;
  disabled: string;
  disabledText: string;

  // Modales y overlays
  modalBackground: string;
  overlay: string;

  // Tarjetas y elementos especiales
  cardBackground: string;
  chipBackground: string;

  // Colores específicos para naturaleza
  forest: string;
  earth: string;
  water: string;
  leaf: string;
}

interface ThemeSpacing {
  tiny: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
}

interface ThemeTypography {
  fontSize: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
  fontWeight: {
    light: string;
    regular: string;
    medium: string;
    bold: string;
    black: string;
  };
  fontFamily: {
    primary: string;
    secondary: string;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  spacing: ThemeSpacing;
}

const lightColors: ThemeColors = {
  primary: '#007A33', // Verde fuerte (nuevo)
  primaryLight: '#4CAF50', // Verde más claro
  primaryDark: '#004D1C', // Verde profundo
  secondary: '#FFD600', // Amarillo vibrante
  secondaryLight: '#FFF59D', // Amarillo claro
  secondaryDark: '#C7A500', // Amarillo oscuro
  tertiary: '#D50000', // Rojo vivo (logo)

  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#EEEEEE',

  text: '#212121',
  textSecondary: '#616161',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#212121',

  success: '#388E3C',
  warning: '#FBC02D',
  error: '#C62828',
  info: '#0288D1',

  border: '#E0E0E0',
  divider: '#BDBDBD',
  placeholder: '#9E9E9E',
  shadow: 'rgba(0, 0, 0, 0.1)',

  primaryButton: '#007A33',
  primaryButtonText: '#FFFFFF',
  secondaryButton: '#FFD600',
  secondaryButtonText: '#212121',
  disabled: '#E0E0E0',
  disabledText: '#9E9E9E',

  modalBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.4)',

  cardBackground: '#FFFFFF',
  chipBackground: '#F1F8E9',

  forest: '#007A33',
  earth: '#5D4037',
  water: '#0288D1',
  leaf: '#43A047'
};

const darkColors: ThemeColors = {
  primary: '#4CAF50',
  primaryLight: '#81C784',
  primaryDark: '#007A33',
  secondary: '#FFD600',
  secondaryLight: '#FFEE58',
  secondaryDark: '#C7A500',
  tertiary: '#EF5350',

  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',

  text: '#E0E0E0',
  textSecondary: '#B0B0B0',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#212121',

  success: '#81C784',
  warning: '#FFD54F',
  error: '#EF5350',
  info: '#4FC3F7',

  border: '#424242',
  divider: '#616161',
  placeholder: '#9E9E9E',
  shadow: 'rgba(0, 0, 0, 0.6)',

  primaryButton: '#4CAF50',
  primaryButtonText: '#212121',
  secondaryButton: '#FFD600',
  secondaryButtonText: '#212121',
  disabled: '#424242',
  disabledText: '#757575',

  modalBackground: '#1E1E1E',
  overlay: 'rgba(0, 0, 0, 0.7)',

  cardBackground: '#2C2C2C',
  chipBackground: '#424242',

  forest: '#388E3C',
  earth: '#8D6E63',
  water: '#4FC3F7',
  leaf: '#66BB6A'
};

const defaultSpacing: ThemeSpacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48
};

const defaultTypography: ThemeTypography = {
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24
  },
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    bold: '700',
    black: '900'
  },
  fontFamily: {
    primary: '"Roboto", sans-serif',
    secondary: '"Open Sans", sans-serif'
  }
};

const defaultBorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16
};

const defaultShadows = {
  small: '0 1px 3px rgba(0, 0, 0, 0.12)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
  large: '0 10px 15px rgba(0, 0, 0, 0.1)'
};

const lightTheme: Theme = {
  colors: lightColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  shadows: defaultShadows
};

const darkTheme: Theme = {
  colors: darkColors,
  spacing: defaultSpacing,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.25)',
    large: '0 10px 15px rgba(0, 0, 0, 0.2)'
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  // Efecto para cargar el tema guardado
  useEffect(() => {
    const loadTheme = async () => {
      const secureStorageService = await SecureStorageService.getInstance();
      const savedTheme = await secureStorageService.getValueFor(THEME_KEY);
      if (savedTheme === 'dark') {
        setIsDark(true);
        setTheme(darkTheme);
      } else {
        setIsDark(false);
        setTheme(lightTheme);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = useCallback(async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setTheme(newIsDark ? darkTheme : lightTheme);
    try {
      const secureStorageService = await SecureStorageService.getInstance();
      await secureStorageService.save(THEME_KEY, newIsDark ? 'dark' : 'light');
    } catch (e) {
      console.error('Error saving theme:', e);
    }
  }, [isDark]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleTheme,
    colors: isDark ? darkColors : lightColors,
    spacing: defaultSpacing
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Extensión para styled-components (si los usas)
export const themeVariables = (theme: Theme) => ({
  // Colores
  '--primary': theme.colors.primary,
  '--primary-light': theme.colors.primaryLight,
  '--primary-dark': theme.colors.primaryDark,
  '--secondary': theme.colors.secondary,
  '--secondary-light': theme.colors.secondaryLight,
  '--secondary-dark': theme.colors.secondaryDark,
  '--tertiary': theme.colors.tertiary,
  '--background': theme.colors.background,
  '--surface': theme.colors.surface,
  '--surface-variant': theme.colors.surfaceVariant,
  '--text': theme.colors.text,
  '--text-secondary': theme.colors.textSecondary,
  '--text-on-primary': theme.colors.textOnPrimary,
  '--text-on-secondary': theme.colors.textOnSecondary,
  '--success': theme.colors.success,
  '--warning': theme.colors.warning,
  '--error': theme.colors.error,
  '--info': theme.colors.info,
  '--border': theme.colors.border,
  '--divider': theme.colors.divider,
  '--placeholder': theme.colors.placeholder,
  '--shadow': theme.colors.shadow,
  '--primary-button': theme.colors.primaryButton,
  '--primary-button-text': theme.colors.primaryButtonText,
  '--secondary-button': theme.colors.secondaryButton,
  '--secondary-button-text': theme.colors.secondaryButtonText,
  '--disabled': theme.colors.disabled,
  '--disabled-text': theme.colors.disabledText,
  '--modal-background': theme.colors.modalBackground,
  '--overlay': theme.colors.overlay,
  '--card-background': theme.colors.cardBackground,
  '--chip-background': theme.colors.chipBackground,
  '--forest': theme.colors.forest,
  '--earth': theme.colors.earth,
  '--water': theme.colors.water,
  '--leaf': theme.colors.leaf,

  // Espaciado
  '--spacing-tiny': `${theme.spacing.tiny}px`,
  '--spacing-small': `${theme.spacing.small}px`,
  '--spacing-medium': `${theme.spacing.medium}px`,
  '--spacing-large': `${theme.spacing.large}px`,
  '--spacing-xlarge': `${theme.spacing.xlarge}px`,
  '--spacing-xxlarge': `${theme.spacing.xxlarge}px`,

  // Tipografía
  '--font-size-small': `${theme.typography.fontSize.small}px`,
  '--font-size-medium': `${theme.typography.fontSize.medium}px`,
  '--font-size-large': `${theme.typography.fontSize.large}px`,
  '--font-size-xlarge': `${theme.typography.fontSize.xlarge}px`,
  '--font-size-xxlarge': `${theme.typography.fontSize.xxlarge}px`,
  '--font-weight-light': theme.typography.fontWeight.light,
  '--font-weight-regular': theme.typography.fontWeight.regular,
  '--font-weight-medium': theme.typography.fontWeight.medium,
  '--font-weight-bold': theme.typography.fontWeight.bold,
  '--font-weight-black': theme.typography.fontWeight.black,
  '--font-family-primary': theme.typography.fontFamily.primary,
  '--font-family-secondary': theme.typography.fontFamily.secondary,

  // Bordes
  '--border-radius-small': `${theme.borderRadius.small}px`,
  '--border-radius-medium': `${theme.borderRadius.medium}px`,
  '--border-radius-large': `${theme.borderRadius.large}px`,
  '--border-radius-xlarge': `${theme.borderRadius.xlarge}px`,

  // Sombras
  '--shadow-small': theme.shadows.small,
  '--shadow-medium': theme.shadows.medium,
  '--shadow-large': theme.shadows.large
});

export type ThemeVariablesType = ReturnType<typeof themeVariables>;
