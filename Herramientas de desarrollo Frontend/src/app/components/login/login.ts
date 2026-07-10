import { Component } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  login() {
    const datos = {
      email: this.email,
      password: this.password
    };

    this.api.login(datos).subscribe({
      next: (respuesta: any) => {
        // 1. Extraer el nombre desde el JSON (nombre, username, nombres) o desde el payload del token JWT
        let nombreGuardar = respuesta.nombre || respuesta.username || respuesta.nombres;
        if (!nombreGuardar && respuesta.token) {
          try {
            const payload = JSON.parse(atob(respuesta.token.split('.')[1]));
            nombreGuardar = payload.name || payload.nombre || payload.sub || payload.username;
          } catch (e) {}
        }
        // 2. Si el backend solo devolvió el token, usar el correo digitado en el login (ej: "jperez@utp.edu.pe" -> "Jperez")
        if (!nombreGuardar || nombreGuardar === 'undefined') {
          if (this.email) {
            const parteEmail = this.email.split('@')[0];
            nombreGuardar = parteEmail.charAt(0).toUpperCase() + parteEmail.slice(1);
          } else {
            nombreGuardar = 'Usuario UTP';
          }
        }

        // 3. Extraer rol desde la Base de Datos (JSON devuelto por el servidor o token JWT)
        console.log('Respuesta JSON del Backend:', respuesta);
        let roleGuardar = respuesta.role || respuesta.roles || respuesta.rol || respuesta.authorities || 
                          respuesta.tipoUsuario || (respuesta.user && (respuesta.user.role || respuesta.user.rol)) || 
                          (respuesta.usuario && (respuesta.usuario.role || respuesta.usuario.rol));
        if (Array.isArray(roleGuardar)) {
          roleGuardar = roleGuardar.map((a: any) => typeof a === 'string' ? a : (a.authority || a.nombre || a.role || a.rol)).join(', ');
        }
        if (!roleGuardar && respuesta.token) {
          try {
            const payload = JSON.parse(atob(respuesta.token.split('.')[1]));
            console.log('Payload del JWT decodificado:', payload);
            roleGuardar = payload.role || payload.roles || payload.authorities || payload.rol || payload.auth;
            if (Array.isArray(roleGuardar)) {
              roleGuardar = roleGuardar.map((a: any) => typeof a === 'string' ? a : (a.authority || a.nombre || a.role || a.rol)).join(', ');
            }
          } catch (e) {}
        }
        roleGuardar = roleGuardar || 'No asignado';

        if (typeof nombreGuardar === 'string' && nombreGuardar.includes('@')) {
          const parteEmail = nombreGuardar.split('@')[0];
          nombreGuardar = parteEmail
            .split('.')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
        }

        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('role', typeof roleGuardar === 'string' ? roleGuardar : JSON.stringify(roleGuardar));
        localStorage.setItem('nombre', nombreGuardar);
        if (respuesta.userId) localStorage.setItem('userId', String(respuesta.userId));
        if (respuesta.email) localStorage.setItem('email', respuesta.email);

        this.mensaje = 'Login correcto';
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 600);
      },

      error: () => {
        this.mensaje = 'Usuario o contraseña incorrectos';
      }
    });
  }
}