# Ticket 5.1: Análisis de Componentes UI Reutilizables

## 📊 Resumen Ejecutivo

**Estado General**: 🟡 **OPORTUNIDADES DE MEJORA IDENTIFICADAS**

**Componentes Analizados**: 53 componentes en src/presentation/components

**Veredicto**: Se identificaron patrones reutilizables y oportunidades para mejorar la separación de responsabilidades y reutilización de componentes UI.

---

## 🔍 Estructura Actual de Componentes

### Componentes por Categoría (53 total):

#### 1. **Animal Components** (5 componentes)

- animal-card-variants.component.tsx
- animal-card-with-actions.component.tsx
- animal-card.component.tsx
- animal-searchable-dropdown.component.tsx
- catalog-filters.component.tsx

#### 2. **Auth Components** (7 componentes)

- auth-container.component.tsx
- auth-text-input.component.tsx
- code-input.component.tsx
- error-message.component.tsx
- social-button.component.tsx
- sponsors-footer.component.tsx
- step-indicator.component.tsx
- support-footer.component.tsx

#### 3. **Camera Components** (10 componentes)

- camera-restricted-overlay.component.tsx
- camera-view.component.tsx
- capture-button.component.tsx
- freeze-overlay.component.tsx
- gallery-button.component.tsx
- loading.component.tsx
- permission-message.component.tsx
- thumbnail-list.component.tsx
- top-controls.component.tsx
- zoom-controls.component.tsx

#### 4. **Publication Components** (7 componentes)

- publication-card-variants.component.tsx
- publication-card-with-actions.component.tsx
- publication-card.component.tsx
- publication-image.component.tsx
- publication-view-selector.component.tsx
- status-tabs.component.tsx

#### 5. **UI Components** (20 componentes)

- animated-pressable.component.tsx
- catalog-view-selector.component.tsx
- custom-button.component.tsx
- custom-image-picker.component.tsx
- custom-modal.component.tsx
- custom-picker.component.tsx
- custom-text-input.component.tsx
- error-boundary.component.tsx
- floating-action-button.component.tsx
- help-modal.component.tsx
- image-skeleton.component.tsx
- location-map.component.tsx
- notification-skeleton.component.tsx
- offline-banner.component.tsx
- publication-skeleton.component.tsx
- search-bar.component.tsx
- skeleton-loader.component.tsx
- top-tabs-navigation-bar.component.tsx
- user-avatar.component.tsx
- user-view-selector.component.tsx

#### 6. **Other Components** (4 componentes)

- common/loading-modal.component.tsx
- draft/draft-card.component.tsx
- notification/notification-card.component.tsx
- user/user-card.component.tsx

---

## 🎯 Patrones Identificados

### 1. **Card Pattern Duplication** ⭐⭐⭐

**Componentes Similares**:

- animal-card.component.tsx
- publication-card.component.tsx
- draft-card.component.tsx
- notification-card.component.tsx
- user-card.component.tsx

**Patrón Común**:

```typescript
- Contenedor con estilos
- Header con imagen/avatar
- Contenido principal
- Footer con acciones
- Shadows y borders
- Padding consistente
```

**Oportunidad**: Crear `BaseCard` component reutilizable

---

### 2. **Skeleton Loader Duplication** ⭐⭐⭐

**Componentes Existentes**:

- skeleton-loader.component.tsx (genérico)
- image-skeleton.component.tsx
- notification-skeleton.component.tsx
- publication-skeleton.component.tsx

**Análisis**:

- ✅ Ya existe `skeleton-loader` genérico
- ✅ Componentes especializados usan el genérico
- ✅ Patrón bien implementado

**Estado**: NO requiere refactor

---

### 3. **View Selector Duplication** ⭐⭐

**Componentes Duplicados**:

- catalog-view-selector.component.tsx
- publication-view-selector.component.tsx
- user-view-selector.component.tsx

**Patrón Común**:

```typescript
- Botones para cambiar vista (list/grid)
- Íconos de vista
- Estado activo
- Misma lógica
```

**Oportunidad**: Consolidar en `GenericViewSelector`

---

### 4. **Card Variants Pattern** ⭐⭐

**Componentes con Variantes**:

- animal-card-variants.component.tsx
- animal-card-with-actions.component.tsx
- publication-card-variants.component.tsx
- publication-card-with-actions.component.tsx

**Análisis**:

- Cada entidad tiene múltiples variantes
- Lógica similar de renderizado condicional
- Acciones específicas por contexto

**Oportunidad**: Extraer lógica común de variantes

---

### 5. **Input Components** ⭐

**Componentes Existentes**:

- auth-text-input.component.tsx
- custom-text-input.component.tsx
- code-input.component.tsx

**Análisis**:

- auth-text-input: Específico para auth
- custom-text-input: Genérico
- code-input: Específico para códigos

**Estado**: Bien separados, NO requiere refactor

---

### 6. **Button Components** ⭐

**Componentes Existentes**:

- custom-button.component.tsx (genérico)
- social-button.component.tsx (específico auth)
- floating-action-button.component.tsx (FAB)
- capture-button.component.tsx (específico cámara)
- gallery-button.component.tsx (específico cámara)

**Análisis**:

- ✅ Buena separación entre genérico y específicos
- ✅ custom-button cubre casos generales
- ✅ Botones específicos para contextos únicos

**Estado**: Bien implementado, NO requiere refactor

---

## 🚨 Oportunidades de Refactorización

### Alta Prioridad:

#### 1. **Consolidar View Selectors** ⭐⭐⭐

**Archivos Afectados**: 3

- catalog-view-selector.component.tsx
- publication-view-selector.component.tsx
- user-view-selector.component.tsx

**Propuesta**: Crear `GenericViewSelector` con props:

```typescript
interface GenericViewSelectorProps {
  currentView: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
  listIcon?: string;
  gridIcon?: string;
  colors?: object;
}
```

**Beneficio**: Eliminar ~150 líneas de código duplicado

---

#### 2. **Extraer BaseCard Component** ⭐⭐

**Archivos Afectados**: 5

- animal-card.component.tsx
- publication-card.component.tsx
- draft-card.component.tsx
- notification-card.component.tsx
- user-card.component.tsx

**Propuesta**: Crear `BaseCard` con slots:

```typescript
interface BaseCardProps {
  header?: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}
```

**Beneficio**: Código más consistente, estilos compartidos

---

### Media Prioridad:

#### 3. **Refactorizar Card Variants Logic** ⭐⭐

**Archivos Afectados**: 4

- animal-card-variants.component.tsx
- animal-card-with-actions.component.tsx
- publication-card-variants.component.tsx
- publication-card-with-actions.component.tsx

**Propuesta**: Extraer HOC o hook para gestionar variantes

**Beneficio**: Lógica reutilizable de variantes

---

### Baja Prioridad:

#### 4. **Consolidar Camera Buttons** ⭐

**Archivos**: capture-button, gallery-button

**Análisis**: Son muy específicos, consolidación no aporta mucho

**Decisión**: Mantener separados

---

## 📊 Componentes que NO Requieren Refactor

### ✅ Bien Implementados:

1. **Skeleton Loaders** - Patrón genérico + especializados ✅
2. **Input Components** - Buena separación ✅
3. **Button Components** - Genérico + específicos ✅
4. **Modal Components** - custom-modal + especializados ✅
5. **Camera Components** - Específicos del contexto ✅
6. **Auth Components** - Específicos del flujo ✅

---

## 🎯 Plan de Implementación

### Fase 1: View Selectors (Alta Prioridad)

1. ✅ Crear GenericViewSelector component
2. ✅ Migrar catalog-view-selector
3. ✅ Migrar publication-view-selector
4. ✅ Migrar user-view-selector
5. ✅ Eliminar componentes antiguos

**Tiempo estimado**: 1 hora  
**Impacto**: Alto (~150 líneas ahorradas)

---

### Fase 2: Base Card (Media Prioridad)

1. ✅ Crear BaseCard component
2. ✅ Extraer estilos comunes
3. ✅ Migrar cards uno por uno
4. ✅ Mantener compatibilidad

**Tiempo estimado**: 2 horas  
**Impacto**: Medio (consistencia, ~100 líneas)

---

### Fase 3: Card Variants (Baja Prioridad)

1. ✅ Analizar lógica de variantes
2. ✅ Extraer HOC/hook común
3. ✅ Refactorizar gradualmente

**Tiempo estimado**: 1.5 horas  
**Impacto**: Bajo (mejora mantenibilidad)

---

## 📊 Estimaciones Totales

| Fase       | Archivos | Líneas Ahorradas | Tiempo   | Prioridad |
| ---------- | -------- | ---------------- | -------- | --------- |
| **Fase 1** | 3        | ~150             | 1h       | Alta      |
| **Fase 2** | 5        | ~100             | 2h       | Media     |
| **Fase 3** | 4        | ~80              | 1.5h     | Baja      |
| **Total**  | 12       | **~330**         | **4.5h** | -         |

---

## 🎯 Veredicto Final

**Estado**: 🟡 **OPORTUNIDADES IDENTIFICADAS**

**Recomendación**:

1. ✅ **Implementar Fase 1** (View Selectors) - Alto impacto
2. ⚠️ **Evaluar Fase 2** (Base Card) - Mejora consistencia
3. ⏸️ **Posponer Fase 3** (Card Variants) - Bajo beneficio inmediato

**Beneficios**:

- Eliminar ~330 líneas de código duplicado
- Mejorar consistencia en UI
- Facilitar mantenimiento
- Reducir bugs por inconsistencias

**Calidad Actual**: 🟢 **Buena** (la mayoría de componentes bien estructurados)

**Calidad Objetivo**: 🟢 **Excelente** (tras implementar mejoras)
