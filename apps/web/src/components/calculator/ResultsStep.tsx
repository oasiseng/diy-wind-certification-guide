'use client';

import { useState } from 'react';
import { calculate } from '@oasis/asce7-calculator';
import type { CalculatorOutput } from '@oasis/asce7-calculator';

interface ResultsStepProps {
  formData: any;
  onCalculationComplete: (result: CalculatorOutput) => void;
  onBack: () => void;
}

export function ResultsStep({ formData, onCalculationComplete, onBack }: ResultsStepProps) {
  const [result, setResult] = useState<CalculatorOutput | null>(null);
  const [error, setError] = useState('');
  const [showIntermediateValues, setShowIntermediateValues] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleCalculate = () => {
    try {
      const calculationInput = {
        county: formData.county,
        isHVHZ: formData.isHVHZ,
        ultimateWindSpeed: formData.ultimateWindSpeed,
        exposureCategory: formData.exposureCategory,
        meanRoofHeight: formData.meanRoofHeight,
        buildingLength: formData.buildingLength,
        buildingWidth: formData.buildingWidth,
        effectiveWindArea: formData.effectiveWindArea,
        topographicFactor: formData.topographicFactor || 1.0,
        riskCategory: formData.riskCategory as 1 | 2 | 3 | 4,
        address: formData.address,
      };

      const calculatedResult = calculate(calculationInput);
      setResult(calculatedResult);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Calculation failed. Please check your inputs.');
    }
  };

  const handleNext = () => {
    if (result) {
      onCalculationComplete(result);
    }
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm">
              Review your inputs and click Calculate to get wind pressure results.
            </p>
          </div>

          {/* Input Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">County:</span>
                <p className="text-gray-900">{formData.county}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Wind Speed:</span>
                <p className="text-gray-900">{formData.ultimateWindSpeed} mph</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Exposure Category:</span>
                <p className="text-gray-900">{formData.exposureCategory}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Roof Height:</span>
                <p className="text-gray-900">{formData.meanRoofHeight} ft</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Building Size:</span>
                <p className="text-gray-900">
                  {formData.buildingLength} ft × {formData.buildingWidth} ft
                </p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Effective Area:</span>
                <p className="text-gray-900">{formData.effectiveWindArea} sq ft</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-900 font-semibold">Error</p>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors text-lg"
          >
            Calculate Wind Pressures
          </button>
        </>
      ) : (
        <>
          <div className="bg-green-50 border border-green-300 rounded-lg p-4">
            <p className="text-green-900 font-semibold">✓ Calculation Complete</p>
            <p className="text-green-800 text-sm">
              Results calculated using ASCE 7-22 standards on{' '}
              {new Date(result.calculatedAt).toLocaleString()}
            </p>
          </div>

          {/* Critical Pressure Summary */}
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
            <h3 className="font-bold text-yellow-900 mb-3">Critical Pressure Summary</h3>
            <p className="text-yellow-800 text-sm mb-3">
              Your product must be rated for at least:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded p-3 border-2 border-yellow-300">
                <div className="text-sm font-semibold text-gray-700">Positive Pressure</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {result.criticalPressure.positive.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">psf (inward)</div>
              </div>
              <div className="bg-white rounded p-3 border-2 border-yellow-300">
                <div className="text-sm font-semibold text-gray-700">Negative Pressure</div>
                <div className="text-2xl font-bold text-yellow-900">
                  -{result.criticalPressure.negative.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">psf (outward/suction)</div>
              </div>
            </div>
          </div>

          {/* Zone Pressures */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900">Zone Pressures</h3>

            {/* Zone 4 */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">Zone 4 (Interior)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-semibold text-gray-700">Positive Pressure</div>
                  <div className="text-lg font-bold text-blue-900">
                    {result.zone4.positive.toFixed(2)} psf
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Load: {result.zone4.loads.positive.toFixed(0)} lbf
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-semibold text-gray-700">Negative Pressure</div>
                  <div className="text-lg font-bold text-red-600">
                    {result.zone4.negative.toFixed(2)} psf
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Load: {result.zone4.loads.negative.toFixed(0)} lbf
                  </div>
                </div>
              </div>
            </div>

            {/* Zone 5 (Governing) */}
            <div className="bg-red-50 rounded-lg p-4 border-2 border-red-400">
              <h4 className="font-semibold text-red-900 mb-1">
                Zone 5 (Corner/Edge) - GOVERNING ZONE
              </h4>
              <p className="text-xs text-red-700 mb-3">This is the critical zone. Design for these pressures.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-semibold text-gray-700">Positive Pressure</div>
                  <div className="text-lg font-bold text-red-900">
                    {result.zone5.positive.toFixed(2)} psf
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Load: {result.zone5.loads.positive.toFixed(0)} lbf
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-xs font-semibold text-gray-700">Negative Pressure</div>
                  <div className="text-lg font-bold text-red-600">
                    {result.zone5.negative.toFixed(2)} psf
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Load: {result.zone5.loads.negative.toFixed(0)} lbf
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intermediate Values */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowIntermediateValues(!showIntermediateValues)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>{showIntermediateValues ? '▼' : '▶'}</span>
              <span>Intermediate Calculation Values</span>
            </button>
            {showIntermediateValues && (
              <div className="mt-3 bg-gray-50 rounded-lg p-4 space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-gray-700">Kz (Exposure Coefficient):</span>
                  <span className="text-gray-900 font-semibold">
                    {result.intermediate.exposureCoefficient.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">qh (Velocity Pressure):</span>
                  <span className="text-gray-900 font-semibold">
                    {result.intermediate.velocityPressure.toFixed(2)} psf
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Kd (Directionality Factor):</span>
                  <span className="text-gray-900 font-semibold">
                    {result.intermediate.directionalityFactor.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Ke (Elevation Factor):</span>
                  <span className="text-gray-900 font-semibold">
                    {result.intermediate.groundElevationFactor.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Zone End Width (a):</span>
                  <span className="text-gray-900 font-semibold">
                    {result.intermediate.zoneEndWidth.toFixed(2)} ft
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>{showExplanation ? '▼' : '▶'}</span>
              <span>What do these numbers mean?</span>
            </button>
            {showExplanation && (
              <div className="mt-3 bg-blue-50 rounded-lg p-4 space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Positive Pressure (Inward):</p>
                  <p>
                    Wind pushing inward on the surface (e.g., pressure on the facing side of a door
                    in wind).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Negative Pressure (Suction):</p>
                  <p>
                    Wind suction pulling outward on the surface (e.g., pressure on the leeward side
                    of a door). This is often the governing load.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Zone 4 vs Zone 5:</p>
                  <p>
                    Zone 4 covers the main surface area. Zone 5 covers corners and edges where
                    pressures are higher due to wind acceleration.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Critical Pressure:</p>
                  <p>
                    The maximum pressure across all zones. Your product must be rated to withstand
                    this pressure.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
              <p className="font-semibold text-orange-900 mb-2">Warnings</p>
              <ul className="space-y-1">
                {result.warnings.map((warning, idx) => (
                  <li key={idx} className="text-orange-800 text-sm">
                    • {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Compare Product
            </button>
          </div>
        </>
      )}
    </div>
  );
}
