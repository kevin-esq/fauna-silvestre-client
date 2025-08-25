import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginVertical: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    minHeight: 120
  },

  // Contenedor de imagen mejorado
  imageContainer: {
    position: 'relative',
    width: 120,
    height: 120
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },

  // Badge de categoría pequeño
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },

  // Información principal
  info: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative'
  },

  headerSection: {
    flex: 1,
    justifyContent: 'center'
  },

  commonName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 22
  },

  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    fontWeight: '400',
    marginBottom: 8
  },

  // Status mejorado
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize'
  },

  // Indicador de acción
  actionIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    transform: [{ translateY: -10 }]
  }
});
