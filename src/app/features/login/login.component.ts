import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  loginForm: FormGroup = this.formBuilder.nonNullable.group({
    login:["", [Validators.required, Validators.minLength(3)]],
    password: ["", [
      Validators.required,
      Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
    ]]
  })

  msgError: string = '';
  loading: boolean = false;
  registerSubscribe: Subscription = new Subscription();
  submitForm(): void {
    if (this.loginForm.valid) {
      this.loading = true;

      this.registerSubscribe.unsubscribe();
      console.log(this.loginForm.value);
      this.registerSubscribe = this.authService.signIn(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          if (res.success) {

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', res.data.user);
            this.router.navigate(['/feed']);
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.msgError = err.error.message;
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

}