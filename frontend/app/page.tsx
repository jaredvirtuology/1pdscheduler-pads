'use client';
import { useState } from 'react';
import UserManagement from './components/UserManagement';
import SchemaViewer from './components/SchemaViewer';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr disabled for SchemaViewer
const DynamicSchemaViewer = dynamic(
  () => import('./components/SchemaViewer'),
  { ssr: false }
);

type View = 'login' | 'dashboard' | 'users';

interface User {
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
}

type CurrentUser = User;

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('login');
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('healthy');
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    setHealthStatus('checking');
    try {
      const response = await fetch('http://localhost:8000/healthcheck');
      if (response.ok) {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('unhealthy');
      }
    } catch (error) {
      setHealthStatus('unhealthy');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        
        const userResponse = await fetch('http://localhost:8000/users/me/', {
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData);
        }
        
        setView('dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred while logging in');
      console.error('Login error:', err);
    }
  };

  if (view === 'dashboard' || view === 'users') {
    return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold">1pdscheduler-pads</h1>
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-3 py-2 rounded-md ${view === 'dashboard' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  Overview
                </button>
                {currentUser?.is_admin && (
                  <button
                    onClick={() => setView('users')}
                    className={`px-3 py-2 rounded-md ${view === 'users' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                  >
                    Users
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-4">
                {currentUser && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      {currentUser.username}
                    </span>
                    {currentUser.is_admin && (
                      <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                        Admin
                      </span>
                    )}
                  </div>
                )}
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    setToken(null);
                    setCurrentUser(null);
                    setView('login');
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {view === 'dashboard' ? (
            // Your existing dashboard content
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Health Check Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Health Check</h3>
                      <button
                        onClick={checkHealth}
                        disabled={isChecking}
                        className="px-3 py-1 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isChecking ? 'Checking...' : 'Check Now'}
                      </button>
                    </div>
                    <div className="mt-3">
                      {healthStatus === 'checking' ? (
                        <div className="flex items-center">
                          <svg className="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-600">Checking health status...</span>
                        </div>
                      ) : (
                        <span className={`px-2 py-1 text-sm ${
                          healthStatus === 'healthy' 
                            ? 'text-green-800 bg-green-100' 
                            : 'text-red-800 bg-red-100'
                        } rounded-full`}>
                          {healthStatus === 'healthy' ? 'Healthy' : 'Unhealthy'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Connection List Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Connections</h3>
                    <div className="mt-3">
                      {/* Add your connection list here */}
                      <p className="text-gray-500">No active connections</p>
                    </div>
                  </div>
                </div>

                {/* Add more dashboard components as needed */}
              </div>
            </div>
          ) : (
            <UserManagement 
              token={token!} 
              isAdmin={currentUser?.is_admin || false} 
              currentUser={currentUser as User | undefined}
            />
          )}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Schema Viewer</h2>
            <DynamicSchemaViewer />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            1pdscheduler-pads
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}