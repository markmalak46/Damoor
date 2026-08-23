import { Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ProductImageResolverService } from '../../services/product-image-resolver.service';
import { ProductVariant, ShopProduct } from '../../models/shop.models';

@Component({
  selector: 'app-shop-product-card',
  imports: [CurrencyPipe],
  templateUrl: './shop-product-card.component.html',
})
export class ShopProductCardComponent {
  readonly product = input.required<ShopProduct>();

  private readonly imageResolver = inject(ProductImageResolverService);

  protected readonly imageFailed = signal(false);

  protected readonly mainImage = computed(() => {
    const variant = this.product().defaultVariant;
    return this.imageResolver.resolveImageUrl(this.findMainImage(variant));
  });

  protected readonly secondaryImage = computed(() => {
    const variant = this.product().defaultVariant;
    return this.imageResolver.resolveImageUrl(variant.images.find((image) => !image.isMain));
  });

  protected readonly effectivePrice = computed(() => this.getEffectivePrice(this.product().defaultVariant));

  protected readonly hasSalePrice = computed(() => {
    const variant = this.product().defaultVariant;
    return variant.salePrice !== null && variant.salePrice < variant.price;
  });

  protected handleImageError(): void {
    this.imageFailed.set(true);
  }

  private findMainImage(variant: ProductVariant) {
    return variant.images.find((image) => image.isMain) ?? variant.images[0];
  }

  private getEffectivePrice(variant: ProductVariant): number {
    return variant.salePrice !== null && variant.salePrice < variant.price
      ? variant.salePrice
      : variant.price;
  }
}

