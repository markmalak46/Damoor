import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthErrors, SignInRequest } from '../../core/auth/models/damoor-auth.models';
import { AuthService } from '../../core/auth/services/auth.service';

interface SignInForm {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

interface ApiErrorBody {
  message?: string;
  errors?: AuthErrors;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly apiError = signal('');

  protected readonly signInForm = this.formBuilder.nonNullable.group<SignInForm>({
    email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.nonNullable.control('', [Validators.required]),
    rememberMe: this.formBuilder.nonNullable.control(true),
  });

  protected submit(): void {
    this.submitted.set(true);
    this.apiError.set('');

    if (this.signInForm.invalid || this.loading()) {
      this.signInForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService
      .signIn(this.toSignInRequest())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.authService.persistAuthSession(response.data);
            this.router.navigate(['/']);
            return;
          }

          this.apiError.set(this.formatApiErrors(response.message, response.errors));
        },
        error: (error: HttpErrorResponse) => {
          this.apiError.set(this.formatHttpError(error));
        },
      });
  }

  protected togglePassword(): void {
    this.showPassword.update((isVisible) => !isVisible);
  }

  protected shouldShowError(controlName: 'email' | 'password'): boolean {
    const control = this.signInForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected errorId(controlName: 'email' | 'password'): string {
    return `sign-in-${controlName}-error`;
  }

  private toSignInRequest(): SignInRequest {
    const value = this.signInForm.getRawValue();

    return {
      email: value.email.trim(),
      password: value.password,
    };
  }

  private formatHttpError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'We could not reach the sign-in service. Please check that the backend is running and the local HTTPS certificate is trusted.';
    }

    return this.formatApiErrors(this.readErrorMessage(error.error), this.readErrorDetails(error.error));
  }

  private formatApiErrors(message: string | undefined, errors: AuthErrors): string {
    const details = this.flattenErrors(errors);

    if (message && details.length > 0) {
      return `${message} ${details.join(' ')}`;
    }

    if (message) {
      return message;
    }

    if (details.length > 0) {
      return details.join(' ');
    }

    return 'We could not sign you in. Please review your email and password and try again.';
  }

  private flattenErrors(errors: AuthErrors): string[] {
    if (!errors) {
      return [];
    }

    if (Array.isArray(errors)) {
      return errors.filter((error) => error.trim().length > 0);
    }

    return Object.values(errors)
      .flat()
      .filter((error) => error.trim().length > 0);
  }

  private readErrorMessage(errorBody: unknown): string | undefined {
    if (this.isApiErrorBody(errorBody) && typeof errorBody.message === 'string') {
      return errorBody.message;
    }

    return undefined;
  }

  private readErrorDetails(errorBody: unknown): AuthErrors {
    if (this.isApiErrorBody(errorBody)) {
      return errorBody.errors ?? null;
    }

    return null;
  }

  private isApiErrorBody(value: unknown): value is ApiErrorBody {
    return typeof value === 'object' && value !== null;
  }
}
