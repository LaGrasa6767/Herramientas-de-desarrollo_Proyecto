import { Component } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.html',
  styleUrl: './users.css'
})
export class Users {

  users: any[] = [];

  nombre = '';
  email = '';
  direccion = '';
  password = '';

  constructor(private api: ApiService) {
    this.load();
  }

  load() {
    this.api.getUsers().subscribe((data: any) => {
      this.users = data;
    });
  }

  create() {
    const user = {
      nombre: this.nombre,
      email: this.email,
      direccion: this.direccion,
      password: this.password,
      role: "USER"
    };

    this.api.createUser(user).subscribe(() => {
      this.load();
      this.nombre = '';
      this.email = '';
      this.direccion = '';
      this.password = '';
    });
  }

  delete(id: number) {
    this.api.deleteUser(id).subscribe(() => {
      this.load();
    });
  }
}