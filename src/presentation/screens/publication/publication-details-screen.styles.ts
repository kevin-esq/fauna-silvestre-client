import { StyleSheet } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';

export const createStyles = (
  vars: Record<string, string>,
  width: number,
  height: number,
  insets: EdgeInsets,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: vars['--background'],
      paddingTop: insets.top,
      paddingBottom: insets.bottom + 16,
    },
    content: {
      padding: 16,
      gap: 24,
    },
    headerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: vars['--primary'],
      borderRadius: 32,
      paddingVertical: 10,
      paddingHorizontal: 18,
      alignSelf: 'flex-start',
      elevation: 2,
    },
    backButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: vars['--text'],
    },
    imageCard: {
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: vars['--background-variant'],
    },
    image: {
      width: '100%',
      height: 240,
    },
    imagePlaceholder: {
      height: 240,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: vars['--background-variant'],
    },
    placeholderText: {
      marginTop: 8,
      color: vars['--text-secondary'],
      fontSize: 14,
    },
    zoomIcon: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: 20,
      padding: 6,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullImage: {
      width,
      height: height * 0.85,
    },
    closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      zIndex: 2,
    },
    card: {
      backgroundColor: vars['--background-variant'],
      borderRadius: 16,
      padding: 20,
      gap: 12,
    },
    cardTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: vars['--text'],
    },
    cardText: {
      fontSize: 17,
      color: vars['--text-secondary'],
      lineHeight: 24,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    locationText: {
      fontSize: 17,
      color: vars['--text'],
    },
    rejectionCard: {
      backgroundColor: '#FDECEA',
    },
    rejectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#D32F2F',
    },
    userProfilePicture: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: vars['--background'],
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    modifyButton: {
      marginTop: 12,
      alignSelf: 'center',
      backgroundColor: vars['--primary'],
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      elevation: 2,
    },
    modifyButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });