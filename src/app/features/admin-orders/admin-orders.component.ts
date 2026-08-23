import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import {
  AdminOrderDetails,
  AdminOrderStatus,
  AdminOrderStatusFilter,
  AdminOrderSummary,
  AdminOrdersPagination,
  AdminOrdersQuery,
} from './admin-orders.models';
import { AdminOrdersService } from './admin-orders.service';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './admin-orders.component.html',
})
export class AdminOrdersComponent {
  private readonly adminOrdersService = inject(AdminOrdersService);
  private readonly authService = inject(AuthService);

  protected readonly orders = signal<AdminOrderSummary[]>([]);
  protected readonly orderDetails = signal<Record<number, AdminOrderDetails>>({});
  protected readonly expandedOrderId = signal<number | null>(null);
  protected readonly loadingOrderId = signal<number | null>(null);
  protected readonly updatingStatusOrderId = signal<number | null>(null);
  protected readonly selectedStatuses = signal<Record<number, AdminOrderStatus>>({});
  protected readonly pagination = signal<AdminOrdersPagination | null>(null);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly detailsErrorMessage = signal('');
  protected readonly noticeMessage = signal('');
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly status = signal<AdminOrderStatusFilter>('');
  protected readonly search = signal('');
  protected readonly asc = signal<boolean | null>(false);

  protected readonly totalRevenue = computed(() =>
    this.orders().reduce((total, order) => total + order.totalAmount, 0),
  );

  protected readonly pendingCount = computed(
    () => this.orders().filter((order) => order.status.trim().toLowerCase() === 'pending').length,
  );

  protected readonly guestCount = computed(
    () => this.orders().filter((order) => order.userId === null).length,
  );

  protected readonly querySummary = computed(() => {
    const pagination = this.pagination();

    if (!pagination) {
      return `${this.orders().length} order${this.orders().length === 1 ? '' : 's'}`;
    }

    return `${pagination.totalCount} order${pagination.totalCount === 1 ? '' : 's'}`;
  });

  protected readonly orderStatusOptions: AdminOrderStatus[] = [
    'Pending',
    'Confirmed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled',
  ];

  constructor() {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.detailsErrorMessage.set('');
    this.noticeMessage.set('');

    this.adminOrdersService
      .getOrders(this.currentQuery())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.orders.set(response.data);
          this.pagination.set(response.pagination);
          this.expandedOrderId.set(null);
        },
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

    this.adminOrdersService
      .getOrder(orderId)
      .pipe(finalize(() => this.loadingOrderId.set(null)))
      .subscribe({
        next: (orderDetails) => {
          this.orderDetails.update((currentDetails) => ({
            ...currentDetails,
            [orderDetails.id]: orderDetails,
          }));
          this.selectedStatuses.update((currentStatuses) => ({
            ...currentStatuses,
            [orderDetails.id]: this.toAdminOrderStatus(orderDetails.status),
          }));
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.detailsErrorMessage.set(this.formatError(error)),
      });
  }

  protected getOrderDetails(orderId: number): AdminOrderDetails | undefined {
    return this.orderDetails()[orderId];
  }

  protected setSelectedStatus(orderId: number, status: string): void {
    this.selectedStatuses.update((currentStatuses) => ({
      ...currentStatuses,
      [orderId]: this.toAdminOrderStatus(status),
    }));
  }

  protected selectedStatus(orderId: number, fallbackStatus: string): AdminOrderStatus {
    return this.selectedStatuses()[orderId] ?? this.toAdminOrderStatus(fallbackStatus);
  }

  protected updateOrderStatus(orderId: number): void {
    const nextStatus = this.selectedStatuses()[orderId];

    if (!nextStatus || this.updatingStatusOrderId() !== null) {
      return;
    }

    this.updatingStatusOrderId.set(orderId);
    this.detailsErrorMessage.set('');
    this.noticeMessage.set('');

    this.adminOrdersService
      .updateOrderStatus(orderId, { status: nextStatus })
      .pipe(finalize(() => this.updatingStatusOrderId.set(null)))
      .subscribe({
        next: (response) => {
          if (!response.success || !response.data) {
            this.detailsErrorMessage.set(response.message || 'We could not update this order status.');
            return;
          }

          const updatedOrder = response.data;

          this.orderDetails.update((currentDetails) => ({
            ...currentDetails,
            [updatedOrder.id]: updatedOrder,
          }));
          this.orders.update((currentOrders) =>
            currentOrders.map((order) =>
              order.id === updatedOrder.id
                ? {
                    ...order,
                    status: updatedOrder.status,
                    totalAmount: updatedOrder.totalAmount,
                    customerName: updatedOrder.customerName,
                    whatsAppNumber: updatedOrder.whatsAppNumber,
                    accountEmail: updatedOrder.accountEmail,
                    sessionToken: updatedOrder.sessionToken,
                    userId: updatedOrder.userId,
                  }
                : order,
            ),
          );
          this.selectedStatuses.update((currentStatuses) => ({
            ...currentStatuses,
            [updatedOrder.id]: this.toAdminOrderStatus(updatedOrder.status),
          }));
          this.noticeMessage.set(response.message || 'Order status updated successfully.');
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.detailsErrorMessage.set(this.formatError(error)),
      });
  }

  protected applyFilters(): void {
    this.page.set(1);
    this.loadOrders();
  }

  protected resetFilters(): void {
    this.page.set(1);
    this.pageSize.set(10);
    this.status.set('');
    this.search.set('');
    this.asc.set(false);
    this.loadOrders();
  }

  protected goToPage(page: number): void {
    const pagination = this.pagination();
    const totalPages = pagination?.totalPages ?? page;

    if (page < 1 || page > totalPages || page === this.page()) {
      return;
    }

    this.page.set(page);
    this.loadOrders();
  }

  protected setPageSize(value: string): void {
    const nextPageSize = Number(value);

    if (!Number.isFinite(nextPageSize) || nextPageSize < 1) {
      return;
    }

    this.pageSize.set(nextPageSize);
    this.page.set(1);
    this.loadOrders();
  }

  protected setStatus(value: string): void {
    const allowedStatuses: AdminOrderStatusFilter[] = ['', 'Pending', 'Delivered', 'Cancelled'];
    const nextStatus = allowedStatuses.includes(value as AdminOrderStatusFilter)
      ? (value as AdminOrderStatusFilter)
      : '';

    this.status.set(nextStatus);
  }

  protected setAsc(value: string): void {
    if (value === 'true') {
      this.asc.set(true);
      return;
    }

    if (value === 'false') {
      this.asc.set(false);
      return;
    }

    this.asc.set(null);
  }

  protected statusClasses(status: string): string {
    const normalizedStatus = status.trim().toLowerCase();

    if (normalizedStatus === 'pending') {
      return 'border-accent bg-accent/10 text-accent';
    }

    if (normalizedStatus === 'delivered' || normalizedStatus === 'completed') {
      return 'border-green-800 bg-green-50 text-green-800';
    }

    if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
      return 'border-red-800 bg-red-50 text-red-800';
    }

    return 'border-primary/30 bg-primary/5 text-primary';
  }

  private toAdminOrderStatus(status: string): AdminOrderStatus {
    const matchedStatus = this.orderStatusOptions.find(
      (option) => option.toLowerCase() === status.trim().toLowerCase(),
    );

    return matchedStatus ?? 'Pending';
  }

  private currentQuery(): AdminOrdersQuery {
    return {
      page: this.page(),
      pageSize: this.pageSize(),
      status: this.status(),
      search: this.search(),
      asc: this.asc(),
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
        return 'We could not reach the admin orders service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not load admin orders. Please try again.';
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
