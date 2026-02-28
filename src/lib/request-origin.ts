import { getOAuthRedirectUriOverride } from './oauth-config';

const OAUTH_CALLBACK_PATH = '/api/auth/callback';

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

function firstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value.split(',')[0]?.trim();
  return first || null;
}

export function resolveBaseUrl(requestUrl: string, headers: Pick<Headers, 'get'>): string {
  const configuredBaseUrl = process.env.APP_BASE_URL;
  if (configuredBaseUrl && configuredBaseUrl.trim()) {
    return normalizeBaseUrl(configuredBaseUrl);
  }

  const forwardedHost = firstHeaderValue(headers.get('x-forwarded-host'));
  if (forwardedHost) {
    const forwardedProto = firstHeaderValue(headers.get('x-forwarded-proto'));
    const requestProto = new URL(requestUrl).protocol.replace(':', '');
    return `${forwardedProto || requestProto}://${forwardedHost}`;
  }

  return new URL(requestUrl).origin;
}

export function buildOAuthRedirectUrl(requestUrl: string, headers: Pick<Headers, 'get'>): string {
  const redirectUriOverride = getOAuthRedirectUriOverride();
  if (redirectUriOverride) {
    return normalizeBaseUrl(redirectUriOverride);
  }

  const baseUrl = resolveBaseUrl(requestUrl, headers);
  return `${baseUrl}${OAUTH_CALLBACK_PATH}`;
}
