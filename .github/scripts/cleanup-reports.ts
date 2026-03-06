#!/usr/bin/env ts-node
/**
 * cleanup-reports.ts
 *
 * Prunes the Allure history kept on the gh-pages branch so that:
 *   - No more than MAX_REPORTS past runs are kept, AND
 *   - No run older than MAX_DAYS days is kept
 *
 * The script operates on the local checkout of the gh-pages branch.
 * It expects the following directory layout (created by allure-report-action):
 *
 *   <root>/
 *     index.html          ← latest report (always kept)
 *     history/            ← Allure trend data (always kept)
 *     last-history/       ← raw results snapshot (always kept)
 *     <run-id>/           ← one directory per past run
 *       index.html
 *       ...
 *     badges/             ← status badges (always kept)
 *
 * Usage (from repo root, gh-pages checked out to ./gh-pages):
 *   npx ts-node scripts/cleanup-reports.ts --dir ./gh-pages
 *
 * Flags:
 *   --dir   Path to the gh-pages checkout  (default: ./gh-pages)
 *   --max-reports  Max number of run dirs to keep (default: 40)
 *   --max-days     Max age in days to keep       (default: 30)
 *   --dry-run      Print what would be deleted without deleting
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Config ──────────────────────────────────────────────────────────────────

const ALWAYS_KEEP = new Set([
  'index.html',
  'history',
  'last-history',
  'badges',
  'favicon.ico',
  '.nojekyll',
  'CNAME',
]);

const DEFAULT_MAX_REPORTS = 40;
const DEFAULT_MAX_DAYS    = 30;

// ── Argument parsing ─────────────────────────────────────────────────────────

function arg(flag: string, fallback: string): string {
  const idx = process.argv.indexOf(flag);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const ghPagesDir  = path.resolve(arg('--dir', './gh-pages'));
const maxReports  = parseInt(arg('--max-reports', String(DEFAULT_MAX_REPORTS)), 10);
const maxDays     = parseInt(arg('--max-days',    String(DEFAULT_MAX_DAYS)),    10);
const dryRun      = process.argv.includes('--dry-run');

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(`[cleanup] ${msg}`); }

function isRunDirectory(name: string, fullPath: string): boolean {
  if (ALWAYS_KEEP.has(name)) return false;
  const stat = fs.statSync(fullPath);
  if (!stat.isDirectory()) return false;
  // Run dirs created by allure-report-action are numeric integers
  return /^\d+$/.test(name);
}

interface RunDir {
  name:    string;
  fullPath: string;
  mtime:   Date;
  runNum:  number;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(ghPagesDir)) {
    console.error(`[cleanup] ERROR: directory not found: ${ghPagesDir}`);
    process.exit(1);
  }

  log(`Scanning: ${ghPagesDir}`);
  log(`Policy  : keep ≤ ${maxReports} reports AND ≤ ${maxDays} days`);
  log(`Dry run : ${dryRun}`);

  const entries = fs.readdirSync(ghPagesDir);
  const runs: RunDir[] = [];

  for (const name of entries) {
    const fullPath = path.join(ghPagesDir, name);
    if (!isRunDirectory(name, fullPath)) continue;
    const stat = fs.statSync(fullPath);
    runs.push({ name, fullPath, mtime: stat.mtime, runNum: parseInt(name, 10) });
  }

  if (runs.length === 0) {
    log('No run directories found — nothing to clean up.');
    return;
  }

  // Sort newest → oldest (highest run number first)
  runs.sort((a, b) => b.runNum - a.runNum);

  log(`Found ${runs.length} run director${runs.length === 1 ? 'y' : 'ies'}.`);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxDays);

  const toDelete: RunDir[] = [];
  const toKeep:   RunDir[] = [];

  runs.forEach((run, idx) => {
    const tooOld  = run.mtime < cutoffDate;
    const tooMany = idx >= maxReports;

    if (tooOld || tooMany) {
      const reason = tooMany ? `exceeds limit of ${maxReports}` : `older than ${maxDays} days (${run.mtime.toISOString().slice(0, 10)})`;
      toDelete.push(run);
      log(`  ✗ ${run.name}  →  DELETE  (${reason})`);
    } else {
      toKeep.push(run);
      log(`  ✓ ${run.name}  →  keep    (run ${idx + 1}/${maxReports}, ${run.mtime.toISOString().slice(0, 10)})`);
    }
  });

  log('');
  log(`Keeping ${toKeep.length} run(s), deleting ${toDelete.length} run(s).`);

  if (toDelete.length === 0) {
    log('Nothing to delete.');
    return;
  }

  if (dryRun) {
    log('Dry-run mode — no files removed.');
    return;
  }

  let deleted = 0;
  let errors  = 0;

  for (const run of toDelete) {
    try {
      fs.rmSync(run.fullPath, { recursive: true, force: true });
      log(`Deleted: ${run.name}`);
      deleted++;
    } catch (err) {
      console.error(`[cleanup] ERROR deleting ${run.name}:`, err);
      errors++;
    }
  }

  log('');
  log(`Done. Deleted ${deleted} run(s)${errors > 0 ? `, ${errors} error(s)` : ''}.`);

  if (errors > 0) process.exit(1);
}

main();
