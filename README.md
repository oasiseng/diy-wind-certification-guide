# Wind Certification Platform

**The #1 open-source wind load calculation tool for the United States.**

Free ASCE 7-22 wind pressure calculator for windows, doors, and roof components — covering 19 coastal states. No paywall. No signup. Just accurate engineering numbers.

[Live Calculator](https://windcalculations.com) | [API Docs](./openapi.yaml) | [LLM Integration](./AGENTS.md) | [Oasis Engineering](https://oasisengineering.com)

---

## What This Does

This platform calculates ASCE 7-22 Components & Cladding (C&C) wind pressures for low-rise buildings (h ≤ 60 ft). It covers **wall zones** (4 and 5) for windows and doors, plus **roof zones** (1, 2, 3) for 10 roof types. Results include design pressures for building permit submissions.

**Features:**
- Full project reports with multiple openings (windows, doors, sliding doors)
- Roof C&C pressures for all 3 zones across 10 roof types
- HVHZ auto-detection from county name (Miami-Dade, Broward) with FBC 2023 overrides
- NaN-safe validation on every numeric input — no garbage numbers in reports
- Standalone HTML demo that works offline (no build step needed)
- Product comparison against FL Product Approvals and NOA ratings
- PDF report generation (client-side via jsPDF)

**Supported states:** FL, TX, NC, SC, LA, MS, AL, GA, VA, MD, DE, NJ, NY, MA, CT, RI, ME, NH, HI

## Who It's For

- **Homeowners** replacing doors or windows who need a wind load verification for their permit
- **Contractors** who need quick field calculations without calling an engineer every time
- **Architects** who want a fast design-check tool for C&C wind loads
- **AI Assistants** (ChatGPT, Claude, Gemini) that guide users through wind certification — see [AGENTS.md](./AGENTS.md)

## Project Structure

```
wind-certification-platform/
├── packages/
│   ├── asce7-calculator/     # Pure TypeScript ASCE 7-22 engine (zero deps)
│   │   ├── src/
│   │   │   ├── calculator.ts         # Single-opening calculator
│   │   │   ├── report-calculator.ts  # Multi-opening project reports
│   │   │   ├── formulas.ts           # Core ASCE 7-22 equations
│   │   │   ├── roof-formulas.ts      # Roof C&C (10 types, 3 zones)
│   │   │   ├── hvhz-overrides.ts     # FBC 2023 HVHZ with county normalization
│   │   │   ├── validations.ts        # NaN-safe input validation
│   │   │   └── types.ts              # TypeScript interfaces
│   │   └── tests/                    # Vitest test suite
│   └── schemas/              # JSON schemas for LLM integration
├── apps/
│   └── web/                  # Next.js interactive web application
│       ├── src/app/
│       │   ├── page.tsx              # Home / wind speed lookup
│       │   ├── calculator/           # Single-product calculator wizard
│       │   └── report/               # Multi-opening report generator
│       ├── src/lib/          # PDF generator, county helpers
│       ├── src/data/         # Florida county database (67 counties)
│       └── public/
│           └── demo.html     # Standalone HTML demo (no build needed)
├── AGENTS.md                 # AI assistant instructions
├── llm-reference.json        # Structured LLM knowledge base
└── openapi.yaml              # OpenAPI 3.0 API specification
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the calculator tests
pnpm --filter @oasis/asce7-calculator test

# Start the web app
pnpm dev
```

## Calculator Engine (`@oasis/asce7-calculator`)

Standalone TypeScript library with zero dependencies. Use it anywhere:

```typescript
import { calculate, generateReport } from '@oasis/asce7-calculator';

// Quick single-opening calculation
const result = calculate({
  county: 'Broward',       // Auto-detects HVHZ even without isHVHZ flag
  isHVHZ: false,           // Will be auto-corrected to true for Broward
  ultimateWindSpeed: 140,  // Will be bumped to 170 per FBC 2023
  exposureCategory: 'B',   // Will be bumped to C per HVHZ rules
  meanRoofHeight: 12,
  buildingLength: 50,
  buildingWidth: 50,
  effectiveWindArea: 20,
});

console.log(result.input.ultimateWindSpeed); // 170 (adjusted)
console.log(result.criticalPressure);        // { positive: 54.2, negative: -81.0 }

// Full project report with multiple openings + roof
const report = generateReport({
  projectName: 'Beach House Renovation',
  address: '456 Ocean Dr',
  state: 'FL',
  county: 'Miami-Dade',
  isHVHZ: true,
  ultimateWindSpeed: 175,
  exposureCategory: 'C',
  meanRoofHeight: 15,
  buildingLength: 40,
  buildingWidth: 30,
  enclosureType: 'Enclosed',
  openings: [
    { markId: 'W-1', type: 'Window', widthInches: 36, heightInches: 48, floorLevel: 1, zone: 4 },
    { markId: 'D-1', type: 'Door', widthInches: 36, heightInches: 80, floorLevel: 1, zone: 5 },
    { markId: 'SL-1', type: 'Sliding Door', widthInches: 72, heightInches: 80, floorLevel: 1, zone: 4 },
  ],
  roof: { roofType: 'Flat', effectiveArea: 100 },
});

console.log(report.openingResults.length); // 3
console.log(report.roofResults);           // { zone1: {...}, zone2: {...}, zone3: {...} }
```

### Key Formulas (ASCE 7-22 Chapter 30)

| Formula | Description |
|---------|-------------|
| `qh = 0.00256 × Kz × Kzt × Kd × Ke × V²` | Velocity pressure at roof height |
| `p = qh × [(GCp) ± (GCpi)]` | Design wind pressure |
| `F = p × A` | Wind load (force) on component |

### HVHZ Overrides (FBC 2023 Section 1620)

County names are auto-normalized — "miami dade", "Miami-Dade County", "BROWARD", "dade" all resolve correctly.

| County | Cat I | Cat II | Cat III | Cat IV | Min Exposure |
|--------|-------|--------|---------|--------|-------------|
| Miami-Dade | 165 | 175 | 186 | 195 mph | C |
| Broward | 156 | 170 | 180 | 185 mph | C |

## API

### POST `/api/calculate`

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "county": "Broward",
    "isHVHZ": true,
    "ultimateWindSpeed": 170,
    "exposureCategory": "C",
    "meanRoofHeight": 18,
    "buildingLength": 50,
    "buildingWidth": 40,
    "effectiveWindArea": 20
  }'
```

### GET `/api/llm-context`

Returns the complete structured knowledge base for LLM integration. Any AI assistant can call this endpoint to get everything needed to guide a user through wind certification.

## LLM Integration

This project is designed to be referenced by AI assistants. Three resources:

1. **[AGENTS.md](./AGENTS.md)** — Instructions for AI assistants. Feed this to your LLM for comprehensive wind certification guidance.
2. **[llm-reference.json](./llm-reference.json)** — Structured knowledge base with glossary, workflow, examples, and conversation templates.
3. **[openapi.yaml](./openapi.yaml)** — OpenAPI spec for tool-calling integration (ChatGPT Actions, Claude MCP, etc.)

### Example AI Prompt

> "I'm replacing a sliding door in Fort Lauderdale. Using the Oasis Wind Certification tool, help me figure out if my product meets the wind load requirements. The door is 6ft × 8ft, my house is 50×40 ft with a 15ft roof, and I'm in an open area."

## Florida County Data

All 67 Florida counties are included with:
- HVHZ status and minimum wind speeds
- Whether DIY packages are accepted
- Whether engineer stamps are required
- Building department contacts (for focus counties)
- Geographic region classification

## Important Disclaimers

- This tool is for **educational purposes only** and does not constitute professional engineering
- Results are **not sealed engineering documents**
- **HVHZ locations** (Miami-Dade, Broward) typically require sealed engineering packages
- Always confirm requirements with your local building department before submission
- For professional sealed letters, visit [windcalculations.com](https://windcalculations.com)

## Standalone HTML Demo

Don't want to set up a dev environment? Open `apps/web/public/demo.html` in any browser. It includes the complete calculation engine, all 10 roof types, HVHZ auto-detection, XSS-safe rendering, and a print-to-PDF workflow. Zero build step, zero dependencies (just Tailwind CDN for styling).

## Tech Stack

- **Calculator:** TypeScript (zero dependencies, publishable to npm)
- **Web App:** Next.js 14, React 18, Tailwind CSS
- **PDF:** jsPDF (client-side generation)
- **Monorepo:** pnpm workspaces + Turborepo
- **Testing:** Vitest

## Contributing

We welcome contributions! See [contributing.md](./diy-wind-certification-guide-main/contributing.md) for guidelines.

Ideas for contributions:
- FL Product Approval / NOA database integration
- County-specific building department contacts
- Additional roof types or building configurations
- Spanish / multilingual translations
- State-specific building code overrides beyond Florida
- Product recommendation engine based on calculated pressures

## Professional Services

Need a **sealed engineering letter**? The DIY tool covers many cases, but some jurisdictions and scenarios require professional engineering:

- [WindCalculations.com](https://windcalculations.com) — Sealed wind load packages
- [OasisEngineering.com](https://oasisengineering.com) — Full engineering services
- Contact: info@oasisengineering.com | (813) 694-8989

## License

This project uses a dual-license structure:

- **Web app, schemas, docs** (`apps/`, `packages/schemas/`, `docs/`): **MIT** — do whatever you want with it.
- **Calculator engine** (`packages/asce7-calculator/`): **AGPL-3.0** — free to use, but if you serve it on a public-facing website or API, you must open-source your entire application under AGPL. If you want to keep your app closed-source, contact us for a commercial license.

**Why AGPL for the calculator?** This engine contains hand-verified ASCE 7-22 equations, FBC 2023 HVHZ overrides, and GCp tables that took real engineering review to get right. We want everyone to benefit from accurate wind load calculations for free. We don't want competitors wrapping our engine in a paywall while keeping their code secret.

**Commercial licensing:** info@oasisengineering.com | (813) 694-8989

Built by [Oasis Engineering](https://oasisengineering.com).
