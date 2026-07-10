import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  canActivate(): boolean {

    const token = localStorage.getItem('token');

    if (!token) {
      window.location.href = '/login';
      return false;
    }

    return true;
  }
}