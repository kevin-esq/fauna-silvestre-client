# Ticket 1.1: Eliminación de Código Muerto y Duplicado

## Estado: En Progreso

### ✅ Completado

#### 1. DraftEditorScreen - ELIMINADO

- **Razón**: Reemplazado por `PublicationFormScreen` que maneja tanto creación como edición (principio DRY)
- **Archivos eliminados**:
  - `src/presentation/screens/drafts/draft-editor-screen.tsx`
  - `src/presentation/screens/drafts/draft-editor-screen.styles.ts`
- **Archivos actualizados**:
  - `src/presentation/navigation/app.navigator.tsx`: Eliminado import y referencias
  - `src/presentation/navigation/navigation.types.ts`: Eliminada ruta `DraftEditor` y tipo `DraftEditorScreenProps`

### 🔍 Identificado para Análisis

#### 2. ReviewPublicationsScreen

- **Ubicación**: `src/presentation/screens/admin/review-publications-screen.tsx`
- **Usado en**: `src/presentation/navigation/tabs-config.tsx`
- **Estado**: Activo en tabs de administrador
- **Acción**: REVISAR - Verificar si se usa o puede ser eliminado

#### 3. OfflineHomeScreen

- **Ubicación**: `src/presentation/screens/offline/offline-home-screen.tsx`
- **Usado en**: `src/presentation/navigation/offline-tabs-config.tsx`
- **Estado**: Activo en tabs offline
- **Acción**: MANTENER - Necesario para modo offline

#### 4. NotificationsScreen

- **Import comentado en**: `src/presentation/navigation/tabs-config.tsx`
- **Estado**: Comentado pero no eliminado
- **Acción**: Verificar si el archivo existe y eliminar import comentado

#### 5. Servicios de Cámara Duplicados

- **Archivos**:
  - `src/services/camera/camera.service.ts` - Servicio de permisos
  - `src/services/media/camera.service.ts` - Servicio de captura de fotos
- **Estado**: Ambos tienen responsabilidades diferentes
- **Acción**: MANTENER - No son duplicados, tienen propósitos distintos

### 📋 Próximos Pasos

1. ✅ Revisar uso de ReviewPublicationsScreen
2. ⏳ Verificar NotificationsScreen y limpiar import comentado
3. ⏳ Buscar componentes duplicados
4. ⏳ Buscar hooks no utilizados
5. ⏳ Eliminar imports no utilizados
6. ⏳ Consolidar código duplicado

### 📝 Notas

- SQLite fue completamente removido según memories
- ImageOptimizationService fue removido y reemplazado por servicio vacío
- PublicationContext fue refactorizado para usar paginación pura con backend
