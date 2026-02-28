import test from 'node:test';
import assert from 'node:assert/strict';
import { extractRecommendedModelIds } from './recommended-models';

test('extractRecommendedModelIds returns IDs from Recommended groups only', () => {
  const ids = extractRecommendedModelIds([
    {
      displayName: 'Recommended',
      groups: [
        { modelIds: ['gemini-3.1-pro-high', 'claude-sonnet-4-6'] },
        { modelIds: ['gpt-oss-120b-medium'] },
      ],
    },
    {
      displayName: 'Other',
      groups: [{ modelIds: ['chat_20706'] }],
    },
  ]);

  assert.deepEqual(ids, new Set(['gemini-3.1-pro-high', 'claude-sonnet-4-6', 'gpt-oss-120b-medium']));
});

test('extractRecommendedModelIds is case-insensitive and de-duplicates IDs', () => {
  const ids = extractRecommendedModelIds([
    {
      displayName: 'recommended',
      groups: [{ modelIds: ['gemini-3-flash', 'gemini-3-flash'] }],
    },
  ]);

  assert.deepEqual(ids, new Set(['gemini-3-flash']));
});
