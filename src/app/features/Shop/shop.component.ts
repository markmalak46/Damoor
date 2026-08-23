import { CommonModule } from '@angular/common';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import {
  Category,
  FilterOption,
  ShopFilters,
  ShopProduct,
  ShopSortDirection,
  ShopSortOption,
} from './models/shop.models';
import { ShopService } from './services/shop.service';
import { ShopProductCardComponent } from './components/shop-product-card/shop-product-card.component';
import { WishlistService } from './services/wishlist.service';
import { CartService } from './services/cart.service';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, ShopProductCardComponent],
  templateUrl: './shop.component.html',
})
export class ShopComponent implements OnDestroy {
  private readonly shopService = inject(ShopService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly products = signal<ShopProduct[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly actionNotification = signal<{
    message: string;
    tone: 'success' | 'error';
    label: string;
  } | null>(null);
  protected readonly isFilterDrawerOpen = signal(false);
  protected readonly updatingWishlistVariantIds = signal<Set<number>>(new Set());
  protected readonly updatingCartVariantIds = signal<Set<number>>(new Set());
  protected readonly sortOption = signal<ShopSortOption>('newest');
  protected readonly sortDirection = signal<ShopSortDirection>('desc');
  protected readonly filters = signal<ShopFilters>({
    search: '',
    categoryId: null,
    color: null,
    size: null,
    inStockOnly: false,
  });

  protected readonly categoryOptions = computed<FilterOption<number>[]>(() =>
    this.categories()
      .map((category) => ({ value: category.id, label: category.name }))
      .sort((first, second) => first.label.localeCompare(second.label)),
  );

  protected readonly colorOptions = computed<string[]>(() =>
    this.uniqueSorted(this.products().flatMap((product) => product.availableColors)),
  );

  protected readonly sizeOptions = computed<string[]>(() =>
    this.sortSizes(this.uniqueSorted(this.products().flatMap((product) => product.availableSizes))),
  );

  protected readonly filteredProducts = computed(() =>
    this.sortProducts(this.products().filter((product) => this.productMatchesFilters(product))),
  );

  protected readonly heroProducts = computed(() => this.filteredProducts().slice(0, 2));

  protected readonly productColorCount = computed(() => this.products().length);

  protected readonly availableCategoryCount = computed(() => this.categoryOptions().length);

  protected readonly hasActiveFilters = computed(() => {
    const filters = this.filters();
    return (
      filters.search.trim().length > 0 ||
      filters.categoryId !== null ||
      filters.color !== null ||
      filters.size !== null ||
      filters.inStockOnly
    );
  });

  protected readonly skeletonCards = Array.from({ length: 8 });

  protected readonly sortOptions: FilterOption<ShopSortOption>[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price', value: 'price' },
    { label: 'Name', value: 'name' },
  ];
  private actionNotificationTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.clearActionNotificationTimeout();
  }

  protected loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      products: this.shopService.getProducts(),
      categories: this.shopService.getCategories(),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ products, categories }) => {
          this.products.set(products);
          this.categories.set(categories);
        },
        error: (error: unknown) => this.errorMessage.set(this.formatError(error)),
      });
  }

  protected updateSearch(search: string): void {
    this.patchFilters({ search });
  }

  protected selectCategory(categoryId: number | null): void {
    this.patchFilters({ categoryId });
  }

  protected selectColor(color: string | null): void {
    this.patchFilters({ color });
  }

  protected selectSize(size: string | null): void {
    this.patchFilters({ size });
  }

  protected updateInStockOnly(inStockOnly: boolean): void {
    this.patchFilters({ inStockOnly });
  }

  protected updateSort(sortOption: ShopSortOption): void {
    this.sortOption.set(sortOption);
  }

  protected toggleSortDirection(): void {
    this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
  }

  protected clearFilters(): void {
    this.filters.set({
      search: '',
      categoryId: null,
      color: null,
      size: null,
      inStockOnly: false,
    });
  }

  protected openFilterDrawer(): void {
    this.isFilterDrawerOpen.set(true);
  }

  protected closeFilterDrawer(): void {
    this.isFilterDrawerOpen.set(false);
  }

  protected isVariantWishlisted(product: ShopProduct): boolean {
    return this.wishlistService.variantIds().has(product.defaultVariant.id);
  }

  protected isWishlistUpdating(product: ShopProduct): boolean {
    return this.updatingWishlistVariantIds().has(product.defaultVariant.id);
  }

  protected isCartUpdating(product: ShopProduct): boolean {
    return this.updatingCartVariantIds().has(product.defaultVariant.id);
  }

  protected toggleWishlist(productVariantId: number): void {
    this.actionNotification.set(null);

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.updatingWishlistVariantIds().has(productVariantId)) {
      return;
    }

    const shouldRemove = this.wishlistService.variantIds().has(productVariantId);
    this.setWishlistUpdating(productVariantId, true);

    const request = shouldRemove
      ? this.wishlistService.removeItem(productVariantId)
      : this.wishlistService.addItem(productVariantId);

    request.pipe(finalize(() => this.setWishlistUpdating(productVariantId, false))).subscribe({
      next: (response) => {
        if (!response.success) {
          this.showActionNotification(response.message || 'Wishlist update failed.', 'error', 'Wishlist notice');
          return;
        }

        this.showActionNotification(response.message, 'success', 'Wishlist updated');
      },
      error: (error: unknown) =>
        this.handleUnauthorizedError(error) ||
        this.showActionNotification(this.formatWishlistError(error), 'error', 'Wishlist notice'),
    });
  }

  protected addToCart(productVariantId: number): void {
    this.actionNotification.set(null);

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.updatingCartVariantIds().has(productVariantId)) {
      return;
    }

    this.setCartUpdating(productVariantId, true);

    this.cartService
      .addItem({ productVariantId, quantity: 1 })
      .pipe(finalize(() => this.setCartUpdating(productVariantId, false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.showActionNotification(
              response.message || 'We could not add this item to your cart.',
              'error',
              'Cart notice',
            );
            return;
          }

          this.showActionNotification(response.message, 'success', 'Cart updated');
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.showActionNotification(this.formatCartError(error), 'error', 'Cart notice'),
      });
  }

  private patchFilters(filters: Partial<ShopFilters>): void {
    this.filters.update((currentFilters) => ({ ...currentFilters, ...filters }));
  }

  private setWishlistUpdating(productVariantId: number, isUpdating: boolean): void {
    this.updatingWishlistVariantIds.update((currentIds) => {
      const nextIds = new Set(currentIds);

      if (isUpdating) {
        nextIds.add(productVariantId);
      } else {
        nextIds.delete(productVariantId);
      }

      return nextIds;
    });
  }

  private setCartUpdating(productVariantId: number, isUpdating: boolean): void {
    this.updatingCartVariantIds.update((currentIds) => {
      const nextIds = new Set(currentIds);

      if (isUpdating) {
        nextIds.add(productVariantId);
      } else {
        nextIds.delete(productVariantId);
      }

      return nextIds;
    });
  }

  private showActionNotification(
    message: string,
    tone: 'success' | 'error',
    label: string,
  ): void {
    this.clearActionNotificationTimeout();
    this.actionNotification.set({ message, tone, label });
    this.actionNotificationTimeout = setTimeout(() => {
      this.actionNotification.set(null);
      this.actionNotificationTimeout = null;
    }, 3200);
  }

  private clearActionNotificationTimeout(): void {
    if (this.actionNotificationTimeout !== null) {
      clearTimeout(this.actionNotificationTimeout);
      this.actionNotificationTimeout = null;
    }
  }

  private productMatchesFilters(product: ShopProduct): boolean {
    const filters = this.filters();
    const search = filters.search.trim().toLowerCase();

    if (search && !this.productMatchesSearch(product, search)) {
      return false;
    }

    if (filters.categoryId !== null && product.categoryId !== filters.categoryId) {
      return false;
    }

    if (
      filters.color !== null &&
      !product.variants.some((variant) => variant.color === filters.color)
    ) {
      return false;
    }

    if (filters.size !== null && !product.variants.some((variant) => variant.size === filters.size)) {
      return false;
    }

    if (filters.inStockOnly && !product.variants.some((variant) => variant.isInStock)) {
      return false;
    }

    return true;
  }

  private productMatchesSearch(product: ShopProduct, search: string): boolean {
    return [
      product.productName,
      product.categoryName,
      ...product.availableColors,
      ...product.availableSizes,
    ].some((value) => value.toLowerCase().includes(search));
  }

  private sortProducts(products: ShopProduct[]): ShopProduct[] {
    const sortedProducts = [...products];

    const directionMultiplier = this.sortDirection() === 'asc' ? 1 : -1;

    switch (this.sortOption()) {
      case 'name':
        return sortedProducts.sort(
          (first, second) =>
            first.productName.localeCompare(second.productName) * directionMultiplier,
        );
      case 'price':
        return sortedProducts.sort(
          (first, second) => (this.priceOf(first) - this.priceOf(second)) * directionMultiplier,
        );
      case 'newest':
        return sortedProducts.sort(
          (first, second) =>
            (first.defaultVariant.id - second.defaultVariant.id) * directionMultiplier,
        );
    }
  }

  private priceOf(product: ShopProduct): number {
    const variant = product.defaultVariant;
    return variant.salePrice !== null && variant.salePrice < variant.price
      ? variant.salePrice
      : variant.price;
  }

  private uniqueSorted(values: string[]): string[] {
    return Array.from(new Set(values.filter(Boolean))).sort((first, second) =>
      first.localeCompare(second),
    );
  }

  private sortSizes(sizes: string[]): string[] {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

    return [...sizes].sort((first, second) => {
      const firstIndex = sizeOrder.indexOf(first.toUpperCase());
      const secondIndex = sizeOrder.indexOf(second.toUpperCase());

      if (firstIndex === -1 && secondIndex === -1) {
        return first.localeCompare(second);
      }

      if (firstIndex === -1) {
        return 1;
      }

      if (secondIndex === -1) {
        return -1;
      }

      return firstIndex - secondIndex;
    });
  }

  private formatError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'We could not reach the collection service. Please check that the backend is running and the local HTTPS certificate is trusted.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return "We couldn't load the collection. Please try again.";
  }

  private formatWishlistError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'We could not reach the wishlist service. Please check that the backend is running and the local HTTPS certificate is trusted.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    return 'Wishlist update failed. Please try again.';
  }

  private formatCartError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'We could not reach the cart service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    return 'We could not add this item to your cart. Please try again.';
  }

  private handleUnauthorizedError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.actionNotification.set(null);
      this.authService.logout();
      return true;
    }

    return false;
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
