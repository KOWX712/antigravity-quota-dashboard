import { NextResponse } from 'next/server';
import { getAllAccounts } from '@/lib/db';
import { getAccountQuota } from '@/lib/antigravity';

export async function GET() {
  try {
    const accounts = getAllAccounts();
    const quotaPromises = accounts.map(async (account) => {
      try {
        const quotaData = await getAccountQuota(account);
        return {
          email: account.email,
          success: true,
          data: quotaData,
        };
      } catch (error: any) {
        console.error(`Error fetching quota for ${account.email}:`, error);
        return {
          email: account.email,
          success: false,
          error: error.message || 'Unknown error',
        };
      }
    });

    const results = await Promise.all(quotaPromises);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      accounts: results,
    });
  } catch (error: any) {
    console.error('Aggregated quota fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
