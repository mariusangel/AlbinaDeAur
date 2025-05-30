require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//Inregistrare
exports.registerUser = async (req, res) => {
  try {
    console.log("[REGISTER] Date primite:", req.body); // Log 1
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      console.log("[REGISTER] Utilizator existent:", normalizedEmail); // Log 2
      return res.status(400).json({ message: 'Utilizatorul există deja' });
    }

    const user = await User.create({ 
      name, 
      email: normalizedEmail, 
      password 
    });
    console.log("[REGISTER] Utilizator creat:", user); // Log 3 (verifică aici)

    // Generează token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({ 
      message: 'Utilizator înregistrat cu succes', 
      user: { _id: user._id, name: user.name, email: user.email },
      token // Trimite token-ul în corpul răspunsului
    });

  } catch (error) {
    console.error("[DEBUG] Eroare la înregistrare:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Eroare server' });
  }
};

//Autentificare
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // CORECT: Definirea corectă a variabilei
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("password");
    if (!user) {
      return res.status(401).json({ message: "Email invalid" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Parolă invalidă" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({ 
      token, 
      user: { _id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error("[DEBUG] Eroare login:", error);
    res.status(500).json({ message: "Eroare server" });
  }
};

// Verificare user
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};