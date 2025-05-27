require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require("./routes/orderRoutes");
const path = require("path");

const app = express();

// Conectare la MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectat la MongoDB'))
.catch(err => console.error('Eroare conexiune MongoDB:', err));

// Middleware
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rute
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use("/api/orders", orderRoutes);

app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"]
}));

// Gestionare erori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Eroare server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server rulând pe portul ${PORT}`));
