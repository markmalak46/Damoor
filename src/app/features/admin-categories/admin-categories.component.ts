import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { Category } from '../Shop/models/shop.models';
import { ShopService } from '../Shop/services/shop.service';
import { AdminCategoriesService } from './admin-categories.service';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html',
})
export class AdminCategoriesComponent {
  private readonly shopService = inject(ShopService);
  private readonly adminCategoriesService = inject(AdminCategoriesService);
  private readonly authService = inject(AuthService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly mutationErrorMessage = signal('');
  protected readonly noticeMessage = signal('');
  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly confirmingDeleteCategoryId = signal<number | null>(null);
  protected readonly deletingCategoryId = signal<number | null>(null);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly categoryName = signal('');
  protected readonly categoryDescription = signal('');

  protected readonly totalProducts = computed(() =>
    this.categories().reduce((total, category) => total + category.productCount, 0),
  );

  constructor() {
    this.loadCategories();
  }

  protected loadCategories(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.shopService
      .getCategories()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.errorMessage.set(this.formatError(error)),
      });
  }

  protected saveCategory(): void {
    const request = this.currentRequest();

    if (!request.name || !request.description || this.saving()) {
      this.mutationErrorMessage.set('Category name and description are required.');
      return;
    }

    const editingCategoryId = this.editingCategoryId();
    const request$ = editingCategoryId === null
      ? this.adminCategoriesService.createCategory(request)
      : this.adminCategoriesService.updateCategory(editingCategoryId, request);

    this.saving.set(true);
    this.mutationErrorMessage.set('');
    this.noticeMessage.set('');

    request$
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.mutationErrorMessage.set(response.message || 'We could not save this category.');
            return;
          }

          this.noticeMessage.set(response.message || 'Category saved successfully.');
          this.resetForm();
          this.loadCategories();
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.mutationErrorMessage.set(this.formatError(error)),
      });
  }

  protected editCategory(category: Category): void {
    this.editingCategoryId.set(category.id);
    this.categoryName.set(category.name);
    this.categoryDescription.set(category.description);
    this.mutationErrorMessage.set('');
    this.noticeMessage.set('');
  }

  protected resetForm(): void {
    this.editingCategoryId.set(null);
    this.categoryName.set('');
    this.categoryDescription.set('');
    this.mutationErrorMessage.set('');
  }

  protected requestDeleteCategory(categoryId: number): void {
    this.confirmingDeleteCategoryId.set(categoryId);
    this.mutationErrorMessage.set('');
    this.noticeMessage.set('');
  }

  protected cancelDeleteCategory(): void {
    this.confirmingDeleteCategoryId.set(null);
  }

  protected deleteCategory(category: Category): void {
    if (this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.deletingCategoryId.set(category.id);
    this.mutationErrorMessage.set('');
    this.noticeMessage.set('');

    this.adminCategoriesService
      .deleteCategory(category.id)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.deletingCategoryId.set(null);
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.mutationErrorMessage.set(response.message || 'We could not delete this category.');
            return;
          }

          this.noticeMessage.set(response.message || 'Category deleted successfully.');
          if (this.editingCategoryId() === category.id) {
            this.resetForm();
          }
          this.confirmingDeleteCategoryId.set(null);
          this.loadCategories();
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.mutationErrorMessage.set(this.formatError(error)),
      });
  }

  private currentRequest(): { name: string; description: string } {
    return {
      name: this.categoryName().trim(),
      description: this.categoryDescription().trim(),
    };
  }

  private handleUnauthorizedError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.authService.logout();
      return true;
    }

    return false;
  }

  private formatError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'We could not reach the categories service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not load categories. Please try again.';
  }

  private hasMessage(value: unknown): value is { message: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      typeof value.message === 'string'
    );
  }
}
