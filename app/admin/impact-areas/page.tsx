"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ImpactArea } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const ImpactAreasDashboard: React.FC = () => {
  const [impactAreas, setImpactAreas] = useState<ImpactArea[]>([]);
  const [newImpactArea, setNewImpactArea] = useState({ name: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchImpactAreas(currentPage);
  }, [currentPage]);

  const fetchImpactAreas = async (page: number) => {
    const response = await axios.get(`/api/impact-areas?page=${page}`);
    setImpactAreas(response.data.data);
    setTotalPages(response.data.pages);
  };

  const handleCreateImpactArea = async () => {
    await axios.post('/api/impact-areas', newImpactArea);
    fetchImpactAreas(currentPage);
  };

  const handleUpdateImpactArea = async (id: number, data: Partial<ImpactArea>) => {
    await axios.put('/api/impact-areas', { id, ...data });
    fetchImpactAreas(currentPage);
  };

  const handleDeleteImpactArea = async (id: number) => {
    await axios.delete('/api/impact-areas', { data: { impactAreaId: id } });
    fetchImpactAreas(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-black font-bold mb-4">Impact Areas Dashboard</h1>
      <Card className="mb-4">
        <h2 className="text-xl text-black font-semibold">Create Impact Area</h2>
        <Input
          type="text"
          placeholder="Name"
          value={newImpactArea.name}
          onChange={(e) => setNewImpactArea({ ...newImpactArea, name: e.target.value })}
          className="mr-2 text-black"
        />
        <Button onClick={handleCreateImpactArea} className="mt-2 bg-black text-white">Create</Button>
      </Card>
      <Card>
        <h2 className="text-xl text-black font-semibold">Impact Areas</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 text-black text-left">ID</th>
              <th className="py-2 text-black text-left">Name</th>
              <th className="py-2 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {impactAreas.map((impactArea) => (
              <tr key={impactArea.id}>
                <td className="py-2 text-black text-left">{impactArea.id}</td>
                <td className="py-2 text-black text-left">{impactArea.name}</td>
                <td className="py-2 text-black text-left">
                  <Button onClick={() => handleUpdateImpactArea(impactArea.id, { name: 'Updated Name' })} variant="secondary" className="mr-2 bg-black text-white">Update</Button>
                  <Button onClick={() => handleDeleteImpactArea(impactArea.id)} variant="secondary" className="bg-black text-white">Delete</Button>
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

export default ImpactAreasDashboard;