import { Component, signal, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './services/auth.service';

interface Guest {
  id: number;
  name: string;
  attending: number;
  created_at: string;
}

@Component({
  selector: 'app-rsvp',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = '/api/guests';
  private pollInterval: any;

  protected readonly guests = signal<Guest[]>([]);
  protected readonly showForm = signal(true);
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  readonly user = this.authService.user;
  readonly userName = computed(() => this.user()?.name || '');

  ngOnInit() {
    this.loadGuests();
    this.pollInterval = setInterval(() => this.loadGuests(), 5000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadGuests() {
    this.http.get<Guest[]>(this.apiUrl, { withCredentials: true }).subscribe({
      next: (guests) => {
        this.guests.set(guests);
        this.error.set('');
      },
      error: (err) => {
        if (err.status === 401) {
          this.error.set('Session expired. Please refresh the page.');
        } else {
          this.error.set('Could not connect to server. Make sure the server is running!');
        }
        console.error('Failed to load guests:', err);
      }
    });
  }

  submitRSVP(attending: boolean) {
    const name = this.userName();
    if (!name) return;

    this.loading.set(true);

    this.http.post<Guest>(this.apiUrl, { name, attending }, { withCredentials: true }).subscribe({
      next: () => {
        this.loadGuests();
        this.submitted.set(true);
        this.showForm.set(false);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to submit. Please try again!');
        this.loading.set(false);
        console.error('Failed to submit RSVP:', err);
      }
    });
  }

  resetForm() {
    this.submitted.set(false);
    this.showForm.set(true);
  }

  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/login';
    });
  }

  get attendingGuests() {
    return this.guests().filter(g => g.attending === 1);
  }

  get notAttendingGuests() {
    return this.guests().filter(g => g.attending === 0);
  }
}
