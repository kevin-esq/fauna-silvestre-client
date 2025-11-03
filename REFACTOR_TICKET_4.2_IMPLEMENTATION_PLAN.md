# Ticket 4.2: Plan de Implementación - Hooks de Utilidad

## 📊 Búsqueda Completa Realizada

**setTimeout encontrados**: 49 instancias en 22 archivos
**setInterval encontrados**: 2 instancias en 2 archivos

---

## 🎯 Archivos a Actualizar (Prioridad)

### Alta Prioridad (Casos Simples - useTimeout)

1. ✅ use-camera-freeze.hook.ts (1) - COMPLETADO
2. ✅ catalog-animals-screen.tsx (0 - useDebounce) - COMPLETADO
3. ✅ use-current-time.hook.ts (0 - useInterval) - COMPLETADO
4. ⏳ use-catalog-management.hook.ts (1) - setTimeout para debounce

### Media Prioridad (Navegación/UI)

9. ✅ image-preview-screen.tsx (1) - setTimeout para navegación
10. ✅ animal-form-screen.tsx (1) - setTimeout para navegación
11. ✅ camera-gallery-screen.tsx (2) - setTimeout para permisos
12. ✅ publication-form-screen.tsx (1) - setTimeout

### Baja Prioridad (Casos Complejos)

13. ✅ code-input.component.tsx (10) - Múltiples setTimeout para input
14. ✅ notification.context.tsx (5) - setTimeout para notificaciones
15. ✅ publication-details-screen.tsx (4) - setTimeout múltiples
16. ✅ use-animal-image-picker.hook.ts (3) - setTimeout complejos
17. ✅ review-publications-screen.tsx (3) - setTimeout
18. ✅ publication-screen.tsx (3) - setTimeout
19. ✅ location-map.component.tsx (2) - setTimeout con refs
20. ✅ publication.context.tsx (2) - setTimeout
21. ✅ custom-image-picker-screen.tsx (1) - Promise setTimeout

### Excluidos (Implementaciones de Hooks)

- ❌ use-debounce.hook.ts - Es el hook que creamos
- ❌ use-timeout.hook.ts - Es el hook que creamos
- ❌ use-is-mounted.hook.ts - Ejemplo en documentación

---

## 📝 Estrategia de Implementación

### Fase 1: Hooks Simples (5-8 archivos)

- Casos donde setTimeout se usa para delays simples
- Fácil reemplazo con useTimeout
- Bajo riesgo

### Fase 2: Casos de Navegación (4-5 archivos)

- setTimeout usado para delays en navegación
- Reemplazar con useTimeout
- Riesgo medio

### Fase 3: Casos Complejos (Evaluar individualmente)

- Múltiples setTimeout interdependientes
- Puede requerir refactoring adicional
- Alto riesgo - hacer con cuidado

---

## 🎯 Objetivo

**Meta**: Actualizar al menos 10-12 archivos en esta sesión
**Estimado**: 1-1.5 horas
**Beneficio**: Eliminar ~100-150 líneas de código boilerplate
