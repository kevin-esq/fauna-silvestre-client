# Ticket 3.2: Análisis de AuthContext

## 📊 Resumen Ejecutivo

**Estado General**: 🟢 **BUENA ESTRUCTURA BASE**

**Líneas de Código**: 319 líneas

**Veredicto**: Context bien estructurado pero con oportunidades de mejora para alinearse con los nuevos patrones establecidos (ValidationService, ErrorHandlingService, estructura modular).

---

## 🔍 Estado Actual

### ✅ Aspectos Positivos

1. **Tamaño Manejable**: 319 líneas vs 1,140 de PublicationContext
2. **Delegación Correcta**: Ya usa AuthService, AuthErrorMapper, authEventEmitter
3. **Hooks Apropiados**: useCallback y useMemo usados correctamente
4. **Storage Seguro**: Ya implementa SecureStorage correctamente
5. **Event System**: Ya tiene sistema de eventos para signOut
6. **Estado Limpio**: Estados bien definidos (user, isAuthenticated, isLoading, initializing, error)

### 🟡 Oportunidades de Mejora

#### 1. **No Usa Nuevos Servicios Centralizados**

**Ubicación**: Todo el archivo

**Problema**: No aprovecha ValidationService ni ErrorHandlingService

**Actual**:

```typescript
const getErrorMessage = useCallback((error: unknown): string => {
  const authError = AuthErrorMapper.map(error);
  return authError.message;
}, []);

const isValidUserData = (
  user: User,
  accessToken: string | null,
  refreshToken: string | null
): boolean => {
  return !!(user && user.role && accessToken && refreshToken);
};
```

**Mejor**:

```typescript
// Usar ErrorHandlingService para manejo centralizado
// Usar ValidationService para validaciones
```

---

#### 2. **Código de Storage Duplicado**

**Ubicación**: Líneas 95-101, 130-134, 254-260

**Problema**: Operaciones de storage repetidas en 3 lugares

**Actual**:

```typescript
// initializeAuth
const [storedUser, storedAccessToken, storedRefreshToken] = await Promise.all([
  storage.getValueFor(USER_KEY),
  storage.getValueFor(ACCESS_TOKEN_KEY),
  storage.getValueFor(REFRESH_TOKEN_KEY)
]);

// handleSignOutEvent
await Promise.all([
  storage.deleteValueFor(USER_KEY),
  storage.deleteValueFor(ACCESS_TOKEN_KEY),
  storage.deleteValueFor(REFRESH_TOKEN_KEY)
]);

// loadUserData
const storedUser = await storage.getValueFor(USER_KEY);
```

**Mejor**: Extraer a utility functions

```typescript
// src/presentation/contexts/auth/storage-utils.ts
export const loadAuthDataFromStorage = async () => { ... }
export const clearAuthDataFromStorage = async () => { ... }
```

---

#### 3. **Patrón de Error Handling Repetitivo**

**Ubicación**: Líneas 147-166, 168-180, 182-197, etc.

**Problema**: Mismo patrón try/catch en todos los métodos

**Actual**:

```typescript
const signIn = useCallback(
  async (credentials, rememberMe) => {
    setIsLoading(true);
    setError(null);
    try {
      setStatus('AUTHENTICATING');
      const userEntity = await authService.signIn(credentials, rememberMe);
      setAuthenticatedUser(userEntity);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      setStatus('UNAUTHENTICATED');
      throw error;
    } finally {
      setIsLoading(false);
    }
  },
  [setStatus, setAuthenticatedUser, getErrorMessage]
);
```

**Patrón se repite en**:

- signOut (líneas 168-180)
- registerUser (líneas 182-197)
- sendResetPasswordEmail (líneas 199-214)
- verifyResetCode (líneas 216-231)
- resetPassword (líneas 233-248)
- loadUserData (líneas 250-269)

**Mejor**: Extraer wrapper genérico para operaciones async

---

#### 4. **No Hay Estructura Modular**

**Ubicación**: Todo en un solo archivo

**Problema**: Aunque es pequeño, podría beneficiarse de modularización

**Actual**: Todo en `auth.context.tsx`

**Mejor**:

```
src/presentation/contexts/auth/
├── index.tsx              (Provider y hook principal)
├── types.ts              (Interfaces)
├── storage-utils.ts      (Utilidades de storage)
└── auth-operations.ts    (Lógica de operaciones)
```

---

#### 5. **Helpers Locales en Lugar de Servicios Compartidos**

**Ubicación**: Líneas 54-90

**Problema**: Funciones helper que podrían ser servicios compartidos

```typescript
const getErrorMessage = useCallback((error: unknown): string => {
  const authError = AuthErrorMapper.map(error);
  return authError.message;
}, []);

const resetAuthState = useCallback(() => { ... }, []);
const setAuthenticatedUser = useCallback((userEntity: User) => { ... }, []);
const setLoadingState = useCallback((loading, errorMsg) => { ... }, []);
const isValidUserData = (user, accessToken, refreshToken) => { ... };
```

**Mejor**: Usar servicios centralizados o extraer a módulos

---

## 📊 Comparación con PublicationContext

| Aspecto                     | PublicationContext (Antes) | AuthContext            | Mejora Necesaria             |
| --------------------------- | -------------------------- | ---------------------- | ---------------------------- |
| **LOC**                     | 1,140                      | 319                    | ✅ Ya es bueno               |
| **Utility Classes**         | 5 en context               | 0                      | ✅ Ya es bueno               |
| **Modularización**          | 1 archivo                  | 1 archivo              | 🟡 Podría mejorar            |
| **Servicios Centralizados** | No usaba                   | Usa AuthService        | 🟡 Falta integrar nuevos     |
| **Validations**             | Locales                    | Locales                | 🟡 Usar ValidationService    |
| **Error Handling**          | Try/catch manual           | Try/catch manual       | 🟡 Usar ErrorHandlingService |
| **Storage**                 | N/A                        | Operaciones duplicadas | 🟡 Extraer a utils           |

---

## 🎯 Plan de Optimización

### Fase 1: Integrar Servicios Centralizados

1. ✅ **Usar ValidationService**
   - Mover `isValidUserData` a ValidationService
   - Reutilizar en otros lugares de la app

2. ✅ **Usar ErrorHandlingService**
   - Reemplazar try/catch manual con ErrorHandlingService
   - Categorización automática de errores
   - Logging centralizado

---

### Fase 2: Extraer Utilidades

3. ✅ **Crear Storage Utils**
   - Extraer operaciones de storage repetidas
   - `loadAuthDataFromStorage()`
   - `clearAuthDataFromStorage()`
   - `saveAuthDataToStorage()`

4. ✅ **Crear Auth Operations Utils**
   - Extraer lógica común de operaciones async
   - Generic wrapper para operaciones con loading/error

---

### Fase 3: Modularizar Estructura

5. ✅ **Separar en Módulos**
   - `types.ts`: Interfaces y tipos
   - `storage-utils.ts`: Operaciones de storage
   - `index.tsx`: Provider y hook principal

---

## 📝 Estimaciones

### Reducción Esperada

| Item                     | Antes      | Después       | Mejora      |
| ------------------------ | ---------- | ------------- | ----------- |
| **Líneas en context**    | 319        | ~180          | **-44%**    |
| **Try/catch blocks**     | 7          | 0             | **-100%**   |
| **Storage operations**   | Duplicadas | Centralizadas | **DRY**     |
| **Archivos**             | 1          | 4             | **Modular** |
| **Servicios integrados** | 3          | 5             | **+2**      |

---

## ✅ Beneficios Esperados

### Reusabilidad

- ✅ **ValidationService.validateAuthData()** disponible para otros contextos
- ✅ **Storage utils** reutilizables en toda la app
- ✅ **Error handling** consistente con resto de la app

### Mantenibilidad

- ✅ **Menos código** en context principal
- ✅ **Lógica separada** en módulos específicos
- ✅ **Más fácil de testear**

### Consistencia

- ✅ **Mismos patrones** que PublicationContext
- ✅ **Servicios compartidos** en toda la app
- ✅ **Estructura modular** consistente

---

## 📊 Prioridad vs Impacto

**Prioridad**: Media  
**Impacto**: Medio  
**Riesgo**: Bajo (no breaking changes)  
**Tiempo Estimado**: 1-2 horas

**Razón**: AuthContext ya está bien estructurado, las optimizaciones son principalmente para:

1. Consistencia con nuevos patrones
2. Reusabilidad de código
3. Mejor mantenibilidad a largo plazo

---

## 🚀 Orden de Implementación

1. Crear ValidationService.validateAuthData() (15 min)
2. Crear storage-utils.ts con funciones helper (20 min)
3. Crear types.ts para interfaces (10 min)
4. Integrar ErrorHandlingService en operaciones (30 min)
5. Refactorizar context principal (20 min)
6. Testing y verificación (15 min)

**Total**: 1.5-2 horas

---

## 📝 Conclusión

**Veredicto Final**: 🟢 **OPTIMIZACIÓN BENEFICIOSA**

El AuthContext está bien estructurado pero puede beneficiarse de:

- Integración con servicios centralizados nuevos
- Extracción de utilidades duplicadas
- Modularización para consistencia
- Reducción de código boilerplate

**NO es crítico** como lo era PublicationContext, pero las mejoras aportarán:

- Mejor consistencia
- Código más reutilizable
- Mantenibilidad a largo plazo
