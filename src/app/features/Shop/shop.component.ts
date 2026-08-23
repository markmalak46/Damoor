import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import {
  FilterOption,
  ShopFilters,
  ShopProduct,
  ShopSortOption,
} from './models/shop.models';
import { ShopService } from './services/shop.service';
import { ShopProductCardComponent } from './components/shop-product-card/shop-product-card.component';

@Component({
  selector: 'app-shop',
  imports: [CommonModule, FormsModule, ShopProductCardComponent],
  templateUrl: './shop.component.html',
})
export class ShopComponent {
  private readonly shopService = inject(ShopService);

  protected readonly products = signal<ShopProduct[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly isFilterDrawerOpen = signal(false);
  protected readonly sortOption = signal<ShopSortOption>('featured');
  protected readonly filters = signal<ShopFilters>({
    search: '',
    categoryId: null,
    color: null,
    size: null,
    inStockOnly: false,
  });

  protected readonly categoryOptions = computed<FilterOption<number>[]>(() =>
    Array.from(
      new Map(
        this.products().map((product) => [
          product.categoryId,
          { value: product.categoryId, label: product.categoryName },
        ]),
      ).values(),
    ).sort((first, second) => first.label.localeCompare(second.label)),
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
    { label: 'Featured', value: 'featured' },
    { label: 'Name A-Z', value: 'name-asc' },
    { label: 'Name Z-A', value: 'name-desc' },
    { label: 'Price Low to High', value: 'price-asc' },
    { label: 'Price High to Low', value: 'price-desc' },
  ];

  constructor() {
    this.loadProducts();
  }

  protected loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.shopService
      .getProducts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (products) => this.products.set(products),
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

  private patchFilters(filters: Partial<ShopFilters>): void {
    this.filters.update((currentFilters) => ({ ...currentFilters, ...filters }));
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

    switch (this.sortOption()) {
      case 'name-asc':
        return sortedProducts.sort((first, second) =>
          first.productName.localeCompare(second.productName),
        );
      case 'name-desc':
        return sortedProducts.sort((first, second) =>
          second.productName.localeCompare(first.productName),
        );
      case 'price-asc':
        return sortedProducts.sort((first, second) => this.priceOf(first) - this.priceOf(second));
      case 'price-desc':
        return sortedProducts.sort((first, second) => this.priceOf(second) - this.priceOf(first));
      case 'featured':
        return sortedProducts;
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

  private hasMessage(value: unknown): value is { message: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      typeof value.message === 'string'
    );
  }
}

