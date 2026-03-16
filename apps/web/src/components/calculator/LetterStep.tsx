'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import type { CalculatorOutput, ProductComparison } from '@oasis/asce7-calculator';

interface LetterStepProps {
  formData: any;
  calculationResult: CalculatorOutput;
  productComparison: ProductComparison | null;
  onDataChange: (updates: any) => void;
  onBack: () => void;
}

export function LetterStep({
  formData,
  calculationResult,
  productComparison,
  onDataChange,
  onBack,
}: LetterStepProps) {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleValidation = () => {
    const errors: Record<string, string> = {};

    if (!formData.homeownerName) {
      errors.name = 'Homeowner name is required';
    }
    if (!disclaimerAccepted) {
      errors.disclaimer = 'You must accept the disclaimer to generate the letter';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generatePDF = () => {
    if (!handleValidation()) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;
    const leftMargin = 20;
    const rightMargin = 20;
    const maxWidth = pageWidth - leftMargin - rightMargin;

    // Title
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Wind Pressure Certification Letter', leftMargin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      leftMargin,
      yPos
    );

    yPos += 15;

    // Project Information
    doc.setFont(undefined, 'bold');
    doc.text('Project Information', leftMargin, yPos);
    yPos += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const projectInfo = [
      `Property Owner: ${formData.homeownerName || 'Not provided'}`,
      `County: ${formData.county}`,
      `Region: ${formData.county}`,
      formData.permitNumber ? `Permit Number: ${formData.permitNumber}` : null,
    ].filter(Boolean);

    projectInfo.forEach((line) => {
      doc.text(line, leftMargin, yPos);
      yPos += 5;
    });

    yPos += 5;

    // Calculation Summary
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Calculation Parameters', leftMargin, yPos);
    yPos += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    const calcParams = [
      `Ultimate Wind Speed: ${calculationResult.input.ultimateWindSpeed} mph`,
      `Exposure Category: ${calculationResult.input.exposureCategory}`,
      `Mean Roof Height: ${calculationResult.input.meanRoofHeight} ft`,
      `Building Dimensions: ${calculationResult.input.buildingLength} ft × ${calculationResult.input.buildingWidth} ft`,
      `Effective Wind Area: ${calculationResult.input.effectiveWindArea} sq ft`,
      `HVHZ: ${calculationResult.input.isHVHZ ? 'Yes' : 'No'}`,
      `ASCE Version: ${calculationResult.asce7Version}`,
      `Florida Building Code: ${calculationResult.floridaBuildingCodeVersion}`,
    ];

    calcParams.forEach((line) => {
      doc.text(line, leftMargin, yPos);
      yPos += 5;
    });

    yPos += 5;

    // Critical Pressures
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Critical Design Pressures', leftMargin, yPos);
    yPos += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text(
      `Positive (Inward): ${calculationResult.criticalPressure.positive.toFixed(2)} psf`,
      leftMargin,
      yPos
    );
    yPos += 5;
    doc.text(
      `Negative (Suction): -${calculationResult.criticalPressure.negative.toFixed(2)} psf`,
      leftMargin,
      yPos
    );
    yPos += 10;

    // Product Information (if provided)
    if (productComparison) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text('Product Evaluation', leftMargin, yPos);
      yPos += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Product: ${productComparison.product.name}`, leftMargin, yPos);
      yPos += 5;

      if (productComparison.product.approvalNumber) {
        doc.text(
          `FL Approval Number: ${productComparison.product.approvalNumber}`,
          leftMargin,
          yPos
        );
        yPos += 5;
      }

      doc.text(
        `Rated Positive: ${productComparison.product.ratedPositive} psf`,
        leftMargin,
        yPos
      );
      yPos += 5;
      doc.text(
        `Rated Negative: ${productComparison.product.ratedNegative} psf`,
        leftMargin,
        yPos
      );
      yPos += 5;

      const passStatus = productComparison.overallPass ? 'PASSES' : 'FAILS';
      doc.setFont(undefined, 'bold');
      doc.setTextColor(productComparison.overallPass ? 0 : 200);
      doc.text(`Result: ${passStatus}`, leftMargin, yPos);
      doc.setTextColor(0);
      doc.setFont(undefined, 'normal');
      yPos += 10;
    }

    // Page break if needed
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    // Disclaimer
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Disclaimer', leftMargin, yPos);
    yPos += 6;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    const disclaimerText = [
      'This certification letter is generated automatically by the Wind Certification Platform',
      'based on ASCE 7-22 standards and the calculation parameters provided.',
      '',
      'This is NOT a sealed engineering document and does NOT constitute professional',
      'engineering design or analysis. For HVHZ areas or where professional engineering',
      'is required, consult a licensed engineer.',
      '',
      'The accuracy of results depends on accurate input parameters. The user is responsible',
      'for verifying all calculation inputs match actual site and product conditions.',
      '',
      'This tool is provided as-is for informational purposes.',
    ];

    disclaimerText.forEach((line) => {
      doc.text(line, leftMargin, yPos);
      yPos += 4;
    });

    // Save
    doc.save(`Wind_Certification_${formData.county}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Homeowner Information */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Homeowner Information</h3>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.homeownerName || ''}
            onChange={(e) => {
              onDataChange({ homeownerName: e.target.value });
              setValidationErrors((prev) => ({ ...prev, name: '' }));
            }}
            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
              validationErrors.name
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-blue-600'
            }`}
            placeholder="John Smith"
          />
          {validationErrors.name && (
            <p className="text-sm text-red-600 font-medium">{validationErrors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.homeownerEmail || ''}
            onChange={(e) => onDataChange({ homeownerEmail: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.homeownerPhone || ''}
            onChange={(e) => onDataChange({ homeownerPhone: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
            placeholder="(555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Permit Number (Optional)
          </label>
          <input
            type="text"
            value={formData.permitNumber || ''}
            onChange={(e) => onDataChange({ permitNumber: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
            placeholder="Building permit number"
          />
        </div>
      </div>

      {/* Letter Preview */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Letter Preview</h3>
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 font-serif text-sm space-y-3 max-h-96 overflow-y-auto">
          <div className="text-center font-bold text-lg mb-4">
            Wind Pressure Certification Letter
          </div>

          <div className="text-xs text-gray-600">
            Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>

          <div className="font-bold">Project Information</div>
          <div className="text-xs space-y-1">
            <div>Property Owner: {formData.homeownerName || '(Not provided)'}</div>
            <div>County: {formData.county}</div>
            {formData.permitNumber && <div>Permit Number: {formData.permitNumber}</div>}
          </div>

          <div className="font-bold mt-3">Calculation Parameters</div>
          <div className="text-xs space-y-1">
            <div>Ultimate Wind Speed: {calculationResult.input.ultimateWindSpeed} mph</div>
            <div>Exposure Category: {calculationResult.input.exposureCategory}</div>
            <div>Mean Roof Height: {calculationResult.input.meanRoofHeight} ft</div>
            <div>
              Building Dimensions: {calculationResult.input.buildingLength} ft ×{' '}
              {calculationResult.input.buildingWidth} ft
            </div>
            <div>Effective Wind Area: {calculationResult.input.effectiveWindArea} sq ft</div>
          </div>

          <div className="font-bold mt-3">Critical Design Pressures</div>
          <div className="text-xs space-y-1">
            <div>
              Positive (Inward): {calculationResult.criticalPressure.positive.toFixed(2)} psf
            </div>
            <div>
              Negative (Suction): -{calculationResult.criticalPressure.negative.toFixed(2)} psf
            </div>
          </div>

          {productComparison && (
            <>
              <div className="font-bold mt-3">Product Evaluation</div>
              <div className="text-xs space-y-1">
                <div>Product: {productComparison.product.name}</div>
                <div>
                  Result: {productComparison.overallPass ? 'PASSES' : 'FAILS'} design requirements
                </div>
              </div>
            </>
          )}

          <div className="font-bold mt-3 text-xs">Disclaimer</div>
          <div className="text-xs text-gray-700 italic">
            This certification letter is generated automatically by the Wind Certification Platform
            based on ASCE 7-22 standards. This is NOT a sealed engineering document.
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={disclaimerAccepted}
            onChange={(e) => {
              setDisclaimerAccepted(e.target.checked);
              setValidationErrors((prev) => ({ ...prev, disclaimer: '' }));
            }}
            className="mt-1 w-4 h-4 rounded cursor-pointer"
          />
          <div>
            <p className="font-semibold text-orange-900">Important Disclaimer</p>
            <p className="text-orange-800 text-sm mt-1">
              I understand this is an automatically generated letter based on ASCE 7-22 calculations
              and is NOT a sealed engineering document. For HVHZ areas or where professional
              engineering is required, I will consult a licensed engineer.
            </p>
          </div>
        </label>
        {validationErrors.disclaimer && (
          <p className="text-sm text-red-600 font-medium mt-2">{validationErrors.disclaimer}</p>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={generatePDF}
        disabled={!disclaimerAccepted}
        className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-colors ${
          disclaimerAccepted
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Download PDF Letter
      </button>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Back
        </button>
        <div className="text-sm text-gray-600">
          Calculation complete. Letter ready for download.
        </div>
      </div>
    </div>
  );
}
