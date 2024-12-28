"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { Institution } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const InstitutionsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [newInstitution, setNewInstitution] = useState({ name: '', status: false });
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

  const fetchInstitutions = useCallback(async (page: number) => {
    try {
      const response = await axios.get(`/api/institutions?page=${page}`);
      setInstitutions(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error: unknown) {
      console.error('Error fetching institutions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch institutions",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchInstitutions(currentPage);
  }, [currentPage, fetchInstitutions]);

  const handleCreateInstitution = async () => {
    try {
      if (!newInstitution.name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter an institution name",
        });
        return;
      }

      await axios.post('/api/institutions', newInstitution);
      fetchInstitutions(currentPage);
      setNewInstitution({ name: '', status: false });
      toast({
        title: "Success",
        description: "Institution created successfully",
      });
    } catch (error: unknown) {
      console.error('Error creating institution:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create institution",
      });
    }
  };

  const handleUpdateInstitution = async (id: number, data: Partial<Institution>) => {
    try {
      await axios.put('/api/institutions', { id, ...data });
      fetchInstitutions(currentPage);
      toast({
        title: "Success",
        description: "Institution updated successfully",
      });
    } catch (error: unknown) {
      console.error('Error updating institution:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update institution",
      });
    }
  };

  const handleDeleteInstitution = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this institution?")) {
      return;
    }

    try {
      await axios.delete('/api/institutions', { data: { institutionId: id } });
      fetchInstitutions(currentPage);
      toast({
        title: "Success",
        description: "Institution deleted successfully",
      });
    } catch (error: unknown) {
      console.error('Error deleting institution:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete institution",
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
      const response = await fetch('/api/institutions/bulk-upload', {
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

      await fetchInstitutions(currentPage);
      event.target.value = '';

      toast({
        title: "Success",
        description: `Successfully uploaded ${data.summary.successful} institutions`,
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
      <h1 className="text-2xl text-black font-bold mb-4">Institutions Dashboard</h1>
      
      {/* Create Institution Form */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Create Institution</h2>
        <Input
          type="text"
          placeholder="Name"
          value={newInstitution.name}
          onChange={(e) => setNewInstitution({ ...newInstitution, name: e.target.value })}
          className="mb-2 text-black"
        />
        <Button onClick={handleCreateInstitution} className="bg-black text-white">
          Create
        </Button>
      </Card>

      {/* Bulk Upload Section */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Bulk Upload Institutions</h2>
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

      {/* Institutions Table */}
      <Card className="p-4">
        <h2 className="text-xl text-black font-semibold mb-4">Institutions</h2>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 text-black text-left">ID</th>
              <th className="py-2 text-black text-left">Image</th>
              <th className="py-2 text-black text-left">Name</th>
              <th className="py-2 text-black text-left">Status</th>
              <th className="py-2 text-black text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {institutions.map((institution) => (
              <tr key={institution.id}>
                <td className="py-2 text-black text-left">{institution.id}</td>
                <td className="py-2 text-black text-left">
                  <div className="relative w-16 h-16">
                    <Image 
                      src={institution.image || '/npp.png'}
                      alt={institution.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                </td>
                <td className="py-2 text-black text-left">{institution.name}</td>
                <td className="py-2 text-black text-left">
                  {institution.status ? 'Active' : 'Inactive'}
                </td>
                <td className="py-2 text-black text-left">
                  <Button 
                    onClick={() => handleUpdateInstitution(institution.id, { name: 'Updated Name' })} 
                    variant="secondary" 
                    className="mr-2 bg-black text-white"
                  >
                    Update
                  </Button>
                  <Button 
                    onClick={() => handleDeleteInstitution(institution.id)} 
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

export default InstitutionsDashboard;