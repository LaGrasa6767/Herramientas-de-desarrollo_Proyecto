import { Component } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: false, 
})
export class Login {

  email = '';
  password = '';
  mensaje = '';

  constructor(private api: ApiService) {}

  login() {
    const datos = {
      email: this.email,
      password: this.password
    };

    this.api.login(datos).subscribe({
      next: (respuesta: any) => {
        localStorage.setItem('token', respuesta.token);
        this.mensaje = 'Login correcto';
      },
      error: () => {
        this.mensaje = 'Usuario o contraseña incorrectos';
      }
    });
  }
}