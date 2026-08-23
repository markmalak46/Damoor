import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { ProductVariant, ShopProduct } from '../Shop/models/shop.models';
import { ProductImageResolverService } from '../Shop/services/product-image-resolver.service';
import { mapVariantsToShopProducts } from '../Shop/services/shop-product.mapper';
import { ShopService } from '../Shop/services/shop.service';

@Component({
  selector: 'app-admin-products',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './admin-products.component.html',
})
export class AdminProductsComponent {
  private readonly shopService = inject(ShopService);
  private readonly authService = inject(AuthService);
  private readonly imageResolver = inject(ProductImageResolverService);

  protected readonly products = signal<ShopProduct[]>([]);
  protected readonly failedImageVariantIds = signal<Set<number>>(new Set());
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');

  protected readonly totalColorEdits = computed(() => this.products().length);

  protected readonly totalSizes = computed(() =>
    this.products().reduce((total, product) => total + product.availableSizes.length, 0),
  );

  protected readonly inStockCount = computed(
    () => this.products().filter((product) => product.isInStock).length,
  );

  constructor() {
    this.loadProducts();
  }

  protected loadProducts(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.failedImageVariantIds.set(new Set());

    this.shopService
      .getProductVariants()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (variants) => this.products.set(mapVariantsToShopProducts(variants)),
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.errorMessage.set(this.formatError(error)),
      });
  }

  protected resolveMainImage(variant: ProductVariant): string {
    return this.imageResolver.resolveImageUrl(
      variant.images.find((image) => image.isMain) ?? variant.images[0],
    );
  }

  protected hasImageFailed(variantId: number): boolean {
    return this.failedImageVariantIds().has(variantId);
  }

  protected handleImageError(variantId: number): void {
    this.failedImageVariantIds.update((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(variantId);
      return nextIds;
    });
  }

  protected effectivePrice(variant: ProductVariant): number {
    return variant.salePrice !== null && variant.salePrice < variant.price
      ? variant.salePrice
      : variant.price;
  }

  protected hasSalePrice(variant: ProductVariant): boolean {
    return variant.salePrice !== null && variant.salePrice < variant.price;
  }

  protected stockClasses(product: ShopProduct): string {
    return product.isInStock
      ? 'border-green-800 bg-green-50 text-green-800'
      : 'border-red-800 bg-red-50 text-red-800';
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
        return 'We could not reach the product variants service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not load product variants. Please try again.';
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
