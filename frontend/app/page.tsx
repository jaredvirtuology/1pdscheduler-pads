'use client';
import { useState } from 'react';
import ConnectionList from './components/ConnectionList';
import ConnectionForm from './components/ConnectionForm';
import { Connection } from './types';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  const handleSubmit = (connection: Connection) => {
    if (editingConnection) {
      // Update existing connection
      setConnections(connections.map(c => 
        c.id === editingConnection.id 
          ? { ...connection, id: editingConnection.id }
          : c
      ));
      setEditingConnection(null);
    } else {
      // Add new connection
      setConnections([...connections, connection]);
    }
    setShowForm(false);
  };

  const handleHealthCheck = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL!, {
        method: 'GET'
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
          <div className="flex-1 flex items-center gap-4 justify-end">
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