// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Corruption Awards Kenya",
  description: "Rate and expose corruption in Kenya through citizen participation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Navigation */}
          <nav className="bg-slate-900 text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-xl font-bold">Corruption Free Kenya</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                  <Link href="/nominees" className="hover:text-gray-300 transition-colors">
                    Officials
                  </Link>
                  <Link href="/institutions" className="hover:text-gray-300 transition-colors">
                    Institutions
                  </Link>
                  <Link href="/leaderboard" className="hover:text-gray-300 transition-colors">
                    Leaderboard
                  </Link>
                  <Link 
                    href="/submit"
                    className="bg-white text-slate-900 px-4 py-2 rounded-md font-medium 
                             hover:bg-gray-100 transition-colors"
                  >
                    Submit
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden p-2" aria-label="Menu">
                  <svg 
                    className="h-6 w-6" 
                    fill="none" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-grow bg-gray-50">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">About</h3>
                  <p className="text-gray-300">
                    Empowering citizens to expose and rate corruption in Kenya through 
                    transparent metrics and evidence-based reporting.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/nominees" className="text-gray-300 hover:text-white transition-colors">
                        Browse Officials
                      </Link>
                    </li>
                    <li>
                      <Link href="/leaderboard" className="text-gray-300 hover:text-white transition-colors">
                        Leaderboard
                      </Link>
                    </li>
                    <li>
                      <Link href="/nominate" className="text-gray-300 hover:text-white transition-colors">
                        Submit
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/categories/bribery" className="text-gray-300 hover:text-white transition-colors">
                        Bribery
                      </Link>
                    </li>
                    <li>
                      <Link href="/categories/embezzlement" className="text-gray-300 hover:text-white transition-colors">
                        Embezzlement
                      </Link>
                    </li>
                    <li>
                      <Link href="/categories/nepotism" className="text-gray-300 hover:text-white transition-colors">
                        Nepotism
                      </Link>
                    </li>
                    <li>
                      <Link href="/categories" className="text-gray-300 hover:text-white transition-colors">
                        View All →
                      </Link>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                        Contact Us
                      </Link>
                    </li>
                    <li>
                      <Link href="/report" className="text-gray-300 hover:text-white transition-colors">
                        Report Issue
                      </Link>
                    </li>
                    <li>
                      <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                        Terms of Use
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-800">
                <p className="text-center text-gray-300">
                  © {new Date().getFullYear()} Corruption Awards Kenya. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}