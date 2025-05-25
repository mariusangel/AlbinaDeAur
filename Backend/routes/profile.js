// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/auth'); // Importă middleware-ul

// Ruta protejată - necesită token valid
router.get('/me', authenticate, (req, res) => {
  // Doar utilizatorii autentificați ajung aici
  res.json({ userId: req.userId }); // Folosește ID-ul extras din token
});