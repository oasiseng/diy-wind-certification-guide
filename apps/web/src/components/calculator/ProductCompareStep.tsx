'use client';

import { useState } from 'react';
import { compareProduct } from '@oasis/asce7-calculator';
import type { CalculatorOutput, ProductComparison, ProductRating } from '@oasis/asce7-calculator';

interface ProductCompareStepProps {
  calculationResult: CalculatorOutput;
  formData: any;
  onDataChange: (updates: any) => void;
  onProductComparison: (comparison: ProductComparison) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProductCompareStep({
  calculationResult,
  formData,
  onDataChange,
  onProductComparison,
  onNext,
  onBack,
}: ProductCompareStepProps) {
  const [comparison, setComparison] = useState<ProductComparison | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleValidation = () => {
    const errors: Record<string, string> = {};

    if (!formData.productName) {
      errors.productName = 'Product name is required';
    }
    if (!formData.productRatedPositive || formData.productRatedPositive <= 0) {
      errors.ratedPositive = 'Rated positive pressure is required';
    }
    if (!formData.productRatedNegative || formData.productRatedNegative <= 0) {
      errors.ratedNegative = 'Rated negative pressure is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCompare = () => {
    if (!handleValidation()) return;

    try {
      const productRating: ProductRating = {
        name: formData.productName,
        approvalNumber: formData.productApprovalNumber,
        ratedPositive: formData.productRatedPositive,
        ratedNegative: formData.productRatedNegative,
        isHVHZApproved: formData.isHVHZ ? formData.productHVHZApproved : undefined,
      };

      const result = compareProduct(calculationResult, productRating);
      setComparison(result);
      onProductComparison(result);
    } catch (err: any) {
      setValidationErrors({
        form: err.message || 'Comparison failed',
      });
    }
  };

  const handleNext = () => {
    if (comparison) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {!comparison ? (
        <>
          {/* Product Information */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.productName || ''}
                onChange={(e) => {
                  onDataChange({ productName: e.target.value });
                  setValidationErrors((prev) => ({ ...prev, productName: '' }));
                }}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  validationErrors.productName
                    ? 'border-red-500 focus:border-red-600'
                    : 'border-gray-300 focus:border-blue-600'
                }`}
                placeholder="e.g., MasterCraft Impact Door"
              />
              {validationErrors.productName && (
                <p className="text-sm text-red-600 font-medium">{validationErrors.productName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                FL Approval Number (Optional)
              </label>
              <input
                type="text"
                value={formData.productApprovalNumber || ''}
                onChange={(e) => {
                  onDataChange({ productApprovalNumber: e.target.value });
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
                placeholder="e.g., FL12345-R2"
              />
              <p className="text-xs text-gray-600 mt-1">
                Found on the product's NOA or approval document
              </p>
            </div>
          </div>

          {/* Rating Inputs */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Product Rating</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rated Positive Pressure (psf) *
                </label>
                <input
                  type="number"
                  value={formData.productRatedPositive || ''}
                  onChange={(e) => {
                    onDataChange({ productRatedPositive: parseFloat(e.target.value) || 0 });
                    setValidationErrors((prev) => ({ ...prev, ratedPositive: '' }));
                  }}
                  min="0"
                  step="0.1"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    validationErrors.ratedPositive
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-300 focus:border-blue-600'
                  }`}
                  placeholder="e.g., 55"
                />
                {validationErrors.ratedPositive && (
                  <p className="text-sm text-red-600 font-medium">{validationErrors.ratedPositive}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Rated Negative Pressure (psf) *
                </label>
                <input
                  type="number"
                  value={formData.productRatedNegative || ''}
                  onChange={(e) => {
                    onDataChange({ productRatedNegative: parseFloat(e.target.value) || 0 });
                    setValidationErrors((prev) => ({ ...prev, ratedNegative: '' }));
                  }}
                  min="0"
                  step="0.1"
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    validationErrors.ratedNegative
                      ? 'border-red-500 focus:border-red-600'
                      : 'border-gray-300 focus:border-blue-600'
                  }`}
                  placeholder="e.g., 90"
                />
                {validationErrors.ratedNegative && (
                  <p className="text-sm text-red-600 font-medium">{validationErrors.ratedNegative}</p>
                )}
              </div>
            </div>
          </div>

          {/* HVHZ NOA */}
          {formData.isHVHZ && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.productHVHZApproved || false}
                  onChange={(e) => {
                    onDataChange({ productHVHZApproved: e.target.checked });
                  }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <span className="text-sm font-semibold text-red-900">
                  Product is NOA approved for HVHZ
                </span>
              </label>
              <p className="text-xs text-red-800 ml-7 mt-2">
                HVHZ areas require Notice of Acceptance (NOA) approval for the product to be used.
              </p>
            </div>
          )}

          {validationErrors.form && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <p className="text-red-900 font-semibold text-sm">{validationErrors.form}</p>
            </div>
          )}

          {/* Required Pressures Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Required Pressures</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-blue-800">Positive:</span>
                <p className="text-lg font-bold text-blue-900">
                  {calculationResult.criticalPressure.positive.toFixed(2)} psf
                </p>
              </div>
              <div>
                <span className="text-blue-800">Negative:</span>
                <p className="text-lg font-bold text-blue-900">
                  -{calculationResult.criticalPressure.negative.toFixed(2)} psf
                </p>
              </div>
            </div>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            className="w-full px-6 py-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors text-lg"
          >
            Compare Product
          </button>
        </>
      ) : (
        <>
          {/* Comparison Result */}
          <div
            className={`rounded-lg p-6 border-2 ${
              comparison.overallPass
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">
                {comparison.overallPass ? '✓' : '✗'}
              </span>
              <div>
                <h3
                  className={`text-2xl font-bold ${
                    comparison.overallPass ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {comparison.overallPass ? 'PASS' : 'FAIL'}
                </h3>
                <p
                  className={`text-sm ${
                    comparison.overallPass ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {comparison.product.name}
                </p>
              </div>
            </div>

            {!comparison.overallPass && (
              <div className="bg-white rounded p-3 border-l-4 border-red-600 mb-4">
                <p className="text-sm text-red-900 font-semibold">
                  Product rating is insufficient. Recommended:
                </p>
                <p className="text-sm text-red-800 mt-1">
                  Positive: {comparison.requiredPressure.positive.toFixed(2)} psf |
                  Negative: {comparison.requiredPressure.negative.toFixed(2)} psf
                </p>
              </div>
            )}
          </div>

          {/* Margin Display */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Margin of Safety</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-lg p-4 ${
                comparison.margin.positive >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="text-xs font-semibold text-gray-700">Positive Pressure</p>
                <p className={`text-2xl font-bold mt-1 ${
                  comparison.margin.positive >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {comparison.margin.positive > 0 ? '+' : ''}{comparison.margin.positive.toFixed(2)} psf
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {comparison.margin.positive >= 0 ? 'Excess capacity' : 'Deficient'}
                </p>
              </div>
              <div className={`rounded-lg p-4 ${
                comparison.margin.negative >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <p className="text-xs font-semibold text-gray-700">Negative Pressure</p>
                <p className={`text-2xl font-bold mt-1 ${
                  comparison.margin.negative >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {comparison.margin.negative > 0 ? '+' : ''}{comparison.margin.negative.toFixed(2)} psf
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {comparison.margin.negative >= 0 ? 'Excess capacity' : 'Deficient'}
                </p>
              </div>
            </div>
          </div>

          {/* Zone Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Zone-by-Zone Breakdown</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="border-b pb-3">
                <p className="font-semibold text-gray-900 mb-2">Zone 4 (Interior)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded ${comparison.zone4.positivePass ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className="text-xs font-semibold text-gray-700">Positive</p>
                    <p className={`font-bold ${comparison.zone4.positivePass ? 'text-green-700' : 'text-red-700'}`}>
                      {comparison.zone4.positivePass ? '✓ PASS' : '✗ FAIL'}
                    </p>
                  </div>
                  <div className={`p-2 rounded ${comparison.zone4.negativePass ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className="text-xs font-semibold text-gray-700">Negative</p>
                    <p className={`font-bold ${comparison.zone4.negativePass ? 'text-green-700' : 'text-red-700'}`}>
                      {comparison.zone4.negativePass ? '✓ PASS' : '✗ FAIL'}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-2">Zone 5 (Corner/Edge)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-2 rounded ${comparison.zone5.positivePass ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className="text-xs font-semibold text-gray-700">Positive</p>
                    <p className={`font-bold ${comparison.zone5.positivePass ? 'text-green-700' : 'text-red-700'}`}>
                      {comparison.zone5.positivePass ? '✓ PASS' : '✗ FAIL'}
                    </p>
                  </div>
                  <div className={`p-2 rounded ${comparison.zone5.negativePass ? 'bg-green-100' : 'bg-red-100'}`}>
                    <p className="text-xs font-semibold text-gray-700">Negative</p>
                    <p className={`font-bold ${comparison.zone5.negativePass ? 'text-green-700' : 'text-red-700'}`}>
                      {comparison.zone5.negativePass ? '✓ PASS' : '✗ FAIL'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {comparison.warnings.length > 0 && (
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
              <p className="font-semibold text-orange-900 mb-2">Warnings</p>
              <ul className="space-y-1">
                {comparison.warnings.map((warning, idx) => (
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
              Generate Letter
            </button>
          </div>
        </>
      )}
    </div>
  );
}
