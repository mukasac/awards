"use client";
import { useState, useEffect } from "react";
import { RatingCategory } from "@/types/interfaces";
import { useRouter } from "next/navigation";
// import { PlusCircle } from 'lucide-react';
import { uploadImage } from "@/services/uploadService";

interface NewInstitution {
  name: string;
  evidence: string;
  image: string;
}

export default function CreateInstitutionPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<RatingCategory[]>([]);
  const [ratings, setRatings] = useState<{
    ratingCategoryId: number;
    score: number;
    severity: number;
    evidence: string;
  }[]>([]);
  const [institutionName, setInstitutionName] = useState<string>("");
  const [institutionEvidence, setInstitutionEvidence] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newInstitution, setNewInstitution] = useState<NewInstitution>({
    name: '',
    evidence: '',
    image: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const categoriesRes = await fetch("/api/rating-categories/");
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories. Please refresh the page.");
      }
    }

    fetchData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstitution.name.trim()) return;

    try {
      const response = await fetch('/api/institutions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstitution),
      });

      if (response.ok) {
        const data = await response.json();
        setInstitutionName(data.name);
        setImageUrl(data.image);
        setInstitutionEvidence(newInstitution.evidence);
        setShowNewInstitution(false);
        setNewInstitution({ name: '', evidence: '', image: '' });
      } else {
        throw new Error('Failed to add institution');
      }
    } catch (error) {
      console.error('Error adding institution:', error);
      setError('Failed to add institution. Please try again.');
    }
  };

  const handleRate = (
    categoryId: number,
    score: number,
    severity: number,
    evidence: string,
  ) => {
    setRatings((prev) => {
      const existing = prev.find((r) => r.ratingCategoryId === categoryId);
      if (existing) {
        return prev.map((r) =>
          r.ratingCategoryId === categoryId
            ? { ...r, score, severity, evidence }
            : r,
        );
      }
      return [
        ...prev,
        { ratingCategoryId: categoryId, score, severity, evidence },
      ];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let uploadedImageUrl = imageUrl;
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
        setImageUrl(uploadedImageUrl);
      }
      const payload = {
        institutionData: {
          name: institutionName,
          evidence: institutionEvidence,
          image: uploadedImageUrl,
        },
        ratings: ratings.map((rating) => ({
          userId: 1,
          ...rating,
          severity: Math.floor(Math.random() * 5) + 1,
          evidence: institutionEvidence,
        })),
      };

      const response = await fetch("/api/institutions/rate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("payload", payload);

      if (response.ok) {
        router.push("/institutions");
      } else {
        throw new Error('Failed to submit institution rating');
      }
    } catch (error) {
      console.error("Error submitting institution:", error);
      setError("Failed to submit institution. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-gray-700 font-bold mb-8">
        Create New Institution
      </h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-lg p-6 shadow-md space-y-4">
          <h2 className="text-xl text-gray-700 font-semibold mb-4">
            Basic Information
          </h2>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 block w-full text-gray-700 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </label>
          </div>

          {/* Quick Add Institution */}
          {!showNewInstitution ? (
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Name:
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter institution name"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowNewInstitution(true)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-4"
                disabled
              >
                {/*<PlusCircle className="w-4 h-4" />*/}
                {/*Add New*/}
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900">Add New Institution</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Institution Name"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Evidence"
                  value={newInstitution.evidence}
                  onChange={(e) => setNewInstitution(prev => ({ ...prev, evidence: e.target.value }))}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewInstitution(false);
                    setNewInstitution({ name: '', evidence: '', image: '' });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Evidence Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Evidence
              <textarea
                required
                className="mt-1 block w-full text-gray-700 rounded-md border-gray-300 shadow focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                value={institutionEvidence}
                onChange={(e) => setInstitutionEvidence(e.target.value)}
                placeholder="Provide detailed evidence of corruption..."
              />
            </label>
          </div>
        </div>

        {/* Rating Categories Section */}
        <div className="space-y-6">
          <h2 className="text-xl text-gray-700 font-semibold">
            Rate Corruption Metrics
          </h2>
          <p className="text-gray-600">
            Rate each metric from 1 (Minor) to 5 (Extreme) based on available evidence.
          </p>
          <div className="grid gap-6 md:grid-cols-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg p-4 shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="text-lg text-gray-700 font-medium">
                    {category.name}
                  </h3>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {category.description}
                </p>
                {category.examples && category.examples.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Examples:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {category.examples.map((example, index) => (
                        <li key={index}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() =>
                        handleRate(category.id, score, 2, institutionEvidence)
                      }
                      className={`px-3 py-1 text-gray-600 rounded transition-colors ${
                        ratings.find(
                          (r) =>
                            r.ratingCategoryId === category.id &&
                            r.score === score
                        )
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 px-8 rounded-md font-medium transition-colors ${
            isSubmitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit Institution"}
        </button>
      </form>
    </div>
  );
}