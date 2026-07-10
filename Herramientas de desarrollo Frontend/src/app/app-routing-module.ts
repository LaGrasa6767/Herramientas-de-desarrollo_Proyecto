import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Users } from './components/users/users';
import { Products } from './components/products/products';
import { Cart } from './components/cart/cart';
import { Orders } from './components/orders/orders';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },

  { path: 'home', component: Home, canActivate: [AuthGuard] },

  { path: 'products', component: Products, canActivate: [AuthGuard] },

  { path: 'users', component: Users, canActivate: [AuthGuard] },

  { path: 'cart', component: Cart, canActivate: [AuthGuard] },

  { path: 'orders', component: Orders, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }