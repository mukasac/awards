"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { District } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DistrictsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [districts, setDistricts] = useState<District[]>([]);
  const [newDistrict, setNewDistrict] = useState({ name: '', region: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadStatus, setUploadStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    summary?: {
      total: number;
      successful: number;
      failed: number;
    };
  }>({
    status: 'idle',
    message: '',
  });

  const fetchDistricts = useCallback(async (page: number) => {
    try {
      const response = await axios.get(`/api/districts?page=${page}`);
      setDistricts(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error: unknown) {
      console.error('Error fetching districts:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch districts",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchDistricts(currentPage);
  }, [currentPage, fetchDistricts]);

  const handleCreateDistrict = async () => {
    try {
      if (!newDistrict.name || !newDistrict.region) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in both name and region",
        });
        return;
      }

      await axios.post('/api/districts', newDistrict);
      fetchDistricts(currentPage);
      setNewDistrict({ name: '', region: '' });
      toast({
        title: "Success",
        description: "District created successfully",
      });
    } catch (error: unknown) {
      console.error('Error creating district:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create district",
      });
    }
  };

  const handleUpdateDistrict = async (id: number, data: Partial<District>) => {
    try {
      await axios.put('/api/districts', { id, ...data });
      fetchDistricts(currentPage);
      toast({
        title: "Success",
        description: "District updated successfully",
      });
    } catch (error: unknown) {
      console.error('Error updating district:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update district",
      });
    }
  };

  const handleDeleteDistrict = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this district?")) {
      return;
    }

    try {
      await axios.delete('/api/districts', { data: { districtId: id } });
      fetchDistricts(currentPage);
      toast({
        title: "Success",
        description: "District deleted successfully",
      });
    } catch (error: unknown) {
      console.error('Error deleting district:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete district",
      });
    }
  };

  const handleBulkUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const file = event.target.files?.[0];
    
    if (!file) {
      setUploadStatus({
        status: 'error',
        message: 'Please select a CSV file to upload',
      });
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setUploadStatus({
        status: 'error',
        message: 'Please upload a valid CSV file',
      });
      return;
    }

    setUploadStatus({
      status: 'loading',
      message: 'Processing upload...',
    });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/districts/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadStatus({
        status: 'success',
        message: 'Upload completed successfully',
        summary: {
          total: data.summary.total,
          successful: data.summary.successful,
          failed: data.summary.failed,
        },
      });

      // Refresh districts list
      await fetchDistricts(currentPage);

      // Reset file input
      event.target.value = '';

      toast({
        title: "Success",
        description: `Successfully uploaded ${data.summary.successful} districts`,
      });
    } catch (error: unknown) {
      console.error('Error processing bulk upload:', error);
      setUploadStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Upload failed',
      });
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process bulk upload",
      });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-black font-bold mb-4">Districts Dashboard</h1>
      
      {/* Create District Form */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Create District</h2>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Name"
            value={newDistrict.name}
            onChange={(e) => setNewDistrict({ ...newDistrict, name: e.target.value })}
            className="text-black"
          />
          <Input
            type="text"
            placeholder="Region"
            value={newDistrict.region}
            onChange={(e) => setNewDistrict({ ...newDistrict, region: e.target.value })}
            className="text-black"
          />
          <Button 
            onClick={handleCreateDistrict} 
            className="bg-black text-white"
          >
            Create District
          </Button>
        </div>
      </Card>

      {/* Bulk Upload Section */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Bulk Upload Districts</h2>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleBulkUpload}
            disabled={uploadStatus.status === 'loading'}
            className="text-black"
          />
          {uploadStatus.status === 'loading' && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-black">Processing upload...</span>
            </div>
          )}
          {uploadStatus.status !== 'idle' && (
            <Alert
              className={`${
                uploadStatus.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : uploadStatus.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <AlertDescription className="text-black">
                {uploadStatus.message}
                {uploadStatus.summary && (
                  <div className="mt-2">
                    <p>Total processed: {uploadStatus.summary.total}</p>
                    <p>Successfully uploaded: {uploadStatus.summary.successful}</p>
                    <p>Failed: {uploadStatus.summary.failed}</p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Districts Table */}
      <Card className="p-4">
        <h2 className="text-xl text-black font-semibold mb-4">Districts List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 text-black text-left">ID</th>
                <th className="py-2 text-black text-left">Name</th>
                <th className="py-2 text-black text-left">Region</th>
                <th className="py-2 text-black text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {districts.map((district) => (
                <tr key={district.id}>
                  <td className="py-2 text-black text-left">{district.id}</td>
                  <td className="py-2 text-black text-left">{district.name}</td>
                  <td className="py-2 text-black text-left">{district.region}</td>
                  <td className="py-2 text-black text-left">
                    <Button 
                      onClick={() => handleUpdateDistrict(district.id, { name: 'Updated Name' })} 
                      variant="secondary" 
                      className="mr-2 bg-black text-white"
                    >
                      Update
                    </Button>
                    <Button 
                      onClick={() => handleDeleteDistrict(district.id)} 
                      variant="secondary" 
                      className="bg-black text-white"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between mt-4">
          <Button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1} 
            className="bg-black text-white"
          >
            Previous
          </Button>
          <span className="text-black">Page {currentPage} of {totalPages}</span>
          <Button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages} 
            className="bg-black text-white"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default DistrictsDashboard;