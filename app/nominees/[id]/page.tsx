"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import { Nominee } from "@/types/interfaces";
import { Avatar } from "@/components/ui/avatar";
import Image from 'next/image';
import { useParams } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function NomineePage() {
 const params = useParams();
 const id = params.id as string;
 const [nominee, setNominee] = useState<Nominee | null>(null);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   if (id) {
     const fetchNominee = async () => {
       try {
         const response = await fetch(`${baseUrl}nominees/${id}/`);
         if (!response.ok) {
           throw new Error("Failed to fetch nominee data.");
         }
         const data = await response.json();
         setNominee(data);
       } catch (err) {
         if (err instanceof Error) {
           setError(err.message);
         } else {
           setError("An unknown error occurred");
         }
       }
     };

     fetchNominee();
   }
 }, [id]);

 if (error) {
   return (
     <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="bg-red-100 text-red-800 rounded-lg p-4">
         <p>Error: {error}</p>
       </div>
     </div>
   );
 }

 if (!nominee) {
   return (
     <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="bg-white rounded-lg shadow-lg p-6">
         <h1 className="text-2xl text-gray-500">Loading...</h1>
       </div>
     </div>
   );
 }

 const weightedScore = nominee.rating.reduce((acc, curr) => acc + curr.score, 0) / nominee.rating.length;

 return (
   <div className="max-w-7xl mx-auto px-4 py-8">
     <Card>
       <CardHeader>
         <div className="flex justify-between items-start">
           <div>
             <Avatar className="w-24 h-24 mb-4">
               <Image
                 src={nominee.image ? nominee.image : "/npp.png"}
                 alt={nominee.name}
                 width={96}
                 height={96}
               />
             </Avatar>
             <h1 className="text-3xl text-cyan-900 font-bold">{nominee.name}</h1>
             <p className="text-xl text-gray-600">{nominee.position.name}</p>
             <p className="text-gray-500">{nominee.institution.name}</p>
           </div>
           <div>
             <Badge variant={nominee.status ? "success" : "warning"}>
               {nominee.status ? "APPROVED" : "PENDING"}
             </Badge>
             <div className="mt-2 text-right">
               <span className="text-2xl font-bold text-blue-600">
                 {weightedScore.toFixed(2)}
               </span>
               <span className="text-gray-500">/5.0</span>
             </div>
           </div>
         </div>
       </CardHeader>
       <CardContent>
         <div className="space-y-6">
           <div>
             <h2 className="text-xl font-bold text-gray-500 mb-4">Evidence</h2>
             <p className="text-gray-600">{nominee.evidence || "No Submitted Evidence available."}</p>
           </div>

           <div>
             <h2 className="text-xl text-gray-500 font-bold mb-4">Corruption Metrics</h2>
             <div className="grid gap-4 md:grid-cols-2">
               {nominee.rating.map((rating) => (
                 <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-medium text-gray-500">{rating.ratingCategory.name}</span>
                     <span className="text-blue-600 font-bold">
                       {rating.score.toFixed(1)}/5.0
                     </span>
                   </div>
                   <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                       className="bg-blue-600 rounded-full h-2"
                       style={{ width: `${(rating.score / 5) * 100}%` }}
                     />
                   </div>
                 </div>
               ))}
             </div>
           </div>

           <div>
             <h2 className="text-xl text-gray-500 font-bold mb-4">Vote Count</h2>
             <p className="text-2xl font-bold text-gray-900">
               {nominee.rating.length?.toLocaleString() || 0} votes
             </p>
           </div>
           
           {/* Rate Button */}
           <div className="flex justify-end">
             <a 
               href={`/nominees/${nominee.id}/rate`}
               className="bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 transition"
             >
               Rate
             </a>
           </div>
         </div>
       </CardContent>
     </Card>
   </div>
 );
}