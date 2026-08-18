import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface NavigationItem {
  label: string;
  route?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly isMobileMenuOpen = signal(false);

  protected readonly primaryNavigation: NavigationItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Shop' },
    { label: 'Collections' },
    { label: 'About Us' },
    { label: 'Contact' },
  ];

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
