"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Position } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PositionsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [newPosition, setNewPosition] = useState({ name: '' });
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

  const fetchPositions = useCallback(async (page: number) => {
    try {
      const response = await axios.get(`/api/positions?page=${page}`);
      setPositions(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error: unknown) {
      console.error('Error fetching positions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch positions",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPositions(currentPage);
  }, [currentPage, fetchPositions]);

  const handleCreatePosition = async () => {
    try {
      if (!newPosition.name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a position name",
        });
        return;
      }

      await axios.post('/api/positions', newPosition);
      fetchPositions(currentPage);
      setNewPosition({ name: '' });
      toast({
        title: "Success",
        description: "Position created successfully",
      });
    } catch (error: unknown) {
      console.error('Error creating position:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create position",
      });
    }
  };

  const handleUpdatePosition = async (id: number, data: Partial<Position>) => {
    try {
      await axios.put('/api/positions', { id, ...data });
      fetchPositions(currentPage);
      toast({
        title: "Success",
        description: "Position updated successfully",
      });
    } catch (error: unknown) {
      console.error('Error updating position:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update position",
      });
    }
  };

  const handleDeletePosition = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this position?")) {
      return;
    }

    try {
      await axios.delete('/api/positions', { data: { positionId: id } });
      fetchPositions(currentPage);
      toast({
        title: "Success",
        description: "Position deleted successfully",
      });
    } catch (error: unknown) {
      console.error('Error deleting position:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete position",
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
      const response = await fetch('/api/positions/bulk-upload', {
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

      await fetchPositions(currentPage);
      event.target.value = '';

      toast({
        title: "Success",
        description: `Successfully uploaded ${data.summary.successful} positions`,
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
      <h1 className="text-2xl text-black font-bold mb-4">Positions Dashboard</h1>
      
      {/* Create Position Form */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Create Position</h2>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Name"
            value={newPosition.name}
            onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
            className="text-black"
          />
          <Button 
            onClick={handleCreatePosition} 
            className="bg-black text-white"
          >
            Create Position
          </Button>
        </div>
      </Card>

      {/* Bulk Upload Section */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Bulk Upload Positions</h2>
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

      {/* Positions Table */}
      <Card className="p-4">
        <h2 className="text-xl text-black font-semibold mb-4">Positions List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 text-black text-left">ID</th>
                <th className="py-2 text-black text-left">Name</th>
                <th className="py-2 text-black text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.id}>
                  <td className="py-2 text-black text-left">{position.id}</td>
                  <td className="py-2 text-black text-left">{position.name}</td>
                  <td className="py-2 text-black text-left">
                    <Button 
                      onClick={() => handleUpdatePosition(position.id, { name: 'Updated Name' })} 
                      variant="outline" 
                      className="mr-2"
                    >
                      Update
                    </Button>
                    <Button 
                      onClick={() => handleDeletePosition(position.id)} 
                      variant="secondary" 
                      className="bg-red-500 hover:bg-red-600 text-white"
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
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-black">Page {currentPage} of {totalPages}</span>
          <Button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages} 
            variant="outline"
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PositionsDashboard;