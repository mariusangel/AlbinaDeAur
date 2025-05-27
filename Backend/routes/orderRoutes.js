const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");
const { updateStatusValidator } = require("../validators/orderValidators");
const { handleValidationErrors }   = require("../middleware/validationMiddleware");
const bodyParser = require("body-parser");

// POST /api/orders/checkout
router.post("/checkout", protect, orderController.checkout);

// GET  /api/orders
router.get("/", protect, orderController.getOrders);

// PUT  /api/orders/:orderId/status
router.put(
  "/:orderId/status",
  protect,
  updateStatusValidator,
  handleValidationErrors,
  orderController.updateOrderStatus
);

// Ruta pentru a crea sesiunea Stripe
router.post(
  "/create-checkout-session",
  protect,
  orderController.createStripeCheckout
);

// Stripe Webhook (public, deci NU pui protect aici)
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  orderController.stripeWebhook
);

module.exports = router;
