import { test, expect } from '../../fixtures';
import { specMeta, given, when, then, and, Feature, Story, Severity, Tag, Owner } from '../../helpers/spec';

test.describe('@filter Todo Filtering', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.goto();
    await todoPage.addMultipleTodos(['Buy groceries', 'Walk the dog', 'Read a book']);
    await todoPage.completeTodo('Walk the dog');
  });

  // ─── @smoke — core filter behaviour ──────────────────────────────────────

  test.describe('@smoke', () => {
    test('should show all todos on the All filter', async ({ todoPage }) => {
      await specMeta({
        feature:     Feature.TODO_FILTERING,
        story:       Story.FILTER,
        severity:    Severity.NORMAL,
        tags:        [Tag.SMOKE, Tag.FILTER, Tag.E2E],
        owner:       Owner.QA_TEAM,
        description: 'Verifies that the "All" filter displays both active and completed todos.',
      });

      await given('the user has 2 active and 1 completed todo', async () => {
        await todoPage.assertTodoCount(3);
      });

      await when('the user selects the "All" filter', async () => {
        await todoPage.filterBy('All');
      });

      await then('all 3 todos should be visible', async () => {
        await todoPage.assertTodoCount(3);
      });
    });

    test('should show only active todos on the Active filter', async ({ todoPage }) => {
      await specMeta({
        feature:  Feature.TODO_FILTERING,
        story:    Story.FILTER,
        severity: Severity.NORMAL,
        tags:     [Tag.SMOKE, Tag.FILTER, Tag.E2E],
        owner:    Owner.QA_TEAM,
      });

      await given('the user has 2 active and 1 completed todo', async () => {
        await todoPage.assertTodoCount(3);
      });

      await when('the user selects the "Active" filter', async () => {
        await todoPage.filterBy('Active');
      });

      await then('only the 2 active todos should be visible', async () => {
        await todoPage.assertTodoCount(2);
      });

      await and('"Walk the dog" (completed) should not be shown', async () => {
        await expect(todoPage.todoItems.filter({ hasText: 'Walk the dog' })).toHaveCount(0);
      });
    });

    test('should show only completed todos on the Completed filter', async ({ todoPage }) => {
      await specMeta({
        feature:  Feature.TODO_FILTERING,
        story:    Story.FILTER,
        severity: Severity.NORMAL,
        tags:     [Tag.SMOKE, Tag.FILTER, Tag.E2E],
        owner:    Owner.QA_TEAM,
      });

      await given('the user has 2 active and 1 completed todo', async () => {
        await todoPage.assertTodoCount(3);
      });

      await when('the user selects the "Completed" filter', async () => {
        await todoPage.filterBy('Completed');
      });

      await then('only "Walk the dog" should be visible', async () => {
        await todoPage.assertTodoCount(1);
        await todoPage.assertTodoVisible('Walk the dog');
      });

      await and('the active todos should be hidden', async () => {
        await expect(todoPage.todoItems.filter({ hasText: 'Buy groceries' })).toHaveCount(0);
        await expect(todoPage.todoItems.filter({ hasText: 'Read a book' })).toHaveCount(0);
      });
    });
  });

  // ─── @regression — persistence & edge cases ──────────────────────────────

  test.describe('@regression', () => {
    test('should persist filter state on page reload', async ({ todoPage, page }) => {
      await specMeta({
        feature:     Feature.TODO_FILTERING,
        story:       Story.PERSISTENCE,
        severity:    Severity.MINOR,
        tags:        [Tag.REGRESSION, Tag.FILTER, Tag.PERSISTENCE],
        owner:       Owner.QA_TEAM,
        description: 'Filter selection should survive a full page reload via URL hash.',
      });

      await given('the user has applied the "Active" filter', async () => {
        await todoPage.filterBy('Active');
        await todoPage.assertTodoCount(2);
      });

      await when('the page is reloaded', async () => {
        await page.reload();
      });

      await then('the "Active" filter should still be selected', async () => {
        const activeLink = page.getByRole('link', { name: 'Active' });
        await expect(activeLink).toHaveClass(/selected/);
      });

      await and('only active todos should be shown', async () => {
        await todoPage.assertTodoCount(2);
      });
    });
  });
});
