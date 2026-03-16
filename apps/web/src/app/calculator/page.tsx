'use client';

import { CalculatorWizard } from '@/components/calculator/CalculatorWizard';

export default function CalculatorPage() {
  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CalculatorWizard />
      </div>
    </div>
  );
}
