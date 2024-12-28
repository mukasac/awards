"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
import { Institution } from "@/types/interfaces";
import { useParams } from 'next/navigation';

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function InstitutionPage() {
 const params = useParams();
 const id = params.id as string;
 const [institution, setInstitution] = useState<Institution | null>(null);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
   if (id) {
     const fetchInstitution = async () => {
       try {
         const response = await fetch(`${baseUrl}institutions/${id}/`);
         if (!response.ok) {
           throw new Error("Failed to fetch institution data.");
         }
         const data = await response.json();
         setInstitution(data);
       } catch (err) {
         if (err instanceof Error) {
           setError(err.message);
         } else {
           setError("An unknown error occurred");
         }
       }
     };

     fetchInstitution();
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

 if (!institution) {
   return (
     <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="bg-white rounded-lg shadow-lg p-6">
         <h1 className="text-2xl text-gray-500">Loading...</h1>
       </div>
     </div>
   );
 }

 const weightedScore =
   institution.rating.reduce((acc, curr) => acc + curr.score, 0) /
   institution.rating.length;

 return (
   <div className="max-w-7xl mx-auto px-4 py-8">
     <Card>
       <CardHeader>
         <div className="flex justify-between items-start">
           <div>
             <h1 className="text-3xl text-cyan-900 font-bold">
               {institution.name}
             </h1>
           </div>
           <div>
             <Badge variant={institution.status ? "success" : "warning"}>
               {institution.status ? "APPROVED" : "PENDING"}
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
             {institution.rating && institution.rating.length > 0 ? (
               <p className="text-gray-600">
                 {institution.rating[0].evidence || "No Submitted Evidence available."}
               </p>
             ) : (
               <p className="text-gray-600">No ratings available.</p>
             )}
           </div>

           <div>
             <h2 className="text-xl text-gray-500 font-bold mb-4">
               Corruption Metrics
             </h2>
             <div className="grid gap-4 md:grid-cols-2">
               {institution.rating.map((rating) => (
                 <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-medium text-gray-500">
                       {rating.ratingCategory.name}
                     </span>
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
               {institution.rating.length?.toLocaleString() || 0} votes
             </p>
           </div>
           
           <div className="flex justify-end">
             <a 
               href={`/institutions/${institution.id}/rate`}
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