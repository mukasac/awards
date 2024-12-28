"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const UsersDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await axios.get('/api/users');
    setUsers(response.data);
  };

  const handleCreateUser = async () => {
    await axios.post('/api/users', newUser);
    fetchUsers();
  };

  const handleUpdateUser = async (id: number, data: Partial<User>) => {
    await axios.put('/api/users', { id, ...data });
    fetchUsers();
  };

  const handleDeleteUser = async (id: number) => {
    await axios.delete('/api/users', { data: { userId: id } });
    fetchUsers();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl text-black font-bold mb-4">Users Dashboard</h1>
      <Card className="mb-4">
        <h2 className="text-xl text-black font-semibold">Create User</h2>
        <Input
          type="text"
          placeholder="Name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          className="mr-2"
        />
        <Input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          className="mr-2"
        />
        <Input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          className="mr-2"
        />
        <Button onClick={handleCreateUser} className="mt-2">Create</Button>
      </Card>
      <Card>
        <h2 className="text-xl text-black font-semibold">Users</h2>
        <table className="min-w-full bg-white">
  <thead>
    <tr>
      <th className="py-2 text-black text-left">ID</th>
      <th className="py-2 text-black text-left">Name</th>
      <th className="py-2 text-black text-left">Email</th>
      <th className="py-2 text-black text-left">Actions</th>
    </tr>
  </thead>
  <tbody>
    {users.map((user) => (
      <tr key={user.id}>
        <td className="py-2 text-black text-left">{user.id}</td>
        <td className="py-2 text-black text-left">{user.name}</td>
        <td className="py-2 text-black text-left">{user.email}</td>
        <td className="py-2 text-black text-left">
          <Button onClick={() => handleUpdateUser(user.id, { name: 'Updated Name' })} variant="secondary" className="mr-2">Update</Button>
          <Button onClick={() => handleDeleteUser(user.id)} variant="secondary">Delete</Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
      </Card>
    </div>
  );
};

export default UsersDashboard;