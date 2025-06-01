const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// Obține coșul
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.status(200).json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Adaugă în coș
exports.addToCart = async (req, res) => {
  try {
    console.log("Cerere addToCart:", {
      user: req.user._id,
      body: req.body
    });
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    // Verifică dacă ID-ul este valid
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        message: "ID produs invalid",
        receivedId: productId
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        message: "Produsul nu există",
        productId 
      });
    }

    // Logging pentru depanare
    console.log(`Adăugare în coș: [User: ${userId}] [Produs: ${productId}] [Cantitate: ${quantity}]`);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Eroare gravă în addToCart:", error);
    res.status(500).json({ 
      message: "Eroare internă a serverului",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Șterge din coș
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });
    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizează cantitatea
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    const item = cart.items.find((item) => item._id.toString() === itemId);
    
    if (!item) {
      return res.status(404).json({ message: "Produsul nu este în coș" });
    }

    item.quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
