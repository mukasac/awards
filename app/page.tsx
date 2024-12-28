// app/page.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronRight, Users, Award, AlertTriangle, Search, X } from 'lucide-react';
import Link from "next/link";

interface Rating {
  score: number;
  ratingCategory: {
    name: string;
    weight: number;
  };
}

interface Nominee {
  id: number;
  name: string;
  position: {
    name: string;
  };
  institution: {
    name: string;
  };
  rating: Rating[];
}

interface Institution {
  id: number;
  name: string;
  rating: Rating[];
}

const MOCK_NOMINEES = [
  {
    id: 1,
    name: "John Doe",
    position: { name: "County Executive" },
    institution: { name: "Nairobi County" },
    rating: [{ score: 4.5, ratingCategory: { name: "Bribery", weight: 30 } }]
  },
  {
    id: 2,
    name: "Jane Smith",
    position: { name: "Director" },
    institution: { name: "Ministry of Finance" },
    rating: [{ score: 4.2, ratingCategory: { name: "Bribery", weight: 30 } }]
  },
  {
    id: 3,
    name: "Peter Kamau",
    position: { name: "Chief Officer" },
    institution: { name: "KRA" },
    rating: [{ score: 4.0, ratingCategory: { name: "Bribery", weight: 30 } }]
  },
  {
    id: 4,
    name: "Mary Wanjiku",
    position: { name: "Minister" },
    institution: { name: "Ministry of Education" },
    rating: [{ score: 3.9, ratingCategory: { name: "Bribery", weight: 30 } }]
  }
];

const MOCK_INSTITUTIONS = [
  {
    id: 1,
    name: "Kenya Revenue Authority",
    rating: [{ score: 4.7, ratingCategory: { name: "Bribery", weight: 30 } }]
  },
  {
    id: 2,
    name: "Ministry of Health",
    rating: [{ score: 4.5, ratingCategory: { name: "Bribery", weight: 30 } }]
  },
  {
    id: 3,
    name: "Kenya Police Service",
    rating: [{ score: 4.3, ratingCategory: { name: "Bribery", weight: 30 } }]
  },
  {
    id: 4,
    name: "Nairobi County Government",
    rating: [{ score: 4.1, ratingCategory: { name: "Bribery", weight: 30 } }]
  }
];

export default function Home() {
  const [topNominees, setTopNominees] = useState<Nominee[]>([]);
  const [topInstitutions, setTopInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    nominees: Nominee[];
    institutions: Institution[];
  }>({ nominees: [], institutions: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setTopNominees(MOCK_NOMINEES);
    setTopInstitutions(MOCK_INSTITUTIONS);
    setIsLoading(false);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults({ nominees: [], institutions: [] });
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    const filteredNominees = MOCK_NOMINEES.filter(nominee => 
      nominee.name.toLowerCase().includes(query.toLowerCase()) ||
      nominee.position.name.toLowerCase().includes(query.toLowerCase()) ||
      nominee.institution.name.toLowerCase().includes(query.toLowerCase())
    );

    const filteredInstitutions = MOCK_INSTITUTIONS.filter(institution =>
      institution.name.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults({ 
      nominees: filteredNominees,
      institutions: filteredInstitutions
    });
    setIsSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults({ nominees: [], institutions: [] });
    setShowResults(false);
  };

  const calculateAverageRating = (ratings: Rating[]) => {
    if (!ratings.length) return 0;
    return (ratings.reduce((acc, curr) => acc + curr.score, 0) / ratings.length).toFixed(1);
  };

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Exposing Corruption in Kenya
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300">
              Join thousands of citizens in rating and exposing corruption through transparent, evidence-based reporting.
            </p>

            {/* Search Box */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              {searchQuery && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
              <input
                type="text"
                placeholder="Search for officials or institutions..."
                className="block w-full pl-10 pr-10 py-4 rounded-lg bg-white text-slate-900 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Search Results */}
            {showResults && searchQuery.length >= 2 && (
              <div className="absolute left-0 right-0 max-w-3xl mx-auto px-4 z-50">
                <div className="bg-white rounded-lg shadow-xl text-slate-900 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center">Searching...</div>
                  ) : (
                    <>
                      {searchResults.nominees.length === 0 && searchResults.institutions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No results found</div>
                      ) : (
                        <>
                          {searchResults.nominees.length > 0 && (
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-700 mb-3">Officials</h3>
                              <div className="space-y-2">
                                {searchResults.nominees.map(nominee => (
                                  <a
                                    key={nominee.id}
                                    href={`/nominees/${nominee.id}`}
                                    className="block p-3 hover:bg-gray-50 rounded border border-gray-100"
                                  >
                                    <div className="font-medium">{nominee.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {nominee.position.name} at {nominee.institution.name}
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {searchResults.institutions.length > 0 && (
                            <div className="p-4 border-t">
                              <h3 className="font-semibold text-gray-700 mb-3">Institutions</h3>
                              <div className="space-y-2">
                                {searchResults.institutions.map(institution => (
                                  <a
                                    key={institution.id}
                                    href={`/institutions/${institution.id}`}
                                    className="block p-3 hover:bg-gray-50 rounded border border-gray-100"
                                  >
                                    <div className="font-medium">{institution.name}</div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Single Report Button */}
            <div className="flex">
              <a 
                href="/submit" 
                className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                Report Corruption
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 mb-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">2,547</div>
              <div className="text-sm text-gray-600">Corrupt Officials</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">312</div>
              <div className="text-sm text-gray-600">Institutions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">15,832</div>
              <div className="text-sm text-gray-600">Total Ratings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">8,945</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Report Corruption Card */}
          <Card className="hover:shadow-lg transition bg-gradient-to-br from-red-50 to-white">
            <CardHeader>
              <AlertTriangle className="w-12 h-12 text-red-600" />
              <CardTitle>Report Corruption</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Submit evidence-based reports about corrupt officials and institutions. Help expose corruption in Kenya.
              </p>
              <a href="/submit" className="text-slate-900 font-medium flex items-center group">
                Start Reporting
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>

          {/* Leaderboard Card */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <Award className="w-12 h-12 text-purple-600" />
              <CardTitle>Corruption Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View the most corrupt officials and institutions ranked by evidence and citizen ratings.
              </p>
              <a href="/leaderboard" className="text-slate-900 font-medium flex items-center group">
                View Rankings
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
              </a>
            </CardContent>
          </Card>

          {/* Browse Card */}
          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <Users className="w-12 h-12 text-blue-600" />
              <CardTitle>Browse Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explore detailed corruption metrics and evidence for both officials and institutions.
              </p>
              <div className="flex gap-4">
                <Link href="/nominees" className="text-slate-900 font-medium flex items-center group">
                  Officials
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </Link>
                <Link href="/institutions" className="text-slate-900 font-medium flex items-center group">
                  Institutions
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Rated Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Top Nominees */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Most Corrupt Officials</h2>
              <a href="/leaderboard?tab=officials" className="text-blue-600 hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                topNominees.map((nominee) => (
                  <a 
                    key={nominee.id}
                    href={`/nominees/${nominee.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{nominee.name}</h3>
                        <p className="text-sm text-gray-600">
                          {nominee.position.name} at {nominee.institution.name}
                        </p>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {calculateAverageRating(nominee.rating)}/5
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* Top Institutions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Most Corrupt Institutions</h2>
              <a href="/leaderboard?tab=institutions" className="text-blue-600 hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                topInstitutions.map((institution) => (
                  <a 
                    key={institution.id}
                    href={`/institutions/${institution.id}`}
                    className="block p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900">{institution.name}</h3>
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {calculateAverageRating(institution.rating)}/5
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}