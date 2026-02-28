'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, UserPlus, AlertCircle, CheckCircle2, Clock, Mail, Zap, Download } from 'lucide-react';

interface QuotaInfo {
  remainingFraction: number;
  resetTime?: string;
}

interface ModelInfo {
  displayName: string;
  quotaInfo: QuotaInfo;
}

interface AccountData {
  email: string;
  success: boolean;
  data?: {
    models: Record<string, ModelInfo>;
  };
  error?: string;
}

interface QuotaResponse {
  timestamp: string;
  accounts: AccountData[];
}

export default function DashboardPage() {
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery<QuotaResponse>({
    queryKey: ['quotas'],
    queryFn: async () => {
      const res = await fetch('/api/quotas');
      if (!res.ok) throw new Error('Failed to fetch quotas');
      return res.json();
    },
    refetchInterval: 300000, // 5 minutes
  });

  const handleLoadConfig = async () => {
    setIsLoadingConfig(true);
    setConfigError(null);
    try {
      const res = await fetch('/api/auth/load-plugin-config', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to load config');
      }
      await refetch();
    } catch (err: any) {
      setConfigError(err.message);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-600 fill-blue-600" />
            <h1 className="text-xl font-bold tracking-tight">Antigravity Quota</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleLoadConfig}
              disabled={isLoadingConfig}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Download className={`h-4 w-4 mr-2 ${isLoadingConfig ? 'animate-pulse' : ''}`} />
              {isLoadingConfig ? 'Loading...' : 'Load Plugin Config'}
            </button>
            <button 
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh Now'}
            </button>
            <a
              href="/api/auth/login"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Account
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {configError && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {configError}
                </p>
              </div>
              <button
                onClick={() => setConfigError(null)}
                className="ml-auto pl-3 text-red-500 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 font-medium">Loading aggregated quotas...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error loading quotas: {(error as Error).message}
                </p>
              </div>
            </div>
          </div>
        ) : !data?.accounts || data.accounts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts added</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first Antigravity account.</p>
            <div className="mt-6">
              <a
                href="/api/auth/login"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Account
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.accounts.map((account) => (
              <AccountCard key={account.email} account={account} />
            ))}
          </div>
        )}
      </main>

      {data?.timestamp && (
        <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center text-xs text-gray-400">
          Last updated: {new Date(data.timestamp).toLocaleString()}
        </footer>
      )}
    </div>
  );
}

function AccountCard({ account }: { account: AccountData }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
        <div className="flex items-center space-x-3 truncate">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div className="truncate">
            <h3 className="font-semibold text-gray-900 truncate" title={account.email}>
              {account.email}
            </h3>
            <div className="flex items-center mt-1">
              {account.success ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" /> Error
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 flex-grow">
        {!account.success ? (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
            {account.error || 'Failed to fetch quota data.'}
          </div>
        ) : !account.data?.models || Object.keys(account.data.models).length === 0 ? (
          <p className="text-sm text-gray-500 italic">No models found for this account.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(account.data.models).map(([id, model]) => (
              <div key={id} className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium text-gray-700 truncate mr-2">
                    {model.displayName || id}
                  </label>
                  <span className={`text-xs font-bold ${getQuotaColor(model.quotaInfo.remainingFraction)}`}>
                    {Math.round(model.quotaInfo.remainingFraction * 100)}%
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${getQuotaBgColor(model.quotaInfo.remainingFraction)}`}
                    style={{ width: `${model.quotaInfo.remainingFraction * 100}%` }}
                  />
                </div>
                {model.quotaInfo.resetTime && (
                  <div className="flex items-center text-[10px] text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    Resets: {new Date(model.quotaInfo.resetTime).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getQuotaColor(fraction: number) {
  if (fraction < 0.2) return 'text-red-600';
  if (fraction < 0.5) return 'text-amber-600';
  return 'text-green-600';
}

function getQuotaBgColor(fraction: number) {
  if (fraction < 0.2) return 'bg-red-500';
  if (fraction < 0.5) return 'bg-amber-500';
  return 'bg-green-500';
}
