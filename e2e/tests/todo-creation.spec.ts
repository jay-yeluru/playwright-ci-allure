import { test, expect } from '../../fixtures';
import { specMeta, given, when, then, and, Feature, Story, Severity, Tag, Owner } from '../../helpers/spec';

test.describe('@creation Todo Creation', () => {
  test.beforeEach(async ({ todoPage }) => {
    await todoPage.goto();
  });

  // ─── @smoke ──────────────────────────────────────────────────────────────

  test.describe('@smoke', () => {
    test('should add a single todo item', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.CREATE,
        severity: Severity.CRITICAL,
        tags: [Tag.SMOKE, Tag.CREATION, Tag.E2E],
        owner: Owner.QA_TEAM,
        description: 'Verifies that a user can create a new todo item successfully.',
      });

      await given('the user is on the Todo app homepage', async () => {
        await expect(todoPage.newTodoInput).toBeVisible();
      });

      await when('the user types a task and presses Enter', async () => {
        await todoPage.addTodo('Buy groceries');
      });

      await then('the todo item should appear in the list', async () => {
        await todoPage.assertTodoVisible('Buy groceries');
      });

      await and('the item count should show 1 item', async () => {
        await todoPage.assertCounterText('1 item left');
      });
    });

    test('should add multiple todo items', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.CREATE,
        severity: Severity.NORMAL,
        tags: [Tag.SMOKE, Tag.CREATION, Tag.E2E],
        owner: Owner.QA_TEAM,
        description: 'Verifies that multiple todo items can be added sequentially.',
      });

      const items = ['Buy groceries', 'Walk the dog', 'Read a book'];

      await given('the user is on the Todo app homepage', async () => {
        await expect(todoPage.newTodoInput).toBeVisible();
      });

      await when('the user adds three todo items', async () => {
        await todoPage.addMultipleTodos(items);
      });

      await then('all three items should be visible in the list', async () => {
        await todoPage.assertTodoCount(3);
        for (const item of items) {
          await todoPage.assertTodoVisible(item);
        }
      });

      await and('the counter should show 3 items left', async () => {
        await todoPage.assertCounterText('3 items left');
      });
    });
  });

  // ─── @edge-case ──────────────────────────────────────────────────────────

  test.describe('@edge-case', () => {
    test('should not add an empty todo item', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.CREATE,
        severity: Severity.MINOR,
        tags: [Tag.EDGE_CASE, Tag.CREATION, Tag.REGRESSION],
        owner: Owner.QA_TEAM,
      });

      await given('the user is on the Todo app homepage', async () => {
        await expect(todoPage.newTodoInput).toBeVisible();
      });

      await when('the user presses Enter without typing anything', async () => {
        await todoPage.newTodoInput.press('Enter');
      });

      await then('no todo item should be added', async () => {
        await todoPage.assertTodoCount(0);
      });
    });

    test('should trim whitespace from new todo items', async ({ todoPage }) => {
      await specMeta({
        feature: Feature.TODO_MANAGEMENT,
        story: Story.CREATE,
        severity: Severity.MINOR,
        tags: [Tag.EDGE_CASE, Tag.CREATION, Tag.REGRESSION],
        owner: Owner.QA_TEAM,
        description: 'Leading and trailing whitespace must be stripped before saving.',
      });

      await given('the user is on the Todo app homepage', async () => {
        await expect(todoPage.newTodoInput).toBeVisible();
      });

      await when('the user types a task surrounded by whitespace', async () => {
        await todoPage.addTodo('  Trimmed task  ');
      });

      await then('the todo item should be saved with trimmed text', async () => {
        await todoPage.assertTodoVisible('Trimmed task');
      });
    });
  });
});
