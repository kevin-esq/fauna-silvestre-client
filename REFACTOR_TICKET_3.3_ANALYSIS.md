# Ticket 3.3: Análisis de DraftContext

## 📊 Resumen Ejecutivo

**Estado General**: 🟡 **BUENA ESTRUCTURA BASE - NECESITA MODERNIZACIÓN**

**Líneas de Código**: 314 líneas

**Veredicto**: Context bien estructurado funcionalmente pero no aprovecha los nuevos servicios centralizados (ValidationService, ErrorHandlingService) ni sigue los patrones modernos establecidos en PublicationContext y AuthContext.

---

## 🔍 Estado Actual

### ✅ Aspectos Positivos

1. **Tamaño Manejable**: 314 líneas vs 1,140 de PublicationContext original
2. **Delegación Correcta**: Ya usa draftService y offlineQueueService
3. **Hooks Apropiados**: useCallback usado correctamente
4. **Network Awareness**: Integración con useNetworkStatus
5. **Auto-sync**: Sistema automático cuando hay conexión
6. **Estados Claros**: drafts, isLoading, error, pendingCount

### 🟡 Oportunidades de Mejora

#### 1. **No Usa Nuevos Servicios Centralizados**

**Ubicación**: Todo el archivo

**Problema**: No aprovecha ValidationService ni ErrorHandlingService

**Actual**:
```typescript
const logger = new ConsoleLogger('info');

// Logging manual en cada método
logger.error('Error loading drafts', err as Error);
logger.info(`Draft created: ${draft.id}`);
```

**Mejor**:
```typescript
import { errorHandlingService } from '@/services/error-handling';
import { ValidationService } from '@/services/validation';

// Error handling centralizado
```

---

#### 2. **Patrón de Error Handling Repetitivo**

**Ubicación**: Líneas 73-115, 117-136, 138-157, 171-223, 225-245, 247-265

**Problema**: Mismo patrón try/catch en 8 métodos

**Actual**:
```typescript
const createDraft = useCallback(async (...) => {
  setIsLoading(true);
  setError(null);
  try {
    // Operación
  } catch (err) {
    const errorMessage = 'Error al crear borrador';
    setError(errorMessage);
    logger.error(errorMessage, err as Error);
    throw err;
  } finally {
    setIsLoading(false);
  }
}, [loadDrafts]);
```

**Patrón se repite en**:
- createDraft (líneas 73-115)
- updateDraft (líneas 117-136)
- deleteDraft (líneas 138-157)
- submitDraft (líneas 171-223)
- retryFailedDrafts (líneas 225-245)
- clearAllDrafts (líneas 247-265)

**Mejor**: Usar ErrorHandlingService.handleWithRetry() wrapper

---

#### 3. **Mensajes de Error en Español**

**Ubicación**: Líneas 106, 127, 148, 180, 214, 227, 239, 258

**Problema**: Logs internos en español, deberían estar en inglés

**Actual**:
```typescript
const errorMessage = 'Error al crear borrador';
const errorMessage = 'Error al actualizar borrador';
const errorMessage = 'Error al eliminar borrador';
throw new Error('Borrador no encontrado');
const errorMessage = 'Error al enviar borrador';
setError('No hay conexión a internet');
const errorMessage = 'Error al reintentar borradores';
const errorMessage = 'Error al limpiar borradores';
```

**Mejor**:
```typescript
const errorMessage = 'Error creating draft';
const errorMessage = 'Error updating draft';
const errorMessage = 'Error deleting draft';
throw new Error('Draft not found');
const errorMessage = 'Error submitting draft';
setError('No internet connection');
const errorMessage = 'Error retrying drafts';
const errorMessage = 'Error clearing drafts';
```

---

#### 4. **No Usa useMemo para Context Value**

**Ubicación**: Líneas 285-299

**Problema**: El value del context no está memoizado

**Actual**:
```typescript
const value: DraftContextType = {
  drafts,
  isLoading,
  error,
  isOnline: isConnected,
  pendingCount,
  createDraft,
  updateDraft,
  deleteDraft,
  getDraftById,
  submitDraft,
  retryFailedDrafts,
  clearAllDrafts,
  refreshDrafts
};

return (
  <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
);
```

**Mejor**:
```typescript
const value = useMemo(() => ({
  drafts,
  isLoading,
  // ...
}), [drafts, isLoading, /* deps */]);
```

---

#### 5. **No Hay Estructura Modular**

**Ubicación**: Todo en un solo archivo

**Problema**: Aunque es pequeño, podría beneficiarse de modularización

**Actual**: Todo en `draft.context.tsx`

**Mejor**:
```
src/presentation/contexts/draft/
├── index.tsx              (Provider y hook)
├── types.ts              (Interfaces)
└── draft-operations.ts   (Operaciones CRUD)
```

---

#### 6. **Validaciones Manuales Sin ValidationService**

**Ubicación**: Líneas 179-181

**Problema**: Validación manual en lugar de usar ValidationService

```typescript
const draft = await draftService.getDraftById(draftId);

if (!draft) {
  throw new Error('Borrador no encontrado');
}
```

**Mejor**: Usar ValidationService para validaciones consistentes

---

#### 7. **ConsoleLogger Directo en Lugar de Through Service**

**Ubicación**: Línea 21

**Problema**: Crea instancia de logger directamente

```typescript
const logger = new ConsoleLogger('info');
```

**Mejor**: Debería pasar logger a ErrorHandlingService o usar servicio centralizado

---

## 📊 Comparación con Otros Contexts

| Aspecto | PublicationContext | AuthContext | DraftContext | Estado DraftContext |
|---------|-------------------|-------------|--------------|---------------------|
| **LOC Original** | 1,140 | 319 | 314 | 🟢 Bueno |
| **Utility Classes** | 5 → 0 | 0 | 0 | ✅ Bueno |
| **Modularización** | 7 archivos | 4 archivos | 1 archivo | 🟡 Podría mejorar |
| **ValidationService** | ✅ Integrado | ✅ Integrado | ❌ No | 🔴 Falta |
| **ErrorHandlingService** | ✅ Integrado | ❌ No | ❌ No | 🔴 Falta |
| **useMemo** | ✅ Sí | ✅ Sí | ❌ No | 🔴 Falta |
| **Try/catch repetidos** | 0 | 7 | 8 | 🔴 Alto |
| **Mensajes en inglés** | ✅ Sí | ✅ Sí | ❌ No | 🔴 Falta |

---

## 🎯 Plan de Optimización

### Fase 1: Integrar Servicios Centralizados

1. ✅ **Usar ErrorHandlingService**
   - Reemplazar try/catch manual con ErrorHandlingService
   - Eliminar 8 bloques try/catch repetitivos
   - Logging centralizado y categorización de errores

2. ✅ **Usar ValidationService**
   - Validar drafts antes de operaciones
   - Validar IDs de forma consistente
   - Reutilizar validaciones en app

---

### Fase 2: Internacionalización de Mensajes

3. ✅ **Cambiar Mensajes a Inglés**
   - Todos los logs internos en inglés
   - Mensajes de error en inglés
   - Logs de info en inglés
   - Mantener mensajes de usuario en español (si los hay)

---

### Fase 3: Optimizaciones de Performance

4. ✅ **Agregar useMemo al Context Value**
   - Memoizar el value del provider
   - Evitar re-renders innecesarios
   - Optimizar dependencias

---

### Fase 4: Modularizar Estructura (Opcional)

5. ⏳ **Separar en Módulos**
   - `types.ts`: Interfaces y tipos
   - `draft-operations.ts`: Operaciones CRUD
   - `index.tsx`: Provider y hook principal

---

## 📝 Estimaciones

### Reducción Esperada

| Item | Antes | Después | Mejora |
|------|-------|---------|--------|
| **Líneas en context** | 314 | ~200 | **-36%** |
| **Try/catch blocks** | 8 | 0 | **-100%** |
| **Mensajes en español** | 8 | 0 | **-100%** |
| **useMemo** | 0 | 1 | **+Performance** |
| **Archivos** | 1 | 3-4 | **Modular** |
| **Servicios integrados** | 2 | 4 | **+2** |

---

## ✅ Beneficios Esperados

### Reusabilidad
- ✅ **ErrorHandlingService** para manejo consistente
- ✅ **ValidationService** para validaciones
- ✅ **Código modular** reutilizable

### Mantenibilidad
- ✅ **-36% líneas** en context principal
- ✅ **Sin try/catch repetitivo**
- ✅ **Mensajes consistentes** en inglés
- ✅ **Más fácil de testear**

### Consistencia
- ✅ **Mismos patrones** que PublicationContext y AuthContext
- ✅ **Servicios compartidos** en toda la app
- ✅ **Logs en inglés** como resto de la app

### Performance
- ✅ **useMemo** evita re-renders
- ✅ **Dependencias optimizadas**
- ✅ **Mejor gestión de estado**

---

## 📊 Prioridad vs Impacto

**Prioridad**: Media  
**Impacto**: Medio-Alto  
**Riesgo**: Bajo (no breaking changes)  
**Tiempo Estimado**: 1.5-2 horas

**Razón**: DraftContext está funcional pero necesita modernización para:
1. Consistencia con nuevos patrones
2. Reducción de código boilerplate
3. Mejor manejo de errores
4. Internacionalización de logs

---

## 🚀 Orden de Implementación

1. Cambiar mensajes a inglés (20 min)
2. Integrar ErrorHandlingService (40 min)
3. Agregar useMemo al value (10 min)
4. Integrar ValidationService (15 min)
5. Extraer tipos a módulo separado (10 min)
6. Testing y verificación (15 min)

**Total**: 1.5-2 horas

---

## 📝 Conclusión

**Veredicto Final**: 🟡 **MODERNIZACIÓN NECESARIA**

El DraftContext está bien estructurado funcionalmente pero necesita modernización para:
- Integrar servicios centralizados (ErrorHandlingService, ValidationService)
- Eliminar código boilerplate repetitivo (8 try/catch bloques)
- Internacionalizar logs internos (inglés)
- Optimizar performance con useMemo
- Consistencia con otros contexts refactorizados

**NO es crítico** pero las mejoras aportarán:
- Mejor consistencia con el resto de la app
- Código más limpio y mantenible
- Manejo de errores centralizado
- Performance optimizado

**Recomendación**: Implementar al menos Fases 1-3 (servicios, inglés, useMemo) para consistencia
