# Data Export

Portable JSON dumps of the wiring data, for consumption outside the app (no
TypeScript/Next.js build required).

## Files

### `sample-data.json`

The actual 1993 NA Miata full rewire data — circuits, components, connectors,
pins, and wires.

Top-level shape:

```
{
  "sampleDiagramData": {
    "circuits": [ ... ],     // circuit definitions: id, name, color, category
    "components": [ ... ],   // PDM, ECU, relays, etc. — each with connectors[] and pins[]
    "wires": [ ... ],        // wire runs between pins, with circuit/gauge info
    "junctions": [ ... ]     // splice/junction points
  }
}
```

### `wiring-reference.json`

Authoritative reference data used for validating the wiring (PDM datasheet
specs, ampacity chart, connector pinouts).

Top-level keys:

- `WIRE_GAUGE_AMPACITY` — max continuous current per AWG gauge + recommended fuse
- `PDM_SPECS` — Bussmann 31S-001-0 PDM specs, relays, connector pinouts
- `MS3PRO_MINI_SPECS` — MS3Pro Mini ECU pinout
- `TYPICAL_LOADS` — typical current draw per load type
- `INVERTER_RELAY_WIRING` — inverter relay wiring notes
- `GROUNDING_BEST_PRACTICES` — grounding rules/notes
- `VALIDATION_RULES` — human-readable validation rules

Note: `wiring-reference.ts` also exports helper functions
(`validateWireGauge`, `findPdmPin`, `findMs3Pin`) and a `WIRING_REFERENCE`
convenience object that re-nests the consts above. Functions aren't
JSON-serializable, so they're excluded here, and `WIRING_REFERENCE` is
omitted to avoid duplicating the same data twice in one file.

## Source of truth

These JSON files are generated from `src/lib/sample-data.ts` and
`src/lib/wiring-reference.ts`. The `.ts` files are the source of truth —
regenerate this export after editing them:

```bash
npx tsx scripts/export-data.ts
```
