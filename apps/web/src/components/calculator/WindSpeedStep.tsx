'use client';

import { useState } from 'react';
import { getCounty, getMinimumWindSpeed } from '@/lib/counties';
import type { ExposureCategory } from '@oasis/asce7-calculator';

interface WindSpeedStepProps {
  formData: any;
  onDataChange: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const EXPOSURE_CATEGORIES: { id: ExposureCategory; label: string; description: string }[] = [
  {
    id: 'B',
    label: 'Exposure B',
    description: 'Urban and suburban areas with trees and buildings',
  },
  {
    id: 'C',
    label: 'Exposure C',
    description: 'Open terrain with scattered obstructions',
  },
  {
    id: 'D',
    label: 'Exposure D',
    description: 'Flat unobstructed coastal areas',
  },
];

export function WindSpeedStep({ formData, onDataChange, onNext, onBack }: WindSpeedStepProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const county = getCounty(formData.county);

  const minimumWindSpeed = county?.isHVHZ
    ? getMinimumWindSpeed(formData.county, formData.riskCategory.toString())
    : undefined;

  const minExposureCategory = county?.minimumExposureCategory;

  const handleValidation = () => {
    const errors: Record<string, string> = {};

    if (!formData.ultimateWindSpeed || formData.ultimateWindSpeed < 80) {
      errors.windSpeed = 'Wind speed must be at least 80 mph';
    }

    if (minimumWindSpeed && formData.ultimateWindSpeed < minimumWindSpeed) {
      errors.windSpeed = `HVHZ requires minimum ${minimumWindSpeed} mph for Risk Category ${formData.riskCategory}`;
    }

    if (minExposureCategory && formData.exposureCategory < minExposureCategory) {
      errors.exposure = `HVHZ requires minimum Exposure Category ${minExposureCategory}`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (handleValidation()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Wind Speed Input */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <label className="block text-sm font-semibold text-gray-900">
            Ultimate Wind Speed (mph)
          </label>
          <a
            href="https://www.asce.org/structural-engineering/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Find your wind speed →
          </a>
        </div>
        <input
          type="number"
          value={formData.ultimateWindSpeed}
          onChange={(e) => {
            onDataChange({ ultimateWindSpeed: parseFloat(e.target.value) || 0 });
            setValidationErrors((prev) => ({ ...prev, windSpeed: '' }));
          }}
          min="80"
          max="250"
          step="1"
          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
            validationErrors.windSpeed
              ? 'border-red-500 focus:border-red-600'
              : 'border-gray-300 focus:border-blue-600'
          }`}
          placeholder="Enter wind speed in mph"
        />
        {minimumWindSpeed && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-900">
            HVHZ Minimum: {minimumWindSpeed} mph (Risk Category {formData.riskCategory})
          </div>
        )}
        {validationErrors.windSpeed && (
          <p className="text-sm text-red-600 font-medium">{validationErrors.windSpeed}</p>
        )}
      </div>

      {/* Risk Category */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Risk Category
        </label>
        <select
          value={formData.riskCategory}
          onChange={(e) => {
            onDataChange({ riskCategory: parseInt(e.target.value) as 1 | 2 | 3 | 4 });
          }}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
        >
          <option value="1">Category 1 - Agricultural, temporary structures</option>
          <option value="2">Category 2 - Residential (default)</option>
          <option value="3">Category 3 - Commercial, office buildings</option>
          <option value="4">Category 4 - Emergency, essential services</option>
        </select>
        <p className="text-xs text-gray-600">Most residential buildings use Category 2</p>
      </div>

      {/* Exposure Category */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-900">
          Exposure Category
        </label>
        <div className="space-y-2">
          {EXPOSURE_CATEGORIES.map((category) => {
            const isDisabled = minExposureCategory && category.id < minExposureCategory;
            return (
              <label
                key={category.id}
                className={`flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  formData.exposureCategory === category.id
                    ? 'border-blue-600 bg-blue-50'
                    : isDisabled
                    ? 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <input
                  type="radio"
                  name="exposure"
                  value={category.id}
                  checked={formData.exposureCategory === category.id}
                  onChange={(e) => {
                    onDataChange({ exposureCategory: e.target.value as ExposureCategory });
                    setValidationErrors((prev) => ({ ...prev, exposure: '' }));
                  }}
                  disabled={isDisabled}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-gray-900">{category.label}</div>
                  <div className="text-sm text-gray-600">{category.description}</div>
                </div>
              </label>
            );
          })}
        </div>
        {validationErrors.exposure && (
          <p className="text-sm text-red-600 font-medium">{validationErrors.exposure}</p>
        )}
      </div>

      {/* HVHZ Notice */}
      {county?.isHVHZ && minExposureCategory && (
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-xl">⚠️</span>
            <div className="text-sm">
              <p className="font-semibold text-yellow-900 mb-1">HVHZ Restrictions</p>
              <p className="text-yellow-800">
                This HVHZ county requires minimum Exposure Category {minExposureCategory} and minimum wind speeds.
                These selections may be restricted.
              </p>
            </div>
          </div>
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
          Next
        </button>
      </div>
    </div>
  );
}
