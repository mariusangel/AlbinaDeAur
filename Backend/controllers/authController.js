require('dotenv').config();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//Inregistrare
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verifică dacă utilizatorul există deja
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Utilizatorul există deja' });
    }

    // Creează utilizator
    const user = await User.create({ name, email, password });

    // Generează token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Setează cookie cu token
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 de zile
    });

    res.status(201).json({ message: 'Utilizator înregistrat cu succes', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Autentificare
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Caută utilizatorul ȘI selectează parola
    const user = await User.findOne({ email }).select("password"); // <- Schimbare aici
    if (!user) {
      return res.status(401).json({ message: "Email invalid" });
    }

    // Verifică parola cu bcrypt.compare()
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Parolă invalidă" });
    }

    // Generează token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};