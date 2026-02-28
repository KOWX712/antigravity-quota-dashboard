import { NextRequest, NextResponse } from 'next/server';
import { upsertAccount } from '@/lib/db';
import { buildOAuthRedirectUrl } from '@/lib/request-origin';
import { getOAuthClientId, getOAuthClientSecret } from '@/lib/oauth-config';

function decodeIdToken(idToken: string) {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid ID token format');
    }
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding ID token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const clientId = getOAuthClientId();
  const clientSecret = getOAuthClientSecret();
  const redirectUri = buildOAuthRedirectUrl(request.url, request.headers);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/?error=' + error, request.url));
  }

  if (!code) {
    console.error('No code provided in callback');
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Token exchange failed:', data);
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const { access_token, refresh_token, id_token, expires_in } = data;

    const idTokenPayload = decodeIdToken(id_token);
    if (!idTokenPayload || !idTokenPayload.email) {
      console.error('Failed to extract email from id_token');
      return NextResponse.redirect(new URL('/?error=email_extraction_failed', request.url));
    }

    const email = idTokenPayload.email;
    const expiresAt = Math.floor(Date.now() / 1000) + expires_in;

    console.log(`Upserting account for ${email}`);
    upsertAccount({
      email,
      access_token,
      refresh_token: refresh_token || '', // refresh_token might be missing if prompt=consent wasn't used or already granted
      expires_at: expiresAt,
    });

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/?error=internal_callback_error', request.url));
  }
}
