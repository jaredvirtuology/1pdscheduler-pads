'use client';

import { useState } from 'react';
import { 
  Connection, 
  BigQueryConfig, 
  GoogleAdsConfig, 
  MetaMarketingConfig,
  SourceType,
  DestinationType,
  ScheduleFrequency
} from '../types';

interface ConnectionFormProps {
  onSubmit: (connection: Connection) => void;
  onCancel: () => void;
  initialValues?: Connection;
}

export default function ConnectionForm({ onSubmit, onCancel, initialValues }: ConnectionFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: initialValues?.name || '',
    source: {
      type: (initialValues?.source.type || 'bigquery') as SourceType,
      config: initialValues?.source.config || {
        projectId: '',
        datasetId: '',
        tableId: '',
        credentials: ''
      } as BigQueryConfig
    },
    destination: {
      type: (initialValues?.destination.type || 'google_ads') as DestinationType,
      config: initialValues?.destination.config || {
        customerId: '',
        developerToken: '',
        accessToken: '',
        refreshToken: '',
        clientId: '',
        clientSecret: ''
      } as GoogleAdsConfig
    },
    schedule: {
      frequency: (initialValues?.schedule.frequency || 'daily') as ScheduleFrequency,
      startTime: initialValues?.schedule.startTime || ''
    }
  });

  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    onSubmit({
      id: Date.now().toString(),
      ...formData,
      baseUrl,
      apiKey,
      status: 'disconnected'
    } as Connection);
    setBaseUrl('');
    setApiKey('');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Connection Name</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">BigQuery Source Configuration</h2>
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">Project ID</label>
              <input
                type="text"
                id="projectId"
                value={formData.source.config.projectId}
                onChange={(e) => setFormData({
                  ...formData,
                  source: {
                    ...formData.source,
                    config: {
                      ...formData.source.config,
                      projectId: e.target.value
                    }
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="datasetId" className="block text-sm font-medium text-gray-700">Dataset ID</label>
              <input
                type="text"
                id="datasetId"
                value={formData.source.config.datasetId}
                onChange={(e) => setFormData({
                  ...formData,
                  source: {
                    ...formData.source,
                    config: {
                      ...formData.source.config,
                      datasetId: e.target.value
                    }
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="tableId" className="block text-sm font-medium text-gray-700">Table ID</label>
              <input
                type="text"
                id="tableId"
                value={formData.source.config.tableId}
                onChange={(e) => setFormData({
                  ...formData,
                  source: {
                    ...formData.source,
                    config: {
                      ...formData.source.config,
                      tableId: e.target.value
                    }
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="credentials" className="block text-sm font-medium text-gray-700">Service Account Credentials (JSON)</label>
              <textarea
                id="credentials"
                value={formData.source.config.credentials}
                onChange={(e) => setFormData({
                  ...formData,
                  source: {
                    ...formData.source,
                    config: {
                      ...formData.source.config,
                      credentials: e.target.value
                    }
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                rows={4}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Destination Configuration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Destination</label>
              <select
                value={formData.destination.type}
                onChange={(e) => setFormData({
                  ...formData,
                  destination: {
                    type: e.target.value as DestinationType,
                    config: e.target.value === 'google_ads' 
                      ? {
                          customerId: '',
                          developerToken: '',
                          accessToken: '',
                          refreshToken: '',
                          clientId: '',
                          clientSecret: ''
                        }
                      : {
                          accessToken: '',
                          adAccountId: '',
                          appId: '',
                          appSecret: ''
                        }
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="google_ads">Google Ads</option>
                <option value="meta_marketing">Meta Marketing</option>
              </select>
            </div>
            
            {formData.destination.type === 'google_ads' ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">Customer ID</label>
                  <input
                    type="text"
                    id="customerId"
                    value={(formData.destination.config as GoogleAdsConfig).customerId}
                    onChange={(e) => setFormData({
                      ...formData,
                      destination: {
                        ...formData.destination,
                        config: {
                          ...(formData.destination.config as GoogleAdsConfig),
                          customerId: e.target.value
                        }
                      }
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                {/* Add other Google Ads fields similarly */}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">Access Token</label>
                  <input
                    type="text"
                    id="accessToken"
                    value={(formData.destination.config as MetaMarketingConfig).accessToken}
                    onChange={(e) => setFormData({
                      ...formData,
                      destination: {
                        ...formData.destination,
                        config: {
                          ...(formData.destination.config as MetaMarketingConfig),
                          accessToken: e.target.value
                        }
                      }
                    })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                {/* Add other Meta Marketing fields similarly */}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Schedule Configuration</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <select
                value={formData.schedule.frequency}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: {
                    ...formData.schedule,
                    frequency: e.target.value as ScheduleFrequency
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                id="startTime"
                value={formData.schedule.startTime}
                onChange={(e) => setFormData({
                  ...formData,
                  schedule: {
                    ...formData.schedule,
                    startTime: e.target.value
                  }
                })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      {renderStep()}
      
      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          {step === 4 ? (initialValues ? 'Update Connection' : 'Create Connection') : 'Next'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}