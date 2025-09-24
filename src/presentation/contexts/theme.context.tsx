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
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  tertiary: string;

  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textOnPrimary: string;
  textOnSecondary: string;

  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  divider: string;
  placeholder: string;
  shadow: string;
  primaryButton: string;
  primaryButtonText: string;
  secondaryButton: string;
  secondaryButtonText: string;
  disabled: string;
  disabledText: string;

  modalBackground: string;
  overlay: string;

  cardBackground: string;
  chipBackground: string;

  forest: string;
  earth: string;
  water: string;
  leaf: string;

  publicationCardBackground: string;
  publicationCardShadow: string;
  publicationCardBorder: string;
  publicationCardTitleColor: string;
  publicationCardTextColor: string;
  publicationCardButtonBackground: string;
  publicationCardButtonText: string;
}

interface ThemeSpacing {
  tiny: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
}

interface ThemeIconSizes {
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
  lineHeight: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
    xxlarge: number;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  iconSizes: ThemeIconSizes;
  typography: ThemeTypography;
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  borderWidths: {
    hairline: number;
    small: number;
    medium: number;
    large: number;
  };
  borderWidth: {
    hairline: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  publicationCardShadow: string;
  publicationCardBorder: string;
  publicationCardTitleColor: string;
  publicationCardTextColor: string;
  publicationCardButtonBackground: string;
  publicationCardButtonText: string;
  modalBackground: string;
  overlay: string;
  cardBackground: string;
  chipBackground: string;
  forest: string;
  earth: string;
  water: string;
  leaf: string;
  primaryButton: string;
  primaryButtonText: string;
  secondaryButton: string;
  secondaryButtonText: string;
  disabled: string;
  disabledText: string;
  textOnPrimaryButton: string;
  textOnSecondaryButton: string;
  textOnDisabledButton: string;
  textOnDisabled: string;
  textOnPlaceholder: string;
  textOnBackground: string;
  textOnSurface: string;
  textOnSurfaceVariant: string;
  textOnCardBackground: string;
  textOnChipBackground: string;
  textOnModalBackground: string;
  textOnOverlay: string;
  textOnPublicationCardBackground: string;
  textOnPublicationCardButtonBackground: string;
  textOnPrimary: string;
  textOnSecondary: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  border: string;
  divider: string;
  placeholder: string;
  shadow: string;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  iconSizes: ThemeIconSizes;
  typography: ThemeTypography;
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  borderWidths: {
    hairline: number;
    small: number;
    medium: number;
    large: number;
  };
  borderWidth: {
    hairline: number;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  modalBackground: string;
  overlay: string;
  cardBackground: string;
  chipBackground: string;
  forest: string;
  earth: string;
  water: string;
  leaf: string;
  primaryButton: string;
  primaryButtonText: string;
  secondaryButton: string;
  secondaryButtonText: string;
  disabled: string;
  disabledText: string;
  publicationCardBackground: string;
  publicationCardShadow: string;
  publicationCardBorder: string;
  publicationCardTitleColor: string;
  publicationCardTextColor: string;
  publicationCardButtonBackground: string;
  publicationCardButtonText: string;
}

const lightColors: ThemeColors = {
  primary: '#007A33',
  primaryLight: '#4CAF50',
  primaryDark: '#004D1C',
  secondary: '#FFD600',
  secondaryLight: '#FFF59D',
  secondaryDark: '#C7A500',
  tertiary: '#D50000',

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
  leaf: '#43A047',

  publicationCardBackground: '#FFFFFF',
  publicationCardShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  publicationCardBorder: '#E0E0E0',
  publicationCardTitleColor: '#212121',
  publicationCardTextColor: '#616161',
  publicationCardButtonBackground: '#007A33',
  publicationCardButtonText: '#FFFFFF'
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
  leaf: '#66BB6A',

  publicationCardBackground: '#2C2C2C',
  publicationCardShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  publicationCardBorder: '#424242',
  publicationCardTitleColor: '#E0E0E0',
  publicationCardTextColor: '#B0B0B0',
  publicationCardButtonBackground: '#4CAF50',
  publicationCardButtonText: '#212121'
};

const defaultSpacing: ThemeSpacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48
};

const defaultIconSizes: ThemeIconSizes = {
  tiny: 12,
  small: 16,
  medium: 24,
  large: 32,
  xlarge: 48,
  xxlarge: 64
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
  },
  lineHeight: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 28,
    xxlarge: 32
  }
};

const defaultBorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16
};

const defaultBorderWidths = {
  hairline: 1,
  small: 2,
  medium: 4,
  large: 8
};

const defaultShadows = {
  small: '0 1px 3px rgba(0, 0, 0, 0.12)',
  medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
  large: '0 10px 15px rgba(0, 0, 0, 0.1)'
};

const lightTheme: Theme = {
  colors: lightColors,
  spacing: defaultSpacing,
  iconSizes: defaultIconSizes,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  borderWidths: defaultBorderWidths,
  borderWidth: { hairline: defaultBorderWidths.hairline },
  shadows: defaultShadows,
  publicationCardShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  publicationCardBorder: '#E0E0E0',
  publicationCardTitleColor: '#212121',
  publicationCardTextColor: '#616161',
  publicationCardButtonBackground: '#007A33',
  publicationCardButtonText: '#FFFFFF',
  modalBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.4)',
  cardBackground: '#FFFFFF',
  chipBackground: '#F1F8E9',
  forest: '#007A33',
  earth: '#5D4037',
  water: '#0288D1',
  leaf: '#43A047',
  primaryButton: '#007A33',
  primaryButtonText: '#FFFFFF',
  secondaryButton: '#FFD600',
  secondaryButtonText: '#212121',
  disabled: '#E0E0E0',
  disabledText: '#9E9E9E',
  textOnPrimaryButton: '#FFFFFF',
  textOnSecondaryButton: '#212121',
  textOnDisabledButton: '#9E9E9E',
  textOnDisabled: '#9E9E9E',
  textOnPlaceholder: '#9E9E9E',
  textOnBackground: '#212121',
  textOnSurface: '#212121',
  textOnSurfaceVariant: '#616161',
  textOnCardBackground: '#212121',
  textOnChipBackground: '#616161',
  textOnModalBackground: '#212121',
  textOnOverlay: '#FFFFFF',
  textOnPublicationCardBackground: '#616161',
  textOnPublicationCardButtonBackground: '#FFFFFF',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#212121',
  textSecondary: '#616161',
  success: '#388E3C',
  warning: '#FBC02D',
  error: '#C62828',
  info: '#0288D1',
  border: '#E0E0E0',
  divider: '#BDBDBD',
  placeholder: '#9E9E9E',
  shadow: 'rgba(0, 0, 0, 0.1)'
};

const darkTheme: Theme = {
  colors: darkColors,
  spacing: defaultSpacing,
  iconSizes: defaultIconSizes,
  typography: defaultTypography,
  borderRadius: defaultBorderRadius,
  borderWidths: defaultBorderWidths,
  borderWidth: { hairline: defaultBorderWidths.hairline },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.25)',
    large: '0 10px 15px rgba(0, 0, 0, 0.2)'
  },
  publicationCardShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  publicationCardBorder: '#424242',
  publicationCardTitleColor: '#E0E0E0',
  publicationCardTextColor: '#B0B0B0',
  publicationCardButtonBackground: '#4CAF50',
  publicationCardButtonText: '#212121',
  modalBackground: '#1E1E1E',
  overlay: 'rgba(0, 0, 0, 0.7)',
  cardBackground: '#2C2C2C',
  chipBackground: '#424242',
  forest: '#388E3C',
  earth: '#8D6E63',
  water: '#4FC3F7',
  leaf: '#66BB6A',
  primaryButton: '#4CAF50',
  primaryButtonText: '#212121',
  secondaryButton: '#FFD600',
  secondaryButtonText: '#212121',
  disabled: '#424242',
  disabledText: '#757575',
  textOnPrimaryButton: '#212121',
  textOnSecondaryButton: '#212121',
  textOnDisabledButton: '#757575',
  textOnDisabled: '#757575',
  textOnPlaceholder: '#9E9E9E',
  textOnBackground: '#E0E0E0',
  textOnSurface: '#E0E0E0',
  textOnSurfaceVariant: '#B0B0B0',
  textOnCardBackground: '#E0E0E0',
  textOnChipBackground: '#B0B0B0',
  textOnModalBackground: '#E0E0E0',
  textOnOverlay: '#FFFFFF',
  textOnPublicationCardBackground: '#B0B0B0',
  textOnPublicationCardButtonBackground: '#212121',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#212121',
  textSecondary: '#B0B0B0',
  success: '#81C784',
  warning: '#FFD54F',
  error: '#EF5350',
  info: '#4FC3F7',
  border: '#424242',
  divider: '#616161',
  placeholder: '#9E9E9E',
  shadow: 'rgba(0, 0, 0, 0.6)'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [theme, setTheme] = useState<Theme>(lightTheme);
  const [isDark, setIsDark] = useState(false);

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
    spacing: defaultSpacing,
    iconSizes: defaultIconSizes,
    typography: defaultTypography,
    borderRadius: defaultBorderRadius,
    borderWidths: defaultBorderWidths,
    borderWidth: { hairline: defaultBorderWidths.hairline },
    shadows: isDark ? darkTheme.shadows : defaultShadows,
    modalBackground: theme.modalBackground,
    overlay: theme.overlay,
    cardBackground: theme.cardBackground,
    chipBackground: theme.chipBackground,
    forest: theme.forest,
    earth: theme.earth,
    water: theme.water,
    leaf: theme.leaf,
    primaryButton: theme.primaryButton,
    primaryButtonText: theme.primaryButtonText,
    secondaryButton: theme.secondaryButton,
    secondaryButtonText: theme.secondaryButtonText,
    disabled: theme.disabled,
    disabledText: theme.disabledText,
    publicationCardBackground: theme.colors.publicationCardBackground,
    publicationCardShadow: theme.publicationCardShadow,
    publicationCardBorder: theme.publicationCardBorder,
    publicationCardTitleColor: theme.publicationCardTitleColor,
    publicationCardTextColor: theme.publicationCardTextColor,
    publicationCardButtonBackground: theme.publicationCardButtonBackground,
    publicationCardButtonText: theme.publicationCardButtonText
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

export const themeVariables = (theme: Theme) => ({
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
  '--modal-background': theme.modalBackground,
  '--overlay': theme.overlay,
  '--card-background': theme.cardBackground,
  '--chip-background': theme.chipBackground,
  '--forest': theme.forest,
  '--earth': theme.earth,
  '--water': theme.water,
  '--leaf': theme.leaf,

  '--publication-card-background': theme.colors.publicationCardBackground,
  '--publication-card-shadow': theme.publicationCardShadow,
  '--publication-card-border': theme.publicationCardBorder,
  '--publication-card-title-color': theme.publicationCardTitleColor,
  '--publication-card-text-color': theme.publicationCardTextColor,
  '--publication-card-button-background': theme.publicationCardButtonBackground,
  '--publication-card-button-text': theme.publicationCardButtonText,

  '--spacing-tiny': `${theme.spacing.tiny}px`,
  '--spacing-small': `${theme.spacing.small}px`,
  '--spacing-medium': `${theme.spacing.medium}px`,
  '--spacing-large': `${theme.spacing.large}px`,
  '--spacing-xlarge': `${theme.spacing.xlarge}px`,
  '--spacing-xxlarge': `${theme.spacing.xxlarge}px`,

  '--icon-size-tiny': `${theme.iconSizes.tiny}px`,
  '--icon-size-small': `${theme.iconSizes.small}px`,
  '--icon-size-medium': `${theme.iconSizes.medium}px`,
  '--icon-size-large': `${theme.iconSizes.large}px`,
  '--icon-size-xlarge': `${theme.iconSizes.xlarge}px`,
  '--icon-size-xxlarge': `${theme.iconSizes.xxlarge}px`,

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
  '--line-height-small': `${theme.typography.lineHeight.small}px`,
  '--line-height-medium': `${theme.typography.lineHeight.medium}px`,
  '--line-height-large': `${theme.typography.lineHeight.large}px`,
  '--line-height-xlarge': `${theme.typography.lineHeight.xlarge}px`,
  '--line-height-xxlarge': `${theme.typography.lineHeight.xxlarge}px`,

  '--border-radius-small': `${theme.borderRadius.small}px`,
  '--border-radius-medium': `${theme.borderRadius.medium}px`,
  '--border-radius-large': `${theme.borderRadius.large}px`,
  '--border-radius-xlarge': `${theme.borderRadius.xlarge}px`,

  '--border-width-hairline': `${theme.borderWidth.hairline}px`,
  '--border-width-small': `${theme.borderWidths.small}px`,
  '--border-width-medium': `${theme.borderWidths.medium}px`,
  '--border-width-large': `${theme.borderWidths.large}px`,

  '--shadow-small': theme.shadows.small,
  '--shadow-medium': theme.shadows.medium,
  '--shadow-large': theme.shadows.large,

  '--text-on-primary-button': theme.textOnPrimaryButton,
  '--text-on-secondary-button': theme.textOnSecondaryButton,
  '--text-on-disabled-button': theme.textOnDisabledButton,
  '--text-on-disabled': theme.textOnDisabled,
  '--text-on-placeholder': theme.textOnPlaceholder,
  '--text-on-background': theme.textOnBackground,
  '--text-on-surface': theme.textOnSurface,
  '--text-on-surface-variant': theme.textOnSurfaceVariant,
  '--text-on-card-background': theme.textOnCardBackground,
  '--text-on-chip-background': theme.textOnChipBackground,
  '--text-on-modal-background': theme.textOnModalBackground,
  '--text-on-overlay': theme.textOnOverlay,
  '--text-on-publication-card-background':
    theme.textOnPublicationCardBackground,
  '--text-on-publication-card-button-background':
    theme.textOnPublicationCardButtonBackground
});

export type ThemeVariablesType = ReturnType<typeof themeVariables>;
