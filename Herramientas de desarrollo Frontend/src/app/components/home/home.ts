import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private getCleanItem(key: string, fallback: string): string {
    let val = localStorage.getItem(key);
    if (!val || val === 'undefined' || val === 'null' || val.trim() === '') {
      return fallback;
    }
    if (key === 'nombre' && val.includes('@')) {
      val = val.split('@')[0];
      return val
        .split('.')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }
    return val;
  }

  nombre: string = this.getCleanItem('nombre', 'Usuario');
  role: string = this.getCleanItem('role', 'USER');
}
