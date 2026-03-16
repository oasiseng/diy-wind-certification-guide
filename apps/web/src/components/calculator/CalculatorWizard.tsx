'use client';

import { useState } from 'react';
import { CalculatorInput, CalculatorOutput, ProductComparison, ExposureCategory } from '@oasis/asce7-calculator';
import { CountyStep } from './CountyStep';
import { WindSpeedStep } from './WindSpeedStep';
import { DimensionsStep } from './DimensionsStep';
import { ResultsStep } from './ResultsStep';
import { ProductCompareStep } from './ProductCompareStep';
import { LetterStep } from './LetterStep';

interface FormData {
  county: string;
  isHVHZ: boolean;
  ultimateWindSpeed: number;
  exposureCategory: ExposureCategory;
  riskCategory: 1 | 2 | 3 | 4;
  meanRoofHeight: number;
  buildingLength: number;
  buildingWidth: number;
  effectiveWindArea: number;
  topographicFactor: number;
  address?: string;
  homeownerName?: string;
  homeownerEmail?: string;
  homeownerPhone?: string;
  permitNumber?: string;
  productName?: string;
  productApprovalNumber?: string;
  productRatedPositive?: number;
  productRatedNegative?: number;
}

const STEPS = [
  { number: 1, title: 'Location', description: 'Select your county' },
  { number: 2, title: 'Wind & Exposure', description: 'Wind speed and exposure category' },
  { number: 3, title: 'Dimensions', description: 'Building dimensions' },
  { number: 4, title: 'Results', description: 'Calculation results' },
  { number: 5, title: 'Product Compare', description: 'Compare against a product' },
  { number: 6, title: 'Certification', description: 'Generate certification letter' },
];

export function CalculatorWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    county: '',
    isHVHZ: false,
    ultimateWindSpeed: 130,
    exposureCategory: 'C',
    riskCategory: 2,
    meanRoofHeight: 15,
    buildingLength: 40,
    buildingWidth: 30,
    effectiveWindArea: 50,
    topographicFactor: 1.0,
  });

  const [calculationResult, setCalculationResult] = useState<CalculatorOutput | null>(null);
  const [productComparison, setProductComparison] = useState<ProductComparison | null>(null);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormDataChange = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleCalculationComplete = (result: CalculatorOutput) => {
    setCalculationResult(result);
    handleNext();
  };

  const handleProductComparison = (comparison: ProductComparison) => {
    setProductComparison(comparison);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CountyStep
            formData={formData}
            onDataChange={handleFormDataChange}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <WindSpeedStep
            formData={formData}
            onDataChange={handleFormDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <DimensionsStep
            formData={formData}
            onDataChange={handleFormDataChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ResultsStep
            formData={formData}
            onCalculationComplete={handleCalculationComplete}
            onBack={handleBack}
          />
        );
      case 5:
        if (!calculationResult) {
          return <div>Loading calculation results...</div>;
        }
        return (
          <ProductCompareStep
            calculationResult={calculationResult}
            formData={formData}
            onDataChange={handleFormDataChange}
            onProductComparison={handleProductComparison}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 6:
        if (!calculationResult) {
          return <div>Loading...</div>;
        }
        return (
          <LetterStep
            formData={formData}
            calculationResult={calculationResult}
            productComparison={productComparison}
            onDataChange={handleFormDataChange}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-4">
        {STEPS.map((step, idx) => (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => currentStep > step.number && setCurrentStep(step.number)}
              className={`flex flex-col items-center space-y-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === step.number
                  ? 'bg-blue-100 border-2 border-blue-600'
                  : currentStep > step.number
                  ? 'bg-green-100 border-2 border-green-600 cursor-pointer'
                  : 'bg-gray-100 border-2 border-gray-300'
              }`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  currentStep === step.number
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <div className="hidden sm:block text-center">
                <div className="text-xs font-semibold text-gray-900">{step.title}</div>
                <div className="text-xs text-gray-600">{step.description}</div>
              </div>
            </button>

            {idx < STEPS.length - 1 && (
              <div
                className={`hidden md:block h-1 w-12 mx-2 ${
                  currentStep > step.number ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Step {currentStep}: {STEPS[currentStep - 1].title}
        </h2>
        <p className="text-gray-600 mt-2">{STEPS[currentStep - 1].description}</p>
      </div>

      {/* Step Content */}
      <div className="card min-h-96">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            currentStep === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Back
        </button>
        <div className="text-sm text-gray-600">
          Step {currentStep} of {STEPS.length}
        </div>
        {currentStep < 5 && (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
