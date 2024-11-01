'use client';
import { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';
import CreateUserModal from './CreateUserModal';

interface User {
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
}

interface Props {
  token: string;
  isAdmin: boolean;
  currentUser?: User;
}

const PasswordInput = ({ ...props }) => {
  return (
    <input
      {...props}
      type="password"
      data-lpignore="true"
      autoComplete="new-password"
    />
  )
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
  const [error, setError] = useState<string>('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setMounted(true)
  }, [])

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

  const handleCreateUser = async (userData: {
    username: string;
    email: string;
    password: string;
    is_admin: boolean;
  }) => {
    try {
      const response = await fetch('http://localhost:8000/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        setMessage('User created successfully');
        setCreateModalOpen(false);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.detail);
      }
    } catch (err) {
      setError('Failed to create user');
    }
  };

  const handleDeleteClick = (userEmail: string) => {
    console.log('Current user:', currentUser);
    console.log('Attempting to delete user email:', userEmail);
    console.log('Current user email:', currentUser?.email);
    
    if (currentUser && currentUser.email === userEmail) {
      console.log('Self-deletion prevented');
      setError("You cannot delete your own account");
      return;
    }
    
    setError('');
    setUserToDelete(userEmail);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:8000/users/${encodeURIComponent(userToDelete)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(user => user.email !== userToDelete));
        setMessage('User deleted successfully');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error deleting user');
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setUserToDelete(null);
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

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'old_password' | 'new_password') => {
    setPasswordChange(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">1pdscheduler-pads</h1>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Create User
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.email} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_admin 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteClick(user.email)}
                          disabled={isDeleting}
                          className={`text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200 ${
                            isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No users found
                </div>
              )}
            </div>
          </div>

          {/* Add CreateUserModal */}
          <CreateUserModal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateUser}
          />

          {/* Change Password Form - available to all users */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Old Password</label>
                <PasswordInput
                  name="old_password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={passwordChange.old_password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordInputChange(e, 'old_password')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <PasswordInput
                  name="new_password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={passwordChange.new_password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePasswordInputChange(e, 'new_password')}
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
            onClose={() => {
              setDeleteModalOpen(false);
              setUserToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            title="Delete User"
            message={`Are you sure you want to delete this user? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
          />
        </>
      )}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 mb-4 rounded">
          <p>Debug Info:</p>
          <p>Current User Email: {currentUser?.email}</p>
          <p>Current User Name: {currentUser?.username}</p>
        </div>
      )}
    </div>
  );
} 