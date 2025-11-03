# Ticket 1.3: Estandarización de Imports Absolutos/Relativos

## Estado Actual

### Configuración TypeScript

```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Análisis de Imports Actuales

| Tipo                                     | Cantidad | Porcentaje |
| ---------------------------------------- | -------- | ---------- |
| Imports con `@/` (absolutos)             | 189      | 27%        |
| Imports con `../` (relativos)            | 426      | 62%        |
| Imports con `./` (relativos mismo nivel) | 71       | 10%        |
| **Total**                                | **686**  | **100%**   |

### Desglose de @ Imports

| Destino             | Cantidad |
| ------------------- | -------- |
| `@/domain`          | 29       |
| `@/services`        | 28       |
| `@/presentation`    | 71       |
| `@/shared`          | 11       |
| **Total @ imports** | **139**  |

---

## 🎯 Estrategia Propuesta

### Regla Principal: **Usar Imports Absolutos (@/) para Todo**

#### Ventajas:

✅ **Legibilidad**: Siempre sabes de dónde viene el import  
✅ **Refactoring seguro**: Mover archivos no rompe imports  
✅ **Consistencia**: Todos los imports se ven igual  
✅ **Autocompletado**: Mejor soporte en IDEs  
✅ **Escalabilidad**: Fácil agregar nuevas capas

#### Desventajas de Imports Relativos:

❌ Difícil seguir `../../../components/...`  
❌ Se rompen al mover archivos  
❌ Inconsistencia en el codebase

---

## 📋 Plan de Implementación

### Fase 1: Actualizar Presentation Layer

```typescript
// Antes
import { useTheme } from '../contexts/theme.context';
import { CustomButton } from '../../components/ui/custom-button.component';

// Después
import { useTheme } from '@/presentation/contexts/theme.context';
import { CustomButton } from '@/presentation/components/ui/custom-button.component';
```

### Fase 2: Actualizar Services Layer

```typescript
// Antes
import { ILogger } from '../../services/logging/ILogger';

// Después
import { ILogger } from '@/services/logging/ILogger';
```

### Fase 3: Actualizar Domain Layer

```typescript
// Antes
import { PublicationModel } from '../models/publication.models';

// Después
import { PublicationModel } from '@/domain/models/publication.models';
```

### Fase 4: Actualizar Data Layer

```typescript
// Antes
import { BaseRepository } from './base.repository';

// Después
import { BaseRepository } from '@/data/repositories/base.repository';
```

---

## 🔧 Implementación Técnica

### Script de Conversión Automática

Se usará `sed` para reemplazar imports relativos por absolutos:

```bash
# Presentation layer
find src/presentation -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./presentation/|from '@/presentation/|g" {} \;

# Services layer
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  "s|from '\.\./\.\./services/|from '@/services/|g" {} \;
```

---

## ✅ Beneficios Esperados

1. **100% consistencia** en imports
2. **Mejor DX** (Developer Experience)
3. **Código más limpio** y legible
4. **Refactoring más seguro**
5. **Onboarding más fácil** para nuevos devs

---

## 📊 Métricas de Éxito

- ✅ 0 imports relativos con `../../../`
- ✅ 100% imports usando alias `@/`
- ✅ 0 errores de compilación TypeScript
- ✅ 0 errores de ESLint

---

## 🚀 Ejecución

1. ✅ Analizar estado actual
2. ⏳ Convertir imports en presentation/
3. ⏳ Convertir imports en services/
4. ⏳ Convertir imports en domain/
5. ⏳ Convertir imports en data/
6. ⏳ Verificar compilación
7. ⏳ Commit cambios
