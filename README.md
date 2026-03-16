# Wind Certification Platform

**The #1 open-source wind load certification tool for Florida.**

Free ASCE 7-22 wind pressure calculator, product comparison, and certification letter generator — built for homeowners, contractors, and architects.

[Live Calculator](https://windcalculations.com) | [API Docs](./openapi.yaml) | [LLM Integration](./AGENTS.md) | [Oasis Engineering](https://oasisengineering.com)

---

## What This Does

This platform helps anyone in Florida verify that their doors, windows, and cladding meet wind load requirements per **ASCE 7-22** and the **Florida Building Code 2023**. It replaces expensive engineering consultations for straightforward like-for-like replacements.

**The workflow:**
1. Select your Florida county (auto-detects HVHZ status)
2. Enter your wind speed and exposure category
3. Input building dimensions and product area
4. Get calculated wind pressures (Zone 4 and Zone 5)
5. Compare against your product's rated pressures
6. Generate a certification letter (PDF) for your permit submission

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
│   └── schemas/              # JSON schemas for LLM integration
├── apps/
│   └── web/                  # Next.js interactive web application
│       ├── src/app/          # Pages and API routes
│       ├── src/components/   # Calculator wizard UI (6 steps)
│       ├── src/lib/          # PDF generator, county helpers
│       └── src/data/         # Florida county database (67 counties)
├── docs/                     # Original guides (migrated)
├── AGENTS.md                 # AI assistant instructions
├── llm-reference.json        # Structured LLM knowledge base
├── openapi.yaml              # OpenAPI 3.0 API specification
└── diy-wind-certification-guide-main/  # Original documentation
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
import { calculate, compareProduct } from '@oasis/asce7-calculator';

const result = calculate({
  county: 'Broward',
  isHVHZ: true,
  ultimateWindSpeed: 170,
  exposureCategory: 'C',
  meanRoofHeight: 12,
  buildingLength: 50,
  buildingWidth: 50,
  effectiveWindArea: 20,
});

console.log(result.criticalPressure);
// { positive: 54.2, negative: -81.0 }

// Compare against a product
const comparison = compareProduct(result, {
  name: 'MasterCraft Impact Door',
  ratedPositive: 55,
  ratedNegative: 90,
});

console.log(comparison.overallPass); // true
```

### Key Formulas (ASCE 7-22 Chapter 30)

| Formula | Description |
|---------|-------------|
| `qh = 0.00256 × Kz × Kzt × Kd × Ke × V²` | Velocity pressure at roof height |
| `p = qh × [(GCp) ± (GCpi)]` | Design wind pressure |
| `F = p × A` | Wind load (force) on component |

### HVHZ Overrides (FBC 2023 Section 1620)

| County | Risk Cat II Min Speed | Min Exposure |
|--------|----------------------|-------------|
| Miami-Dade | 175 mph | C |
| Broward | 170 mph | C |

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

## Tech Stack

- **Calculator:** TypeScript (zero dependencies, publishable to npm)
- **Web App:** Next.js 14, React 18, Tailwind CSS
- **PDF:** jsPDF (client-side generation)
- **Monorepo:** pnpm workspaces + Turborepo
- **Testing:** Vitest (39 tests passing)

## Contributing

We welcome contributions! See [contributing.md](./diy-wind-certification-guide-main/contributing.md) for guidelines.

Ideas for contributions:
- County-specific notes and building department contacts
- Product approval database entries
- Calculation examples with screenshots
- Spanish / multilingual translations
- Additional building code versions
- Multi-state expansion (California, Texas)

## Professional Services

Need a **sealed engineering letter**? The DIY tool covers many cases, but some jurisdictions and scenarios require professional engineering:

- [WindCalculations.com](https://windcalculations.com) — Sealed wind load packages
- [OasisEngineering.com](https://oasisengineering.com) — Full engineering services
- Contact: info@oasisengineering.com | (813) 694-8989

## License

MIT — Free to use, modify, and distribute. Built by [Oasis Engineering](https://oasisengineering.com).
