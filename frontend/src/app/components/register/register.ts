import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  errorMessage = '';

  private http = inject(HttpClient);
  private router = inject(Router);

  onRegister() {
    this.errorMessage = '';
    const userData = {
      name: this.name,
      email: this.email,
      password: this.password
    };

    this.http.post<any>('http://localhost:5000/api/auth/register', userData).subscribe({
      next: (res) => {
        // Tsajjel el token w el user w t3addi lel dashboard direct
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur lors de l’inscription';
      }
    });
  }
}