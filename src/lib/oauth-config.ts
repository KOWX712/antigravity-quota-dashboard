const DEFAULT_OAUTH_CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const DEFAULT_OAUTH_CLIENT_SECRET = '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';

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getOAuthClientId(): string {
  return readEnv('OAUTH_CLIENT_ID') || DEFAULT_OAUTH_CLIENT_ID;
}

export function getOAuthClientSecret(): string {
  return readEnv('OAUTH_CLIENT_SECRET') || DEFAULT_OAUTH_CLIENT_SECRET;
}

export function getOAuthRedirectUriOverride(): string | undefined {
  return readEnv('OAUTH_REDIRECT_URI');
}
