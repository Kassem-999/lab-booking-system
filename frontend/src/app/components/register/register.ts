import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  form = { name: '', email: '', password: '' };
  errorMessage = '';
  isLoading = false;
  private auth = inject(AuthService);
  private router = inject(Router);

  register(): void {
    if (this.isLoading) return;
    this.errorMessage = '';
    this.isLoading = true;
    this.auth.register(this.form).subscribe({
      next: () => { this.isLoading = false; void this.router.navigate(['/dashboard']); },
      error: (error) => { this.isLoading = false; this.errorMessage = error.error?.message || 'Unable to create account'; }
    });
  }
}
