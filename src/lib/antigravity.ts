import { Account, upsertAccount } from './db';
import type { AgentModelSort } from './recommended-models';

const CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const BASE_URL = 'https://cloudcode-pa.googleapis.com';

export interface AvailableModelsResponse {
  models?: Record<string, unknown>;
  agentModelSorts?: AgentModelSort[];
  [key: string]: unknown;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Token refresh failed: ${JSON.stringify(data)}`);
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}

export async function loadCodeAssist(accessToken: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/v1internal:loadCodeAssist`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'antigravity',
    },
    body: JSON.stringify({
      metadata: {
        ideType: 'ANTIGRAVITY',
        platform: 'PLATFORM_UNSPECIFIED',
        pluginType: 'GEMINI',
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`loadCodeAssist failed: ${JSON.stringify(data)}`);
  }

  return data.cloudaicompanionProject;
}

export async function fetchAvailableModels(accessToken: string, projectId: string): Promise<AvailableModelsResponse> {
  const response = await fetch(`${BASE_URL}/v1internal:fetchAvailableModels`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'antigravity',
    },
    body: JSON.stringify({ project: projectId }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`fetchAvailableModels failed: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function getAccountQuota(account: Account) {
  let currentAccessToken = account.access_token;
  const now = Math.floor(Date.now() / 1000);

  // Buffer of 60 seconds for expiration
  if (account.expires_at <= now + 60) {
    console.log(`Refreshing access token for ${account.email}...`);
    try {
      const refreshed = await refreshAccessToken(account.refresh_token);
      currentAccessToken = refreshed.access_token;
      const newExpiresAt = now + refreshed.expires_in;

      upsertAccount({
        ...account,
        access_token: currentAccessToken,
        expires_at: newExpiresAt,
      });
      console.log(`Successfully refreshed token for ${account.email}`);
    } catch (error) {
      console.error(`Failed to refresh token for ${account.email}:`, error);
      throw error;
    }
  }

  try {
    const projectId = await loadCodeAssist(currentAccessToken);
    const quotaInfo = await fetchAvailableModels(currentAccessToken, projectId);
    return quotaInfo;
  } catch (error) {
    console.error(`Failed to fetch quota for ${account.email}:`, error);
    throw error;
  }
}
