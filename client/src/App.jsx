import React, { useState, useEffect, useCallback } from 'react';
import AddUserForm from './components/AddUserForm';
import UsersTable from './components/UsersTable';
import './App.css';

const API_URL = 'http://localhost:3000/users';

export default function App() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' | 'error'
  const [editUser, setEditUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddOrUpdate = async (userData) => {
    try {
      const method = editUser ? 'PUT' : 'POST';
      const url = editUser ? `${API_URL}/${editUser.id}` : API_URL;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error(editUser ? 'Failed to update user' : 'Failed to add user');
      const result = await res.json();
      setMessage({
        text: editUser ? 'User updated successfully' : 'User added successfully',
        type: 'success',
      });
      setEditUser(null);
      await fetchUsers();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      setMessage({ text: 'User deleted successfully', type: 'success' });
      await fetchUsers();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleCancelEdit = () => {
    setEditUser(null);
  };

  // Auto‑clear messages after a short delay
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>Add New User</h1>
      {message.text && (
        <div
          style={{
            marginBottom: '20px',
            color: message.type === 'error' ? 'red' : 'green',
          }}
        >
          {message.text}
        </div>
      )}
      <AddUserForm
        onSubmit={handleAddOrUpdate}
        editUser={editUser}
        onCancel={handleCancelEdit}
      />
      <h3 style={{ marginTop: '40px' }}>Registered Users</h3>
      <UsersTable users={users} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
