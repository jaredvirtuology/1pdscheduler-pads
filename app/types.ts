export type SourceType = 'bigquery';
export type DestinationType = 'google_ads' | 'meta_marketing';
export type ScheduleFrequency = 'hourly' | 'daily' | 'weekly';

export interface BigQueryConfig {
  projectId: string;
  datasetId: string;
  tableId: string;
  credentials: string; // JSON credentials as string
}

export interface GoogleAdsConfig {
  customerId: string;
  developerToken: string;
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export interface MetaMarketingConfig {
  accessToken: string;
  adAccountId: string;
  appId: string;
  appSecret: string;
}

export interface Connection {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  status: 'connected' | 'disconnected' | 'error';
  source: {
    type: SourceType;
    config: BigQueryConfig;
  };
  destination: {
    type: DestinationType;
    config: GoogleAdsConfig | MetaMarketingConfig;
  };
  schedule: {
    frequency: ScheduleFrequency;
    startTime: string; // ISO string
  };
}