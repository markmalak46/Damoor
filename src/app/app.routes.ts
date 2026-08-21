import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { NotificationComponent } from './features/notification/notification.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { NotfoundComponent } from './features/notfound/notfound.component';

import { authGuard } from './core/auth/guards/auth-guard';
import { guestGuard } from './core/auth/guards/guest-guard';

export const routes: Routes = [
  // Public Home
  {
    path: '',
    component: MainLayoutComponent,
    pathMatch: 'full',
    title: 'Damoor',
  },

  // Guest Routes
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        component: LoginComponent,
        title: 'Sign In',
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'Register',
      },
      {
        path: 'forget',
        component: ForgotPasswordComponent,
        title: 'Forgot Password',
      },
    ],
  },

  // Authenticated Routes
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'notification',
        component: NotificationComponent,
        title: 'Notifications',
      },
      {
        path: 'change',
        component: ChangePasswordComponent,
        title: 'Change Password',
      },
    ],
  },

  // 404
  {
    path: '**',
    component: NotfoundComponent,
    title: 'Page Not Found',
  },
];