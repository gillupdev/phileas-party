import { Injectable, signal, computed } from '@angular/core';

export type Language = 'fr' | 'en';

const translations = {
  fr: {
    date: '23 Mars 2025',
    title: 'Phileas',
    subtitle: 'fete ses 8 ans !',
    logout: 'Deconnexion',
    profileAlt: 'Photo de profil',
    respondAs: 'Tu reponds en tant que',
    attending: 'Je viens !',
    notAvailable: 'Pas dispo',
    thanks: 'Merci',
    changeResponse: 'Modifier ma reponse',
    present: 'Presents',
    absent: 'Absents',
    loginMessage: 'Connecte-toi pour repondre a l\'invitation',
    loginGoogle: 'Se connecter avec Google',
    sessionExpired: 'Session expiree. Veuillez rafraichir la page.',
    serverError: 'Impossible de se connecter au serveur.',
    submitError: 'Echec de l\'envoi. Veuillez reessayer !'
  },
  en: {
    date: 'March 23, 2025',
    title: 'Phileas',
    subtitle: 'is turning 8!',
    logout: 'Logout',
    profileAlt: 'Profile picture',
    respondAs: 'You are responding as',
    attending: 'I\'m coming!',
    notAvailable: 'Can\'t make it',
    thanks: 'Thank you',
    changeResponse: 'Change my response',
    present: 'Attending',
    absent: 'Not attending',
    loginMessage: 'Sign in to respond to the invitation',
    loginGoogle: 'Sign in with Google',
    sessionExpired: 'Session expired. Please refresh the page.',
    serverError: 'Could not connect to server.',
    submitError: 'Failed to submit. Please try again!'
  }
} as const;

export type TranslationKey = keyof typeof translations.en;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly storageKey = 'preferred-language';

  readonly language = signal<Language>(this.getInitialLanguage());

  readonly t = computed(() => translations[this.language()]);

  private getInitialLanguage(): Language {
    const stored = localStorage.getItem(this.storageKey);
    if (stored === 'fr' || stored === 'en') {
      return stored;
    }
    const browserLang = navigator.language.substring(0, 2);
    return browserLang === 'fr' ? 'fr' : 'en';
  }

  setLanguage(lang: Language) {
    this.language.set(lang);
    localStorage.setItem(this.storageKey, lang);
  }

  toggleLanguage() {
    const newLang = this.language() === 'fr' ? 'en' : 'fr';
    this.setLanguage(newLang);
  }
}
