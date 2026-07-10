import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];

  // Campos para crear un nuevo usuario
  nombre = '';
  email = '';
  direccion = '';
  password = '';
  role = 'USER'; // Por defecto crear como USUARIO normal

  // Búsqueda en tiempo real
  searchText = '';

  // Mensajes flotantes de notificación
  mensaje = '';
  tipoMensaje = 'success'; // 'success' | 'error'

  constructor(private api: ApiService) {}

  ngOnInit() {
    if (this.isAdmin()) {
      this.load();
    }
  }

  // Verificar si el usuario actual es Administrador
  isAdmin(): boolean {
    const role = localStorage.getItem('role') || '';
    return role.toUpperCase().includes('ADMIN');
  }

  // Cargar lista de usuarios desde el backend
  load() {
    this.api.getUsers().subscribe({
      next: (data: any) => {
        this.users = data || [];
        this.search(); // Aplicar filtro de búsqueda actual si existiera
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.mostrarNotificacion('No se pudo cargar la lista de usuarios del servidor.', 'error');
      }
    });
  }

  // Filtrar usuarios por nombre o correo en tiempo real
  search() {
    if (!this.searchText.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const query = this.searchText.toLowerCase().trim();
      this.filteredUsers = this.users.filter(u =>
        (u.nombre && u.nombre.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.role && u.role.toLowerCase().includes(query))
      );
    }
  }

  // Registrar nuevo usuario en la base de datos
  create() {
    if (!this.nombre.trim() || !this.email.trim() || !this.password.trim() || !this.direccion.trim()) {
      this.mostrarNotificacion('Por favor completa todos los campos obligatorios para registrar al usuario.', 'error');
      return;
    }

    const newUser = {
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      direccion: this.direccion.trim(),
      password: this.password.trim(),
      role: this.role
    };

    this.api.createUser(newUser).subscribe({
      next: () => {
        this.mostrarNotificacion(`Usuario "${this.nombre}" registrado exitosamente en la base de datos.`, 'success');
        this.nombre = '';
        this.email = '';
        this.direccion = '';
        this.password = '';
        this.role = 'USER';
        this.load();
      },
      error: (err) => {
        console.error('Error al crear usuario:', err);
        this.mostrarNotificacion('Error al crear el usuario. Verifica si el correo electrónico ya está registrado.', 'error');
      }
    });
  }

  // Eliminar usuario con confirmación de seguridad
  delete(id: number, nombre: string) {
    if (confirm(`¿Estás seguro de eliminar al usuario "${nombre}" del sistema? Esta acción no se puede deshacer.`)) {
      this.api.deleteUser(id).subscribe({
        next: () => {
          this.mostrarNotificacion(`Usuario "${nombre}" eliminado del sistema.`, 'success');
          this.load();
        },
        error: (err) => {
          console.error('Error al eliminar usuario:', err);
          this.mostrarNotificacion('Ocurrió un error al intentar eliminar al usuario en el servidor.', 'error');
        }
      });
    }
  }

  // Ayudante para mostrar notificaciones temporales en pantalla
  mostrarNotificacion(texto: string, tipo: string = 'success') {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 4500);
  }
}