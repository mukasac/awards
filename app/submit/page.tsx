// app/submit/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AlertTriangle, Building, BadgeAlert } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Report Corruption
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Help expose corruption in Kenya by submitting evidence-based reports about officials or institutions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Report Official */}
        <Link href="/nominate">
          <Card className="hover:shadow-lg transition cursor-pointer h-full bg-gradient-to-br from-red-50 to-white border-red-100">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <BadgeAlert className="w-12 h-12 text-red-600" />
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <CardTitle className="text-2xl">Report Corrupt Official</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Submit evidence and documentation about corrupt practices by government officials and public servants.
              </p>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">What you can report:</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Bribery and extortion incidents
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Misuse of public resources
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Abuse of office and power
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-red-600">•</span>
                    Nepotism and favoritism cases
                  </li>
                </ul>
              </div>
              
              <div className="mt-8 pt-6 border-t border-red-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your identity stays protected</span>
                  <span className="text-red-600 font-medium">Report Now →</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Report Institution */}
        <Link href="/rate-institution">
          <Card className="hover:shadow-lg transition cursor-pointer h-full bg-gradient-to-br from-slate-50 to-white border-slate-100">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Building className="w-12 h-12 text-slate-600" />
                <AlertTriangle className="w-6 h-6 text-slate-500" />
              </div>
              <CardTitle className="text-2xl">Report Corrupt Institution</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Expose systematic corruption and malpractices within government institutions and public organizations.
              </p>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">What you can report:</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-600">•</span>
                    Systematic corruption practices
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-600">•</span>
                    Institutional policy violations
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-600">•</span>
                    Resource mismanagement
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-slate-600">•</span>
                    Service delivery failures
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Your identity stays protected</span>
                  <span className="text-slate-600 font-medium">Report Now →</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>All reports are reviewed and verified before being published.</p>
        <p>Your identity will remain confidential throughout the process.</p>
      </div>
    </div>
  );
}