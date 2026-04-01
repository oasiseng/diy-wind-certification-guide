'use client';

import { useState } from 'react';
import {
  generateReport,
  ProjectInput,
  ProjectReport,
  Opening,
  RoofType,
  ExposureCategory,
  RiskCategory,
} from '@oasis/asce7-calculator';
import { generatePdfReport } from '@/lib/generate-pdf-report';

type OpeningFormData = Opening & {
  id: string;
};

interface FormData {
  projectName: string;
  address: string;
  state: string;
  county: string;
  isHVHZ: boolean;
  ultimateWindSpeed: number;
  exposureCategory: ExposureCategory;
  meanRoofHeight: number;
  buildingLength: number;
  buildingWidth: number;
  riskCategory: RiskCategory;
  enclosureType: 'Enclosed' | 'Partially Enclosed';
  openings: OpeningFormData[];
  roofType?: RoofType;
  effectiveArea?: number;
  showRoof: boolean;
}

const STATES = ['FL', 'TX', 'NC', 'SC', 'LA', 'MS', 'AL', 'GA', 'VA', 'MD', 'DE', 'NJ', 'NY', 'MA', 'CT', 'RI', 'ME', 'NH', 'HI'];
const OPENING_TYPES = ['Window', 'Door', 'Sliding Door', 'Storefront', 'Fixed Window', 'Curtain Wall'];
const ROOF_TYPES: RoofType[] = [
  'Flat',
  'Gable ≤7°',
  'Gable 7-20°',
  'Gable 20-27°',
  'Gable 27-45°',
  'Hip 7-20°',
  'Hip 20-27°',
  'Monoslope ≤3°',
  'Monoslope 3-10°',
  'Monoslope 10-30°',
];

export default function ReportPage() {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    address: '',
    state: 'FL',
    county: '',
    isHVHZ: false,
    ultimateWindSpeed: 130,
    exposureCategory: 'C',
    meanRoofHeight: 15,
    buildingLength: 40,
    buildingWidth: 30,
    riskCategory: 2,
    enclosureType: 'Enclosed',
    openings: [],
    showRoof: false,
  });

  const [report, setReport] = useState<ProjectReport | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof FormData
  ) => {
    const { value, type } = e.target as HTMLInputElement;
    const newValue =
      field === 'isHVHZ'
        ? (e.target as HTMLInputElement).checked
        : field === 'ultimateWindSpeed' || field === 'meanRoofHeight' || field === 'buildingLength' || field === 'buildingWidth' || field === 'effectiveArea'
        ? parseFloat(value)
        : field === 'riskCategory'
        ? parseInt(value) as RiskCategory
        : value;

    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleOpeningChange = (
    openingId: string,
    field: keyof OpeningFormData,
    value: any
  ) => {
    setFormData((prev) => {
      const updated = prev.openings.map((o) => {
        if (o.id !== openingId) return o;
        const numericFields = ['widthInches', 'heightInches', 'floorLevel', 'zone'];
        const parsedValue = numericFields.includes(field) ? parseFloat(value) : value;
        const updatedOpening = { ...o, [field]: parsedValue };

        // Auto-update markId when type changes
        if (field === 'type') {
          updatedOpening.markId = getNextMarkId(
            value,
            prev.openings.filter((op) => op.id !== openingId)
          );
        }
        return updatedOpening;
      });
      return { ...prev, openings: updated };
    });
  };

  /** Get the next mark ID based on opening type prefix */
  const getNextMarkId = (type: string, currentOpenings: OpeningFormData[]): string => {
    const prefixMap: Record<string, string> = {
      'Window': 'W',
      'Door': 'D',
      'Sliding Door': 'SL',
      'Storefront': 'SF',
      'Fixed Window': 'FW',
      'Curtain Wall': 'CW',
    };
    const prefix = prefixMap[type] || 'W';
    const existing = currentOpenings.filter((o) =>
      o.markId.startsWith(prefix + '-')
    );
    return `${prefix}-${existing.length + 1}`;
  };

  const addOpening = (type: string = 'Window') => {
    const defaultDimensions: Record<string, { w: number; h: number }> = {
      'Window': { w: 36, h: 48 },
      'Door': { w: 36, h: 80 },
      'Sliding Door': { w: 72, h: 80 },
      'Storefront': { w: 60, h: 84 },
      'Fixed Window': { w: 48, h: 48 },
      'Curtain Wall': { w: 60, h: 96 },
    };
    const dims = defaultDimensions[type] || { w: 36, h: 48 };

    const newOpening: OpeningFormData = {
      id: `opening-${Date.now()}`,
      markId: getNextMarkId(type, formData.openings),
      type: type as Opening['type'],
      widthInches: dims.w,
      heightInches: dims.h,
      floorLevel: 1,
      zone: 4,
      manufacturer: '',
      model: '',
      flApproval: '',
      noaNumber: '',
    };
    setFormData((prev) => ({
      ...prev,
      openings: [...prev.openings, newOpening],
    }));
  };

  const removeOpening = (openingId: string) => {
    setFormData((prev) => ({
      ...prev,
      openings: prev.openings.filter((o) => o.id !== openingId),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) newErrors.projectName = 'Project name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.county.trim()) newErrors.county = 'County is required';
    if (!Number.isFinite(formData.ultimateWindSpeed) || formData.ultimateWindSpeed < 85 || formData.ultimateWindSpeed > 300) newErrors.ultimateWindSpeed = 'Wind speed must be between 85 and 300 mph';
    if (!Number.isFinite(formData.meanRoofHeight) || formData.meanRoofHeight < 5 || formData.meanRoofHeight > 60) newErrors.meanRoofHeight = 'Mean roof height must be between 5 and 60 ft';
    if (!Number.isFinite(formData.buildingLength) || formData.buildingLength < 5) newErrors.buildingLength = 'Building length must be at least 5 ft';
    if (!Number.isFinite(formData.buildingWidth) || formData.buildingWidth < 5) newErrors.buildingWidth = 'Building width must be at least 5 ft';
    if (formData.openings.length === 0) newErrors.openings = 'At least one opening is required';

    // Validate each opening has valid numeric dimensions
    formData.openings.forEach((opening, idx) => {
      if (!Number.isFinite(opening.widthInches) || opening.widthInches <= 0) {
        newErrors[`opening_${idx}_width`] = `${opening.markId}: Width must be a positive number`;
      }
      if (!Number.isFinite(opening.heightInches) || opening.heightInches <= 0) {
        newErrors[`opening_${idx}_height`] = `${opening.markId}: Height must be a positive number`;
      }
    });

    if (formData.showRoof && (!Number.isFinite(formData.effectiveArea!) || (formData.effectiveArea ?? 0) <= 0)) newErrors.effectiveArea = 'Effective area must be a positive number';
    if (formData.showRoof && !formData.roofType) newErrors.roofType = 'Roof type is required when roof section is enabled';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCalculate = () => {
    if (!validateForm()) return;

    try {
      const input: ProjectInput = {
        projectName: formData.projectName,
        address: formData.address,
        state: formData.state,
        county: formData.county,
        isHVHZ: formData.isHVHZ,
        ultimateWindSpeed: formData.ultimateWindSpeed,
        exposureCategory: formData.exposureCategory,
        meanRoofHeight: formData.meanRoofHeight,
        buildingLength: formData.buildingLength,
        buildingWidth: formData.buildingWidth,
        riskCategory: formData.riskCategory,
        enclosureType: formData.enclosureType,
        openings: formData.openings.map(({ id, ...rest }) => rest),
        ...(formData.showRoof && {
          roof: {
            roofType: formData.roofType!,
            effectiveArea: formData.effectiveArea!,
          },
        }),
      };

      const result = generateReport(input);
      setReport(result);
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error generating report. Please check your inputs and try again.');
    }
  };

  const handleGeneratePdf = () => {
    if (report) {
      generatePdfReport(report);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wind Load Report Generator</h1>
          <p className="text-lg text-gray-600">Create professional ASCE 7-22 certification reports</p>
        </div>

        {!report ? (
          <div className="space-y-8">
            {/* SECTION 1: PROJECT INFO FORM */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-600">
                Project Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange(e, 'projectName')}
                    placeholder="e.g., Residential Complex A"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.projectName && (
                    <p className="text-red-600 text-sm mt-1">{errors.projectName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange(e, 'address')}
                    placeholder="e.g., 123 Main Street"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.address && (
                    <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange(e, 'state')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    County *
                  </label>
                  <input
                    type="text"
                    value={formData.county}
                    onChange={(e) => handleInputChange(e, 'county')}
                    placeholder="e.g., Miami-Dade"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.county && (
                    <p className="text-red-600 text-sm mt-1">{errors.county}</p>
                  )}
                </div>

                {formData.state === 'FL' && (
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isHVHZ}
                        onChange={(e) => handleInputChange(e, 'isHVHZ')}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        High Velocity Hurricane Zone (HVHZ)
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-8">
                      Auto-detected for Miami-Dade and Broward counties. FBC 2023 overrides apply automatically.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Design Wind Speed (mph) *
                  </label>
                  <input
                    type="number"
                    value={formData.ultimateWindSpeed}
                    onChange={(e) => handleInputChange(e, 'ultimateWindSpeed')}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter design wind speed from ASCE 7-22 maps
                  </p>
                  {errors.ultimateWindSpeed && (
                    <p className="text-red-600 text-sm mt-1">{errors.ultimateWindSpeed}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exposure Category *
                  </label>
                  <select
                    value={formData.exposureCategory}
                    onChange={(e) => handleInputChange(e, 'exposureCategory')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="B">B - Urban/Suburban</option>
                    <option value="C">C - Open Terrain</option>
                    <option value="D">D - Shoreline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mean Roof Height (ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.meanRoofHeight}
                    onChange={(e) => handleInputChange(e, 'meanRoofHeight')}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.meanRoofHeight && (
                    <p className="text-red-600 text-sm mt-1">{errors.meanRoofHeight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Building Length (ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.buildingLength}
                    onChange={(e) => handleInputChange(e, 'buildingLength')}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.buildingLength && (
                    <p className="text-red-600 text-sm mt-1">{errors.buildingLength}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Building Width (ft) *
                  </label>
                  <input
                    type="number"
                    value={formData.buildingWidth}
                    onChange={(e) => handleInputChange(e, 'buildingWidth')}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.buildingWidth && (
                    <p className="text-red-600 text-sm mt-1">{errors.buildingWidth}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Risk Category *
                  </label>
                  <select
                    value={formData.riskCategory}
                    onChange={(e) => handleInputChange(e, 'riskCategory')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Category I</option>
                    <option value="2">Category II (Default)</option>
                    <option value="3">Category III</option>
                    <option value="4">Category IV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enclosure Type *
                  </label>
                  <select
                    value={formData.enclosureType}
                    onChange={(e) =>
                      handleInputChange(e as any, 'enclosureType')
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Enclosed">Enclosed</option>
                    <option value="Partially Enclosed">Partially Enclosed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 2: OPENINGS TABLE */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-blue-600">
                <h2 className="text-2xl font-bold text-gray-900">
                  Openings (Windows & Doors)
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => addOpening('Window')}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm"
                  >
                    + Window
                  </button>
                  <button
                    onClick={() => addOpening('Door')}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm"
                  >
                    + Door
                  </button>
                  <button
                    onClick={() => addOpening('Sliding Door')}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm"
                  >
                    + Sliding Door
                  </button>
                </div>
              </div>

              {errors.openings && (
                <p className="text-red-600 text-sm mb-4">{errors.openings}</p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Mark</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Width (in)</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Height (in)</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Floor</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Zone</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Manufacturer</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Model</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">FL#</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">NOA#</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.openings.map((opening) => (
                      <tr key={opening.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={opening.markId}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'markId', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={opening.type}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'type', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {OPENING_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={opening.widthInches}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'widthInches', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={opening.heightInches}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'heightInches', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={opening.floorLevel}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'floorLevel', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={opening.zone}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'zone', e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={opening.manufacturer}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'manufacturer', e.target.value)
                            }
                            placeholder="Optional"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={opening.model}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'model', e.target.value)
                            }
                            placeholder="Optional"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={opening.flApproval}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'flApproval', e.target.value)
                            }
                            placeholder="Optional"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={opening.noaNumber}
                            onChange={(e) =>
                              handleOpeningChange(opening.id, 'noaNumber', e.target.value)
                            }
                            placeholder="Optional"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeOpening(opening.id)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3: ROOF C&C (Optional, Collapsible) */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <button
                onClick={() =>
                  setFormData((prev) => ({ ...prev, showRoof: !prev.showRoof }))
                }
                className="w-full px-8 py-6 text-left bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-600 hover:bg-blue-100 transition-colors flex justify-between items-center"
              >
                <h2 className="text-2xl font-bold text-gray-900">
                  Roof C&C (Coefficients & Cladding) - Optional
                </h2>
                <span className="text-2xl font-bold text-blue-600">
                  {formData.showRoof ? '−' : '+'}
                </span>
              </button>

              {formData.showRoof && (
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Roof Type
                      </label>
                      <select
                        value={formData.roofType || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            roofType: e.target.value as RoofType,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a roof type</option>
                        {ROOF_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Effective Area (sq ft)
                      </label>
                      <input
                        type="number"
                        value={formData.effectiveArea || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            effectiveArea: parseFloat(e.target.value),
                          }))
                        }
                        min="0"
                        placeholder="e.g., 100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.effectiveArea && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.effectiveArea}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: CALCULATE BUTTON */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-bold text-lg transition-colors transform hover:scale-105"
              >
                Calculate Wind Pressures & Generate Report
              </button>
            </div>
          </div>
        ) : (
          /* SECTION 5: RESULTS DISPLAY */
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setReport(null)}
              className="text-blue-600 hover:text-blue-800 font-semibold text-lg mb-4"
            >
              ← Back to Form
            </button>

            {/* Results Summary */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-600">
                Calculation Results
              </h2>

              {/* Common Factors */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Common Factors</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Kd (Directionality)', value: report.commonFactors.kd },
                    { label: 'Kz (Exposure)', value: report.commonFactors.kzRoof },
                    { label: 'Kzt (Topographic)', value: report.commonFactors.kzt },
                    { label: 'Ke (Elevation)', value: report.commonFactors.ke },
                    { label: 'qh (Velocity Press.)', value: `${report.commonFactors.qh.toFixed(2)} psf` },
                    { label: 'GCpi (Pressure Coeff.)', value: report.commonFactors.gcpiPositive.toFixed(2) },
                    { label: 'Zone End Width a', value: `${report.commonFactors.zoneEndWidth.toFixed(1)} ft` },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 uppercase font-semibold">
                        {item.label}
                      </p>
                      <p className="text-lg font-bold text-blue-600 mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opening Schedule */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Opening Schedule</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300">Mark</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300">Type</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300">Size</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300">Area (sqft)</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300">Zone</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300">+DP (psf)</th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300">-DP (psf)</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300">FL#</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300">NOA#</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.openingResults.map((result, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900 border border-gray-300">{result.opening.markId}</td>
                          <td className="px-4 py-3 text-gray-700 border border-gray-300">{result.opening.type}</td>
                          <td className="px-4 py-3 text-gray-700 border border-gray-300">
                            {result.opening.widthInches.toFixed(0)}" × {result.opening.heightInches.toFixed(0)}"
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-700 border border-gray-300">
                            {result.effectiveWindArea.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-gray-700 border border-gray-300">
                            {result.opening.zone}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600 border border-gray-300">
                            {result.designPressurePositive.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-red-600 border border-gray-300">
                            {result.designPressureNegative.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-gray-700 border border-gray-300 text-xs">
                            {result.opening.flApproval || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-700 border border-gray-300 text-xs">
                            {result.opening.noaNumber || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Roof Pressures (if applicable) */}
              {report.roofResults && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Roof C&C Pressures</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-300">Zone</th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300">
                            +DP (psf)
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-gray-700 border border-gray-300">
                            -DP (psf)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3].map((zone) => (
                          <tr key={`roof-${zone}`} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-gray-900 border border-gray-300">
                              Zone {zone}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-blue-600 border border-gray-300">
                              {(report.roofResults as any)[`zone${zone}`]?.positive?.toFixed(2) || '-'}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-red-600 border border-gray-300">
                              {(report.roofResults as any)[`zone${zone}`]?.negative?.toFixed(2) || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {report.warnings && report.warnings.length > 0 && (
                <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">Warnings</h3>
                  <ul className="space-y-2">
                    {report.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-yellow-800">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Generate PDF Button */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <button
                onClick={handleGeneratePdf}
                className="w-full bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-bold text-lg transition-colors transform hover:scale-105"
              >
                Download PDF Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
