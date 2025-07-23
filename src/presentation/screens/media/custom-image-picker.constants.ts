// constants/custom-image-picker.constants.ts

export const ACCESSIBILITY = {
    headerLabel: 'Selector de fotos',
    backButton: 'Volver atrás',
    confirmButton: 'Confirmar selección',
    clearButton: 'Limpiar selección',
    retryButton: 'Reintentar',
    loadingLabel: 'Cargando fotos',
  };
  
  export const UI_LABELS = {
    loadingPhotos: 'Cargando fotos...',
    retry: 'Reintentar',
    errorLoadingAlbums: 'Error cargando álbumes',
    errorLoadingPhotos: 'Error cargando fotos',
  };
  
  export const DIMENSIONS = {
    itemSize: 120, // Puedes actualizar esto dinámicamente desde Dimensions.get('window')
    iconSize: {
      small: 24,
      medium: 32,
      large: 40,
    },
  };
  
  export const HITSLOP = {
    default: { top: 8, bottom: 8, left: 8, right: 8 },
  };
  
  export const PAGINATION = {
    pageSize: 100,
  };
  