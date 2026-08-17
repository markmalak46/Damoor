import { initFlowbite } from 'flowbite';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../../../../core/auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit{
  private readonly authService = inject(AuthService);
ngOnInit(): void {
  initFlowbite();
}

logOut():void{
  this.authService.signOut();
}
}
