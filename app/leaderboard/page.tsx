"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Medal } from "lucide-react";
import Image from 'next/image';

// Define interfaces if not already imported from @/types/interfaces
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
    averageRating?: number;
}

interface Institution {
    id: number;
    name: string;
    rating: Rating[];
    averageRating?: number;
}

const LeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('officials');
    const [nominees, setNominees] = useState<Nominee[]>([]);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/nominees/').then(res => res.json()),
            fetch('/api/institutions/').then(res => res.json())
        ]).then(([nomineesData, institutionsData]) => {
            // Calculate average rating for nominees
            const rankedNominees = nomineesData.data
              .map((nominee: Nominee) => ({
                ...nominee,
                averageRating: nominee.rating.reduce(
                  (acc: number, r: Rating) => acc + r.score * (r.ratingCategory.weight / 100),
                  0,
                ),
              }))
              .sort((a: Nominee, b: Nominee) => (b.averageRating || 0) - (a.averageRating || 0));

            // Calculate average rating for institutions
            const rankedInstitutions = institutionsData.data
                .map((institution: Institution) => ({
                    ...institution,
                    averageRating: institution.rating.reduce((acc: number, r: Rating) =>
                        acc + (r.score * (r.ratingCategory.weight / 100)), 0)
                }))
                .sort((a: Institution, b: Institution) => (b.averageRating || 0) - (a.averageRating || 0));

            setNominees(rankedNominees);
            setInstitutions(rankedInstitutions);
            setIsLoading(false);
        });
    }, []);

    const getMedalColor = (index: number) => {
        switch(index) {
            case 0: return "text-yellow-500"; // Gold
            case 1: return "text-gray-400";   // Silver
            case 2: return "text-amber-600";  // Bronze
            default: return "text-gray-300";  // Others
        }
    };

    const RankingItem = ({
        index,
        name,
        rating,
        subtitle,
        avatar
    }: {
        index: number;
        name: string;
        rating: number;
        subtitle?: string;
        avatar?: boolean;
    }) => (
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-8">
                {index <= 2 ? (
                    <Medal className={`w-6 h-6 ${getMedalColor(index)}`} />
                ) : (
                    <span className="text-lg font-semibold text-gray-500">{index + 1}</span>
                )}
            </div>

            {avatar && (
              <Avatar className="w-12 h-12">
                  <Image
                    src={`/api/placeholder/${index}`}
                    alt={name}
                    width={48}
                    height={48}
                  />
              </Avatar>
            )}

            <div className="flex-grow">
                <h3 className="font-semibold text-gray-900">{name}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>

            <div className="text-right">
                <div className="font-semibold text-cyan-700">
                    {rating.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                    Average Rating
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            Loading...
        </div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Corruption Leaderboard</h1>

            <div className="space-y-6">
                {/* Tab Buttons */}
                <div className="flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('officials')}
                        className={`pb-4 px-4 font-medium ${
                            activeTab === 'officials'
                                ? 'border-b-2 border-cyan-700 text-cyan-700'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Officials
                    </button>
                    <button
                        onClick={() => setActiveTab('institutions')}
                        className={`pb-4 px-4 font-medium ${
                            activeTab === 'institutions'
                                ? 'border-b-2 border-cyan-700 text-cyan-700'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Institutions
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    {activeTab === 'officials' ? (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                {nominees.map((nominee, index) => (
                                    <RankingItem
                                        key={nominee.id}
                                        index={index}
                                        name={nominee.name}
                                        rating={nominee.averageRating || 0}
                                        subtitle={`${nominee.position.name} at ${nominee.institution.name}`}
                                        avatar={true}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6 space-y-4">
                                {institutions.map((institution, index) => (
                                    <RankingItem
                                        key={institution.id}
                                        index={index}
                                        name={institution.name}
                                        rating={institution.averageRating || 0}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;