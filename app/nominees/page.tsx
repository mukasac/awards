"use client";
import React, { useEffect, useState } from "react";
import { Nominee, NomineeResponse, Rating, Comment } from "@/types/interfaces";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const NomineeList: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [newComments, setNewComments] = useState<Record<number, string>>({});
  const [meta, setMeta] = useState<{
    count: number;
    pages: number;
    currentPage: number;
  }>({ count: 0, pages: 0, currentPage: 0 });

  useEffect(() => {
    const initialize = async () => {
      try {
        const [nomineesData, commentsData] = await Promise.all([
          fetchNominees(),
          fetch('/api/comments/').then(res => res.json())
        ]);

        setNominees(nomineesData.data);
        setMeta({
          count: nomineesData.count,
          pages: nomineesData.pages,
          currentPage: nomineesData.currentPage,
        });

        // Group comments by nominee ID
        const groupedComments = commentsData.data.reduce((acc: Record<number, Comment[]>, comment: Comment) => {
          acc[comment.nomineeId] = [...(acc[comment.nomineeId] || []), comment];
          return acc;
        }, {});

        setComments(groupedComments);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchNominees = async (): Promise<NomineeResponse> => {
    const response = await fetch(`/api/nominees/`);
    return response.json();
  };

  const handleAddComment = async (nomineeId: number) => {
    if (!newComments[nomineeId]?.trim()) return;

    try {
      const response = await fetch("/api/comments/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomineeId,
          content: newComments[nomineeId],
          userId: 1,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments(prev => ({
          ...prev,
          [nomineeId]: [...(prev[nomineeId] || []), newComment],
        }));
        setNewComments(prev => ({ ...prev, [nomineeId]: "" }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const renderNomineeRating = (ratings: Rating[]) => {
    if (!ratings?.length)
      return <p className={"text-red-400"}>No ratings available</p>;

    return ratings.slice(0, 2).map((rating) => (
      <div key={rating.id} className="border-t pt-2 mt-2">
        <div className="font-medium text-purple-400">
          {rating.ratingCategory.name}
        </div>
        <div className="text-sm text-gray-600">
          <p>Weight: {rating.ratingCategory.weight}%</p>
          <p>Score: {rating.score}/5</p>
        </div>
        <p className="text-sm mt-1 text-gray-500">
          {rating.ratingCategory.description}
        </p>
        <p className="text-sm mt-1 text-black">
          Evidence:
        </p>
        <div className="text-sm text-blue-400">
          {rating.evidence || "None provided"}
        </div>
      </div>
    ));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h1 className="text-3xl text-gray-600 font-bold mb-6">
            Nominees ({meta.count})
          </h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {nominees.map((nominee) => (
              <Card key={nominee.id} className="p-6 relative">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4">
                    <Image
                      src={nominee.image ? nominee.image : "/npp.png"}
                      alt={nominee.name}
                      width={96}
                      height={96}
                    />
                  </Avatar>
                  <h2 className="text-xl text-cyan-700 font-semibold mb-2">
                    <Link
                      href={`/nominees/${nominee.id}`}
                      className="hover:underline"
                    >
                      {nominee.name}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {nominee.position.name} at {nominee.institution.name}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-black mb-2">
                      Recent Ratings
                    </h3>
                    {renderNomineeRating(nominee.rating)}
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-green-400">Comments</h3>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {comments[nominee.id]?.length > 0 ? (
                        comments[nominee.id].map((comment) => (
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
                        value={newComments[nominee.id] || ""}
                        onChange={(e) =>
                          setNewComments((prev) => ({
                            ...prev,
                            [nominee.id]: e.target.value,
                          }))
                        }
                        placeholder="Add a comment..."
                        className="flex-grow"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(nominee.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleAddComment(nominee.id)}
                        variant="secondary"
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/nominees/${nominee.id}/rate`}
                  className="absolute top-4 right-4 bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 transition"
                >
                  Rate
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NomineeList;
