require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for secure cookies behind load balancer (Koyeb, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Data file paths
const DATA_FILE = path.join(__dirname, 'guests.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize data files if they don't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Helper functions for guests
function readGuests() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeGuests(guests) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(guests, null, 2));
}

// Helper functions for users
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findOrCreateUser(profile) {
  const users = readUsers();
  let user = users.find(u => u.googleId === profile.id);

  if (!user) {
    user = {
      id: Date.now(),
      googleId: profile.id,
      email: profile.emails?.[0]?.value || '',
      name: profile.displayName,
      picture: profile.photos?.[0]?.value || ''
    };
    users.push(user);
    writeUsers(users);
  }

  return user;
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const users = readUsers();
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || '/api/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    const user = findOrCreateUser(profile);
    done(null, user);
  }));
} else {
  console.warn('Warning: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not set. OAuth will not work.');
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Serve Angular static files in production
const staticPath = path.join(__dirname, 'public', 'browser');
app.use(express.static(staticPath));

// Auth routes
app.get('/api/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=auth_failed' }),
  (req, res) => {
    // Successful authentication, redirect to app
    res.redirect('/');
  }
);

app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      picture: req.user.picture
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// GET all guests (protected)
app.get('/api/guests', requireAuth, (req, res) => {
  try {
    const guests = readGuests();
    res.json(guests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// POST new guest (protected)
app.post('/api/guests', requireAuth, (req, res) => {
  const { name, attending } = req.body;

  if (!name || typeof attending !== 'boolean') {
    return res.status(400).json({ error: 'Name and attending status required' });
  }

  try {
    const guests = readGuests();
    const newGuest = {
      id: Date.now(),
      name: name,
      attending: attending ? 1 : 0,
      created_at: new Date().toISOString()
    };
    guests.push(newGuest);
    writeGuests(guests);
    res.status(201).json(newGuest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add guest' });
  }
});

// DELETE guest (protected)
app.delete('/api/guests/:id', requireAuth, (req, res) => {
  try {
    let guests = readGuests();
    guests = guests.filter(g => g.id !== parseInt(req.params.id));
    writeGuests(guests);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete guest' });
  }
});

// Serve Angular app for all other routes (SPA support)
app.use((req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Birthday party server running on port ${PORT}`);
});
