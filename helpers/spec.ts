import * as allure from 'allure-js-commons';
import { Feature, Story, Severity, Tag, Owner } from './tags';

export interface SpecMeta {
  feature:     Feature;
  story:       Story;
  severity?:   Severity;
  tags?:       Tag[];
  owner?:      Owner;
  description?: string;
}

/**
 * Apply all Allure metadata for a test in one call.
 *
 * @example
 * await specMeta({
 *   feature:     Feature.TODO_MANAGEMENT,
 *   story:       Story.CREATE,
 *   severity:    Severity.CRITICAL,
 *   tags:        [Tag.SMOKE, Tag.CREATION],
 *   owner:       Owner.QA_TEAM,
 *   description: 'Verifies a user can add a new todo.',
 * });
 */
export async function specMeta(meta: SpecMeta): Promise<void> {
  await allure.feature(meta.feature);
  await allure.story(meta.story);

  if (meta.severity) {
    await allure.severity(meta.severity as allure.Severity);
  }

  if (meta.tags?.length) {
    await Promise.all(meta.tags.map((t) => allure.tag(t)));
  }

  if (meta.owner) {
    await allure.owner(meta.owner);
  }

  if (meta.description) {
    await allure.description(meta.description);
  }
}

// Re-export everything so specs only need one import
export { Feature, Story, Severity, Tag, Owner };
export { given, when, then, and, but } from './bdd';
