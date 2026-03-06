/**
 * Centralised tag & label registry.
 *
 * Usage:
 *   import { Tag, Feature, Story, Owner } from '../helpers/tags';
 *   await specMeta({ feature: Feature.TODO, story: Story.CREATE, tags: [Tag.SMOKE] });
 */

// ─── Features ────────────────────────────────────────────────────────────────
export const Feature = {
  TODO_MANAGEMENT: 'Todo Management',
  TODO_FILTERING:  'Todo Filtering',
} as const;
export type Feature = (typeof Feature)[keyof typeof Feature];

// ─── Stories ─────────────────────────────────────────────────────────────────
export const Story = {
  CREATE:      'Create Todo',
  COMPLETE:    'Complete Todo',
  DELETE:      'Delete Todo',
  EDIT:        'Edit Todo',
  BULK:        'Bulk Actions',
  FILTER:      'Filter Todos',
  PERSISTENCE: 'Filter Persistence',
} as const;
export type Story = (typeof Story)[keyof typeof Story];

// ─── Tags ────────────────────────────────────────────────────────────────────
export const Tag = {
  // Test-suite groups
  SMOKE:       '@smoke',
  REGRESSION:  '@regression',
  E2E:         '@e2e',

  // Functional area
  CREATION:    '@creation',
  COMPLETION:  '@completion',
  DELETION:    '@deletion',
  EDITING:     '@editing',
  FILTER:      '@filter',
  BULK:        '@bulk-action',
  PERSISTENCE: '@persistence',

  // Risk / special
  EDGE_CASE:   '@edge-case',
  FLAKY:       '@flaky',
  WIP:         '@wip',
} as const;
export type Tag = (typeof Tag)[keyof typeof Tag];

// ─── Owners ──────────────────────────────────────────────────────────────────
export const Owner = {
  QA_TEAM:   'qa-team',
  FRONTEND:  'frontend-team',
} as const;
export type Owner = (typeof Owner)[keyof typeof Owner];

// ─── Severity ─────────────────────────────────────────────────────────────────
export const Severity = {
  BLOCKER:  'blocker',
  CRITICAL: 'critical',
  NORMAL:   'normal',
  MINOR:    'minor',
  TRIVIAL:  'trivial',
} as const;
export type Severity = (typeof Severity)[keyof typeof Severity];
