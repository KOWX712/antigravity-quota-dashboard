import { NextResponse } from 'next/server';

const CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
const SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export async function GET() {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent select_account',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
