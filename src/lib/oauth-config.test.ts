import test from 'node:test';
import assert from 'node:assert/strict';

import { getOAuthClientId, getOAuthClientSecret, getOAuthRedirectUriOverride } from './oauth-config';

test('oauth config uses default client credentials when env is not set', () => {
  delete process.env.OAUTH_CLIENT_ID;
  delete process.env.OAUTH_CLIENT_SECRET;

  assert.equal(getOAuthClientId(), '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com');
  assert.equal(getOAuthClientSecret(), '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');
});

test('oauth config uses env client credentials when provided', () => {
  process.env.OAUTH_CLIENT_ID = 'custom-client-id';
  process.env.OAUTH_CLIENT_SECRET = 'custom-client-secret';

  assert.equal(getOAuthClientId(), 'custom-client-id');
  assert.equal(getOAuthClientSecret(), 'custom-client-secret');

  delete process.env.OAUTH_CLIENT_ID;
  delete process.env.OAUTH_CLIENT_SECRET;
});

test('oauth config exposes redirect URI override only when set', () => {
  delete process.env.OAUTH_REDIRECT_URI;
  assert.equal(getOAuthRedirectUriOverride(), undefined);

  process.env.OAUTH_REDIRECT_URI = 'https://example.com/oauth/callback';
  assert.equal(getOAuthRedirectUriOverride(), 'https://example.com/oauth/callback');

  delete process.env.OAUTH_REDIRECT_URI;
});
