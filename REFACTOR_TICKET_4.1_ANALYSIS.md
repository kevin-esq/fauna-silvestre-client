# Ticket 4.1: Análisis de Hooks Duplicados

## 📊 Resumen Ejecutivo

**Estado General**: 🟡 **OPORTUNIDADES DE CONSOLIDACIÓN IDENTIFICADAS**

**Total de Hooks**: 28 hooks custom

**Veredicto**: Se identificaron patrones repetitivos que pueden consolidarse en hooks genéricos reutilizables.

---

## 🔍 Hooks Analizados

### Total por Categoría

| Categoría | Cantidad | Hooks |
|-----------|----------|-------|
| **Common** | 7 | use-modal-state, use-network-status, use-load-data, etc. |
| **Auth** | 3 | use-login-form, use-register-form, use-forgot-password |
| **Camera** | 5 | use-camera, use-camera-freeze, use-gallery, etc. |
| **Forms** | 2 | use-animal-form, use-image-editor |
| **Media** | 4 | use-file-download, use-recent-images, etc. |
| **Publication** | 2 | use-drafts, use-home-data |
| **Admin** | 2 | use-admin-data, use-catalog-management |
| **Others** | 3 | use-users, use-notifications, use-permissions |

---

## 🔍 Patrones Duplicados Identificados

### 1. **Boolean Toggle Pattern** ⭐⭐⭐

**Ubicaciones** (15+ instancias):
- `use-modal-state.hook.ts` - isModalOpen
- `use-login-form.hook.ts` - rememberMe
- `use-register-form.hook.ts` - successModal
- `use-forgot-password.hook.ts` - successModal
- `use-camera.hook.ts` - isCameraReady, isCapturing, isRetrying
- `use-camera-freeze.hook.ts` - isShowingFreeze
- `use-image-editor.hook.ts` - isSaving
- `use-recent-images.hook.ts` - hasPermission
- `use-users.hook.ts` - hasAttemptedLoad
- `use-request-permissions.hook.ts` - hasPermissions, isRequesting

**Patrón Actual**:
```typescript
const [isModalOpen, setIsModalOpen] = useState(false);

const openModal = useCallback(() => {
  setIsModalOpen(true);
}, []);

const closeModal = useCallback(() => {
  setIsModalOpen(false);
}, []);
```

**Hook Consolidado Propuesto**:
```typescript
// useToggle.ts
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(v => !v), []);

  return {
    value,
    setTrue,
    setFalse,
    toggle,
    setValue
  };
};
```

**Beneficio**: Elimina 50+ líneas de código repetitivo

---

### 2. **Loading + Error State Pattern** ⭐⭐⭐

**Ubicaciones** (10+ instancias):
- `use-drafts.hook.ts` - isLoading, error
- `use-common-nouns.ts` - isLoading, error
- `use-recent-images.hook.ts` - isLoading, error
- `use-admin-data.hook.ts` - isLoadingUserCounts
- `use-home-data.hook.ts` - isLoadingCounts

**Patrón Actual**:
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// En cada función async
setIsLoading(true);
setError(null);
try {
  // operación
} catch (err) {
  setError(err.message);
} finally {
  setIsLoading(false);
}
```

**Hook Consolidado Propuesto**:
```typescript
// useAsyncState.ts
export const useAsyncState = <T,>() => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (asyncFn: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    setData
  };
};
```

**Beneficio**: Elimina 100+ líneas de código repetitivo

---

### 3. **Ref Pattern for Mounted State**

**Ubicaciones** (5+ instancias):
- `use-recent-images.hook.ts` - isMountedRef
- `use-admin-data.hook.ts` - hasLoadedCounts
- `use-home-data.hook.ts` - hasLoaded

**Patrón Actual**:
```typescript
const isMountedRef = useRef(true);

useEffect(() => {
  return () => {
    isMountedRef.current = false;
  };
}, []);
```

**Hook Consolidado Propuesto**:
```typescript
// useIsMounted.ts
export const useIsMounted = () => {
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
};
```

**Beneficio**: Elimina 30+ líneas de código repetitivo

---

## 📝 Hooks a Consolidar

### Nuevos Hooks Genéricos Propuestos

#### 1. **useToggle** ⭐⭐⭐
- **Reemplaza**: 15+ instancias de boolean state
- **Ubicación**: `src/presentation/hooks/common/use-toggle.hook.ts`
- **Ahorro**: ~50 líneas
- **Prioridad**: Alta

#### 2. **useAsyncState** ⭐⭐⭐
- **Reemplaza**: 10+ instancias de loading + error
- **Ubicación**: `src/presentation/hooks/common/use-async-state.hook.ts`
- **Ahorro**: ~100 líneas
- **Prioridad**: Alta

#### 3. **useIsMounted** ⭐⭐
- **Reemplaza**: 5+ instancias de mounted ref
- **Ubicación**: `src/presentation/hooks/common/use-is-mounted.hook.ts`
- **Ahorro**: ~30 líneas
- **Prioridad**: Media

#### 4. **usePrevious** ⭐
- **Para**: Comparar valores previos
- **Ubicación**: `src/presentation/hooks/common/use-previous.hook.ts`
- **Ahorro**: ~20 líneas
- **Prioridad**: Baja (útil para futuro)

---

## 🎯 Plan de Consolidación

### Fase 1: Crear Hooks Genéricos

1. ✅ **Crear useToggle**
   - Boolean state management
   - setTrue, setFalse, toggle methods
   - Lightweight y reutilizable

2. ✅ **Crear useAsyncState**
   - Loading + error + data state
   - execute wrapper function
   - reset method

3. ✅ **Crear useIsMounted**
   - Mounted state tracking
   - Cleanup automático
   - Prevenir memory leaks

---

### Fase 2: Refactorizar Hooks Existentes

4. ✅ **Actualizar use-modal-state**
   - Usar useToggle internamente
   - Mantener API compatible

5. ✅ **Actualizar hooks con loading/error**
   - use-drafts.hook.ts
   - use-common-nouns.ts
   - use-recent-images.hook.ts
   - etc.

6. ✅ **Actualizar hooks con mounted ref**
   - use-recent-images.hook.ts
   - use-admin-data.hook.ts
   - use-home-data.hook.ts

---

### Fase 3: Documentación

7. ✅ **Crear README para hooks**
   - Documentar cada hook genérico
   - Ejemplos de uso
   - Mejores prácticas

---

## 📊 Estimaciones de Reducción

| Hook Genérico | Reemplaza | Líneas Ahorradas | Archivos Actualizados |
|---------------|-----------|------------------|----------------------|
| **useToggle** | 15+ instancias | ~50 líneas | 8-10 archivos |
| **useAsyncState** | 10+ instancias | ~100 líneas | 6-8 archivos |
| **useIsMounted** | 5+ instancias | ~30 líneas | 3-5 archivos |
| **Total** | 30+ instancias | **~180 líneas** | **17-23 archivos** |

---

## ✅ Beneficios Esperados

### Reusabilidad
- ✅ **Hooks genéricos** reutilizables en toda la app
- ✅ **Menos código duplicado**
- ✅ **Más fácil de mantener**

### Consistencia
- ✅ **Mismo patrón** para boolean toggles
- ✅ **Mismo patrón** para async operations
- ✅ **Mismo patrón** para mounted state

### Calidad
- ✅ **Mejor testeable**
- ✅ **Menos bugs** por duplicación
- ✅ **Código más limpio**

### Mantenibilidad
- ✅ **Cambios en un solo lugar**
- ✅ **Documentación centralizada**
- ✅ **Más fácil de entender**

---

## 📊 Prioridad vs Impacto

**Prioridad**: Alta  
**Impacto**: Alto  
**Riesgo**: Bajo (no breaking changes)  
**Tiempo Estimado**: 2-3 horas

**Razón**: Consolidar hooks duplicados:
1. Reduce significativamente código boilerplate
2. Mejora consistencia en toda la app
3. Facilita mantenimiento futuro
4. Previene bugs por duplicación

---

## 🚀 Orden de Implementación

1. Crear useToggle (30 min)
2. Crear useAsyncState (30 min)
3. Crear useIsMounted (15 min)
4. Actualizar use-modal-state (15 min)
5. Actualizar hooks con loading/error (45 min)
6. Actualizar hooks con mounted ref (30 min)
7. Testing y verificación (30 min)

**Total**: 2.5-3 horas

---

## 📝 Conclusión

**Veredicto Final**: 🟡 **CONSOLIDACIÓN ALTAMENTE BENEFICIOSA**

Se identificaron **30+ instancias** de código duplicado que pueden consolidarse en **3 hooks genéricos** principales:
- useToggle (15+ instancias)
- useAsyncState (10+ instancias)
- useIsMounted (5+ instancias)

**Beneficios**:
- Reducción de ~180 líneas de código repetitivo
- Mejor reusabilidad y consistencia
- Más fácil de mantener y testear
- Prevención de bugs por duplicación

**Recomendación**: Implementar al menos Fase 1 y 2 (crear hooks genéricos y refactorizar principales)
