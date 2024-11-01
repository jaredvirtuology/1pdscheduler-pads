'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface SchemaConfig {
    type: string;
    required: boolean;
    description?: string;
}

interface SchemaDefinition {
    name: string;
    configs: Record<string, SchemaConfig>;
}

interface ParsedSchemas {
    sources: SchemaDefinition[];
    destinations: SchemaDefinition[];
}

export default function SchemaViewer() {
    const [schemas, setSchemas] = useState<ParsedSchemas | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const parseSchemas = (rawSchemas: any): ParsedSchemas => {
        const parsed: ParsedSchemas = {
            sources: [],
            destinations: []
        };

        // Parse sources
        if (rawSchemas.sources) {
            Object.entries(rawSchemas.sources).forEach(([name, schema]: [string, any]) => {
                parsed.sources.push({
                    name,
                    configs: schema.configs || {}
                });
            });
        }

        // Parse destinations
        if (rawSchemas.destinations) {
            Object.entries(rawSchemas.destinations).forEach(([name, schema]: [string, any]) => {
                parsed.destinations.push({
                    name,
                    configs: schema.configs || {}
                });
            });
        }

        return parsed;
    };

    const fetchSchemas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/schemas');
            if (!response.ok) {
                throw new Error('Failed to fetch schemas');
            }
            const data = await response.json();
            setSchemas(parseSchemas(data));
        } catch (err) {
            setError('Failed to fetch schemas');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const renderConfigTable = (configs: Record<string, SchemaConfig>) => (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Config Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Required
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(configs).map(([name, config]) => (
                    <tr key={name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {config.required ? (
                                <span className="text-red-600">Required</span>
                            ) : (
                                <span className="text-gray-400">Optional</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                            {config.description || '-'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (!isClient) {
        return null;
    }

    return (
        <div className="p-4">
            <Button 
                onClick={fetchSchemas}
                className="mb-4"
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading Schemas...
                    </div>
                ) : (
                    'Load Schemas'
                )}
            </Button>

            {error && (
                <div className="text-red-500 mb-4">
                    {error}
                </div>
            )}

            {isLoading && !schemas && (
                <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}

            {schemas && !isLoading && (
                <div className="space-y-8">
                    {/* Sources Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Sources</h3>
                        <div className="space-y-6">
                            {schemas.sources.map((source) => (
                                <div key={source.name} className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                        <h4 className="text-md font-medium text-gray-900">{source.name}</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        {renderConfigTable(source.configs)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Destinations Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Destinations</h3>
                        <div className="space-y-6">
                            {schemas.destinations.map((destination) => (
                                <div key={destination.name} className="bg-white shadow rounded-lg overflow-hidden">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                        <h4 className="text-md font-medium text-gray-900">{destination.name}</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        {renderConfigTable(destination.configs)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 