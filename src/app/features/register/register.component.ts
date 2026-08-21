import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthErrors, SignUpRequest } from '../../core/auth/models/damoor-auth.models';
import { AuthService } from '../../core/auth/services/auth.service';

interface RegisterForm {
  fullName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  acceptedTerms: FormControl<boolean>;
}

type RegisterControlName = keyof RegisterForm;

interface ApiErrorBody {
  message?: string;
  errors?: AuthErrors;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly apiMessage = signal('');
  protected readonly apiError = signal('');

  protected readonly registerForm = this.formBuilder.nonNullable.group<RegisterForm>(
    {
      fullName: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
      phone: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^[0-9+\-\s()]{7,20}$/),
      ]),
      password: this.formBuilder.nonNullable.control('', [
        Validators.required,
        Validators.minLength(8),
      ]),
      confirmPassword: this.formBuilder.nonNullable.control('', [Validators.required]),
      acceptedTerms: this.formBuilder.nonNullable.control(false, [Validators.requiredTrue]),
    },
    { validators: this.passwordsMatchValidator },
  );

  protected submit(): void {
    this.submitted.set(true);
    this.apiError.set('');
    this.apiMessage.set('');

    if (this.registerForm.invalid || this.loading()) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.authService
      .signUp(this.toSignUpRequest())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.success && response.data?.accessToken) {
            this.authService.persistAuthSession(response.data);
            this.apiMessage.set(response.message || 'Account created successfully.');
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

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword.update((isVisible) => !isVisible);
  }

  protected shouldShowError(controlName: RegisterControlName): boolean {
    const control = this.registerForm.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected hasConfirmPasswordMismatch(): boolean {
    const confirmPassword = this.registerForm.controls.confirmPassword;
    return (
      this.registerForm.hasError('passwordMismatch') &&
      (confirmPassword.touched || this.submitted())
    );
  }

  protected hasControlError(controlName: RegisterControlName, errorCode: string): boolean {
    return this.registerForm.controls[controlName].hasError(errorCode);
  }

  protected errorId(controlName: RegisterControlName): string {
    return `register-${controlName}-error`;
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  private toSignUpRequest(): SignUpRequest {
    const value = this.registerForm.getRawValue();

    return {
      fullName: value.fullName.trim(),
      email: value.email.trim(),
      phoneNumber: value.phone.trim(),
      password: value.password,
      confirmPassword: value.confirmPassword,
    };
  }

  private formatHttpError(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'We could not reach the registration service. Please check that the backend is running and the local HTTPS certificate is trusted.';
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

    return 'We could not create your account. Please review your details and try again.';
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
