import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { upsertAccount, getAccount } from '@/lib/db';

const CONFIG_PATH = path.join(os.homedir(), '.config/opencode/antigravity-accounts.json');

export async function POST() {
  try {
    const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8');
    const data = JSON.parse(fileContent);

    if (!data.accounts || !Array.isArray(data.accounts)) {
      return NextResponse.json({ error: 'Invalid config format: "accounts" array missing' }, { status: 400 });
    }

    const results = {
      added: 0,
      updated: 0,
    };

    for (const account of data.accounts) {
      const { email, refreshToken } = account;
      if (!email || !refreshToken) continue;

      const existing = getAccount(email);
      const isNew = !existing;

      upsertAccount({
        email,
        refresh_token: refreshToken,
        access_token: existing ? existing.access_token : "",
        expires_at: existing ? existing.expires_at : 0,
      });

      if (isNew) {
        results.added++;
      } else {
        results.updated++;
      }
    }

    return NextResponse.json({ message: 'Config loaded successfully', results });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Config file not found' }, { status: 404 });
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in config file' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
