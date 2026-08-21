#!/usr/bin/env bun
/**
 * Upload editorial slug metadata to R2.
 * Edit scripts/editorial-slugs.json to add new entries, then run:
 *   npm run gen-editorial
 */

import { execSync, spawnSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

const BUCKET = 'pg-cms-manifest';
const R2_KEY = 'editorial/slugs.json';
const TMP_EXISTING = '/tmp/editorial-slugs-existing.json';
const TMP_OUT = '/tmp/editorial-slugs-upload.json';
const LOCAL_FILE = resolve(import.meta.dir, 'editorial-slugs.json');

interface SlugEntry {
  slug: string;
  ogTitle: string;
  ogDescription: string;
}

// ── 1. Load local entries ────────────────────────────────────────────────────

const local: SlugEntry[] = JSON.parse(readFileSync(LOCAL_FILE, 'utf-8'));
console.log(`Loaded ${local.length} entries from ${LOCAL_FILE}`);

// ── 2. Load existing entries from R2 ─────────────────────────────────────────

let existing: SlugEntry[] = [];

console.log('Fetching existing slugs from R2...');
const fetchResult = spawnSync(
  'wrangler',
  ['r2', 'object', 'get', `${BUCKET}/${R2_KEY}`, '--remote', '--file', TMP_EXISTING],
  { stdio: 'pipe' },
);

if (fetchResult.status === 0 && existsSync(TMP_EXISTING)) {
  try {
    existing = JSON.parse(readFileSync(TMP_EXISTING, 'utf-8'));
    console.log(`Found ${existing.length} existing entries in R2.`);
  } catch {
    console.log('Could not parse existing R2 file, will overwrite.');
  }
} else {
  console.log('No existing file in R2, uploading fresh.');
}

// ── 3. Merge (local entries override/append; no duplicate slugs) ─────────────

const existingMap = new Map(existing.map((e) => [e.slug, e]));
for (const entry of local) {
  existingMap.set(entry.slug, entry);
}
const merged = Array.from(existingMap.values());
const added = merged.length - existing.length;

console.log(`Merged total: ${merged.length} entries (${added > 0 ? `+${added} new` : 'no new entries'}).`);

// ── 4. Upload to R2 ───────────────────────────────────────────────────────────

writeFileSync(TMP_OUT, JSON.stringify(merged, null, 2));

console.log('Uploading to R2...');
execSync(`wrangler r2 object put ${BUCKET}/${R2_KEY} --file ${TMP_OUT} --remote`, {
  stdio: 'inherit',
});

// ── 5. Cleanup ────────────────────────────────────────────────────────────────

if (existsSync(TMP_EXISTING)) unlinkSync(TMP_EXISTING);
unlinkSync(TMP_OUT);

console.log('\n✓ Done. Available slugs:\n');
local.forEach((e) => console.log(`  /editorial/${e.slug}`));
