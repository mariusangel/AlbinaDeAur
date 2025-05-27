// routes/cartRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

// Importăm validatori și handler pentru erori
const {
  addToCartValidator,
  updateCartItemValidator
} = require("../validators/cartValidators");
const { handleValidationErrors } = require("../middleware/validationMiddleware");

// Ruta GET /api/cart — simplă, fără validări de body
router
  .route("/")
  .get(protect, cartController.getCart)
  .post(
    protect,
    addToCartValidator,    // validăm body-ul
    handleValidationErrors, 
    cartController.addToCart
  );

// Ruta PUT/DELETE pentru un item specific
router
  .route("/:itemId")
  .put(
    protect,
    updateCartItemValidator,  // validăm parametrii și body-ul
    handleValidationErrors,
    cartController.updateCartItem
  )
  .delete(protect, cartController.removeFromCart);

module.exports = router;
