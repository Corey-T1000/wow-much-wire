# Feature: Explicit Wire Junctions

## Problem Statement

When multiple wires branch from a single source (electrical splice), the current UI stacks them visually without clearly showing:
1. Where the physical splice point is
2. Which wire is the "trunk" (carrying combined load)
3. Which wires are "branches" (individual loads)
4. Proper gauge sizing for current flow

This makes the diagram untrustworthy for physical wiring work.

## Goals

1. **Junctions as first-class entities** - Splices/distribution points are real physical things that get explicitly modeled
2. **Visual clarity** - Trunk vs branch is immediately obvious (thicker wire in, thinner wires out)
3. **Gauge validation** - Diagram makes incorrect sizing visible
4. **Future-proof** - Can extend to harness bundling later

## Non-Goals (this iteration)

- Automatic gauge calculation/suggestion
- Harness routing visualization (future feature)
- 3D wire length estimation

## Junction Types

| Type | Use Case | Visual |
|------|----------|--------|
| `splice` | Y-junction where one wire splits to multiple | Dog icon 🐕 |
| `distribution` | Power distribution point (like a bus bar) | Dog icon 🐕 |
| `tap` | Tapping into existing wire mid-run | Dog icon 🐕 |
| `ground-bus` | Common ground point | Dog icon 🐕 |

## Success Criteria

1. **Junctions render visibly** - You can see splice points on the diagram as dog icons
2. **Trunk vs branch is clear** - Thicker wire enters, thinner wires exit
3. **Existing data migrates** - Current diagram auto-converts implicit splices to explicit junctions
4. **Junctions are selectable** - Click to see details in sidebar
5. **Data persists** - Save/load preserves junction structure
6. **Auto-layout handles junctions** - They position correctly between source/targets

## Test Scenarios

1. Load existing diagram → implicit splices become visible junction nodes (dogs)
2. Junction shows correct trunk gauge (thickest incoming wire)
3. Selecting junction shows all connected wires in sidebar
4. Save → reload → junctions persist
5. Circuit filter dims/highlights junctions appropriately
