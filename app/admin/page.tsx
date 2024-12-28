"use client";
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const AdminDashboard: React.FC = () => {
  const models = [
    { name: 'Users', path: '/admin/users' },
    { name: 'Nominees', path: '/admin/nominees' },
    { name: 'Positions', path: '/admin/positions' },
    { name: 'Institutions', path: '/admin/institutions' },
    { name: 'Districts', path: '/admin/districts' },
    { name: 'Departments', path: '/admin/departments' },
    { name: 'Impact Areas', path: '/admin/impact-areas' },
    { name: 'Rating Categories', path: '/admin/rating-categories' },
    { name: 'Institution Rating Categories', path: '/admin/institution-rating-categories' },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className=" py-2xl text-black font-bold mb-4">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <Card key={model.name} className="p-6">
            <h2 className=" py-xl text-blue-500 font-semibold mb-4">{model.name}</h2>
            <Link href={model.path}>
              <Button className="w-full">Manage {model.name}</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;