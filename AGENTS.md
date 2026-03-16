# ASCE 7-22 Wind Certification Platform — AI Agent Instructions

Welcome, AI assistant! This document provides everything you need to help users navigate ASCE 7-22 wind pressure calculations and Florida wind certification.

---

## Platform Overview

This is an **ASCE 7-22 wind pressure calculator platform for Florida buildings**. It helps homeowners, contractors, and architects determine whether doors, windows, impact devices, and other components meet Florida Building Code (FBC 2023) wind load requirements.

### Key Facts
- **Standard**: ASCE/SEI 7-22 (Minimum Design Loads and Associated Criteria)
- **Jurisdiction**: Florida statewide, with special rules for High-Velocity Hurricane Zones (HVHZ)
- **Scope**: Components & Cladding (C&C) wind pressure calculations per ASCE 7-22 Chapter 30
- **End Goal**: Generate certification letters proving products meet calculated wind pressures

---

## API Reference

### POST /api/calculate

Calculates wind pressures and loads for a specific building and component.

#### Example curl request:

```bash
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "county": "Broward",
    "isHVHZ": true,
    "ultimateWindSpeed": 140,
    "exposureCategory": "B",
    "meanRoofHeight": 20,
    "buildingLength": 60,
    "buildingWidth": 40,
    "effectiveWindArea": 24,
    "topographicFactor": 1.0,
    "riskCategory": 2,
    "address": "123 Main St, Fort Lauderdale, FL 33301"
  }'
```

#### Request Body (CalculatorInput):
- **county** (string, required): Florida county name (e.g., "Broward", "Miami-Dade", "Hillsborough")
- **isHVHZ** (boolean, required): Whether location is in a High-Velocity Hurricane Zone
- **ultimateWindSpeed** (number, required): Vult in mph from ASCE 7-22 Figure 26.5-1 or HVHZ map
- **exposureCategory** (string, required): "B", "C", or "D" per ASCE 7-22 Section 26.7
- **meanRoofHeight** (number, required): Height to eave/ridge in feet (5–200 ft range)
- **buildingLength** (number, required): Longest horizontal dimension in feet
- **buildingWidth** (number, required): Shortest horizontal dimension in feet
- **effectiveWindArea** (number, required): Component area in sq ft (1–1000 sq ft range)
- **topographicFactor** (number, optional): Kzt per ASCE 7-22 Section 26.8. Default: 1.0
- **riskCategory** (integer, optional): 1, 2, 3, or 4. Default: 2 (residential)
- **address** (string, optional): Project address for record-keeping

#### Response Body (CalculatorOutput):

```json
{
  "input": { /* echoed input */ },
  "intermediate": {
    "zoneEndWidth": 8,
    "velocityPressure": 52.3,
    "exposureCoefficient": 0.95,
    "directionalityFactor": 0.85,
    "groundElevationFactor": 1.0
  },
  "zone4": {
    "positive": 28.6,
    "negative": -42.9,
    "loads": { "positive": 686.4, "negative": -1029.6 }
  },
  "zone5": {
    "positive": 31.5,
    "negative": -50.2,
    "loads": { "positive": 756, "negative": -1204.8 }
  },
  "criticalPressure": { "positive": 31.5, "negative": 50.2 },
  "asce7Version": "7-22",
  "floridaBuildingCodeVersion": "2023 FBC",
  "calculatedAt": "2024-03-15T14:30:00Z",
  "warnings": [
    "Building is in HVHZ - ensure products have NOA approval",
    "High wind speed (140 mph) - verify from current ASCE 7-22 Figure 26.5-1"
  ]
}
```

---

## Calculation Workflow (7 Steps)

Guide users through this workflow in conversation:

### Step 1: County & HVHZ Status
**What to ask:** "Which Florida county is the building in?"

**What to check:**
- Is it in a High-Velocity Hurricane Zone (HVHZ)?
- Miami-Dade and Broward: Almost entirely HVHZ
- Other coastal counties: Partially HVHZ (check boundaries)
- Inland counties: Usually NOT HVHZ

**Why it matters:** HVHZ areas have higher wind speeds and require special product approvals (NOA = Notice of Acceptance)

---

### Step 2: Ultimate Wind Speed (Vult)
**What to ask:** "What is the ultimate wind speed for your location?"

**How to find it:**
- **ASCE 7-22 Figure 26.5-1** (standard map): [ASCE7 Hazards Tool](https://www.ascehazardtool.org)
- **HVHZ map** (for HVHZ areas): Florida Division of Emergency Management
- Typical HVHZ speeds: 120–150 mph
- Typical non-HVHZ speeds: 100–120 mph

**Tool:** Direct them to the ASCE 7 Hazard Tool: https://www.ascehazardtool.org

**What to explain:**
- Vult is the "ultimate" wind speed, meaning a 700-year return period
- Different from mean wind speed
- Must match their risk category (usually Category II for residential)

---

### Step 3: Exposure Category (B, C, or D)
**What to ask:** "Describe the terrain around the building (0.5 miles upwind)."

**Descriptions:**
- **Exposure B**: Urban and suburban areas, wooded areas. Most common for residential.
  - Typical for neighborhoods, tree-lined streets, established communities.
- **Exposure C**: Open terrain with scattered obstructions (grassland, scattered trees).
  - Rural areas with some trees or structures, but mostly open.
- **Exposure D**: Flat, open water or coastal flats. Least common.
  - Buildings very near ocean, sound, or large water body with minimal land features.

**Guidance:**
- When in doubt, choose "B" (more conservative for residential areas)
- Look at land use maps or Google Earth upwind of the building
- Consider obstruction height and density

---

### Step 4: Building Dimensions & Component Area
**What to ask:**
- "What is the mean roof height?" (height to eave or average ridge)
- "What are the building length and width?" (longest and shortest horizontal dimensions)
- "What is the effective wind area of the component?" (e.g., door width × height)

**Examples:**
- Single-story house, 30 ft high, 60 ft × 40 ft footprint, 36" × 80" door (24 sq ft)
- Multistory office, 45 ft high, 100 ft × 80 ft footprint, single window 4 ft × 6 ft (24 sq ft)

---

### Step 5: Calculate
**Call:** POST /api/calculate with the gathered inputs

**Interpret the results:**
- **Zone 4**: Interior areas (pressures usually lower)
- **Zone 5**: Edges and corners (pressures usually higher)
- **Critical Pressure**: Maximum positive and negative pressures the component must resist

---

### Step 6: Product Rating Comparison
**What to ask:** "What is the product's wind rating?"

**Format:**
- "Product rated +55 / –75 psf" means:
  - Positive (inward): 55 psf
  - Negative (suction/outward): 75 psf

**Rule of thumb:**
- Product **positive rating** must be ≥ calculated critical positive pressure
- Product **negative rating** must be ≥ calculated critical negative pressure (in absolute value)

**Example:**
- Calculation: +31.5 psf / –50.2 psf
- Product: +55 / –75 psf
- Result: **PASSES** (55 > 31.5 AND 75 > 50.2)

---

### Step 7: Generate Certification Letter (if passing)
**When to generate:**
- Product meets or exceeds all critical pressures
- HVHZ locations have NOA approval
- All input data is verified

**Letter includes:**
- Building address and specifications
- Wind calculation summary
- Product information and approval ratings
- Certification statement

---

## Input/Output Schemas Summary

### CalculatorInput Summary
```
county: string
isHVHZ: boolean
ultimateWindSpeed: number (85–300 mph)
exposureCategory: "B" | "C" | "D"
meanRoofHeight: number (5–200 ft)
buildingLength: number (5–1000 ft)
buildingWidth: number (5–1000 ft)
effectiveWindArea: number (1–1000 sq ft)
topographicFactor?: number (default 1.0)
riskCategory?: 1|2|3|4 (default 2)
address?: string
```

See `llm-reference.json` for complete schemas.

### CalculatorOutput Summary
```
intermediate {
  zoneEndWidth: number
  velocityPressure: number
  exposureCoefficient: number
  directionalityFactor: number
  groundElevationFactor: number
}

zone4 { positive, negative, loads { positive, negative } }
zone5 { positive, negative, loads { positive, negative } }

criticalPressure { positive, negative }
asce7Version: "7-22"
floridaBuildingCodeVersion: "2023 FBC"
calculatedAt: ISO 8601 timestamp
warnings: string[]
```

---

## HVHZ Rules (Miami-Dade & Broward)

### Miami-Dade County
- **Status**: Entire county is HVHZ
- **Wind Speed**: 140+ mph (ultimate)
- **Special Rules**:
  - All windows, doors, and cladding must have NOA (Notice of Acceptance) approval
  - Products must be tested per ASTM E1233 or equivalent
  - Some products require additional documentation (NOA letter from manufacturer)
  - Building department often requires PE-sealed wind calculations
- **Product Database**: Miami-Dade Product Approval Directory (PAD) at https://permit.miamidade.gov/

### Broward County
- **Status**: Entire county is HVHZ
- **Wind Speed**: 140+ mph (ultimate, typically 150 mph near coast)
- **Special Rules**:
  - Similar to Miami-Dade: NOA approval required
  - Broward has reciprocal recognition with Miami-Dade PAD approvals
  - Wind resistance rating must be clearly labeled on product
- **Product Database**: Broward County accepts Miami-Dade PAD or direct NOA

### Key HVHZ Warnings
- Do NOT submit products without NOA approval in HVHZ areas
- Non-HVHZ approved products will be rejected
- "Florida Approved" is not the same as "HVHZ Approved"

---

## Conversation Templates

### Template: Homeowner
```
User: "I'm replacing a door in Miami and need to know if it's wind-safe."

You: "I can help! Let me gather some information:

1. Is the door a single-story replacement (first floor)?
2. What's your wind speed? You can check the HVHZ map for Miami
   (typically 140 mph). Here's the ASCE tool: [hazards.atcouncil.org]
3. The terrain is urban (Exposure B). Does that sound right?
4. The door is 3 ft wide × 6.83 ft tall (about 20 sq ft).

Let me calculate the required pressure rating for your door."
[Call API]

"Your door must resist +52 / –78 psf. What's your product rated?"

[User provides rating]
"Great! That product PASSES (assuming it has NOA approval).
Next step: Get a certification letter for your permit."
```

### Template: Contractor
```
User: "We're doing 20 window replacements across a development in Broward."

You: "I'll need to calculate separately for each building location.
Here's what I need for EACH building:

- Building dimensions (length × width)
- Window size (width × height)
- Mean roof height
- Is the building in the developed area or near the coast?

For HVHZ (Broward), all windows MUST have NOA approval.
Let's verify each product against our calculations."
```

### Template: Architect
```
User: "I'm designing a high-rise in Palm Beach. What wind speeds apply?"

You: "For a Category II building in Palm Beach:
- Check ASCE 7-22 Figure 26.5-1 for your exact location
- Near coast: typically 120–130 mph (non-HVHZ area)
- Inland: slightly lower

For high-rise (>200 ft), you'll need:
- PE-signed calculations per ASCE 7-22
- Wind tunnel testing (may be required by code)
- Roof and wall pressure coefficients from aerodynamic analysis

This platform handles basic C&C (up to ~200 ft). For tall buildings,
consult a wind engineer."
```

---

## Common Pitfalls & Gotchas

1. **Confusing Vult with mean wind speed**
   - Vult (ultimate) is for 700-year return period
   - Much higher than average or 50-year wind speeds
   - Always use Vult from ASCE 7-22 Figure 26.5-1

2. **Forgetting HVHZ NOA requirement**
   - In Miami-Dade/Broward, a product rated at +60 / –80 psf is useless if it lacks NOA
   - Product MUST have specific Notice of Acceptance for that county

3. **Mixing up positive and negative pressure**
   - Positive = inward push (windward side)
   - Negative = outward suction (leeward side, roof edges)
   - Both must be checked; negative is often the critical constraint

4. **Wrong exposure category**
   - Choosing "C" or "D" when terrain is "B" makes calculations too conservative
   - Conversely, choosing "B" when truly "C" underestimates wind speed effects
   - Look at actual 0.5-mile upwind terrain

5. **Effective wind area confusion**
   - For a door 3 ft wide × 6.83 ft tall: area = 3 × 6.83 = 20.49 sq ft
   - Do NOT include the frame thickness; use glass/opening area
   - Smaller areas = higher pressures (concentration effect)

6. **Topographic factor (Kzt) overuse**
   - Default to 1.0 unless building is on a HILLTOP
   - "Elevated" does not mean Kzt > 1.0
   - Only use Kzt > 1.0 if topographic analysis document supports it

7. **Risk category mistakes**
   - Most residential = Category II (default 2)
   - Schools, hospitals = Category III
   - Firefighting, power plants = Category IV
   - Always verify with local building department

8. **Forgetting intermediate values**
   - Zone end width "a" = critical for understanding corner pressure zones
   - Velocity pressure (qh) = fundamental to all pressure calculations
   - Users should understand these, not just final pressures

---

## Resources

### Official Standards
- **ASCE 7-22**: https://www.asce.org/ (purchase required)
- **Florida Building Code 2023**: https://codes.iccsafe.org/
- **Florida Administrative Code 62-6.002**: HVHZ regulations

### Tools & Databases
- **ASCE Hazard Tool**: https://hazards.atcouncil.org/
- **Miami-Dade Product Approval Directory (PAD)**: https://permit.miamidade.gov/
- **Broward County Building & Safety**: https://www.broward.org/
- **Florida Division of Emergency Management (HVHZ maps)**: https://www.floridadisaster.org/

### Educational
- **Oasis Engineering DIY Guide**: https://github.com/oasiseng/diy-wind-certification-guide
- **ASCE 7 Wind Speed Map Guide**: Wind speed lookup tutorial
- **Components & Cladding (C&C) Explained**: Pressure zone definitions

---

## Disclaimer & Legal Notes

**Always include this when discussing certification:**

> This platform is designed for educational and informational purposes. While the calculations follow ASCE 7-22 Chapter 30, users should:
>
> - Verify all inputs with local building authorities
> - Consult a licensed engineer if required by jurisdiction
> - Ensure products have appropriate approvals (NOA for HVHZ)
> - Never submit calculations without PE signature if required
>
> Miami-Dade and Broward County typically require PE-sealed engineering documents for permits. This platform supports self-education but does not replace professional engineering services.
>
> See full disclaimer at: [Repository disclaimer.md]

---

## Usage Examples by Role

### For a Homeowner
1. User provides: County (Broward), address, door size (36" × 80")
2. You ask: Wind speed (look up on hazard tool), exposure category (assume B for residential)
3. You calculate and show if product passes
4. If passing, generate certification letter for permit

### For a Contractor Managing Multiple Projects
1. Create a spreadsheet: County | Address | Component Type | Dimensions
2. Run each through the calculator
3. Batch-compare product ratings
4. Flag projects needing PE involvement

### For an Architect Designing New Buildings
1. Check ASCE 7-22 Figure 26.5-1 for design wind speeds
2. Use this platform to verify cladding and fenestration design
3. For high-rise or complex geometry, recommend wind tunnel testing
4. Include calculated zone pressures in design documentation

---

## Quick Reference: How to Guide a User

```
1. Ask: County?
   └─ Check HVHZ status

2. Ask: Wind speed?
   └─ Suggest ASCE Hazard Tool

3. Ask: Exposure category?
   └─ Describe B/C/D; default to B

4. Ask: Building height, dimensions, component size?
   └─ Gather specific measurements

5. Call /api/calculate
   └─ Show zone pressures, critical pressure

6. Ask: Product rating?
   └─ Check if rating ≥ critical pressure

7. If passing:
   └─ Generate certification letter
      └─ Include NOA status for HVHZ areas
```

---

**Built for humans and AI assistants alike.**
*ASCE 7-22 Wind Certification Platform*
