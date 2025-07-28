
import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const createStyles = (variables: Record<string, string>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: variables['--background'],
  },
  
  // Tarjeta principal
  card: {
    margin: 16,
    marginTop: 20, // Espacio para el status bar
    backgroundColor: variables['--surface'],
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },

  // Header de la tarjeta
  cardHeader: {
    height: 200,
    position: 'relative',
  },

  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  cardHeaderContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },

  commonName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#E5E7EB',
  },

  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: variables['--background'],
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  // Indicador de imagen expandible
  imageIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },

  // Contenido de la tarjeta
  cardContent: {
    padding: 16,
  },

  descriptionContainer: {
    marginBottom: 16,
  },

  description: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Información básica
  basicInfo: {
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  infoValue: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Información expandible
  expandedInfo: {
    marginTop: 16,
  },

  separator: {
    height: 1,
    backgroundColor: variables['--border'],
    marginBottom: 16,
  },

  // Botón expandir
  expandButton: {
    backgroundColor: variables['--primary-color'],
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 16,
  },

  expandButtonText: {
    color: variables['--text-on-primary'],
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer de la tarjeta
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: variables['--surface-variant'],
    borderTopWidth: 1,
    borderTopColor: variables['--border'],
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  actionButtonText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },

  // Estilos del modal de imagen
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 10,
  },

  modalImage: {
    width: screenWidth - 40,
    height: screenHeight - 200,
    borderRadius: 12,
  },

  modalInfo: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },

  modalSubtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#E5E7EB',
    textAlign: 'center',
  },
});