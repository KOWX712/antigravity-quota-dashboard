import test from 'node:test';
import assert from 'node:assert/strict';

import { buildOAuthRedirectUrl, resolveBaseUrl } from './request-origin';

test('resolveBaseUrl prefers APP_BASE_URL when configured', () => {
  process.env.APP_BASE_URL = 'https://quota-dashboard.local/';

  const baseUrl = resolveBaseUrl('http://localhost:3000/api/auth/login', new Headers());

  assert.equal(baseUrl, 'https://quota-dashboard.local');
  delete process.env.APP_BASE_URL;
});

test('resolveBaseUrl uses forwarded host and proto behind reverse proxy', () => {
  const headers = new Headers({
    'x-forwarded-host': 'quota-dashboard.local',
    'x-forwarded-proto': 'https',
  });

  const baseUrl = resolveBaseUrl('http://127.0.0.1:3001/api/auth/login', headers);

  assert.equal(baseUrl, 'https://quota-dashboard.local');
});

test('resolveBaseUrl falls back to request URL origin', () => {
  const baseUrl = resolveBaseUrl('http://localhost:3001/api/auth/login', new Headers());

  assert.equal(baseUrl, 'http://localhost:3001');
});

test('buildOAuthRedirectUrl appends callback path', () => {
  const headers = new Headers({
    host: 'quota-dashboard.local',
  });

  const redirectUrl = buildOAuthRedirectUrl('http://quota-dashboard.local/api/auth/login', headers);

  assert.equal(redirectUrl, 'http://quota-dashboard.local/api/auth/callback');
});
