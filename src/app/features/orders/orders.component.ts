import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { OrderDetails, OrderSummary } from './orders.models';
import { OrdersService } from './orders.service';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './orders.component.html',
})
export class OrdersComponent {
  private readonly ordersService = inject(OrdersService);
  private readonly authService = inject(AuthService);

  protected readonly orders = signal<OrderSummary[]>([]);
  protected readonly orderDetails = signal<Record<number, OrderDetails>>({});
  protected readonly expandedOrderId = signal<number | null>(null);
  protected readonly loadingOrderId = signal<number | null>(null);
  protected readonly cancellingOrderId = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly detailsErrorMessage = signal('');
  protected readonly noticeMessage = signal('');

  protected readonly totalSpent = computed(() =>
    this.orders().reduce((total, order) => total + order.totalAmount, 0),
  );

  protected readonly totalItems = computed(() =>
    this.orders().reduce((total, order) => total + order.itemCount, 0),
  );

  constructor() {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.detailsErrorMessage.set('');
    this.noticeMessage.set('');

    this.ordersService
      .getOrders()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (orders) => this.orders.set(orders),
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.errorMessage.set(this.formatError(error)),
      });
  }

  protected toggleOrderDetails(orderId: number): void {
    this.detailsErrorMessage.set('');

    if (this.expandedOrderId() === orderId) {
      this.expandedOrderId.set(null);
      return;
    }

    this.expandedOrderId.set(orderId);

    if (this.orderDetails()[orderId]) {
      return;
    }

    this.loadingOrderId.set(orderId);

    this.ordersService
      .getOrder(orderId)
      .pipe(finalize(() => this.loadingOrderId.set(null)))
      .subscribe({
        next: (orderDetails) => {
          this.orderDetails.update((currentDetails) => ({
            ...currentDetails,
            [orderDetails.id]: orderDetails,
          }));
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.detailsErrorMessage.set(this.formatError(error)),
      });
  }

  protected getOrderDetails(orderId: number): OrderDetails | undefined {
    return this.orderDetails()[orderId];
  }

  protected cancelOrder(orderId: number): void {
    const details = this.orderDetails()[orderId];

    if (this.cancellingOrderId() !== null || !this.canCancelOrder(details?.status)) {
      return;
    }

    this.detailsErrorMessage.set('');
    this.noticeMessage.set('');
    this.cancellingOrderId.set(orderId);

    this.ordersService
      .cancelOrder(orderId)
      .pipe(finalize(() => this.cancellingOrderId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.detailsErrorMessage.set(response.message || 'We could not cancel this order.');
            return;
          }

          this.orderDetails.update((currentDetails) => ({
            ...currentDetails,
            [response.data.id]: response.data,
          }));
          this.orders.update((currentOrders) =>
            currentOrders.map((order) =>
              order.id === response.data.id
                ? {
                    ...order,
                    status: response.data.status,
                    totalAmount: response.data.totalAmount,
                  }
                : order,
            ),
          );
          this.noticeMessage.set(response.message || 'Order cancelled successfully.');
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.detailsErrorMessage.set(this.formatError(error)),
      });
  }

  protected canCancelOrder(status: string | undefined): boolean {
    return status?.trim().toLowerCase() === 'pending';
  }

  protected statusClasses(status: string): string {
    const normalizedStatus = status.trim().toLowerCase();

    if (normalizedStatus === 'pending') {
      return 'border-accent text-accent bg-accent/10';
    }

    if (normalizedStatus === 'delivered' || normalizedStatus === 'completed') {
      return 'border-green-800 text-green-800 bg-green-50';
    }

    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return 'border-red-800 text-red-800 bg-red-50';
    }

    return 'border-primary/30 text-primary bg-primary/5';
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
        return 'We could not reach the orders service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not load your orders. Please try again.';
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
