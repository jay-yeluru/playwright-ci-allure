import { test as base, Page } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

export type Pages = {
  todoPage: TodoPage;
};

/**
 * Extended test fixture that provides pre-built Page Object instances.
 * Import `test` and `expect` from this file instead of @playwright/test.
 */
export const test = base.extend<Pages>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await use(todoPage);
  },
});

export { expect } from '@playwright/test';
