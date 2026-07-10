import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';

import { AuthInterceptor } from './interceptors/auth.interceptor';

import { App } from './app';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Users } from './components/users/users';
import { Products } from './components/products/products';
import { Cart } from './components/cart/cart';
import { Orders } from './components/orders/orders';

@NgModule({
  declarations: [
    App,
    Home,
    Login,
    Users,
    Products,
    Cart,
    Orders
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),

    //  INTERCEPTOR JWT
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }