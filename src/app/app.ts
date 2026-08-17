import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('social');
}


//بستخدمها ف الكومبونت زي الهوم مثلا مش ف ال app
// import { OnInit } from '@angular/core';
// import { initFlowbite } from 'flowbite';

// export class App implements OnInit {
//     ngOnInit(): void {
//     initFlowbite();
//   }
// }
