import { StyleSheet } from 'react-native';

const parseValue = (value: string): number => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

type FontWeight =
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

const parseFontWeight = (value: string): FontWeight => {
  const numericWeights: Record<string, FontWeight> = {
    '100': '100',
    '200': '200',
    '300': '300',
    '400': '400',
    '500': '500',
    '600': '600',
    '700': '700',
    '800': '800',
    '900': '900'
  };
  return numericWeights[value] || value;
};

export const createStyles = (variables: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: variables['--background']
    },
    content: {
      flex: 1
    },

    header: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: parseValue(variables['--spacing-medium']),
      backgroundColor: variables['--surface'],
      borderBottomWidth: parseValue(variables['--border-width-hairline']),
      borderBottomColor: variables['--divider'],
      elevation: 2,
      shadowColor: variables['--shadow'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },
    headerTitle: {
      fontSize: parseValue(variables['--font-size-xlarge']),
      fontWeight: parseFontWeight(variables['--font-weight-medium']),
      color: variables['--text'],
      fontFamily: variables['--font-family-primary']
    },
    backButton: {
      position: 'absolute',
      left: parseValue(variables['--spacing-medium']),
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent'
    },

    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: parseValue(variables['--spacing-medium']),
      paddingVertical: parseValue(variables['--spacing-small']),
      backgroundColor: variables['--surface-variant'],
      borderBottomWidth: parseValue(variables['--border-width-hairline']),
      borderBottomColor: variables['--divider']
    },
    infoText: {
      fontSize: parseValue(variables['--font-size-small']),
      color: variables['--text-secondary'],
      marginLeft: parseValue(variables['--spacing-small']),
      fontFamily: variables['--font-family-primary']
    },

    albumGrid: {
      padding: parseValue(variables['--spacing-small']),
      paddingTop: parseValue(variables['--spacing-medium'])
    },
    photoGrid: {
      padding: parseValue(variables['--spacing-tiny']),
      paddingTop: parseValue(variables['--spacing-small'])
    },

    albumItem: {
      flex: 1,
      margin: parseValue(variables['--spacing-small']),
      backgroundColor: variables['--surface'],
      borderRadius: parseValue(variables['--border-radius-medium']),
      padding: parseValue(variables['--spacing-medium']),
      elevation: 2,
      shadowColor: variables['--shadow'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: parseValue(variables['--border-width-hairline']),
      borderColor: variables['--border']
    },
    albumCover: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: parseValue(variables['--border-radius-small']),
      backgroundColor: variables['--surface-variant']
    },
    albumTitle: {
      marginTop: parseValue(variables['--spacing-small']),
      fontSize: parseValue(variables['--font-size-medium']),
      fontWeight: parseFontWeight(variables['--font-weight-medium']),
      color: variables['--text'],
      fontFamily: variables['--font-family-primary']
    },
    albumCount: {
      marginTop: parseValue(variables['--spacing-tiny']),
      fontSize: parseValue(variables['--font-size-small']),
      color: variables['--text-secondary'],
      fontFamily: variables['--font-family-primary']
    },

    photoItem: {
      margin: parseValue(variables['--spacing-tiny']),
      borderRadius: parseValue(variables['--border-radius-small']),
      overflow: 'hidden',
      elevation: 1,
      shadowColor: variables['--shadow'],
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2
    },
    photo: {
      borderRadius: parseValue(variables['--border-radius-small'])
    },

    selectionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 122, 51, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: parseValue(variables['--border-radius-small'])
    },
    selectionBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 20,
      padding: parseValue(variables['--spacing-tiny'])
    },
    disabledPhotoOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: parseValue(variables['--border-radius-small'])
    },

    locationIcon: {
      position: 'absolute',
      top: parseValue(variables['--spacing-small']),
      right: parseValue(variables['--spacing-small']),
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2
    },

    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: parseValue(variables['--spacing-xlarge'])
    },

    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: parseValue(variables['--spacing-xlarge'])
    },
    emptyStateIcon: {
      marginBottom: parseValue(variables['--spacing-large']),
      padding: parseValue(variables['--spacing-large']),
      backgroundColor: variables['--surface-variant'],
      borderRadius: 50,
      elevation: 1,
      shadowColor: variables['--shadow'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },
    emptyStateTitle: {
      fontSize: parseValue(variables['--font-size-xlarge']),
      fontWeight: parseFontWeight(variables['--font-weight-medium']),
      color: variables['--text'],
      marginBottom: parseValue(variables['--spacing-small']),
      textAlign: 'center',
      fontFamily: variables['--font-family-primary']
    },
    emptyStateSubtitle: {
      fontSize: parseValue(variables['--font-size-medium']),
      color: variables['--text-secondary'],
      textAlign: 'center',
      lineHeight: parseValue(variables['--line-height-medium']),
      fontFamily: variables['--font-family-primary']
    },

    loadingText: {
      marginTop: parseValue(variables['--spacing-medium']),
      fontSize: parseValue(variables['--font-size-medium']),
      color: variables['--text-secondary'],
      textAlign: 'center',
      fontFamily: variables['--font-family-primary']
    },
    errorText: {
      fontSize: parseValue(variables['--font-size-medium']),
      color: variables['--error'],
      textAlign: 'center',
      marginBottom: parseValue(variables['--spacing-large']),
      lineHeight: parseValue(variables['--line-height-medium']),
      fontFamily: variables['--font-family-primary']
    },

    confirmButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variables['--primary'],
      paddingVertical: parseValue(variables['--spacing-medium']),
      paddingHorizontal: parseValue(variables['--spacing-xlarge']),
      borderRadius: parseValue(variables['--border-radius-xlarge']),
      elevation: 4,
      shadowColor: variables['--primary'],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      minWidth: 160
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variables['--primary'],
      paddingVertical: parseValue(variables['--spacing-medium']),
      paddingHorizontal: parseValue(variables['--spacing-large']),
      borderRadius: parseValue(variables['--border-radius-medium']),
      elevation: 2,
      shadowColor: variables['--shadow'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      marginTop: parseValue(variables['--spacing-large'])
    },
    buttonText: {
      fontSize: parseValue(variables['--font-size-medium']),
      fontWeight: parseFontWeight(variables['--font-weight-medium']),
      color: variables['--text-on-primary'],
      fontFamily: variables['--font-family-primary']
    },

    floatingButtonContainer: {
      position: 'absolute',
      bottom: parseValue(variables['--spacing-large']),
      left: parseValue(variables['--spacing-medium']),
      right: parseValue(variables['--spacing-medium']),
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },

    selectionText: {
      fontSize: parseValue(variables['--font-size-small']),
      fontWeight: parseFontWeight(variables['--font-weight-medium']),
      color: variables['--text-on-primary'],
      textAlign: 'center',
      fontFamily: variables['--font-family-primary']
    }
  });
