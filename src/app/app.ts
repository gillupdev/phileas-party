import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

interface Guest {
  id: number;
  name: string;
  attending: number;
  created_at: string;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private apiUrl = '/api/guests';
  private pollInterval: any;

  protected readonly guests = signal<Guest[]>([]);
  protected readonly guestName = signal('');
  protected readonly showForm = signal(true);
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected lastSubmittedName = '';

  ngOnInit() {
    this.loadGuests();
    // Poll for updates every 5 seconds so everyone sees new RSVPs
    this.pollInterval = setInterval(() => this.loadGuests(), 5000);
  }

  ngOnDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  loadGuests() {
    this.http.get<Guest[]>(this.apiUrl).subscribe({
      next: (guests) => {
        this.guests.set(guests);
        this.error.set('');
      },
      error: (err) => {
        this.error.set('Could not connect to server. Make sure the server is running!');
        console.error('Failed to load guests:', err);
      }
    });
  }

  submitRSVP(attending: boolean) {
    const name = this.guestName().trim();
    if (!name) return;

    this.loading.set(true);

    this.http.post<Guest>(this.apiUrl, { name, attending }).subscribe({
      next: () => {
        this.lastSubmittedName = name;
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
    this.guestName.set('');
    this.submitted.set(false);
    this.showForm.set(true);
  }

  get attendingGuests() {
    return this.guests().filter(g => g.attending === 1);
  }

  get notAttendingGuests() {
    return this.guests().filter(g => g.attending === 0);
  }
}
