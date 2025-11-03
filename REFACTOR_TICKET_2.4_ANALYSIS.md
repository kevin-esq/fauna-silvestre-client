# Ticket 2.4: Análisis y Diseño de ErrorHandlingService Centralizado

## 📊 Resumen Ejecutivo

**Estado General**: 🟡 **ERROR HANDLING DISPERSO**

**Problema**: Cada servicio maneja errores de forma similar pero sin centralización

**Veredicto**: Necesitamos un **ErrorHandlingService centralizado** para:
- Evitar duplicación de código
- Estandarizar manejo de errores
- Mejorar logging y debugging
- Facilitar testing

---

## 🔍 Análisis del Estado Actual

### Patrones Encontrados

#### 1. **Try/Catch con Logger** (más común)

```typescript
// AuthService, CatalogService, PublicationService
try {
  this.logger.debug('Operación X', { params });
  const result = await this.repository.method(...);
  this.logger.info('Operación exitosa', { params });
  return result;
} catch (error) {
  this.logger.error('Error en operación', error as Error, { params });
  throw error;
}
```

**Encontrado en**: AuthService, CatalogService, PublicationService, TokenService

---

#### 2. **Console.error Simple** (legacy)

```typescript
// Servicios de storage antiguos
try {
  await AsyncStorage.setItem(KEY, value);
} catch (error) {
  console.error('Error saving preferences:', error);
  throw error; // o return default
}
```

**Encontrado en**: UserViewPreferences, CatalogViewPreferences, PublicationViewPreferences

---

#### 3. **Manejo de AbortError** (especializado)

```typescript
try {
  return await this.repository.method(..., signal);
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    this.logger.debug('Request cancelado por el usuario');
    throw error;
  }
  this.logger.error('Error en operación', error as Error);
  throw error;
}
```

**Encontrado en**: CatalogService

---

#### 4. **Return Default on Error** (resiliente)

```typescript
try {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : DEFAULT;
} catch (error) {
  console.error('Error loading preferences:', error);
  return DEFAULT; // No lanza, retorna default
}
```

**Encontrado en**: Todos los servicios de preferences

---

#### 5. **Circuit Breaker Pattern** (avanzado)

```typescript
// PublicationContext
if (this.circuitBreaker.isOpen) {
  throw new Error('Too many errors - circuit breaker open');
}
try {
  // ...
} catch (error) {
  this.circuitBreaker.failureCount++;
  throw error;
}
```

**Encontrado en**: PublicationContext

---

## 🎯 Problemas Identificados

### 1. **Duplicación Masiva**

```typescript
// Se repite en 30+ lugares
catch (error) {
  this.logger.error('Error X', error as Error, { context });
  throw error;
}
```

**Impacto**: 🔴 Alto - Código repetitivo, difícil de mantener

---

### 2. **Inconsistencia en Logging**

```typescript
// AuthService
this.logger.error('[AuthService] Sign in failed');

// CatalogService  
this.logger.error('Error al crear catálogo', error as Error, { specie });

// Preferences
console.error('Error loading preferences:', error);
```

**Impacto**: 🟡 Medio - Logs inconsistentes, difícil de rastrear

---

### 3. **No Hay Retry Logic Centralizada**

```typescript
// Solo existe en lugares específicos, no reutilizable
for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  try {
    return await operation();
  } catch (error) {
    if (attempt === MAX_RETRIES - 1) throw error;
    await delay(RETRY_DELAY);
  }
}
```

**Impacto**: 🟡 Medio - Reinventar la rueda cada vez

---

### 4. **Error Categorization Limitada**

```typescript
// No hay categorías claras de errores
if (error instanceof Error && error.name === 'AbortError') { ... }
// ¿Qué pasa con NetworkError, ValidationError, AuthError, etc?
```

**Impacto**: 🟡 Medio - Difícil distinguir tipos de errores

---

### 5. **Testing Difícil**

```typescript
// Sin abstracción, cada test debe mockear logger y error handling
const mockLogger = { error: jest.fn(), debug: jest.fn() };
```

**Impacto**: 🟢 Bajo - Pero acumulativo

---

## 🏗️ Diseño Propuesto: ErrorHandlingService

### Características Clave

#### 1. **Error Categorization**

```typescript
export enum ErrorCategory {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  SERVER = 'server',
  UNKNOWN = 'unknown',
  ABORT = 'abort'
}

export interface ErrorContext {
  operation: string;
  params?: Record<string, unknown>;
  userId?: string;
  timestamp?: number;
}
```

---

#### 2. **Retry Configuration**

```typescript
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
  exponentialBackoff: boolean;
  retryableCategories: ErrorCategory[];
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true,
  retryableCategories: [ErrorCategory.NETWORK, ErrorCategory.SERVER]
};
```

---

#### 3. **Error Handler Methods**

```typescript
export class ErrorHandlingService {
  // Basic error handling
  handle(error: unknown, context: ErrorContext, logger?: ILogger): never;
  
  // Error handling with default value
  handleWithDefault<T>(
    error: unknown,
    defaultValue: T,
    context: ErrorContext,
    logger?: ILogger
  ): T;
  
  // Error handling with retry
  async handleWithRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options?: Partial<RetryOptions>,
    logger?: ILogger
  ): Promise<T>;
  
  // Categorize error
  categorize(error: unknown): ErrorCategory;
  
  // Check if retryable
  isRetryable(error: unknown): boolean;
  
  // Format error message
  formatErrorMessage(error: unknown, context: ErrorContext): string;
}
```

---

### Ejemplo de Uso

#### Antes (sin ErrorHandlingService)

```typescript
async getCatalogById(catalogId: string): Promise<AnimalModelResponse> {
  this.validateId(catalogId, 'getCatalogById');
  
  try {
    this.logger.debug('Obteniendo catálogo por ID', { catalogId });
    return await this.catalogRepository.getCatalogById(catalogId);
  } catch (error) {
    this.logger.error('Error al obtener catálogo por ID', error as Error, {
      catalogId
    });
    throw error;
  }
}
```

#### Después (con ErrorHandlingService)

```typescript
async getCatalogById(catalogId: string): Promise<AnimalModelResponse> {
  this.validateId(catalogId, 'getCatalogById');
  
  return this.errorHandler.handleWithRetry(
    () => this.catalogRepository.getCatalogById(catalogId),
    { operation: 'getCatalogById', params: { catalogId } },
    { maxAttempts: 2 }, // Solo 2 intentos para reads
    this.logger
  );
}
```

---

#### Ejemplo con Default Value

```typescript
// Antes
async getPreferences(): Promise<Preferences> {
  try {
    const data = await AsyncStorage.getItem(KEY);
    return data ? JSON.parse(data) : DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// Después
async getPreferences(): Promise<Preferences> {
  return this.errorHandler.handleWithDefault(
    async () => {
      const data = await AsyncStorage.getItem(KEY);
      return data ? JSON.parse(data) : DEFAULT_PREFERENCES;
    },
    DEFAULT_PREFERENCES,
    { operation: 'getPreferences' }
  );
}
```

---

## 📊 Beneficios Esperados

### 1. **DRY Principle**

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| **Código duplicado** | 30+ try/catch similares | 0 duplicados | ✅ -100% |
| **Líneas por método** | 10-15 (con try/catch) | 3-5 (delegado) | ✅ -60% |

---

### 2. **Consistency**

✅ Logging estandarizado en todos los servicios  
✅ Categorización de errores consistente  
✅ Retry logic uniforme  
✅ Error messages formateados igual

---

### 3. **Testability**

```typescript
// Antes: Mock logger en cada test
const mockLogger = { error: jest.fn(), debug: jest.fn() };

// Después: Mock ErrorHandlingService una vez
const mockErrorHandler = {
  handle: jest.fn(),
  handleWithDefault: jest.fn(),
  handleWithRetry: jest.fn()
};
```

---

### 4. **Maintainability**

✅ Un solo lugar para cambiar error handling  
✅ Fácil agregar nuevas categorías  
✅ Fácil ajustar retry logic  
✅ Fácil mejorar logging

---

### 5. **Observability**

```typescript
// El servicio puede agregar métricas automáticamente
errorHandler.handle(error, context); // Internamente:
// - Log error
// - Increment error counter
// - Add to error tracking service
// - Notify monitoring
```

---

## 🎯 Plan de Implementación

### Fase 1: Crear ErrorHandlingService

1. ✅ Crear interfaces y enums
2. ✅ Implementar ErrorHandlingService
3. ✅ Implementar Factory pattern
4. ✅ Agregar tests unitarios

### Fase 2: Integrar en Servicios Existentes

5. ✅ Actualizar CatalogService
6. ✅ Actualizar PublicationService  
7. ✅ Actualizar servicios de Storage
8. ⚠️ AuthService y TokenService (ya tienen custom handling, evaluar)

### Fase 3: Documentar y Estandarizar

9. ✅ Documentar uso en README
10. ✅ Crear guidelines de error handling
11. ✅ Actualizar ejemplos de código

---

## ⚠️ Consideraciones

### 1. **AuthService Exception**

El AuthService tiene **AuthErrorMapper** específico que traduce errores al español y maneja respuestas backend especiales.

**Decisión**: Mantener AuthErrorMapper pero considerar integrarlo opcionalmente en ErrorHandlingService

---

### 2. **Backward Compatibility**

Algunos servicios legacy usan `console.error` directamente.

**Decisión**: Migrar gradualmente, empezar con servicios nuevos/refactorizados

---

### 3. **Performance**

Agregar capa de abstracción podría afectar performance.

**Decisión**: Minimal overhead, sin blocking operations innecesarias

---

## 📝 Estructura del Archivo

```
src/services/error-handling/
├── error-handling.service.ts       # Servicio principal
├── error-categories.ts              # Enums y tipos
├── error-context.interface.ts       # Interfaces
├── retry-options.interface.ts       # Configuración de retry
└── error-handling.factory.ts        # Factory pattern
```

---

## 🎯 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| **Código duplicado reducido** | -80% |
| **Líneas de código en servicios** | -40% (en error handling) |
| **Consistencia de logs** | 100% |
| **Test coverage** | >90% para ErrorHandlingService |
| **Servicios migrados** | 100% (gradual) |

---

## 📝 Conclusión

**Veredicto**: ✅ **IMPLEMENTAR ErrorHandlingService**

**Razones**:
1. 🔴 **Duplicación masiva** (30+ try/catch similares)
2. 🟡 **Inconsistencia** en logging y error handling
3. 🟡 **No hay retry logic** centralizada
4. 🟡 **Testing difícil** sin abstracción

**Beneficios**:
- ✅ DRY principle aplicado
- ✅ Consistency en toda la app
- ✅ Testability mejorada
- ✅ Maintainability aumentada
- ✅ Observability centralizada

**Tiempo Estimado**: 2-3 horas  
**Riesgo**: Bajo (no breaking changes)  
**Beneficio**: Alto (40-60% mejora en error handling)
