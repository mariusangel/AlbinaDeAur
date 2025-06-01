// Server/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// 1. Obține toate produsele (necesar pentru magazin)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Obține un singur produs după ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produsul nu există" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Ruta pentru verificarea stocului (pe care o ai deja)
router.get('/:id/stock', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produsul nu există" });
    }
    res.status(200).json({ stock: product.stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Creează un nou produs (doar admin)
router.post("/", async (req, res) => {
  const product = new Product({
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    stock: req.body.stock,
    category: req.body.category
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 5. Actualizează un produs (doar admin)
router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produsul nu există" });
    }

    if (req.body.name) product.name = req.body.name;
    if (req.body.price) product.price = req.body.price;
    if (req.body.image) product.image = req.body.image;
    if (req.body.stock) product.stock = req.body.stock;
    if (req.body.category) product.category = req.body.category;

    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Șterge un produs (doar admin)
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Produsul nu există" });
    }

    await product.remove();
    res.status(200).json({ message: "Produs șters cu succes" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;