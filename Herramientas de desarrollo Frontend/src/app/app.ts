import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('marketplace-frontend');

  constructor(
    public router: Router,
    public authService: AuthService
  ) {}

  // Verificar si el usuario actual tiene rol de Administrador para mostrar u ocultar opciones en el Navbar
  isAdmin(): boolean {
    const role = localStorage.getItem('role') || '';
    return role.toUpperCase().includes('ADMIN');
  }
}
