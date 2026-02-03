const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Data file path
const DATA_FILE = path.join(__dirname, 'guests.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Helper functions
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

// Middleware
app.use(cors());
app.use(express.json());

// Serve Angular static files in production
app.use(express.static(path.join(__dirname, 'public', 'browser')));

// GET all guests
app.get('/api/guests', (req, res) => {
  try {
    const guests = readGuests();
    res.json(guests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// POST new guest
app.post('/api/guests', (req, res) => {
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

// DELETE guest
app.delete('/api/guests/:id', (req, res) => {
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'browser', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Birthday party server running on port ${PORT}`);
});
