'use client';

import { useState } from 'react';

interface DimensionsStepProps {
  formData: any;
  onDataChange: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function DimensionsStep({ formData, onDataChange, onNext, onBack }: DimensionsStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useAreaCalculator, setUseAreaCalculator] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleValidation = () => {
    const errors: Record<string, string> = {};

    if (!formData.meanRoofHeight || formData.meanRoofHeight < 1) {
      errors.roofHeight = 'Mean roof height must be at least 1 ft';
    }
    if (!formData.buildingLength || formData.buildingLength < 1) {
      errors.buildingLength = 'Building length must be at least 1 ft';
    }
    if (!formData.buildingWidth || formData.buildingWidth < 1) {
      errors.buildingWidth = 'Building width must be at least 1 ft';
    }
    if (!formData.effectiveWindArea || formData.effectiveWindArea < 0.1) {
      errors.windArea = 'Effective wind area must be at least 0.1 sq ft';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (handleValidation()) {
      onNext();
    }
  };

  const handleAreaWidthChange = (width: number) => {
    onDataChange({ areaWidth: width });
  };

  const handleAreaHeightChange = (height: number) => {
    onDataChange({ areaHeight: height });
    // Auto-calculate total area
    if (formData.areaWidth && height) {
      onDataChange({ effectiveWindArea: formData.areaWidth * height });
    }
  };

  return (
    <div className="space-y-6">
      {/* Mean Roof Height */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          Mean Roof Height (ft)
        </label>
        <input
          type="number"
          value={formData.meanRoofHeight}
          onChange={(e) => {
            onDataChange({ meanRoofHeight: parseFloat(e.target.value) || 0 });
            setValidationErrors((prev) => ({ ...prev, roofHeight: '' }));
          }}
          min="1"
          max="300"
          step="0.5"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            validationErrors.roofHeight
              ? 'border-red-500 focus:border-red-600'
              : 'border-gray-300 focus:border-blue-600'
          }`}
          placeholder="e.g., 15"
        />
        <p className="text-xs text-gray-600">Distance from ground to mean roof height</p>
        {validationErrors.roofHeight && (
          <p className="text-sm text-red-600 font-medium">{validationErrors.roofHeight}</p>
        )}
      </div>

      {/* Building Length */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          Building Length (ft) - Longest horizontal dimension
        </label>
        <input
          type="number"
          value={formData.buildingLength}
          onChange={(e) => {
            onDataChange({ buildingLength: parseFloat(e.target.value) || 0 });
            setValidationErrors((prev) => ({ ...prev, buildingLength: '' }));
          }}
          min="1"
          max="500"
          step="0.5"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            validationErrors.buildingLength
              ? 'border-red-500 focus:border-red-600'
              : 'border-gray-300 focus:border-blue-600'
          }`}
          placeholder="e.g., 50"
        />
        {validationErrors.buildingLength && (
          <p className="text-sm text-red-600 font-medium">{validationErrors.buildingLength}</p>
        )}
      </div>

      {/* Building Width */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          Building Width (ft) - Shortest horizontal dimension
        </label>
        <input
          type="number"
          value={formData.buildingWidth}
          onChange={(e) => {
            onDataChange({ buildingWidth: parseFloat(e.target.value) || 0 });
            setValidationErrors((prev) => ({ ...prev, buildingWidth: '' }));
          }}
          min="1"
          max="500"
          step="0.5"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            validationErrors.buildingWidth
              ? 'border-red-500 focus:border-red-600'
              : 'border-gray-300 focus:border-blue-600'
          }`}
          placeholder="e.g., 40"
        />
        {validationErrors.buildingWidth && (
          <p className="text-sm text-red-600 font-medium">{validationErrors.buildingWidth}</p>
        )}
      </div>

      {/* Effective Wind Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-900">
            Effective Wind Area (sq ft)
          </label>
          <button
            onClick={() => setUseAreaCalculator(!useAreaCalculator)}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            {useAreaCalculator ? 'Manual Entry' : 'Calculate Area'}
          </button>
        </div>

        {useAreaCalculator ? (
          <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              For doors and windows, multiply width × height
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-700 font-medium">Width (ft)</label>
                <input
                  type="number"
                  value={formData.areaWidth || ''}
                  onChange={(e) => handleAreaWidthChange(parseFloat(e.target.value) || 0)}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded mt-1 focus:border-blue-600 focus:outline-none"
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 font-medium">Height (ft)</label>
                <input
                  type="number"
                  value={formData.areaHeight || ''}
                  onChange={(e) => handleAreaHeightChange(parseFloat(e.target.value) || 0)}
                  min="0.1"
                  step="0.1"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded mt-1 focus:border-blue-600 focus:outline-none"
                  placeholder="e.g., 6.67"
                />
              </div>
            </div>
            {formData.areaWidth && formData.areaHeight && (
              <div className="mt-2 p-2 bg-white rounded border-l-4 border-blue-600">
                <p className="text-sm font-semibold text-gray-900">
                  Calculated Area: {(formData.areaWidth * formData.areaHeight).toFixed(2)} sq ft
                </p>
              </div>
            )}
          </div>
        ) : (
          <input
            type="number"
            value={formData.effectiveWindArea}
            onChange={(e) => {
              onDataChange({ effectiveWindArea: parseFloat(e.target.value) || 0 });
              setValidationErrors((prev) => ({ ...prev, windArea: '' }));
            }}
            min="0.1"
            max="5000"
            step="0.1"
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              validationErrors.windArea
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-600'
            }`}
            placeholder="e.g., 50"
          />
        )}
        <p className="text-xs text-gray-600">
          Area of the component exposed to wind (e.g., door/window width × height)
        </p>
        {validationErrors.windArea && (
          <p className="text-sm text-red-600 font-medium">{validationErrors.windArea}</p>
        )}
      </div>

      {/* Advanced Settings */}
      <div className="border-t pt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <span>{showAdvanced ? '▼' : '▶'}</span>
          <span>Advanced Settings</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Topographic Factor (Kzt)
              </label>
              <input
                type="number"
                value={formData.topographicFactor}
                onChange={(e) => onDataChange({ topographicFactor: parseFloat(e.target.value) || 1.0 })}
                min="0.8"
                max="1.5"
                step="0.05"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
              />
              <p className="text-xs text-gray-600 mt-1">
                Default: 1.0 (flat terrain). Use values &gt; 1.0 for hills, ridges, or escarpments.
              </p>
            </div>
          </div>
        )}
      </div>

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
          Next
        </button>
      </div>
    </div>
  );
}
