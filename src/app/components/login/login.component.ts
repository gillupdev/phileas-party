import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="page">
      <div class="container">
        <div class="card">
          <div class="top-bar">
            <button class="btn-lang" (click)="toggleLanguage()">
              {{ lang() === 'fr' ? 'EN' : 'FR' }}
            </button>
          </div>

          <div class="header">
            <span class="badge">{{ t().date }}</span>
            <h1>{{ t().title }}</h1>
            <p>{{ t().subtitle }}</p>
          </div>

          <div class="login-section">
            <p class="login-message">{{ t().loginMessage }}</p>
            <button class="btn btn-google" (click)="login()">
              <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {{ t().loginGoogle }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .top-bar {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #E8E8F0;
    }

    .btn-lang {
      background: none;
      border: 1px solid #E8E8F0;
      color: #64648c;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-lang:hover {
      border-color: #6C5CE7;
      color: #6C5CE7;
    }

    .login-section {
      text-align: center;
      padding: 2rem 0;
    }

    .login-message {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .btn-google {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      background: white;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 500;
      color: #333;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-google:hover {
      border-color: #4285F4;
      box-shadow: 0 2px 8px rgba(66, 133, 244, 0.2);
    }

    .google-icon {
      flex-shrink: 0;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private i18n = inject(I18nService);

  readonly t = this.i18n.t;
  readonly lang = this.i18n.language;

  login() {
    this.authService.login();
  }

  toggleLanguage() {
    this.i18n.toggleLanguage();
  }
}
