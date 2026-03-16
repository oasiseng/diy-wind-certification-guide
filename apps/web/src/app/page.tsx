'use client';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mb-8">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
            Professional Engineering Tools
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Wind Certification Made Simple
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Calculate wind pressures and generate professional certifications using ASCE 7-22
          standards. Designed for engineers, architects, and contractors.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/calculator"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            Launch Calculator
          </a>
          <a
            href="#features"
            className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-header">Powerful Features</h2>
          <p className="section-subheader">
            Everything you need for accurate wind pressure calculations and certifications
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Calculate */}
            <div className="card-hover group">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Calculate Wind Pressures</h3>
              <p className="text-gray-600">
                Precise wind pressure calculations based on ASCE 7-22 standards. Accounts for
                location, building height, and exposure category.
              </p>
            </div>

            {/* Feature 2: Compare */}
            <div className="card-hover group">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Compare Products</h3>
              <p className="text-gray-600">
                Side-by-side comparison of products and designs against calculated wind pressures.
                Make informed decisions with engineering data.
              </p>
            </div>

            {/* Feature 3: Certify */}
            <div className="card-hover group">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Generate Certifications</h3>
              <p className="text-gray-600">
                Create professional PDF certifications and reports. Print or share with confidence
                using ASCE 7-22 standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section id="audience" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-header">Built for You</h2>
          <p className="section-subheader">Whether you're a professional or homeowner, we have tools for your needs</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Homeowners */}
            <div className="card">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 9l-4-4m0 0l-4 4m4-4v4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Homeowners</h3>
              <p className="text-gray-600">
                Verify your roof can withstand local wind conditions. Easy-to-understand results
                and certifications for peace of mind.
              </p>
            </div>

            {/* Contractors */}
            <div className="card">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contractors</h3>
              <p className="text-gray-600">
                Streamline your certification process. Generate professional reports in minutes,
                not hours.
              </p>
            </div>

            {/* Architects */}
            <div className="card">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Architects</h3>
              <p className="text-gray-600">
                Incorporate wind analysis into your design process. Validate designs against
                ASCE 7-22 early.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Built on Engineering Standards</h3>
          <p className="text-gray-600 mb-8">
            Our calculations comply with ASCE 7-22, the standard referenced by most building codes
            for wind pressure design.
          </p>
          <div className="inline-block px-6 py-3 bg-white border-2 border-blue-600 rounded-lg">
            <p className="font-semibold text-blue-600">ASCE 7-22 Compliant</p>
            <p className="text-sm text-gray-600">Minimum Design Loads and Associated Criteria</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Calculate Your Wind Pressures?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Get started with our professional calculator in seconds.
          </p>
          <a
            href="/calculator"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
          >
            Launch Calculator Now
          </a>
        </div>
      </section>

      {/* Partner Links Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Professional Services</h3>
          <p className="text-gray-600 mb-8">
            Looking for professional wind consulting or advanced analysis?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://windcalculations.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              Wind Calculations Services
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6h6m0 0v6m0-6L9 17"
                />
              </svg>
            </a>
            <a
              href="https://oasisengineering.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              Oasis Engineering
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-6h6m0 0v6m0-6L9 17"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
