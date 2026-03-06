import { test, expect } from '../../fixtures';
import { specMeta, given, when, then, and, but, Feature, Story, Severity, Tag, Owner } from '../../helpers/spec';

test.describe('@management Todo Management', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.goto();
    await todoPage.addMultipleTodos(['Buy groceries', 'Walk the dog', 'Read a book']);
  });

  // ─── @smoke — critical path ───────────────────────────────────────────────

  test.describe('@smoke', () => {
    test('should mark a todo as completed', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.COMPLETE,
        severity: Severity.CRITICAL,
        tags: [Tag.SMOKE, Tag.COMPLETION, Tag.E2E],
        owner: Owner.QA_TEAM,
        description: 'Verifies that a todo can be marked as completed, updating its visual state.',
      });

      await given('the user has three active todo items', async () => {
        await todoPage.assertTodoCount(3);
      });

      await when('the user clicks the checkbox on "Buy groceries"', async () => {
        await todoPage.completeTodo('Buy groceries');
      });

      await then('the item should be marked as completed', async () => {
        const isCompleted = await todoPage.isTodoCompleted('Buy groceries');
        expect(isCompleted).toBe(true);
      });

      await and('the counter should update to 2 items left', async () => {
        await todoPage.assertCounterText('2 items left');
      });
    });

    test('should delete a todo item', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.DELETE,
        severity: Severity.CRITICAL,
        tags: [Tag.SMOKE, Tag.DELETION, Tag.E2E],
        owner: Owner.QA_TEAM,
      });

      await given('the user has three todo items', async () => {
        await todoPage.assertTodoCount(3);
      });

      await when('the user deletes "Walk the dog"', async () => {
        await todoPage.deleteTodo('Walk the dog');
      });

      await then('the item should be removed from the list', async () => {
        await todoPage.assertTodoCount(2);
      });

      await and('the remaining items should still be visible', async () => {
        await todoPage.assertTodoVisible('Buy groceries');
        await todoPage.assertTodoVisible('Read a book');
      });

      await but('"Walk the dog" should no longer be in the list', async () => {
        await expect(todoPage.todoItems.filter({ hasText: 'Walk the dog' })).toHaveCount(0);
      });
    });
  });

  // ─── @regression — full CRUD ──────────────────────────────────────────────

  test.describe('@regression', () => {
    test('should edit an existing todo item', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.EDIT,
        severity: Severity.NORMAL,
        tags: [Tag.REGRESSION, Tag.EDITING],
        owner: Owner.QA_TEAM,
      });

      await given('the user has a todo "Buy groceries"', async () => {
        await todoPage.assertTodoVisible('Buy groceries');
      });

      await when('the user double-clicks and edits the item to "Buy organic groceries"', async () => {
        await todoPage.editTodo('Buy groceries', 'Buy organic groceries');
      });

      await then('the todo text should be updated', async () => {
        await todoPage.assertTodoVisible('Buy organic groceries');
      });

      await and('the original text should no longer exist', async () => {
        await expect(todoPage.todoItems.filter({ hasText: 'Buy groceries' })).toHaveCount(0);
      });
    });

    test('should toggle all todos at once', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.BULK,
        severity: Severity.NORMAL,
        tags: [Tag.REGRESSION, Tag.BULK],
        owner: Owner.QA_TEAM,
      });

      await given('the user has three active todo items', async () => {
        await todoPage.assertTodoCount(3);
      });

      await when('the user clicks the "Toggle All" checkbox', async () => {
        await todoPage.toggleAll();
      });

      await then('all todos should be marked as completed', async () => {
        const items = ['Buy groceries', 'Walk the dog', 'Read a book'];
        for (const item of items) {
          expect(await todoPage.isTodoCompleted(item)).toBe(true);
        }
      });

      await and('the counter should show 0 items left', async () => {
        await todoPage.assertCounterText('0 items left');
      });
    });

    test('should clear all completed todos', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.BULK,
        severity: Severity.NORMAL,
        tags: [Tag.REGRESSION, Tag.BULK, Tag.DELETION],
        owner: Owner.QA_TEAM,
      });

      await given('the user has completed some todos', async () => {
        await todoPage.completeTodo('Buy groceries');
        await todoPage.completeTodo('Walk the dog');
      });

      await when('the user clicks "Clear completed"', async () => {
        await todoPage.clearCompleted();
      });

      await then('the completed todos should be removed', async () => {
        await todoPage.assertTodoCount(1);
      });

      await and('only active todos should remain', async () => {
        await todoPage.assertTodoVisible('Read a book');
      });
    });
  });
});
