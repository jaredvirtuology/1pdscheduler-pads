'use client';

import { useState } from 'react';
import { Connection } from '../types';
import { Pencil, Trash2, Play, Loader2 } from 'lucide-react';

interface ConnectionListProps {
  connections: Connection[];
  onEdit: (connection: Connection) => void;
  onDelete: (connectionId: string) => void;
}

export default function ConnectionList({ connections, onEdit, onDelete }: ConnectionListProps) {
  const [syncingConnections, setSyncingConnections] = useState<Set<string>>(new Set());

  const handleSync = async (connectionId: string) => {
    setSyncingConnections(prev => new Set([...prev, connectionId]));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSyncingConnections(prev => {
      const next = new Set(prev);
      next.delete(connectionId);
      return next;
    });
  };

  if (connections.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500">No connections yet. Create your first connection!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {connections.map((connection) => (
        <div 
          key={connection.id}
          className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{connection.name}</h3>
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="text-gray-500">Source:</span>
                  <span className="ml-2 text-gray-900">
                    BigQuery - {connection.source.config.datasetId}.{connection.source.config.tableId}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Destination:</span>
                  <span className="ml-2 text-gray-900">{connection.destination.type}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Schedule:</span>
                  <span className="ml-2 text-gray-900">
                    {connection.schedule.frequency} starting {new Date(connection.schedule.startTime).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSync(connection.id)}
                disabled={syncingConnections.has(connection.id)}
                className={`p-2 rounded ${
                  syncingConnections.has(connection.id)
                    ? 'text-indigo-400 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-100'
                }`}
                title="Sync now"
              >
                {syncingConnections.has(connection.id) ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
              </button>
              <button
                onClick={() => onEdit(connection)}
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded"
                title="Edit connection"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => onDelete(connection.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded"
                title="Delete connection"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
