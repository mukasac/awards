"use client"; // This ensures the page is treated as a Client Component
import React, { useEffect, useState } from "react";

// Define types for the institution, rating, position, institution, and district
import {
  Institution,
  InstitutionResponse,
  InstitutionRating,
  Comment,
} from "@/types/interfaces";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Functional component to fetch and display institutions
const InstitutionList: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State to store fetched institutions data
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  const [meta, setMeta] = useState<{
    count: number;
    pages: number;
    currentPage: number;
  }>({ count: 0, pages: 0, currentPage: 0 });

  // Function to fetch institutions data from the API
  const fetchInstitutions = async (): Promise<InstitutionResponse> => {
    const response = await fetch(`${baseUrl}institutions/`); // Replace with your actual API endpoint
    const data = await response.json();
    return data;
  };

  // Effect hook to fetch data on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        const [institutionsData, commentsData] = await Promise.all([
          fetchInstitutions(),
          fetch("/api/comments/").then((res) => res.json()),
        ]);

        setInstitutions(institutionsData.data);
        setMeta({
          count: institutionsData.count,
          pages: institutionsData.pages,
          currentPage: institutionsData.currentPage,
        });

        // Group comments by nominee ID
        const groupedComments = commentsData.data.reduce(
          (acc: Record<number, Comment[]>, comment: Comment) => {
            acc[comment.institutionId] = [
              ...(acc[comment.institutionId] || []),
              comment,
            ];
            return acc;
          },
          {},
        );

        setComments(groupedComments);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const handleAddComment = async (institutionId: number) => {
    if (!newComments[institutionId]?.trim()) return;

    try {
      const response = await fetch("/api/comments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionId,
          content: newComments[institutionId],
          userId: 1,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => ({
          ...prev,
          [institutionId]: [...(prev[institutionId] || []), newComment],
        }));
        setNewComments((prev) => ({ ...prev, [institutionId]: "" }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Render the ratings for a institution
  const renderInstitutionRating = (ratings: InstitutionRating[]) => {
    if (!ratings || ratings.length === 0) {
      return <p>No ratings available</p>;
    }

    const limitedRatings = ratings.slice(0, 2); // Limit to first two ratings

    return limitedRatings.map((rating) => (
      <div key={rating.id}>
        <hr />
        <div className={"text-black"}>{rating.ratingCategory.name}</div>
        <p>Weight: {rating.ratingCategory.weight} %</p>
        <p>Score: {rating.score}/5</p>
        <div>Description: {rating.ratingCategory.description}</div>
        <p>Evidence: {rating.evidence || "No evidence provided"}</p>
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="mb-6">
          <h1 className="text-3xl text-gray-600 font-bold">
            Institutions ({meta.count})
          </h1>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {institutions.map((institution) => (
          <div
            key={institution.id}
            className="bg-white rounded-lg shadow-md p-6 relative"
          >
            {/* Institution Name with Link */}
            <Avatar className="w-24 h-24 mb-4">
              <Image
                src={institution.image ? institution.image : "/npp.png"}
                alt={institution.name}
                width={96}
                height={96}
              />
            </Avatar>
            <h2 className="text-xl text-cyan-700 font-semibold mb-2">
              <a
                href={`/institutions/${institution.id}`}
                className="hover:underline"
              >
                {institution.name}
              </a>
            </h2>

            {/* Institution Rating */}
            <p className="text-purple-700">Most Recent Corruption Ratings</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div>{renderInstitutionRating(institution.rating)}</div>
            </div>

            {/* Votes */}
            <p className="mt-4 text-gray-900">
              Total Votes: {institution.rating.length}
            </p>

            {/* Evidence */}
            {/* <div className="mt-4  text-gray-700">
                            <p>Evidence:</p>
                            <p>{institution.rating[0].evidence || 'No evidence provided'}</p>
                        </div > */}

            {/* Rate Button */}
            <a
              href={`/institutions/${institution.id}/rate`}
              className="absolute top-4 right-4 bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 transition"
            >
              Rate
            </a>
            <div className="space-y-3">
              <h3 className="font-medium text-green-400">Comments</h3>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {comments[institution.id]?.length > 0 ? (
                  comments[institution.id].map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 p-3 rounded text-sm"
                    >
                      <p className="text-gray-900">{comment.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newComments[institution.id] || ""}
                  onChange={(e) =>
                    setNewComments((prev) => ({
                      ...prev,
                      [institution.id]: e.target.value,
                    }))
                  }
                  placeholder="Add a comment..."
                  className="flex-grow p-2 border border-gray-300 rounded text-black"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddComment(institution.id);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAddComment(institution.id)}
                  variant="secondary"
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstitutionList;
