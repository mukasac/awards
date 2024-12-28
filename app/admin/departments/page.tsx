"use client";
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Department } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const DepartmentsDashboard: React.FC = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState({ name: '' });
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

  const fetchDepartments = useCallback(async (page: number) => {
    try {
      const response = await axios.get(`/api/departments?page=${page}`);
      setDepartments(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error: unknown) {
      console.error('Error fetching departments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch departments",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchDepartments(currentPage);
  }, [currentPage, fetchDepartments]);

  const handleCreateDepartment = async () => {
    try {
      if (!newDepartment.name) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a department name",
        });
        return;
      }

      await axios.post('/api/departments', newDepartment);
      fetchDepartments(currentPage);
      setNewDepartment({ name: '' });
      toast({
        title: "Success",
        description: "Department created successfully",
      });
    } catch (error: unknown) {
      console.error('Error fetching departments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch departments",
      });
    }
  };

  const handleUpdateDepartment = async (id: number, data: Partial<Department>) => {
    try {
      await axios.put('/api/departments', { id, ...data });
      fetchDepartments(currentPage);
      toast({
        title: "Success",
        description: "Department updated successfully",
      });
    } catch (error: unknown) {
      console.error('Error fetching departments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch departments",
      });
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      await axios.delete('/api/departments', { data: { departmentId: id } });
      fetchDepartments(currentPage);
      toast({
        title: "Success",
        description: "Department deleted successfully",
      });
    } catch (error: unknown) {
      console.error('Error fetching departments:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch departments",
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
      const response = await fetch('/api/departments/bulk-upload', {
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

      // Refresh departments list
      await fetchDepartments(currentPage);

      // Reset file input
      event.target.value = '';

      toast({
        title: "Success",
        description: `Successfully uploaded ${data.summary.successful} departments`,
      });
    } catch (error) {
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
      <h1 className="text-2xl text-black font-bold mb-4">Departments Dashboard</h1>
      
      {/* Create Department Form */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Create Department</h2>
        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Name"
            value={newDepartment.name}
            onChange={(e) => setNewDepartment({ ...newDepartment, name: e.target.value })}
            className="text-black"
          />
          <Button 
            onClick={handleCreateDepartment} 
            className="bg-black text-white"
          >
            Create Department
          </Button>
        </div>
      </Card>

      {/* Bulk Upload Section */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl text-black font-semibold mb-4">Bulk Upload Departments</h2>
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

      {/* Departments Table */}
      <Card className="p-4">
        <h2 className="text-xl text-black font-semibold mb-4">Departments List</h2>
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
              {departments.map((department) => (
                <tr key={department.id}>
                  <td className="py-2 text-black text-left">{department.id}</td>
                  <td className="py-2 text-black text-left">{department.name}</td>
                  <td className="py-2 text-black text-left">
                    <Button 
                      onClick={() => handleUpdateDepartment(department.id, { name: 'Updated Name' })} 
                      variant="secondary" 
                      className="mr-2 bg-black text-white"
                    >
                      Update
                    </Button>
                    <Button 
                      onClick={() => handleDeleteDepartment(department.id)} 
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

export default DepartmentsDashboard;