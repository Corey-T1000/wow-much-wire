# Implementation Plan: Explicit Wire Junctions

## Phase 1: Data Model

### Task 1.1: Update types.ts
Add new types for junctions:
```typescript
export type JunctionType = "splice" | "distribution" | "tap" | "ground-bus";

export interface DiagramJunction {
  id: string;
  type: JunctionType;
  label?: string;
  position?: { x: number; y: number };
  isInstalled: boolean;
  notes?: string;
}
```

Update `DiagramWire` to support junction endpoints:
```typescript
// Source can be pin OR junction
sourcePinId?: string;
sourceJunctionId?: string;

// Target can be pin OR junction
targetPinId?: string;
targetJunctionId?: string;
```

Update `DiagramData` to include `junctions: DiagramJunction[]`

### Task 1.2: Create migration utility
New file: `src/lib/migrate-splices.ts`
- Detect implicit splices (wires sharing same sourcePinId)
- Generate DiagramJunction for each splice
- Create trunk wire: original source → junction
- Update branch wires: junction → original targets
- Return migrated DiagramData

## Phase 2: Junction Node Rendering

### Task 2.1: Create JunctionNode component
New file: `src/components/diagram/junction-node.tsx`
- React Flow custom node for junctions
- Render dog icon (🐕) as the junction symbol
- Show label below if present
- Connection handles: one input (trunk), multiple outputs (branches)
- Visual states: normal, selected, dimmed (for circuit filter)
- Size based on connection count

### Task 2.2: Export from index.ts
Add JunctionNode to `src/components/diagram/index.ts` exports

## Phase 3: Wire Edge Updates

### Task 3.1: Update wire-edge.tsx
- Handle wires that connect to junctions (not just component pins)
- Calculate source/target positions for junction handles
- Maintain trunk wire thickness vs branch wire thickness

### Task 3.2: Update auto-layout.ts
- Include junction nodes in ELK graph
- Position junctions between their source component and target components
- Add junction-specific layout constraints
- Handle junction → junction connections if needed

## Phase 4: Main Diagram Integration

### Task 4.1: Update wiring-diagram.tsx
- Register JunctionNode as custom node type
- Add junction nodes to React Flow
- Handle junction selection state
- Apply circuit filter dimming to junctions
- Connect junction positions to diagram state

### Task 4.2: Update diagram page
- Call migration on data load
- Handle junction selection in sidebar
- Pass junction data through to WiringDiagram

## Phase 5: Sidebar Details

### Task 5.1: Create JunctionDetails component
New file: `src/components/diagram/junction-details.tsx`
- Display when junction is selected
- Show: type, label, trunk wire info, all branch wires
- List connected components/pins
- Show gauge information for trunk and each branch
- Toggle isInstalled checkbox
- Edit label and notes

### Task 5.2: Integrate into sidebar
Update `src/app/diagram/page.tsx`:
- Detect junction selection (vs component selection)
- Render JunctionDetails when junction selected

## Phase 6: Sample Data & Testing

### Task 6.1: Update sample-data.ts
- Add example junctions to sample data
- Create at least one splice example (power distribution)
- Create at least one ground-bus example

### Task 6.2: Manual testing
- Verify existing diagram loads and migrates correctly
- Verify junctions render with dog icons
- Verify trunk/branch gauge visualization
- Verify selection and sidebar details
- Verify save/load persistence
- Verify circuit filter affects junctions

## File Changes Summary

| File | Change |
|------|--------|
| `src/components/diagram/types.ts` | Add DiagramJunction, JunctionType, update DiagramWire, DiagramData |
| `src/components/diagram/junction-node.tsx` | NEW - Junction React Flow node with dog icon |
| `src/components/diagram/junction-details.tsx` | NEW - Sidebar panel for junction details |
| `src/components/diagram/wire-edge.tsx` | Handle junction endpoints |
| `src/components/diagram/auto-layout.ts` | Include junctions in ELK layout |
| `src/components/diagram/wiring-diagram.tsx` | Junction state, node types, selection |
| `src/components/diagram/index.ts` | Export new components |
| `src/lib/sample-data.ts` | Add junction examples |
| `src/lib/migrate-splices.ts` | NEW - Migration utility |
| `src/app/diagram/page.tsx` | Handle junction selection in sidebar |

## Implementation Order

1. Types (1.1)
2. Migration utility (1.2)
3. Junction node component (2.1, 2.2)
4. Wire edge updates (3.1)
5. Auto-layout integration (3.2)
6. Main diagram integration (4.1, 4.2)
7. Sidebar details (5.1, 5.2)
8. Sample data & testing (6.1, 6.2)

## Verification Commands

After each phase, run:
```bash
pnpm run lint && pnpm run typecheck
```

Final verification:
```bash
pnpm run build
```
