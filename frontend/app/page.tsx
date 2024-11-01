'use client';
import { useState } from 'react';
import ConnectionList from './components/ConnectionList';
import ConnectionForm from './components/ConnectionForm';
import { Connection } from './types';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [ipAddress, setIpAddress] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  const handleSubmit = (connection: Connection) => {
    if (editingConnection) {
      // Update existing connection
      setConnections(connections.map(c => 
        c.id === editingConnection.id 
          ? { ...connection, baseUrl: `http://${ipAddress}`, apiKey, id: editingConnection.id }
          : c
      ));
      setEditingConnection(null);
    } else {
      // Add new connection
      const newConnection = {
        ...connection,
        baseUrl: `http://${ipAddress}`,
        apiKey
      };
      setConnections([...connections, newConnection]);
    }
    setShowForm(false);
  };

  const handleHealthCheck = async () => {
    if (!ipAddress || !apiKey) {
      alert('Please provide both IP Address and API Key');
      return;
    }

    try {
      const response = await fetch(`http://${ipAddress}/api/v1/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
        },
        mode: 'cors',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Health check successful! Backend is connected.');
      } else {
        alert(`Health check failed: ${response.statusText}`);
      }
    } catch (error) {
      alert(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to validate IP address
  const isValidIP = (ip: string) => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Integration Dashboard</h1>
          <div className="flex-1 flex items-center gap-4">
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => {
                const value = e.target.value;
                setIpAddress(value);
              }}
              placeholder="IP Address (e.g., 192.168.1.1)"
              className={`px-3 py-2 border rounded-md text-sm ${
                ipAddress && !isValidIP(ipAddress) ? 'border-red-500' : ''
              }`}
            />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key"
              className="px-3 py-2 border rounded-md text-sm"
            />
            <button
              onClick={handleHealthCheck}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Health Check
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
            >
              New Connection
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <ConnectionForm
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingConnection(null);
            }}
            initialValues={editingConnection || undefined}
          />
        </div>
      )}

      <ConnectionList
        connections={connections}
        onEdit={(connection: Connection) => {
          setEditingConnection(connection);
          setShowForm(true);
        }}
        onDelete={(connectionId: string) => {
          setConnections(connections.filter(c => c.id !== connectionId));
        }}
      />
    </main>
  );
}