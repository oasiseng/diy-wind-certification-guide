import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wind Certification Platform | Oasis Engineering',
  description: 'Calculate wind pressures and generate certifications using ASCE 7-22 standards. Simple, accurate, professional.',
  keywords: ['wind pressure', 'ASCE 7-22', 'wind certification', 'engineering calculator'],
  openGraph: {
    title: 'Wind Certification Platform | Oasis Engineering',
    description: 'Calculate wind pressures and generate certifications using ASCE 7-22 standards.',
    url: 'https://windcertifications.oasis.com',
    siteName: 'Wind Certification Platform',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wind Certification Platform | Oasis Engineering',
    description: 'Calculate wind pressures and generate certifications using ASCE 7-22 standards.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">W</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Wind Certification</h1>
                    <p className="text-xs text-gray-500">Powered by ASCE 7-22</p>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                  <a
                    href="/calculator"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Calculator
                  </a>
                  <a
                    href="/report"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Wind Load Report
                  </a>
                  <a
                    href="#guide"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Guide
                  </a>
                  <a
                    href="#about"
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    About
                  </a>
                </div>

                {/* CTA Button */}
                <div className="hidden md:block">
                  <a
                    href="/calculator"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </a>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button className="text-gray-700 hover:text-blue-600">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Brand */}
                <div>
                  <h3 className="text-lg font-bold mb-2">Wind Certification Platform</h3>
                  <p className="text-gray-400 text-sm">
                    Professional wind pressure calculations and certifications based on ASCE 7-22 standards.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="/calculator"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Wind Calculator
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Documentation
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        FAQ
                      </a>
                    </li>
                  </ul>
                </div>

                {/* External Links */}
                <div>
                  <h4 className="font-semibold mb-4">Partners</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      <a
                        href="https://windcalculations.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Wind Calculations
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://oasisengineering.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        Oasis Engineering
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer Bottom */}
              <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 text-sm">
                  &copy; 2024 Oasis Engineering. All rights reserved.
                </p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Privacy
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Terms
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
