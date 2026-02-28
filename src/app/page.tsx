'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, UserPlus, AlertCircle, CheckCircle2, Clock, Mail, Zap, Download, ChevronDown } from 'lucide-react';

interface QuotaInfo {
  remainingFraction: number;
  resetTime?: string;
}

interface ModelInfo {
  displayName?: string;
  modelProvider?: string;
  quotaInfo: QuotaInfo;
}

interface ModelGroup {
  id: string;
  name: string;
  models: Array<{ id: string; model: ModelInfo }>;
  resetTime?: string;
  remainingFraction: number;
  isOther?: boolean;
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
      
      if (!res.ok) {
        let errorMessage = 'Failed to load config';
        try {
          const result = await res.json();
          errorMessage = result.error || errorMessage;
        } catch {
          errorMessage = `Server error (${res.status}): ${res.statusText || 'Unexpected response format'}`;
        }
        throw new Error(errorMessage);
      }

      // Parse success response if needed (though we mostly care about refetch)
      try {
        await res.json();
      } catch {
        // Ignore parsing errors on success if we don't need the data
      }
      
      await refetch();
    } catch (err: unknown) {
      setConfigError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleRemoveAccount = async (email: string) => {
    if (!window.confirm(`Are you sure you want to remove account ${email}?`)) {
      return;
    }

    try {
      const res = await fetch('/api/accounts/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to remove account');
      }

      await refetch();
    } catch (err: unknown) {
      alert(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
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
              <AccountCard 
                key={account.email} 
                account={account} 
                onRemove={handleRemoveAccount} 
              />
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

function AccountCard({ account, onRemove }: { account: AccountData; onRemove: (email: string) => void }) {
  const groupedModels = useMemo(() => {
    if (!account.success || !account.data?.models) return [];

    const groups = new Map<string, ModelGroup>();
    const otherGroup: ModelGroup = {
      id: 'other',
      name: 'Other',
      models: [],
      remainingFraction: 0,
      isOther: true
    };

    Object.entries(account.data.models).forEach(([id, model]) => {
      const isNoise = !model.displayName || id.startsWith('chat_') || id.startsWith('tab_');
      
      if (isNoise) {
        otherGroup.models.push({ id, model });
        return;
      }

      const provider = model.modelProvider || 'UNKNOWN';
      const resetTime = model.quotaInfo.resetTime || 'NO_RESET';
      const fraction = model.quotaInfo.remainingFraction;
      const groupKey = `${provider}_${resetTime}_${fraction}`;

      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          id: groupKey,
          name: provider,
          models: [],
          resetTime: model.quotaInfo.resetTime,
          remainingFraction: fraction,
        });
      }
      
      groups.get(groupKey)!.models.push({ id, model });
    });

    groups.forEach(group => {
      group.models.sort((a, b) => {
        const nameA = a.model.displayName || a.id;
        const nameB = b.model.displayName || b.id;
        return nameA.localeCompare(nameB);
      });
    });

    otherGroup.models.sort((a, b) => {
      const nameA = a.model.displayName || a.id;
      const nameB = b.model.displayName || b.id;
      return nameA.localeCompare(nameB);
    });

    const sortedGroups = Array.from(groups.values()).sort((a, b) => a.name.localeCompare(b.name));
    
    if (otherGroup.models.length > 0) {
      sortedGroups.push(otherGroup);
    }

    return sortedGroups;
  }, [account.success, account.data]);

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-colors cursor-default"
      onContextMenu={(e) => {
        e.preventDefault();
        onRemove(account.email);
      }}
    >
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
        ) : groupedModels.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No models found for this account.</p>
        ) : (
          <div className="space-y-3">
            {groupedModels.map((group) => (
              <QuotaGroup key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuotaGroup({ group }: { group: ModelGroup }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex justify-between items-center focus:outline-none transition-colors"
      >
        <div className="flex-1 min-w-0 mr-4">
          <h4 className="font-medium text-gray-900 truncate">{group.name}</h4>
          {!group.isOther && (
            <div className="flex items-center text-xs text-gray-500 mt-1 flex-wrap gap-x-3 gap-y-1">
              <span className={`font-bold ${getQuotaColor(group.remainingFraction)}`}>
                {Math.round(group.remainingFraction * 100)}% remaining
              </span>
              {group.resetTime && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Resets: {formatRelativeTime(group.resetTime)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      
      {expanded && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
          {group.models.map(({ id, model }) => (
            <div key={id} className="flex justify-between items-center text-sm">
              <span className="text-gray-700 truncate mr-2">
                {model.displayName || id}
              </span>
              {group.isOther && (
                <span className={`text-xs font-bold ${getQuotaColor(model.quotaInfo.remainingFraction)}`}>
                  {Math.round(model.quotaInfo.remainingFraction * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getQuotaColor(fraction: number) {
  if (fraction < 0.2) return 'text-red-600';
  if (fraction < 0.5) return 'text-amber-600';
  return 'text-green-600';
}

function formatRelativeTime(dateString?: string) {
  if (!dateString) return 'No reset time';
  const resetDate = new Date(dateString);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Resetting now...';
  
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `in ${days} day${days > 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `in ${hours}h ${mins}m`;
  }
  
  return `in ${mins}m`;
}
