# Ticket 1.2: Organizar Estructura de Carpetas

## Estado: En Progreso

---

## 🔍 Análisis de Estructura Actual

### Estructura General (Clean Architecture)

```
src/
├── app/                    # ✅ Bootstrap de la aplicación
├── assets/                 # ✅ Assets estáticos
├── data/                   # ✅ Capa de datos (repositories)
│   ├── mappers/
│   ├── models/
│   └── repositories/
├── domain/                 # ✅ Capa de dominio (entities, use-cases)
│   ├── entities/
│   ├── interfaces/
│   ├── models/
│   ├── types/
│   └── use-cases/
├── presentation/           # ✅ Capa de presentación (UI)
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── navigation/
│   ├── screens/
│   └── utils/
├── services/               # ✅ Servicios externos
│   ├── auth/
│   ├── camera/
│   ├── catalog/
│   ├── http/
│   ├── logging/
│   ├── media/
│   ├── publication/
│   ├── storage/
│   └── user/
└── shared/                 # ✅ Código compartido
    ├── constants/
    ├── errors/
    ├── types/
    └── utils/
```

---

## ❌ Problemas Identificados

### 1. **Archivos Temporales y Backups**

- ❌ `.catalog-management-screen.tsx.swp` (vim swap file)
- ❌ `catalog-management-screen.backup.tsx` (backup manual)
- ❌ `.auth.context.tsx.swp` (vim swap file)

**Acción**: ELIMINAR - No deben estar en el repositorio

---

### 2. **Hooks sin Organización (31 archivos en una sola carpeta)**

```
src/presentation/hooks/
├── use-admin-data.hook.ts
├── use-animal-form.hook.ts
├── use-animal-image-picker.hook.ts
├── use-back-handler.hook.ts
├── use-camera-actions.hook.ts
├── use-camera-animations.hook.ts
├── use-camera-freeze.hook.ts
├── use-camera.hook.ts
├── use-catalog-management.hook.ts
├── use-common-nouns.ts
├── use-current-time.hook.ts
├── use-device-orientation.hook.ts
├── use-double-back-exit.hook.ts
├── use-downloaded-files.hook.ts
├── use-drafts.hook.ts
├── use-file-download.hook.ts
├── use-forgot-password.hook.ts
├── use-gallery.hook.ts
├── use-home-data.hook.ts
├── use-image-editor.hook.ts
├── use-load-data.hook.ts
├── use-location-info.ts
├── use-login-form.hook.ts
├── use-modal-state.hook.ts
├── use-network-status.hook.ts
├── use-notifications.hook.ts
├── use-recent-images.hook.ts
├── use-register-form.hook.ts
├── use-request-permissions.hook.ts
└── use-users.hook.ts
```

**Problema**: Todos los hooks están en una sola carpeta sin categorización

**Propuesta**: Organizar por feature/dominio

---

### 3. **Screens con Subcarpeta solo para admin-home-screen**

```
src/presentation/screens/admin/
├── admin-home-screen/      # ✅ Subcarpeta
│   ├── admin-home-screen.tsx
│   └── admin-home-screen.styles.ts
├── animal-form-screen.tsx  # ❌ Sin subcarpeta
├── animal-form-screen.styles.ts
├── catalog-management-screen.tsx  # ❌ Sin subcarpeta
└── ...
```

**Problema**: Inconsistencia - solo admin-home tiene subcarpeta

**Opciones**:

- A) Mover todos a subcarpetas
- B) Sacar admin-home de subcarpeta (RECOMENDADO para simplicidad)

---

### 4. **Servicios con Estructura Mixta**

```
src/services/
├── camera/
│   └── camera.service.ts       # Solo 1 archivo
├── catalog/
│   └── catalog.service.ts      # Solo 1 archivo
├── auth/
│   ├── auth.service.ts
│   ├── token.service.ts
│   └── interfaces/             # ✅ Subcarpeta para interfaces
└── storage/
    └── (9 archivos)            # Muchos archivos sin subcarpetas
```

**Problema**: Inconsistencia en cuándo usar subcarpetas

---

### 5. **Duplicación de Nombres entre Carpetas**

- `src/domain/models/` vs `src/data/models/`
- `src/domain/types/` vs `src/shared/types/`
- `src/domain/interfaces/` vs `src/services/auth/interfaces/`

**Clarificar**:

- `domain/models`: DTOs y modelos de negocio
- `data/models`: Modelos específicos de la capa de datos
- `domain/types`: TypeScript types para dominio
- `shared/types`: TypeScript types compartidos globalmente

---

## ✅ Propuesta de Mejoras

### Fase 1: Limpieza Inmediata

1. ✅ Eliminar archivos temporales (.swp, .backup)
2. ✅ Agregar a .gitignore para prevenir futuros archivos temporales

### Fase 2: Reorganización de Hooks

```
src/presentation/hooks/
├── admin/
│   ├── use-admin-data.hook.ts
│   └── use-catalog-management.hook.ts
├── auth/
│   ├── use-forgot-password.hook.ts
│   ├── use-login-form.hook.ts
│   └── use-register-form.hook.ts
├── camera/
│   ├── use-camera-actions.hook.ts
│   ├── use-camera-animations.hook.ts
│   ├── use-camera-freeze.hook.ts
│   ├── use-camera.hook.ts
│   └── use-gallery.hook.ts
├── common/
│   ├── use-back-handler.hook.ts
│   ├── use-current-time.hook.ts
│   ├── use-device-orientation.hook.ts
│   ├── use-double-back-exit.hook.ts
│   ├── use-load-data.hook.ts
│   ├── use-modal-state.hook.ts
│   └── use-network-status.hook.ts
├── forms/
│   ├── use-animal-form.hook.ts
│   └── use-image-editor.hook.ts
├── media/
│   ├── use-animal-image-picker.hook.ts
│   ├── use-downloaded-files.hook.ts
│   ├── use-file-download.hook.ts
│   └── use-recent-images.hook.ts
├── publication/
│   ├── use-drafts.hook.ts
│   └── use-home-data.hook.ts
├── catalog/
│   ├── use-common-nouns.ts
│   └── use-location-info.ts
├── notifications/
│   └── use-notifications.hook.ts
├── permissions/
│   └── use-request-permissions.hook.ts
└── users/
    └── use-users.hook.ts
```

### Fase 3: Estandarizar Screens

**Opción A**: Todo en archivos planos (RECOMENDADO)

```
src/presentation/screens/admin/
├── admin-home-screen.tsx
├── admin-home-screen.styles.ts
├── animal-form-screen.tsx
├── animal-form-screen.styles.ts
└── ...
```

**Opción B**: Todo en subcarpetas

```
src/presentation/screens/admin/
├── admin-home/
├── animal-form/
├── catalog-management/
└── ...
```

---

## 📋 Plan de Ejecución

### Paso 1: Limpieza (Inmediato) ✅

- Eliminar .swp y .backup files
- Actualizar .gitignore

### Paso 2: Reorganizar Hooks (Recomendado)

- Crear subcarpetas por dominio
- Mover archivos
- Actualizar imports

### Paso 3: Estandarizar Screens (Opcional)

- Decidir: subcarpetas vs archivos planos
- Aplicar consistentemente

---

## 🎯 Prioridad Recomendada

1. **ALTA**: Limpieza de archivos temporales
2. **MEDIA**: Reorganización de hooks
3. **BAJA**: Estandarización de screens (funciona bien como está)

---

## 📝 Notas

- La arquitectura general (Clean Architecture) está bien implementada
- El problema principal es la falta de subcategorización en hooks
- Los archivos temporales deben agregarse al .gitignore
