import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  protected readonly shopLinks = ['Shop', 'Collections', 'New In'];
  protected readonly supportLinks = ['Contact', 'Shipping', 'Returns'];
  protected readonly brandLinks = ['About Us'];
}
