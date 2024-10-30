'use client';
import { useState } from 'react';
import ConnectionList from './components/ConnectionList';
import ConnectionForm from './components/ConnectionForm';
import { Connection } from './types';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  const handleSubmit = (connection: Connection) => {
    if (editingConnection) {
      // Update existing connection
      setConnections(connections.map(c => 
        c.id === editingConnection.id 
          ? { ...connection, baseUrl, apiKey, id: editingConnection.id }
          : c
      ));
      setEditingConnection(null);
    } else {
      // Add new connection
      const newConnection = {
        ...connection,
        baseUrl,
        apiKey
      };
      setConnections([...connections, newConnection]);
    }
    setShowForm(false);
  };

  const handleHealthCheck = async () => {
    if (!baseUrl || !apiKey) {
      alert('Please provide both Base URL and API Key');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/connect`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        }
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

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Integration Dashboard</h1>
          <div className="flex-1 flex items-center gap-4">
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Backend Base URL"
              className="px-3 py-2 border rounded-md text-sm"
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