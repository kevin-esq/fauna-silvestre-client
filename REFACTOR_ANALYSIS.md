# Análisis de Estructura del Proyecto - Problemas Identificados

## ❌ Problemas Encontrados

### 1. **Archivos de Sistema macOS (.DS_Store)**
```
src/.DS_Store
src/shared/.DS_Store
src/data/.DS_Store
src/assets/.DS_Store
src/domain/.DS_Store
src/presentation/.DS_Store
src/services/.DS_Store
```
**Acción**: ELIMINAR - Ya están en .gitignore pero siguen en el repo

---

### 2. **Archivos de Backup de Editor**
```
src/domain/use-cases/registerUser.ts~
```
**Acción**: ELIMINAR - Archivo backup de editor

---

### 3. **Archivos Duplicados**

#### ILogger.ts (aparece 2 veces)
- ✅ `src/services/logging/ILogger.ts` (ubicación correcta)
- ❌ `src/shared/types/ILogger.ts` (duplicado)

**Acción**: Eliminar de shared/types, usar el de services/logging

#### custom-errors.ts (aparece 2 veces)
- ✅ `src/shared/errors/custom-errors.ts` (ubicación correcta)
- ❌ `src/shared/types/custom-errors.ts` (duplicado)

**Acción**: Verificar diferencias y consolidar

---

### 4. **Hook Suelto en Raíz**
```
src/presentation/hooks/use-safe-request.ts
```
**Problema**: Todos los demás hooks están en subcarpetas, este está suelto

**Acción**: Mover a `hooks/common/use-safe-request.ts`

---

### 5. **Carpeta Vacía**
```
src/presentation/constants/
```
**Acción**: Eliminar si está vacía o documentar su propósito

---

### 6. **Inconsistencia en Nomenclatura - use-cases/**

Mezcla de camelCase y kebab-case:
```
✅ kebab-case:
- accept-publication.usecase.ts
- create-publication.usecase.ts
- get-all-pending-publications.usecase.ts
- reject-publication.usecase.ts

❌ camelCase:
- getUserPendingPublications.ts
- loginUser.ts
- registerUser.ts
```

**Acción**: Estandarizar a kebab-case

---

## ✅ Propuesta de Limpieza

### Paso 1: Eliminar Archivos de Sistema
```bash
git rm src/**/.DS_Store
git rm src/domain/use-cases/registerUser.ts~
```

### Paso 2: Resolver Duplicaciones
```bash
# Verificar y eliminar duplicados
git rm src/shared/types/ILogger.ts
git rm src/shared/types/custom-errors.ts  # Si es realmente duplicado
```

### Paso 3: Organizar Hook Suelto
```bash
git mv src/presentation/hooks/use-safe-request.ts \
       src/presentation/hooks/common/use-safe-request.ts
```

### Paso 4: Estandarizar Nomenclatura en use-cases
```bash
git mv src/domain/use-cases/getUserPendingPublications.ts \
       src/domain/use-cases/get-user-pending-publications.usecase.ts
       
git mv src/domain/use-cases/loginUser.ts \
       src/domain/use-cases/login-user.usecase.ts
       
git mv src/domain/use-cases/registerUser.ts \
       src/domain/use-cases/register-user.usecase.ts
```

### Paso 5: Manejar Carpeta Vacía
```bash
# Si constants/ está vacía, eliminarla
# Si tiene propósito, agregar README.md explicando
```

---

## 📊 Resumen de Acciones

| Categoría | Archivos | Acción |
|-----------|----------|--------|
| .DS_Store | 7 | Eliminar |
| Backups (~) | 1 | Eliminar |
| Duplicados | 2 | Consolidar |
| Hook suelto | 1 | Mover a subcarpeta |
| Renombrar | 3 | Estandarizar nomenclatura |

**Total**: 14 cambios propuestos

---

## ✅ Después de la Limpieza

La estructura quedará:
- Sin archivos de sistema
- Sin duplicados
- Nomenclatura consistente
- Todos los hooks organizados
- Solo código relevante

