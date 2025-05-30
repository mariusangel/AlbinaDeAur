const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { verifyUser } = require('../controllers/authController');

// Înregistrare
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Verificare utilizator (de exemplu, pentru a verifica dacă un token este valid)
router.get('/verify', protect, verifyUser);


module.exports = router;