import { CommonModule, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { AccountService } from '../account/account.service';
import { CartItem } from '../Shop/models/shop.models';
import { CartService } from '../Shop/services/cart.service';
import { OrderDetails } from '../orders/orders.models';
import { CheckoutRequest } from './checkout.models';
import { CheckoutService } from './checkout.service';

interface CheckoutForm {
  shippingAddress: FormControl<string>;
  customerName: FormControl<string>;
  whatsAppNumber: FormControl<string>;
  backupPhoneNumber: FormControl<string>;
  notes: FormControl<string>;
}

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly checkoutService = inject(CheckoutService);
  private readonly cartService = inject(CartService);
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);

  protected readonly items = signal<CartItem[]>([]);
  protected readonly total = signal(0);
  protected readonly placedOrder = signal<OrderDetails | null>(null);
  protected readonly loadingCart = signal(true);
  protected readonly placingOrder = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal('');

  protected readonly itemCount = computed(() =>
    this.items().reduce((total, item) => total + item.quantity, 0),
  );

  protected readonly checkoutForm = this.formBuilder.nonNullable.group<CheckoutForm>({
    shippingAddress: this.formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    customerName: this.formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    whatsAppNumber: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[0-9+\-\s()]{7,20}$/),
    ]),
    backupPhoneNumber: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[0-9+\-\s()]{7,20}$/),
    ]),
    notes: this.formBuilder.nonNullable.control(''),
  });

  constructor() {
    this.loadCart();
    this.prefillProfile();
  }

  protected loadCart(): void {
    this.loadingCart.set(true);
    this.errorMessage.set('');

    this.cartService
      .getCart()
      .pipe(finalize(() => this.loadingCart.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMessage.set(response.message || 'We could not load your cart.');
            return;
          }

          this.items.set(response.data.items);
          this.total.set(response.data.total);
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.errorMessage.set(this.formatError(error)),
      });
  }

  protected submit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');

    if (this.checkoutForm.invalid || this.placingOrder() || this.items().length === 0) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    this.placingOrder.set(true);

    this.checkoutService
      .placeOrder(this.toCheckoutRequest())
      .pipe(finalize(() => this.placingOrder.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMessage.set(response.message || 'We could not place your order.');
            return;
          }

          this.placedOrder.set(response.data);
          this.items.set([]);
          this.total.set(0);
          this.cartService.clearCartState();
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.errorMessage.set(this.formatError(error)),
      });
  }

  protected shouldShowError(controlName: keyof CheckoutForm): boolean {
    const control = this.checkoutForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  private prefillProfile(): void {
    this.accountService.getProfile().subscribe({
      next: (profile) => {
        this.checkoutForm.patchValue({
          customerName: profile.fullName,
          whatsAppNumber: profile.phoneNumber,
          backupPhoneNumber: profile.phoneNumber,
        });
      },
      error: (error: unknown) => {
        if (this.handleUnauthorizedError(error)) {
          return;
        }
      },
    });
  }

  private toCheckoutRequest(): CheckoutRequest {
    const value = this.checkoutForm.getRawValue();

    return {
      shippingAddress: value.shippingAddress.trim(),
      customerName: value.customerName.trim(),
      whatsAppNumber: value.whatsAppNumber.trim(),
      backupPhoneNumber: value.backupPhoneNumber.trim(),
      notes: value.notes.trim(),
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
        return 'We could not reach the checkout service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not complete checkout. Please try again.';
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
