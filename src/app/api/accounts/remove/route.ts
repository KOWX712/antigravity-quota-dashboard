import { NextResponse } from 'next/server';
import { deleteAccount } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    deleteAccount(email);

    return NextResponse.json({ success: true, message: `Account ${email} removed` });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Account removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}

