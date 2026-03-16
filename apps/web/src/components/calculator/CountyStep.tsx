'use client';

import { useState, useMemo } from 'react';
import { getAllCounties, getCounty } from '@/lib/counties';
import type { FloridaCounty } from '@/lib/counties';

interface CountyStepProps {
  formData: any;
  onDataChange: (updates: any) => void;
  onNext: () => void;
}

export function CountyStep({ formData, onDataChange, onNext }: CountyStepProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  const allCounties = getAllCounties();
  const selectedCounty = useMemo(() => {
    return formData.county ? getCounty(formData.county) : null;
  }, [formData.county]);

  const filteredCounties = useMemo(() => {
    if (!searchTerm) return allCounties;
    const lowerSearch = searchTerm.toLowerCase();
    return allCounties.filter((county) =>
      county.name.toLowerCase().includes(lowerSearch)
    );
  }, [searchTerm, allCounties]);

  const handleCountySelect = (county: FloridaCounty) => {
    onDataChange({
      county: county.name,
      isHVHZ: county.isHVHZ,
    });
    setIsDropdownOpen(false);
    setSearchTerm('');
    setValidationError('');
  };

  const handleNext = () => {
    if (!formData.county) {
      setValidationError('Please select a county');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* County Search */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-900">
          Select Your County
        </label>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-lg hover:border-blue-400 focus:outline-none focus:border-blue-600 transition-colors"
          >
            <span className={formData.county ? 'text-gray-900' : 'text-gray-500'}>
              {formData.county || 'Choose a county...'}
            </span>
            <span className="absolute right-4 top-3 text-gray-500">
              {isDropdownOpen ? '▲' : '▼'}
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50">
              <input
                type="text"
                placeholder="Search counties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none"
              />
              <div className="max-h-64 overflow-y-auto">
                {filteredCounties.length === 0 ? (
                  <div className="px-4 py-3 text-gray-500 text-center">No counties found</div>
                ) : (
                  filteredCounties.map((county) => (
                    <button
                      key={county.name}
                      onClick={() => handleCountySelect(county)}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        formData.county === county.name ? 'bg-blue-100 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{county.name}</div>
                      <div className="text-xs text-gray-500">{county.region}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        {validationError && (
          <p className="text-sm text-red-600 font-medium">{validationError}</p>
        )}
      </div>

      {/* Selected County Info */}
      {selectedCounty && (
        <div className="space-y-4 pt-4">
          {/* HVHZ Warning */}
          {selectedCounty.isHVHZ && (
            <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-red-900 mb-1">
                    High-Velocity Hurricane Zone (HVHZ)
                  </h3>
                  <p className="text-red-800 text-sm mb-3">
                    {selectedCounty.name} is in a High-Velocity Hurricane Zone. Special requirements apply.
                  </p>
                  <div className="bg-white rounded p-3 text-sm space-y-2">
                    <div>
                      <span className="font-semibold text-gray-900">Minimum Wind Speeds:</span>
                      {selectedCounty.hvhzMinimumWindSpeeds && (
                        <div className="text-gray-700 mt-1 ml-2">
                          {Object.entries(selectedCounty.hvhzMinimumWindSpeeds).map(([category, speed]) => (
                            <div key={category}>Risk Category {category}: {speed} mph</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedCounty.minimumExposureCategory && (
                      <div>
                        <span className="font-semibold text-gray-900">Minimum Exposure Category:</span>
                        <div className="text-gray-700 ml-2">{selectedCounty.minimumExposureCategory}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* County Info Card */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm font-semibold text-gray-700">Region:</span>
              <p className="text-gray-900">{selectedCounty.region}</p>
            </div>

            <div>
              <span className="text-sm font-semibold text-gray-700">DIY Packages:</span>
              <p className={`${selectedCounty.acceptsDIYPackages ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}`}>
                {selectedCounty.acceptsDIYPackages ? 'Accepted' : 'Not Accepted'}
              </p>
            </div>

            <div>
              <span className="text-sm font-semibold text-gray-700">Professional Review:</span>
              <p className={`${selectedCounty.requiresEngineerStamp ? 'text-red-700 font-semibold' : 'text-green-700 font-semibold'}`}>
                {selectedCounty.requiresEngineerStamp ? 'Required' : 'Not Required'}
              </p>
            </div>

            {selectedCounty.buildingDeptUrl && (
              <div>
                <span className="text-sm font-semibold text-gray-700">Building Department:</span>
                <a
                  href={selectedCounty.buildingDeptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  Visit Website
                </a>
              </div>
            )}

            {selectedCounty.buildingDeptPhone && (
              <div>
                <span className="text-sm font-semibold text-gray-700">Contact:</span>
                <p className="text-gray-900 text-sm">{selectedCounty.buildingDeptPhone}</p>
              </div>
            )}

            {selectedCounty.notes && (
              <div>
                <span className="text-sm font-semibold text-gray-700">Notes:</span>
                <p className="text-gray-700 text-sm">{selectedCounty.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleNext}
          disabled={!formData.county}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            formData.county
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
