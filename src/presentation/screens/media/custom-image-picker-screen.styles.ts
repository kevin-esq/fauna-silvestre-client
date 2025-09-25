import { StyleSheet } from 'react-native';

export const createStyles = (variables: Record<string, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: variables['--background-color']
    },
    header: {
      height: 56,
      justifyContent: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: variables['--border-color']
    },
    content: {
      flex: 1
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '500',
      color: variables['--text-color']
    },
    backButton: {
      position: 'absolute',
      left: 16,
      flexDirection: 'row',
      alignItems: 'center'
    },
    albumGrid: {
      padding: 8
    },
    albumItem: {
      width: '50%',
      padding: 8
    },
    albumCover: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: 4
    },
    albumTitle: {
      marginTop: 8,
      fontSize: 16,
      fontWeight: '500',
      color: variables['--text-color']
    },
    albumCount: {
      fontSize: 14,
      color: variables['--secondary-text-color']
    },
    photoGrid: {
      padding: 1
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    loadingText: {
      marginTop: 16,
      color: variables['--text-color']
    },
    errorText: {
      color: variables['--error-color'],
      marginBottom: 16
    },
    confirmButton: {
      position: 'absolute',
      bottom: 24,
      alignSelf: 'center',
      backgroundColor: variables['--accent-color'],
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24
    },
    buttonText: {
      color: variables['--text-secondary'],
      fontWeight: '500'
    },
    floatingButtonContainer: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center'
    },
    photoItem: {
      width: '33.33%',
      aspectRatio: 1,
      padding: 1
    },
    photo: {
      width: '100%',
      height: '100%'
    },
    selectionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    selectionBadge: {
      marginBottom: 8
    },
    selectionText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
      paddingHorizontal: 8
    }
  });
