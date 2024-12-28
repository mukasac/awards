"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RatingCategory } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const RatingCategoriesDashboard: React.FC = () => {
  const [ratingCategories, setRatingCategories] = useState<RatingCategory[]>([]);
  const [newRatingCategory, setNewRatingCategory] = useState({ name: '', keyword: '', icon: '', description: '', weight: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRatingCategories(currentPage);
  }, [currentPage]);

  const fetchRatingCategories = async (page: number) => {
    const response = await axios.get(`/api/rating-categories?page=${page}`);
    setRatingCategories(response.data.data);
    setTotalPages(response.data.pages);
  };

  const handleCreateRatingCategory = async () => {
    await axios.post('/api/rating-categories', newRatingCategory);
    fetchRatingCategories(currentPage);
  };

  const handleUpdateRatingCategory = async (id: number, data: Partial<RatingCategory>) => {
    await axios.put('/api/rating-categories', { id, ...data });
    fetchRatingCategories(currentPage);
  };

  const handleDeleteRatingCategory = async (id: number) => {
    await axios.delete('/api/rating-categories', { data: { ratingCategoryId: id } });
    fetchRatingCategories(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-black font-bold mb-4">Rating Categories Dashboard</h1>
      <Card className="mb-4">
        <h2 className="text-xl text-black font-semibold">Create Rating Category</h2>
        <Input
          type="text"
          placeholder="Name"
          value={newRatingCategory.name}
          onChange={(e) => setNewRatingCategory({ ...newRatingCategory, name: e.target.value })}
          className="mr-2 text-black"
        />
        <Input
          type="text"
          placeholder="Keyword"
          value={newRatingCategory.keyword}
          onChange={(e) => setNewRatingCategory({ ...newRatingCategory, keyword: e.target.value })}
          className="mr-2 text-black"
        />
        <Input
          type="text"
          placeholder="Icon"
          value={newRatingCategory.icon}
          onChange={(e) => setNewRatingCategory({ ...newRatingCategory, icon: e.target.value })}
          className="mr-2 text-black"
        />
        <Input
          type="text"
          placeholder="Description"
          value={newRatingCategory.description}
          onChange={(e) => setNewRatingCategory({ ...newRatingCategory, description: e.target.value })}
          className="mr-2 text-black"
        />
        <Input
          type="number"
          placeholder="Weight"
          value={newRatingCategory.weight}
          onChange={(e) => setNewRatingCategory({ ...newRatingCategory, weight: Number(e.target.value) })}
          className="mr-2 text-black"
        />
        <Button onClick={handleCreateRatingCategory} className="mt-2 bg-black text-white">Create</Button>
      </Card>
      <Card>
        <h2 className="text-xl text-black font-semibold">Rating Categories</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 text-black text-left">ID</th>
              <th className="py-2 text-black text-left">Icon</th>
              <th className="py-2 text-black text-left">Name</th>
              <th className="py-2 text-black text-left">Keyword</th>
              <th className="py-2 text-black text-left">Description</th>
              <th className="py-2 text-black text-left">Weight</th>
              <th className="py-2 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ratingCategories.map((ratingCategory) => (
              <tr key={ratingCategory.id}>
                <td className="py-2 text-black text-left">{ratingCategory.id}</td>
                <td className="py-2 text-black text-left">{ratingCategory.icon}</td>
                <td className="py-2 text-black text-left">{ratingCategory.name}</td>
                <td className="py-2 text-black text-left">{ratingCategory.keyword}</td>
                <td className="py-2 text-black text-left">{ratingCategory.description}</td>
                <td className="py-2 text-black text-left">{ratingCategory.weight}</td>
                <td className="py-2 text-black text-left">
                  <Button onClick={() => handleUpdateRatingCategory(ratingCategory.id, { name: 'Updated Name' })} variant="secondary" className="mr-2 bg-black text-white">Update</Button>
                  <Button onClick={() => handleDeleteRatingCategory(ratingCategory.id)} variant="secondary" className="bg-black text-white">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="bg-black text-white">Previous</Button>
          <span className="text-black">Page {currentPage} of {totalPages}</span>
          <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="bg-black text-white">Next</Button>
        </div>
      </Card>
    </div>
  );
};

export default RatingCategoriesDashboard;