# Ticket 3.1: Análisis Detallado de PublicationContext

## 📊 Resumen Ejecutivo

**Estado General**: 🔴 **COMPLEJIDAD CRÍTICA**

**Líneas de Código**: 1,140 líneas

**Veredicto**: Context extremadamente complejo que necesita **refactoring urgente**. Viola principios SOLID y tiene múltiples responsabilidades.

---

## 🔴 Problemas Críticos Identificados

### 1. **File Too Large - 1,140 Lines**

**Ubicación**: Todo el archivo

**Problema**: Un solo archivo de context con 1,140 líneas

**Comparación**:
- Archivo típico de context: 100-300 líneas
- Este archivo: **1,140 líneas (3-11x más grande)**

**Impacto**: 🔴 Crítico - Imposible de mantener, debuggear o entender

---

### 2. **Múltiples Utility Classes Dentro del Context**

**Ubicación**: Líneas 190-291

```typescript
// ❌ Utility classes mezcladas en el context
class PublicationFilters { ... }
class CircuitBreakerUtils { ... }
class ValidationUtils { ... }
class StateCreators { ... }
class ReducerHandlers { ... }
```

**Problema**: 5 utility classes que NO pertenecen en un context

**Solución**: Mover a archivos separados:
- `src/utils/publication-filters.ts`
- `src/utils/circuit-breaker.ts` (o eliminar si usamos ErrorHandlingService)
- `src/utils/validation.ts`
- `src/contexts/publication/state-creators.ts`
- `src/contexts/publication/reducer-handlers.ts`

---

### 3. **Circuit Breaker Duplicado**

**Ubicación**: Líneas 57-61, 207-222

```typescript
interface CircuitBreakerState {
  readonly failureCount: number;
  readonly lastFailureTime: number | null;
  readonly isOpen: boolean;
}

class CircuitBreakerUtils {
  public static isOpen(circuitBreaker: CircuitBreakerState): boolean { ... }
  public static shouldOpen(failureCount: number): boolean { ... }
}
```

**Problema**: Ya tenemos **ErrorHandlingService** con retry logic

**Impacto**: 🔴 Alto - Duplicación innecesaria

**Solución**: **Eliminar** completamente y usar ErrorHandlingService

---

### 4. **15+ Action Types con Interfaces Separadas**

**Ubicación**: Líneas 78-176

```typescript
type PublicationActionType =
  | 'FETCH_STATUS_START'
  | 'FETCH_STATUS_SUCCESS'
  | 'FETCH_MORE_START'
  | 'FETCH_MORE_SUCCESS'
  | 'REFRESH_START'
  | 'REFRESH_SUCCESS'
  | 'FILTER_PUBLICATIONS'
  | 'OPERATION_FAILURE'
  | 'RESET_STATUS'
  | 'RESET_ALL'
  | 'CIRCUIT_BREAKER_OPEN'      // ❌ Eliminar
  | 'CIRCUIT_BREAKER_RESET'     // ❌ Eliminar
  | 'UPDATE_PUBLICATION_STATUS'
  | 'FETCH_COUNTS_START'
  | 'FETCH_COUNTS_SUCCESS'
  | 'FETCH_COUNTS_FAILURE'
  | 'INVALIDATE_CACHE_AND_COUNTS';
```

**Problema**: Demasiados action types, muchos redundantes

**Solución**: Consolidar en ~8 acciones

---

### 5. **Estado Profundamente Anidado**

**Ubicación**: Líneas 70-76

```typescript
interface State {
  readonly [PublicationStatus.PENDING]: PublicationState;
  readonly [PublicationStatus.ACCEPTED]: PublicationState;
  readonly [PublicationStatus.REJECTED]: PublicationState;
  readonly circuitBreaker: CircuitBreakerState;  // ❌ Eliminar
  readonly counts: CountsState;
}
```

**Problema**: Estado normalizado pero muy anidado

**Impacto**: 🟡 Medio - Difícil de acceder y actualizar

---

### 6. **Validaciones Duplicadas**

**Ubicación**: Líneas 224-240

```typescript
class ValidationUtils {
  public static validatePaginationParams(page: number, size: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('El número de página debe ser un entero mayor a 0');
    }
    if (!Number.isInteger(size) || size < 1 || size > 100) {
      throw new Error('El límite debe ser un entero entre 1 y 100');
    }
  }
}
```

**Problema**: **Misma validación** que en PublicationService y CatalogService

**Solución**: Crear un **ValidationService** centralizado

---

### 7. **Reducer Gigante con Lógica Compleja**

**Ubicación**: Líneas 448-612 (165 líneas)

```typescript
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_STATUS_START': { ... }  // 20 líneas
    case 'FETCH_STATUS_SUCCESS': { ... } // 30 líneas
    case 'FETCH_MORE_START': { ... }     // 15 líneas
    // ... 15 casos más
  }
};
```

**Problema**: Reducer con 165 líneas y lógica de negocio

**Solución**: Extraer handlers a funciones separadas

---

### 8. **CONFIG Duplicado**

**Ubicación**: Líneas 23-33

```typescript
const CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE: 1,
  REQUEST_TIMEOUT: 30000,      // Ya no se usa con ErrorHandlingService
  PREFETCH_THRESHOLD: 0.7,
  CIRCUIT_BREAKER_THRESHOLD: 5, // ❌ Eliminar
  CIRCUIT_BREAKER_TIMEOUT: 10000, // ❌ Eliminar
  DEBOUNCE_DELAY: 300,
  RETRY_ATTEMPTS: 2,           // ❌ Usar ErrorHandlingService
  RETRY_DELAY: 1000            // ❌ Usar ErrorHandlingService
} as const;
```

**Problema**: Configuración mezclada, algunas obsoletas

**Solución**: Limpiar y mover a archivo de configuración

---

## 📊 Análisis de Complejidad

### Métricas

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Líneas totales** | 1,140 | 🔴 Crítico |
| **Utility classes** | 5 | 🔴 Alto |
| **Action types** | 15+ | 🔴 Alto |
| **Reducer cases** | 15 | 🔴 Alto |
| **Reducer LOC** | 165 | 🔴 Alto |
| **Interface definitions** | 20+ | 🔴 Alto |
| **Responsabilidades** | 8+ | 🔴 Crítico |

---

## 🎯 Plan de Refactoring

### Fase 1: Eliminar Código Obsoleto

1. ✅ **Eliminar Circuit Breaker**
   - Eliminar `CircuitBreakerState`
   - Eliminar `CircuitBreakerUtils` class
   - Eliminar actions: `CIRCUIT_BREAKER_OPEN`, `CIRCUIT_BREAKER_RESET`
   - Eliminar del state
   - **Razón**: Ya tenemos ErrorHandlingService con retry logic

2. ✅ **Limpiar CONFIG**
   - Eliminar `REQUEST_TIMEOUT` (usa ErrorHandlingService)
   - Eliminar `CIRCUIT_BREAKER_THRESHOLD`
   - Eliminar `CIRCUIT_BREAKER_TIMEOUT`
   - Eliminar `RETRY_ATTEMPTS` (usa ErrorHandlingService)
   - Eliminar `RETRY_DELAY` (usa ErrorHandlingService)

---

### Fase 2: Extraer Utilidades

3. ✅ **Crear ValidationService centralizado**
   - Mover `ValidationUtils` a `src/services/validation/`
   - Reusar en PublicationService, CatalogService, Contexts
   - DRY principle

4. ✅ **Extraer PublicationFilters**
   - Mover a `src/utils/publication-filters.ts`
   - Convertir a funciones puras

5. ✅ **Extraer StateCreators**
   - Mover a `src/contexts/publication/state-creators.ts`

6. ✅ **Extraer ReducerHandlers**
   - Mover a `src/contexts/publication/reducer-handlers.ts`

---

### Fase 3: Simplificar Reducer

7. ✅ **Consolidar Action Types**
   - `FETCH_STATUS_START` + `FETCH_STATUS_SUCCESS` → `SET_STATUS_DATA`
   - `FETCH_MORE_START` + `FETCH_MORE_SUCCESS` → `APPEND_STATUS_DATA`
   - `REFRESH_START` + `REFRESH_SUCCESS` → `REPLACE_STATUS_DATA`
   - Reducir de 15 a ~8 actions

8. ✅ **Simplificar Handlers**
   - Extraer lógica compleja a funciones auxiliares
   - Reducer más declarativo

---

### Fase 4: Reorganizar Estructura

9. ✅ **Crear estructura modular**
   ```
   src/contexts/publication/
   ├── index.tsx              (Provider y hook)
   ├── types.ts              (Interfaces)
   ├── state.ts              (Initial state)
   ├── reducer.ts            (Reducer)
   ├── actions.ts            (Action creators)
   └── hooks/                (Custom hooks)
       ├── use-load-status.ts
       ├── use-bulk-operations.ts
       └── use-counts.ts
   ```

---

## 📝 Estimaciones

### Reducción Esperada

| Item | Antes | Después | Reducción |
|------|-------|---------|-----------|
| **Líneas en context** | 1,140 | ~400 | -65% |
| **Utility classes** | 5 en context | 0 en context | -100% |
| **Action types** | 15 | 8 | -47% |
| **Reducer LOC** | 165 | ~80 | -52% |
| **Archivos** | 1 gigante | 8-10 modulares | Mejor |

---

## ✅ Beneficios Esperados

### Mantenibilidad
- ✅ Archivo principal < 400 líneas
- ✅ Responsabilidades separadas
- ✅ Utilidades reutilizables
- ✅ Estructura clara y modular

### Performance
- ✅ Sin circuit breaker overhead
- ✅ ErrorHandlingService optimizado
- ✅ Menos re-renders innecesarios

### Developer Experience
- ✅ Fácil de entender
- ✅ Fácil de testear
- ✅ Fácil de extender
- ✅ Navegación clara en IDE

---

## 📝 Conclusión

**Veredicto Final**: 🔴 **REFACTORING CRÍTICO NECESARIO**

El PublicationContext es un ejemplo de **context anti-pattern**:
- 1,140 líneas en un solo archivo
- Múltiples responsabilidades mezcladas
- Código duplicado con services
- Circuit breaker obsoleto
- Validaciones duplicadas

**Prioridad**: Alta  
**Riesgo**: Medio (cambios internos, API pública igual)  
**Tiempo Estimado**: 3-4 horas  
**Beneficio**: Muy Alto (65% reducción de código, mejor mantenibilidad)

---

## 🚀 Orden de Implementación

1. Eliminar circuit breaker (30 min)
2. Limpiar CONFIG (10 min)
3. Crear ValidationService (30 min)
4. Extraer utilities (45 min)
5. Consolidar actions (1 hora)
6. Reorganizar estructura (1 hora)
7. Testing y verificación (30 min)

**Total**: 3-4 horas
