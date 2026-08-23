import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { AccountProfile, UpdateAccountProfileRequest } from './account.models';
import { AccountService } from './account.service';

interface AccountForm {
  fullName: FormControl<string>;
  phoneNumber: FormControl<string>;
}

@Component({
  selector: 'app-account',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './account.component.html',
})
export class AccountComponent {
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly profile = signal<AccountProfile | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly accountForm = this.formBuilder.nonNullable.group<AccountForm>({
    fullName: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    phoneNumber: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^[0-9+\-\s()]{7,20}$/),
    ]),
  });

  constructor() {
    this.loadProfile();
  }

  protected loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.accountService
      .getProfile()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (profile) => this.setProfile(profile),
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.errorMessage.set(this.formatError(error)),
      });
  }

  protected submit(): void {
    this.submitted.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    if (this.accountForm.invalid || this.saving()) {
      this.accountForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    this.accountService
      .updateProfile(this.toUpdateRequest())
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMessage.set(response.message || 'We could not update your account.');
            return;
          }

          this.setProfile(response.data);
          this.authService.updateCurrentUser({
            id: response.data.id,
            fullName: response.data.fullName,
            email: response.data.email,
            roles: response.data.roles,
          });
          this.submitted.set(false);
          this.successMessage.set(response.message || 'Account updated successfully.');
        },
        error: (error: unknown) =>
          this.handleUnauthorizedError(error) ||
          this.errorMessage.set(this.formatError(error)),
      });
  }

  protected shouldShowError(controlName: keyof AccountForm): boolean {
    const control = this.accountForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected initials(fullName: string): string {
    const initials = fullName
      .split(' ')
      .map((part) => part.trim()[0])
      .filter(Boolean)
      .join('')
      .slice(0, 2);

    return initials || 'D';
  }

  private setProfile(profile: AccountProfile): void {
    this.profile.set(profile);
    this.accountForm.reset({
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
    });
  }

  private toUpdateRequest(): UpdateAccountProfileRequest {
    const value = this.accountForm.getRawValue();

    return {
      fullName: value.fullName.trim(),
      phoneNumber: value.phoneNumber.trim(),
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
        return 'We could not reach the account service. Please check that the backend is running and try again.';
      }

      if (this.hasMessage(error.error)) {
        return error.error.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return 'We could not load your account. Please try again.';
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
