import { upsertAccount, getAccount, getAllAccounts, deleteAccount, Account } from '../lib/db';

async function test() {
  console.log('--- Starting DB Tests ---');

  const testAccount: Account = {
    email: 'test@example.com',
    access_token: 'abc',
    refresh_token: 'def',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };

  console.log('Testing upsertAccount...');
  upsertAccount(testAccount);
  let account = getAccount(testAccount.email);
  if (account && account.email === testAccount.email) {
    console.log('✅ Upsert and Get successful');
  } else {
    console.log('❌ Upsert or Get failed');
    process.exit(1);
  }

  console.log('Testing update via upsertAccount...');
  const updatedAccount = { ...testAccount, access_token: 'xyz' };
  upsertAccount(updatedAccount);
  account = getAccount(testAccount.email);
  if (account && account.access_token === 'xyz') {
    console.log('✅ Update successful');
  } else {
    console.log('❌ Update failed');
    process.exit(1);
  }

  console.log('Testing getAllAccounts...');
  const accounts = getAllAccounts();
  if (accounts.length > 0) {
    console.log(`✅ Found ${accounts.length} accounts`);
  } else {
    console.log('❌ No accounts found');
    process.exit(1);
  }

  console.log('Testing deleteAccount...');
  deleteAccount(testAccount.email);
  account = getAccount(testAccount.email);
  if (!account) {
    console.log('✅ Delete successful');
  } else {
    console.log('❌ Delete failed');
    process.exit(1);
  }

  console.log('--- All DB Tests Passed! ---');
}

test().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
