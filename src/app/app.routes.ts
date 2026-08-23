import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './features/login/login.component';
import { SignUpComponent } from './features/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './features/forgot-password/forgot-password.component';
import { NotificationComponent } from './features/notification/notification.component';
import { ChangePasswordComponent } from './features/change-password/change-password.component';
import { NotfoundComponent } from './features/notfound/notfound.component';
import { ShopComponent } from './features/Shop/shop.component';
import { WishlistComponent } from './features/wishlist/wishlist.component';
import { CartComponent } from './features/cart/cart.component';
import { ProductVariantDetailsComponent } from './features/product-variant-details/product-variant-details.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { AccountComponent } from './features/account/account.component';

import { adminGuard } from './core/auth/guards/admin-guard';
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

  // Public Shop
  {
    path: 'shop',
    component: MainLayoutComponent,
    title: 'Shop | Damoor',
    children: [
      {
        path: '',
        component: ShopComponent,
      },
    ],
  },

  // Authenticated Wishlist
  {
    path: 'wishlist',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    title: 'Wishlist | Damoor',
    children: [
      {
        path: '',
        component: WishlistComponent,
      },
    ],
  },

  // Authenticated Account
  {
    path: 'account',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    title: 'Account | Damoor',
    children: [
      {
        path: '',
        component: AccountComponent,
      },
    ],
  },

  // Authenticated Cart
  {
    path: 'cart',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    title: 'Cart | Damoor',
    children: [
      {
        path: '',
        component: CartComponent,
      },
    ],
  },

  // Public Product Variant Details
  {
    path: 'product-variants',
    component: MainLayoutComponent,
    title: 'Product | Damoor',
    children: [
      {
        path: ':variantId',
        component: ProductVariantDetailsComponent,
      },
    ],
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
        path: 'sign-up',
        component: SignUpComponent,
        title: 'Sign Up',
      },
      {
        path: 'forget',
        component: ForgotPasswordComponent,
        title: 'Forgot Password',
      },
    ],
  },

  // Admin Dashboard
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [adminGuard],
    title: 'Admin | Damoor',
    children: [
      {
        path: '',
        component: AdminDashboardComponent,
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
