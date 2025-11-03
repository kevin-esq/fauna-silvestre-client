# Ticket 4.2: Análisis de Hooks de Utilidad Reutilizables

## 📊 Resumen Ejecutivo

**Estado General**: 🟡 **MUCHAS OPORTUNIDADES IDENTIFICADAS**

**Patrones Encontrados**: 5+ patrones repetitivos de utilidades

**Veredicto**: Se identificaron múltiples patrones de utilidades que se repiten en diferentes partes de la aplicación y que pueden consolidarse en hooks genéricos reutilizables.

---

## 🔍 Patrones Identificados

### 1. **Debounce Pattern** ⭐⭐⭐

**Ubicaciones**:

- `catalog-animals-screen.tsx` - useSearchDebounce (implementación local)
- `use-catalog-management.hook.ts` - setTimeout con ref para búsqueda

**Patrón Actual en catalog-animals-screen**:

```typescript
const useSearchDebounce = (
  value: string,
  delay: number = SEARCH_DEBOUNCE_DELAY
) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const normalizedValue = value.trim().toLowerCase();

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(normalizedValue);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};
```

**Problema**: Implementación duplicada, no reutilizable

**Beneficio**: ~30 líneas eliminadas, reutilizable en toda la app

---

### 2. **Timeout Pattern** ⭐⭐⭐

**Ubicaciones** (15+ instancias):

- `use-animal-image-picker.hook.ts` - Timeout para callbacks
- `use-file-download.hook.ts` - Timeout para cambio de estado
- `code-input.component.tsx` - Múltiples timeouts
- `location-map.component.tsx` - Timeouts con refs
- `use-camera-freeze.hook.ts` - Timeout con cleanup
- `use-double-back-exit.hook.ts` - Timeout para back press
- `use-camera-actions.hook.ts` - Timeouts para navegación
- `use-camera.hook.ts` - Timeout para retry
- `use-catalog-management.hook.ts` - Timeout para búsqueda
- `image-preview-screen.tsx` - Timeout para navegación
- `camera-gallery-screen.tsx` - Múltiples timeouts
- `custom-image-picker-screen.tsx` - Promise timeout
- `animal-form-screen.tsx` - Timeout para navegación

**Patrón Actual**:

```typescript
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, []);

// Uso
timeoutRef.current = setTimeout(() => {
  // acción
}, delay);
```

**Problema**: Código repetitivo, falta cleanup, referencias manuales

**Hook Propuesto**: `useTimeout`

---

### 3. **Interval Pattern** ⭐⭐

**Ubicaciones**:

- `use-current-time.hook.ts` - setInterval para reloj
- `code-input.component.tsx` - setInterval para clipboard

**Patrón Actual**:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // acción
  }, delay);
  return () => clearInterval(interval);
}, [dependencies]);
```

**Problema**: Cleanup manual, patrón repetitivo

**Hook Propuesto**: `useInterval`

---

### 4. **Previous Value Pattern** ⭐⭐

**Uso Potencial**:

- Comparar valores anteriores en useEffect
- Detectar cambios de estado
- Optimizaciones de renderizado

**Patrón Común**:

```typescript
const prevValueRef = useRef(value);

useEffect(() => {
  prevValueRef.current = value;
});

// Comparación manual
if (prevValueRef.current !== value) {
  // hacer algo
}
```

**Hook Propuesto**: `usePrevious`

---

### 5. **Update Effect Pattern** ⭐⭐

**Uso Potencial**:

- useEffect que no debe correr en mount
- Solo ejecutar en actualizaciones

**Patrón Común**:

```typescript
const isFirstRender = useRef(true);

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  // lógica solo en updates
}, [dependencies]);
```

**Hook Propuesto**: `useUpdateEffect`

---

## 📝 Hooks de Utilidad a Crear

### 1. **useDebounce** ⭐⭐⭐

**Propósito**: Debounce de valores con delay configurable

**Casos de Uso**:

- Búsquedas en tiempo real
- Auto-save de formularios
- Validaciones con delay
- Filtros dinámicos

**API Propuesta**:

```typescript
const debouncedValue = useDebounce(value, delay);
```

**Beneficio**: Elimina ~30 líneas de código repetitivo

---

### 2. **useTimeout** ⭐⭐⭐

**Propósito**: setTimeout con cleanup automático

**Casos de Uso**:

- Navegación con delay
- Animaciones
- Auto-hide de mensajes
- Retry logic

**API Propuesta**:

```typescript
const { start, clear, isActive } = useTimeout(callback, delay);
```

**Beneficio**: Elimina ~15 líneas por uso, previene memory leaks

---

### 3. **useInterval** ⭐⭐

**Propósito**: setInterval con cleanup automático

**Casos de Uso**:

- Relojes
- Polling de datos
- Animaciones continuas
- Auto-refresh

**API Propuesta**:

```typescript
const { start, stop, isRunning } = useInterval(callback, delay);
```

**Beneficio**: Elimina ~10 líneas por uso, cleanup automático

---

### 4. **usePrevious** ⭐⭐

**Propósito**: Obtener valor anterior de un estado/prop

**Casos de Uso**:

- Comparar valores anteriores
- Detectar cambios específicos
- Optimizaciones

**API Propuesta**:

```typescript
const previousValue = usePrevious(value);
```

**Beneficio**: Simplifica comparaciones, código más limpio

---

### 5. **useUpdateEffect** ⭐

**Propósito**: useEffect que solo corre en updates, no en mount

**Casos de Uso**:

- Efectos solo en cambios
- Evitar ejecución inicial
- Lógica condicional

**API Propuesta**:

```typescript
useUpdateEffect(() => {
  // solo en updates
}, [dependencies]);
```

**Beneficio**: Código más claro, evita flags manuales

---

## 📊 Estimaciones de Impacto

| Hook                | Instancias | Líneas Ahorradas | Archivos Afectados |
| ------------------- | ---------- | ---------------- | ------------------ |
| **useDebounce**     | 2+         | ~30              | 2-3                |
| **useTimeout**      | 15+        | ~150             | 10-12              |
| **useInterval**     | 2+         | ~15              | 2                  |
| **usePrevious**     | Futuro     | ~10/uso          | N/A                |
| **useUpdateEffect** | Futuro     | ~8/uso           | N/A                |
| **Total**           | 19+        | **~205+**        | **14-17**          |

---

## 🎯 Plan de Implementación

### Fase 1: Crear Hooks de Utilidad

1. ✅ **Crear useDebounce**
   - Generic debounce hook
   - Configurable delay
   - TypeScript support
   - Documentation

2. ✅ **Crear useTimeout**
   - Cleanup automático
   - start/clear/isActive API
   - TypeScript support
   - Previene memory leaks

3. ✅ **Crear useInterval**
   - Cleanup automático
   - start/stop/isRunning API
   - TypeScript support
   - Pausa/resume capability

4. ✅ **Crear usePrevious**
   - Lightweight hook
   - Generic type support
   - Simple API

5. ✅ **Crear useUpdateEffect**
   - useEffect wrapper
   - Skip first render
   - Same API as useEffect

---

### Fase 2: Refactorizar Código Existente

6. ✅ **Actualizar catalog-animals-screen**
   - Reemplazar useSearchDebounce local con useDebounce

7. ✅ **Actualizar use-catalog-management**
   - Usar useTimeout en lugar de setTimeout manual

8. ✅ **Actualizar use-current-time**
   - Usar useInterval en lugar de setInterval manual

---

## ✅ Beneficios Esperados

### Reusabilidad

- ✅ **5 hooks de utilidad** reutilizables app-wide
- ✅ **Eliminan 200+ líneas** de código duplicado
- ✅ **API consistente** en toda la app

### Calidad

- ✅ **Cleanup automático** previene memory leaks
- ✅ **TypeScript completo** con tipos genéricos
- ✅ **Documentación** con ejemplos

### Mantenibilidad

- ✅ **Código centralizado** más fácil de mantener
- ✅ **Bugs en un solo lugar**
- ✅ **Más fácil de testear**

### Performance

- ✅ **Optimizaciones** en un solo lugar
- ✅ **Previene memory leaks** con cleanup automático
- ✅ **Debounce** reduce renders innecesarios

---

## 📊 Prioridad vs Impacto

**Prioridad**: Alta  
**Impacto**: Alto  
**Riesgo**: Bajo (hooks independientes)  
**Tiempo Estimado**: 2-3 horas

**Razón**: Crear hooks de utilidad:

1. Elimina 200+ líneas de código duplicado
2. Previene memory leaks con cleanup automático
3. Mejora consistencia en toda la app
4. Facilita mantenimiento futuro

---

## 🚀 Orden de Implementación

1. Crear useDebounce (30 min)
2. Crear useTimeout (30 min)
3. Crear useInterval (20 min)
4. Crear usePrevious (15 min)
5. Crear useUpdateEffect (15 min)
6. Refactorizar catalog-animals-screen (20 min)
7. Refactorizar use-catalog-management (15 min)
8. Refactorizar use-current-time (10 min)
9. Testing y verificación (30 min)

**Total**: 2.5-3 horas

---

## 📝 Conclusión

**Veredicto Final**: 🟡 **ALTA PRIORIDAD - GRAN IMPACTO**

Se identificaron **19+ instancias** de código duplicado que pueden consolidarse en **5 hooks de utilidad** genéricos:

- useDebounce (2+ instancias)
- useTimeout (15+ instancias)
- useInterval (2+ instancias)
- usePrevious (uso futuro)
- useUpdateEffect (uso futuro)

**Beneficios**:

- Eliminación de ~205 líneas de código repetitivo
- Prevención de memory leaks con cleanup automático
- Mejor consistencia y reusabilidad
- Código más limpio y mantenible

**Recomendación**: Implementar Fase 1 completa (crear todos los hooks) y Fase 2 parcial (refactorizar casos críticos)
