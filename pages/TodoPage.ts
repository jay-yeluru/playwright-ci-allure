import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export type TodoFilter = 'All' | 'Active' | 'Completed';

export class TodoPage extends BasePage {
  readonly newTodoInput: Locator;
  readonly todoItems: Locator;
  readonly todoCount: Locator;
  readonly clearCompletedButton: Locator;
  readonly toggleAllCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.locator('.todo-list li');
    this.todoCount = page.locator('.todo-count');
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    this.toggleAllCheckbox = page.locator('.toggle-all');
  }

  async goto(): Promise<void> {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press('Enter');
  }

  async addMultipleTodos(items: string[]): Promise<void> {
    for (const item of items) {
      await this.addTodo(item);
    }
  }

  async completeTodo(text: string): Promise<void> {
    const item = this.todoItems.filter({ hasText: text });
    await item.locator('.toggle').check();
  }

  async deleteTodo(text: string): Promise<void> {
    const item = this.todoItems.filter({ hasText: text });
    await item.hover();
    await item.locator('.destroy').click();
  }

  async editTodo(oldText: string, newText: string): Promise<void> {
    const item = this.todoItems.filter({ hasText: oldText });
    await item.dblclick();
    const editInput = item.locator('.edit');
    await editInput.clear();
    await editInput.fill(newText);
    await editInput.press('Enter');
  }

  async filterBy(filter: TodoFilter): Promise<void> {
    await this.page.getByRole('link', { name: filter }).click();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  async toggleAll(): Promise<void> {
    await this.toggleAllCheckbox.click();
  }

  async getTodoCount(): Promise<number> {
    const text = await this.todoCount.textContent();
    const match = text?.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  async getVisibleTodos(): Promise<string[]> {
    return this.todoItems.allTextContents();
  }

  async isTodoCompleted(text: string): Promise<boolean> {
    const item = this.todoItems.filter({ hasText: text });
    const classList = await item.getAttribute('class');
    return classList?.includes('completed') ?? false;
  }

  async assertTodoVisible(text: string): Promise<void> {
    await expect(this.todoItems.filter({ hasText: text })).toBeVisible();
  }

  async assertTodoCount(count: number): Promise<void> {
    await expect(this.todoItems).toHaveCount(count);
  }

  async assertCounterText(text: string): Promise<void> {
    await expect(this.todoCount).toHaveText(text);
  }
}
