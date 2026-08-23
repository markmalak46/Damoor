import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, forkJoin, distinctUntilChanged, finalize, map, of, switchMap, throwError } from 'rxjs';
import {
  CreateProductVariantReviewRequest,
  ProductVariant,
  ProductVariantDetails,
  ProductVariantReview,
} from '../Shop/models/shop.models';
import { ProductImageResolverService } from '../Shop/services/product-image-resolver.service';
import { ShopService } from '../Shop/services/shop.service';
import { WishlistService } from '../Shop/services/wishlist.service';
import { CartService } from '../Shop/services/cart.service';
import { AuthService } from '../../core/auth/services/auth.service';

interface ReviewForm {
  rating: FormControl<number>;
  comment: FormControl<string>;
}

@Component({
  selector: 'app-product-variant-details',
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './product-variant-details.component.html',
})
export class ProductVariantDetailsComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly shopService = inject(ShopService);
  private readonly wishlistService = inject(WishlistService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly imageResolver = inject(ProductImageResolverService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly variant = signal<ProductVariantDetails | null>(null);
  protected readonly allVariants = signal<ProductVariant[]>([]);
  protected readonly reviews = signal<ProductVariantReview[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly reviewError = signal('');
  protected readonly selectedImageIndex = signal(0);
  protected readonly failedImageIds = signal<Set<number>>(new Set());
  protected readonly actionNotification = signal<{ message: string; tone: 'success' | 'error' } | null>(
    null,
  );
  protected readonly isWishlistUpdating = signal(false);
  protected readonly isCartUpdating = signal(false);
  protected readonly isReviewSubmitting = signal(false);
  protected readonly reviewSubmitted = signal(false);
  protected readonly quantity = signal(1);
  protected readonly reviewForm = this.formBuilder.nonNullable.group<ReviewForm>({
    rating: this.formBuilder.nonNullable.control(5, [
      Validators.required,
      Validators.min(1),
      Validators.max(5),
    ]),
    comment: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(500),
    ]),
  });
  private actionNotificationTimeout: ReturnType<typeof setTimeout> | null = null;

  protected readonly selectedImage = computed(() => {
    const variant = this.variant();
    return variant?.images[this.selectedImageIndex()] ?? variant?.images[0];
  });

  protected readonly effectivePrice = computed(() => {
    const variant = this.variant();

    if (!variant) {
      return 0;
    }

    return variant.salePrice !== null && variant.salePrice < variant.price
      ? variant.salePrice
      : variant.price;
  });

  protected readonly hasSalePrice = computed(() => {
    const variant = this.variant();
    return variant !== null && variant.salePrice !== null && variant.salePrice < variant.price;
  });

  protected readonly discountPercent = computed(() => {
    const variant = this.variant();

    if (!variant || variant.salePrice === null || variant.salePrice >= variant.price) {
      return 0;
    }

    return Math.round(((variant.price - variant.salePrice) / variant.price) * 100);
  });

  protected readonly isCurrentVariantWishlisted = computed(() => {
    const variant = this.variant();
    return variant !== null && this.wishlistService.variantIds().has(variant.id);
  });

  protected readonly averageRating = computed(() => {
    const reviews = this.reviews();

    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  });

  protected readonly relatedVariants = computed(() => {
    const variant = this.variant();

    if (!variant) {
      return [];
    }

    return this.allVariants().filter((productVariant) => productVariant.productId === variant.productId);
  });

  protected readonly colorOptions = computed(() =>
    this.uniqueBy(
      this.relatedVariants().map((variant) => ({
        color: variant.color,
        variantId: this.findBestVariantForColor(variant.color)?.id ?? variant.id,
        isInStock: this.relatedVariants().some(
          (relatedVariant) =>
            this.sameValue(relatedVariant.color, variant.color) && relatedVariant.isInStock,
        ),
      })),
      (option) => option.color.trim().toLowerCase(),
    ),
  );

  protected readonly sizeOptions = computed(() => {
    const currentVariant = this.variant();

    if (!currentVariant) {
      return [];
    }

    return this.sortSizes(
      this.relatedVariants()
        .filter((variant) => this.sameValue(variant.color, currentVariant.color))
        .map((variant) => ({
          size: variant.size,
          variantId: variant.id,
          isInStock: variant.isInStock,
        })),
    );
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('variantId'))),
        distinctUntilChanged(),
        switchMap((variantId) => {
          this.prepareLoad();

          if (!Number.isInteger(variantId) || variantId <= 0) {
            this.loading.set(false);
            return throwError(() => new Error('This product variant link is invalid.'));
          }

          return forkJoin({
            variant: this.shopService.getProductVariant(variantId),
            variants: this.shopService.getProductVariants(),
            reviews: this.shopService.getProductVariantReviews(variantId).pipe(
              catchError((error: unknown) => {
                this.reviewError.set(this.formatReviewError(error));
                return of([]);
              }),
            ),
          })
            .pipe(finalize(() => this.loading.set(false)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ variant, variants, reviews }) => {
          this.variant.set(variant);
          this.allVariants.set(variants);
          this.reviews.set(reviews);
          this.selectedImageIndex.set(0);
          this.syncWishlistState();
        },
        error: (error: unknown) => {
          this.variant.set(null);
          this.errorMessage.set(this.formatError(error));
        },
      });
  }

  ngOnDestroy(): void {
    this.clearActionNotificationTimeout();
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected imageUrl(imageId: number | undefined): string {
    const image = this.selectedImage();

    if (!image || image.id !== imageId || this.failedImageIds().has(image.id)) {
      return '';
    }

    return this.imageResolver.resolveImageUrl(image);
  }

  protected thumbnailUrl(index: number): string {
    const image = this.variant()?.images[index];

    if (!image || this.failedImageIds().has(image.id)) {
      return '';
    }

    return this.imageResolver.resolveImageUrl(image);
  }

  protected markImageFailed(imageId: number): void {
    this.failedImageIds.update((currentIds) => new Set(currentIds).add(imageId));
  }

  protected toggleWishlist(productVariantId: number): void {
    this.actionNotification.set(null);

    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login']);
      return;
    }

    if (this.isWishlistUpdating()) {
      return;
    }

    this.isWishlistUpdating.set(true);

    const request = this.wishlistService.variantIds().has(productVariantId)
      ? this.wishlistService.removeItem(productVariantId)
      : this.wishlistService.addItem(productVariantId);

    request.pipe(finalize(() => this.isWishlistUpdating.set(false))).subscribe({
      next: (response) => {
        if (!response.success) {
          this.showActionNotification({
            message: response.message || 'Wishlist update failed.',
            tone: 'error',
          });
          return;
        }

        this.showActionNotification({
          message: response.message,
          tone: 'success',
        });
      },
      error: (error: unknown) =>
        this.handleUnauthorizedError(error) ||
        this.showActionNotification({
          message: this.formatWishlistError(error),
          tone: 'error',
        }),
    });
  }

  protected addToCart(productVariantId: number): void {
    this.actionNotification.set(null);

    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login']);
      return;
    }

    if (this.isCartUpdating()) {
      return;
    }

    this.isCartUpdating.set(true);

    this.cartService
      .addItem({
        productVariantId,
        quantity: this.quantity(),
      })
      .pipe(finalize(() => this.isCartUpdating.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.showActionNotification({
              message: response.message || 'We could not add this item to your cart.',
              tone: 'error',
            });
            return;
          }

          this.showActionNotification({
            message: response.message,
            tone: 'success',
          });
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.showActionNotification({
            message: this.formatCartError(error),
            tone: 'error',
          }),
      });
  }

  protected submitReview(): void {
    const variant = this.variant();
    this.reviewSubmitted.set(true);
    this.reviewError.set('');
    this.actionNotification.set(null);

    if (!this.authService.isAuthenticated()) {
      void this.router.navigate(['/login']);
      return;
    }

    if (!variant || this.reviewForm.invalid || this.isReviewSubmitting()) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    this.isReviewSubmitting.set(true);

    this.shopService
      .createProductVariantReview(variant.id, this.toCreateReviewRequest())
      .pipe(finalize(() => this.isReviewSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.reviewError.set(response.message || 'We could not publish your review.');
            return;
          }

          this.reviews.update((currentReviews) => [
            response.data,
            ...currentReviews.filter((review) => review.id !== response.data.id),
          ]);
          this.reviewForm.reset({ rating: 5, comment: '' });
          this.reviewSubmitted.set(false);
          this.showActionNotification({
            message: response.message || 'Review published successfully.',
            tone: 'success',
          });
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          (this.reviewError.set(this.formatReviewError(error)), false),
      });
  }

  protected decreaseQuantity(): void {
    this.quantity.update((currentQuantity) => Math.max(1, currentQuantity - 1));
  }

  protected increaseQuantity(stockQuantity: number): void {
    this.quantity.update((currentQuantity) => Math.min(stockQuantity, currentQuantity + 1));
  }

  protected selectColor(color: string): void {
    const targetVariant = this.findBestVariantForColor(color);
    this.navigateToVariant(targetVariant?.id);
  }

  protected selectSize(variantId: number): void {
    this.navigateToVariant(variantId);
  }

  protected colorSwatchClasses(color: string): string {
    const normalizedColor = color.trim().toLowerCase();

    if (normalizedColor.includes('navy') || normalizedColor.includes('blue')) {
      return 'bg-primary';
    }

    if (normalizedColor.includes('black')) {
      return 'bg-[#111111]';
    }

    if (normalizedColor.includes('beige') || normalizedColor.includes('cream')) {
      return 'bg-[#d8c6ae]';
    }

    if (normalizedColor.includes('brown')) {
      return 'bg-[#6f4c35]';
    }

    if (normalizedColor.includes('gray') || normalizedColor.includes('grey')) {
      return 'bg-[#8d8f8d]';
    }

    if (normalizedColor.includes('mint') || normalizedColor.includes('green')) {
      return 'bg-[#aebaa4]';
    }

    if (normalizedColor.includes('olive')) {
      return 'bg-[#777c5d]';
    }

    return 'bg-accent';
  }

  protected isCurrentSize(size: string, currentSize: string): boolean {
    return size.toUpperCase() === currentSize.toUpperCase();
  }

  protected isCurrentColor(color: string, currentColor: string): boolean {
    return this.sameValue(color, currentColor);
  }

  protected shouldShowReviewError(controlName: keyof ReviewForm): boolean {
    const control = this.reviewForm.controls[controlName];
    return control.invalid && (control.touched || this.reviewSubmitted());
  }

  protected ratingStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < Math.round(rating));
  }

  protected formatReviewDate(value: string): string {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  }

  private prepareLoad(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.actionNotification.set(null);
    this.variant.set(null);
    this.allVariants.set([]);
    this.reviews.set([]);
    this.reviewError.set('');
    this.reviewSubmitted.set(false);
    this.reviewForm.reset({ rating: 5, comment: '' });
    this.selectedImageIndex.set(0);
    this.failedImageIds.set(new Set());
    this.quantity.set(1);

  }

  private showActionNotification(notification: { message: string; tone: 'success' | 'error' }): void {
    this.clearActionNotificationTimeout();
    this.actionNotification.set(notification);
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

  private syncWishlistState(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.wishlistService.getWishlist().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: (error: unknown) => {
        if (this.handleUnauthorizedError(error)) {
          return;
        }

        this.showActionNotification({
          message: 'We could not refresh your wishlist status.',
          tone: 'error',
        });
      },
    });
  }

  private findBestVariantForColor(color: string): ProductVariant | undefined {
    const currentVariant = this.variant();
    const variants = this.relatedVariants().filter((variant) => this.sameValue(variant.color, color));

    if (!currentVariant) {
      return variants.find((variant) => variant.isInStock) ?? variants[0];
    }

    return (
      variants.find((variant) => this.sameValue(variant.size, currentVariant.size)) ??
      variants.find((variant) => variant.isInStock) ??
      variants[0]
    );
  }

  private navigateToVariant(variantId: number | undefined): void {
    const currentVariantId = this.variant()?.id;

    if (!variantId || variantId === currentVariantId) {
      return;
    }

    void this.router.navigate(['/product-variants', variantId]);
  }

  private sameValue(first: string, second: string): boolean {
    return first.trim().toLowerCase() === second.trim().toLowerCase();
  }

  private uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
    const seenKeys = new Set<string>();

    return items.filter((item) => {
      const itemKey = key(item);

      if (seenKeys.has(itemKey)) {
        return false;
      }

      seenKeys.add(itemKey);
      return true;
    });
  }

  private sortSizes<T extends { size: string }>(sizes: T[]): T[] {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];

    return [...sizes].sort((first, second) => {
      const firstIndex = sizeOrder.indexOf(first.size.toUpperCase());
      const secondIndex = sizeOrder.indexOf(second.size.toUpperCase());

      if (firstIndex === -1 && secondIndex === -1) {
        return first.size.localeCompare(second.size);
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
        return 'We could not reach the product service. Please check that the backend is running and the local HTTPS certificate is trusted.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not load this product. Please try again.';
  }

  private handleUnauthorizedError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      this.actionNotification.set(null);
      this.authService.logout();
      return true;
    }

    return false;
  }

  private formatWishlistError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'We could not reach the wishlist service. Please check that the backend is running and try again.';
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

  private toCreateReviewRequest(): CreateProductVariantReviewRequest {
    const value = this.reviewForm.getRawValue();

    return {
      rating: value.rating,
      comment: value.comment.trim(),
    };
  }

  private formatReviewError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'We could not reach the review service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not load or save reviews right now.';
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
