import { NextResponse } from 'next/server';
import { buildOAuthRedirectUrl } from '@/lib/request-origin';
import { getOAuthClientId } from '@/lib/oauth-config';

const SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export async function GET(request: Request) {
  const clientId = getOAuthClientId();
  const redirectUri = buildOAuthRedirectUrl(request.url, request.headers);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
