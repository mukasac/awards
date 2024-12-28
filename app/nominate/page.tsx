"use client";
import { useState, useEffect } from "react";
import {
  RatingCategory,
  District,
  Position,
  Institution,
} from "@/types/interfaces";
import { useRouter } from "next/navigation";
import { PlusCircle } from 'lucide-react';
import { uploadImage } from '@/services/uploadService';


interface Rating {
  ratingCategoryId: number;
  score: number;
  severity: number;
  evidence: string;
}

interface NewItemForm {
  name: string;
}

interface NewNominee {
  name: string;
  position: string;
  institution: string;
  district: string;
  evidence: string;
  image: string;
}

export default function CreateNomineePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<RatingCategory[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [nomineeName, setNomineeName] = useState<string>("");
  const [nomineeEvidence, setNomineeEvidence] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [institutionId, setInstitutionId] = useState<number | null>(null);
  const [positionId, setPositionId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  // States for forms
  const [showNewInstitution, setShowNewInstitution] = useState(false);
  const [showNewPosition, setShowNewPosition] = useState(false);
  const [showNewDistrict, setShowNewDistrict] = useState(false);
  const [showNewNominee, setShowNewNominee] = useState(false);
  const [newInstitution, setNewInstitution] = useState<NewItemForm>({ name: '' });
  const [newPosition, setNewPosition] = useState<NewItemForm>({ name: '' });
  const [newDistrict, setNewDistrict] = useState<NewItemForm>({ name: '' });
  const [newNominee, setNewNominee] = useState<NewNominee>({
    name: '',
    position: '',
    institution: '',
    district: '',
    evidence: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesRes, institutionsRes, positionsRes, districtsRes] = await Promise.all([
          fetch("/api/rating-categories/"),
          fetch("/api/institutions/"),
          fetch("/api/positions/"),
          fetch("/api/districts/")
        ]);

        const [
          categoriesData,
          institutionsData,
          positionsData,
          districtsData
        ] = await Promise.all([
          categoriesRes.json(),
          institutionsRes.json(),
          positionsRes.json(),
          districtsRes.json()
        ]);

        setCategories(categoriesData.data);
        setInstitutions(institutionsData.data);
        setPositions(positionsData.data);
        setDistricts(districtsData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load form data. Please refresh the page.");
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
    setError(null);
    
    try {
      let newPositionId = positionId;
      let newInstitutionId = institutionId;
      let newDistrictId = districtId;

      if (newNominee.position) {
        const posRes = await fetch('/api/positions/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newNominee.position }),
        });
        if (posRes.ok) {
          const data = await posRes.json();
          setPositions(prev => [...prev, data]);
          newPositionId = data.id;
        }
      }

      if (newNominee.institution) {
        const instRes = await fetch('/api/institutions/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newNominee.institution }),
        });
        if (instRes.ok) {
          const data = await instRes.json();
          setInstitutions(prev => [...prev, data]);
          newInstitutionId = data.id;
        }
      }

      if (newNominee.district) {
        const distRes = await fetch('/api/districts/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newNominee.district }),
        });
        if (distRes.ok) {
          const data = await distRes.json();
          setDistricts(prev => [...prev, data]);
          newDistrictId = data.id;
        }
      }

      setNomineeName(newNominee.name);
      setPositionId(newPositionId);
      setInstitutionId(newInstitutionId);
      setDistrictId(newDistrictId);
      setShowNewNominee(false);
      setNewNominee({ name: '', position: '', institution: '', district: '', evidence: '', image: '' });
    } catch (error) {
      console.error('Error in quick add:', error);
      setError('Failed to add new nominee details. Please try again.');
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

  const handleAddInstitution = async (e: React.FormEvent) => {
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
        setInstitutions(prev => [...prev, data]);
        setInstitutionId(data.id);
        setShowNewInstitution(false);
        setNewInstitution({ name: '' });
      } else {
        throw new Error('Failed to add institution');
      }
    } catch (error) {
      console.error('Error adding institution:', error);
      setError('Failed to add institution. Please try again.');
    }
  };

  const handleAddPosition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosition.name.trim()) return;

    try {
      const response = await fetch('/api/positions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPosition),
      });
      
      if (response.ok) {
        const data = await response.json();
        setPositions(prev => [...prev, data]);
        setPositionId(data.id);
        setShowNewPosition(false);
        setNewPosition({ name: '' });
      } else {
        throw new Error('Failed to add position');
      }
    } catch (error) {
      console.error('Error adding position:', error);
      setError('Failed to add position. Please try again.');
    }
  };

  const handleAddDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrict.name.trim()) return;

    try {
      const response = await fetch('/api/districts/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDistrict),
      });
      
      if (response.ok) {
        const data = await response.json();
        setDistricts(prev => [...prev, data]);
        setDistrictId(data.id);
        setShowNewDistrict(false);
        setNewDistrict({ name: '' });
      } else {
        throw new Error('Failed to add district');
      }
    } catch (error) {
      console.error('Error adding district:', error);
      setError('Failed to add district. Please try again.');
    }
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
        nomineeData: {
          name: nomineeName,
          institutionId,
          positionId,
          districtId,
          evidence: nomineeEvidence,
          image: uploadedImageUrl,
        },
        ratings: ratings.map((rating) => ({
          userId: 1,
          ...rating,
          severity: Math.floor(Math.random() * 5) + 1,
        })),
      };
      const response = await fetch("/api/nominees/rate/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("sent  payload", payload)

      if (!response.ok) {
        throw new Error('Failed to submit nominee');
      }

      router.push("/nominees");
      setImageFile(null);
      setImageUrl(null);
    } catch (error) {
      console.error("Error submitting nominee:", error);
      setError("Failed to submit nominee. Please try again.");
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
        Create New Nominee
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
          
          {/* Quick Add Nominee */}
          {!showNewNominee ? (
            <div className="text-right mb-4">
              <button
                type="button"
                onClick={() => setShowNewNominee(true)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto"
              >
                <PlusCircle className="w-4 h-4" />
                Quick Add Nominee with Details
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-4 border border-gray-200 rounded-lg mb-4">
              <h3 className="font-medium text-gray-900">Quick Add New Nominee</h3>
              <div className="grid gap-4">
                <input
                  type="text"
                  placeholder="Nominee Name"
                  value={newNominee.name}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, name: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Position"
                  value={newNominee.position}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, position: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Institution"
                  value={newNominee.institution}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, institution: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="District"
                  value={newNominee.district}
                  onChange={(e) => setNewNominee(prev => ({ ...prev, district: e.target.value }))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewNominee(false);
                    setNewNominee({ name: '', position: '', institution: '', district: '', evidence: '', image: ''  });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Nominee Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Name:
              <input
                type="text"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter nominee's name"
              />
            </label>
          </div>

          {/* Institution Selection/Addition */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Institution</label>
              {!showNewInstitution && (
                <button
                  type="button"
                  onClick={() => setShowNewInstitution(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New
                </button>
              )}
            </div>
            
            {showNewInstitution ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution({ name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new institution name"
                />
                <button
                  type="button"
                  onClick={handleAddInstitution}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewInstitution(false);
                    setNewInstitution({ name: '' });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={institutionId || ""}
                onChange={(e) => setInstitutionId(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Institution</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Position Selection/Addition */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">Position</label>
              {!showNewPosition && (
                <button
                  type="button"
                  onClick={() => setShowNewPosition(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New
                </button>
              )}
            </div>
            
            {showNewPosition ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPosition.name}
                  onChange={(e) => setNewPosition({ name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new position name"
                />
                <button
                  type="button"
                  onClick={handleAddPosition}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewPosition(false);
                    setNewPosition({ name: '' });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={positionId || ""}
                onChange={(e) => setPositionId(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Position</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* District Selection/Addition */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">District</label>
              {!showNewDistrict && (
                <button
                  type="button"
                  onClick={() => setShowNewDistrict(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add New
                </button>
              )}
            </div>
            
            {showNewDistrict ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDistrict.name}
                  onChange={(e) => setNewDistrict({ name: e.target.value })}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter new district name"
                />
                <button
                  type="button"
                  onClick={handleAddDistrict}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDistrict(false);
                    setNewDistrict({ name: '' });
                  }}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <select
                value={districtId || ""}
                onChange={(e) => setDistrictId(Number(e.target.value))}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Evidence Field */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Evidence
              <textarea
                required
                className="mt-1 block w-full text-gray-700 rounded-md border-gray-300 shadow focus:border-blue-500 focus:ring-blue-500"
                rows={4}
                value={nomineeEvidence}
                onChange={(e) => setNomineeEvidence(e.target.value)}
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
                        handleRate(category.id, score, 2, nomineeEvidence)
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
          {isSubmitting ? "Submitting..." : "Submit Nominee"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}