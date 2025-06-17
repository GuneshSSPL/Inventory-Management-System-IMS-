import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Keep this import
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './MyComponent/login/login.component';
import { LoaderService } from './services/loader.service';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AppComponent } from './app.component';
import { LoaderComponent } from './components/loader/loader.component';
import { SupplierListComponent } from './MyComponent/supplier-list/supplier-list.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SupplierListComponent,
    LoaderComponent // Move LoaderComponent to declarations
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    OAuthModule.forRoot(),
    CommonModule // Add CommonModule here
  ],
  providers: [
    LoaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }