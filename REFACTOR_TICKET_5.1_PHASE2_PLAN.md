# Ticket 5.1: Phase 2 - Complete Card Refactoring Plan

## 📊 Cards to Refactor (9 components)

### Group 1: Main Cards (5)
1. animal-card.component.tsx
2. publication-card.component.tsx  
3. draft-card.component.tsx
4. notification-card.component.tsx
5. user-card.component.tsx

### Group 2: Card Variants (4)
6. animal-card-variants.component.tsx
7. animal-card-with-actions.component.tsx
8. publication-card-variants.component.tsx
9. publication-card-with-actions.component.tsx

---

## 🎯 Refactoring Strategy

### Option A: Full Base Card Integration ⚠️
**Pros**: Maximum code reuse, consistent patterns
**Cons**: Cards are complex with specific layouts, might be over-engineering
**Decision**: NOT RECOMMENDED - cards are too specialized

### Option B: Extract Common Patterns ✅
**Pros**: Practical, maintains flexibility
**Cons**: Less dramatic code reduction
**Decision**: RECOMMENDED

**What to extract**:
1. ✅ Card container styles (shadows, borders, padding)
2. ✅ Touch handling logic
3. ✅ Image loading states
4. ✅ Badge/tag patterns
5. ✅ Action button patterns

---

## 🔨 Components to Create

### 1. CardContainer Component
```typescript
interface CardContainerProps {
  onPress?: () => void;
  leftBorderColor?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
```
**Usage**: Wrap all cards with consistent container
**Benefit**: ~20 lines per card

### 2. CardImage Component  
```typescript
interface CardImageProps {
  uri: string;
  height?: number;
  onPress?: () => void;
  placeholder?: React.ReactNode;
}
```
**Usage**: Replace repetitive image loading logic
**Benefit**: ~30 lines per card with images

### 3. CardBadge Component
```typescript
interface CardBadgeProps {
  label: string;
  icon?: string;
  color: string;
  variant?: 'filled' | 'outlined';
}
```
**Usage**: Status badges, tags, indicators
**Benefit**: ~15 lines per badge

### 4. CardActionButtons Component
```typescript
interface CardActionButtonsProps {
  actions: Array<{
    icon: string;
    label?: string;
    onPress: () => void;
    color?: string;
  }>;
}
```
**Usage**: Footer action buttons
**Benefit**: ~25 lines per card

---

## 📊 Estimated Impact

### Code Reduction:
- animal-card: ~50 lines
- publication-card: ~60 lines
- draft-card: ~45 lines  
- notification-card: ~30 lines
- user-card: ~40 lines
- **Total**: ~225 lines eliminated

### New Components Created: 4
- CardContainer: ~80 lines
- CardImage: ~100 lines
- CardBadge: ~60 lines
- CardActionButtons: ~90 lines
- **Total**: ~330 lines

### Net Result:
- Remove: 225 lines duplicate code
- Add: 330 lines reusable components
- **Net**: +105 lines but MUCH better quality

---

## 🚀 Execution Plan

### Step 1: Create Card Helper Components ✅
1. Create CardContainer
2. Create CardImage
3. Create CardBadge
4. Create CardActionButtons

### Step 2: Refactor Main Cards
1. Refactor notification-card (simplest)
2. Refactor user-card
3. Refactor draft-card
4. Refactor animal-card
5. Refactor publication-card

### Step 3: Refactor Variant Cards
1. Update animal-card-variants
2. Update animal-card-with-actions
3. Update publication-card-variants
4. Update publication-card-with-actions

### Step 4: Test & Verify
- npx tsc --noEmit
- npx eslint
- Visual testing

---

## 🎯 Alternative: Document Only

**IF cards are too complex to refactor safely**:
- Document the patterns
- Create style utilities
- Leave cards as-is
- Focus on screens instead

**Decision pending code review...**
