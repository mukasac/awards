"use client";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Image from 'next/image';
import { Nominee, Position, Institution, District } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const NomineesDashboard: React.FC = () => {
  const { toast } = useToast();
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newNominee, setNewNominee] = useState({
    name: "",
    positionId: 0,
    institutionId: 0,
    districtId: 0,
  });
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

  const fetchNominees = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/nominees?page=${page}`);
      setNominees(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error: unknown) {
      console.error('Error fetching nominees:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch nominees",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const fetchPositions = useCallback(async () => {
    try {
      const response = await axios.get("/api/positions");
      setPositions(response.data.data);
    } catch (error: unknown) {
      console.error('Error fetching positions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch positions",
      });
    }
  }, [toast]);

  const fetchInstitutions = useCallback(async () => {
    try {
      const response = await axios.get("/api/institutions");
      setInstitutions(response.data.data);
    } catch (error: unknown) {
      console.error('Error fetching institutions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch institutions",
      });
    }
  }, [toast]);

  const fetchDistricts = useCallback(async () => {
    try {
      const response = await axios.get("/api/districts");
      setDistricts(response.data.data);
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
    fetchNominees(currentPage);
    fetchPositions();
    fetchInstitutions();
    fetchDistricts();
  }, [currentPage, fetchNominees, fetchPositions, fetchInstitutions, fetchDistricts]);

  const handleCreateNominee = async () => {
    try {
      if (!newNominee.name || !newNominee.positionId || !newNominee.institutionId || !newNominee.districtId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      await axios.post("/api/nominees", newNominee);
      fetchNominees(currentPage);
      setNewNominee({
        name: "",
        positionId: 0,
        institutionId: 0,
        districtId: 0,
      });
      toast({
        title: "Success",
        description: "Nominee created successfully",
      });
    } catch (error: unknown) {
      console.error('Error creating nominee:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create nominee",
      });
    }
  };

  const handleUpdateNominee = async (id: number, data: Partial<Nominee>) => {
    try {
      await axios.put(`/api/nominees/${id}`, data);
      fetchNominees(currentPage);
      toast({
        title: "Success",
        description: "Nominee updated successfully",
      });
    } catch (error: unknown) {
      console.error('Error updating nominee:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update nominee",
      });
    }
  };

  const handleDeleteNominee = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this nominee?")) {
      return;
    }
    
    try {
      await axios.delete(`/api/nominees/${id}`);
      fetchNominees(currentPage);
      toast({
        title: "Success",
        description: "Nominee deleted successfully",
      });
    } catch (error: unknown) {
      console.error('Error deleting nominee:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete nominee",
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
      const response = await fetch('/api/nominees/bulk-upload', {
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

      await fetchNominees(currentPage);
      event.target.value = '';

      toast({
        title: "Success",
        description: `Successfully uploaded ${data.summary.successful} nominees`,
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
      <h1 className="text-2xl font-bold mb-4">Nominees Dashboard</h1>

      {/* Create Nominee Form */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">Create Nominee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Name"
            value={newNominee.name}
            onChange={(e) =>
              setNewNominee({ ...newNominee, name: e.target.value })
            }
          />
          <select
            value={newNominee.positionId}
            onChange={(e) =>
              setNewNominee({ ...newNominee, positionId: Number(e.target.value) })
            }
            className="border rounded p-2"
          >
            <option value="">Select Position</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
          <select
            value={newNominee.institutionId}
            onChange={(e) =>
              setNewNominee({
                ...newNominee,
                institutionId: Number(e.target.value),
              })
            }
            className="border rounded p-2"
          >
            <option value="">Select Institution</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.name}
              </option>
            ))}
          </select>
          <select
            value={newNominee.districtId}
            onChange={(e) =>
              setNewNominee({ ...newNominee, districtId: Number(e.target.value) })
            }
            className="border rounded p-2"
          >
            <option value="">Select District</option>
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={handleCreateNominee}
          className="mt-4"
        >
          Create Nominee
        </Button>
      </Card>

      {/* Bulk Upload Section */}
      <Card className="p-4 mb-4">
        <h2 className="text-xl font-semibold mb-4">Bulk Upload</h2>
        <div className="space-y-4">
          <Input
            type="file"
            accept=".csv"
            onChange={handleBulkUpload}
            disabled={uploadStatus.status === 'loading'}
          />
          {uploadStatus.status === 'loading' && (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing upload...</span>
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
              <AlertDescription>
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

      {/* Nominees Table */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Nominees List</h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Image</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Position</th>
                    <th className="px-4 py-2">Institution</th>
                    <th className="px-4 py-2">District</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nominees.map((nominee) => (
                    <tr key={nominee.id}>
                      <td className="px-4 py-2">{nominee.id}</td>
                      <td className="px-4 py-2">
                        <div className="relative w-16 h-16">
                          <Image
                            src={nominee.image || "/npp.png"}
                            alt={nominee.name}
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-2">{nominee.name}</td>
                      <td className="px-4 py-2">
                        {positions.find((p) => p.id === nominee.positionId)?.name}
                      </td>
                      <td className="px-4 py-2">
                        {institutions.find((i) => i.id === nominee.institutionId)?.name}
                      </td>
                      <td className="px-4 py-2">
                        {districts.find((d) => d.id === nominee.districtId)?.name}
                      </td>
                      <td className="px-4 py-2">
                        <Button
                          onClick={() => handleUpdateNominee(nominee.id, { name: "Updated Name" })}
                          variant="outline"
                          className="mr-2"
                        >
                          Edit
                        </Button>
                        <Button
  onClick={() => handleDeleteNominee(nominee.id)}
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
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default NomineesDashboard;