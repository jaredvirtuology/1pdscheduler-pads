'use client';
import { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

interface Props {
  token: string;
  isAdmin: boolean;
  currentUser?: User;
}

export default function UserManagement({ token, isAdmin, currentUser }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    password: '',
    is_admin: false 
  });
  const [passwordChange, setPasswordChange] = useState({ old_password: '', new_password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [token, isAdmin]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (response.ok) {
        setMessage('User created successfully');
        setNewUser({ username: '', email: '', password: '', is_admin: false });
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.detail);
      }
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleDeleteClick = (userId: number) => {
    console.log('Delete clicked for user:', userId);
    setError('');
    setUserToDelete(userId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    console.log('Confirm delete clicked for user:', userToDelete);
    if (!userToDelete) return;
    
    try {
      console.log('Sending delete request...');
      const response = await fetch(`http://localhost:8000/users/${userToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      
      console.log('Delete response:', response.status);
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userToDelete));
        setMessage('User deleted successfully');
        setDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to delete user');
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting user');
      setDeleteModalOpen(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordChange)
      });
      if (response.ok) {
        setMessage('Password changed successfully');
        setPasswordChange({ old_password: '', new_password: '' });
      } else {
        const data = await response.json();
        setError(data.detail);
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-green-800">{message}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Only show User List and Create User form for admins */}
      {isAdmin && (
        <>
          {/* User List */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.username}>
                      <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create User Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={newUser.is_admin}
                  onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="is_admin" className="ml-2 block text-sm text-gray-900">
                  Admin User
                </label>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Create User
              </button>
            </form>
          </div>
        </>
      )}

      {/* Change Password Form - available to all users */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Old Password</label>
            <input
              type="password"
              value={passwordChange.old_password}
              onChange={(e) => setPasswordChange({ ...passwordChange, old_password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={passwordChange.new_password}
              onChange={(e) => setPasswordChange({ ...passwordChange, new_password: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
} 