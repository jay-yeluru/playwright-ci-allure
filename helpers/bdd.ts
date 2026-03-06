import * as allure from 'allure-js-commons';

/**
 * BDD-style step wrappers using Allure annotations.
 * Provides Gherkin-like syntax (Given/When/Then) without
 * requiring an actual BDD framework like Cucumber.
 *
 * For test metadata (feature, story, severity, tags…) use `specMeta()`
 * from helpers/spec.ts instead.
 */

export async function given(description: string, fn: () => Promise<void>): Promise<void> {
  await allure.step(`Given ${description}`, fn);
}

export async function when(description: string, fn: () => Promise<void>): Promise<void> {
  await allure.step(`When ${description}`, fn);
}

export async function then(description: string, fn: () => Promise<void>): Promise<void> {
  await allure.step(`Then ${description}`, fn);
}

export async function and(description: string, fn: () => Promise<void>): Promise<void> {
  await allure.step(`And ${description}`, fn);
}

export async function but(description: string, fn: () => Promise<void>): Promise<void> {
  await allure.step(`But ${description}`, fn);
}
