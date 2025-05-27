const Cart  = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createStripeCheckout = async (req, res) => {
  try {
    // Preluăm coșul curent
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Coșul este gol." });
    }

    // Cream line items pentru Stripe
    const line_items = cart.items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
        },
        unit_amount: Math.round(item.product.price * 100), // în cenți
      },
      quantity: item.quantity,
    }));

    // Creăm sesiunea
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: { userId: req.user._id.toString() }
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    // 1. Preluăm coșul utilizatorului
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Coșul este gol." });
    }

    // 2. Construim lista de items cu prețul actual
    const items = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price  // presupunem că Product are field-ul price
    }));

    // 3. Calculăm totalul
    const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    // 4. Creăm comanda
    const order = new Order({
      user: req.user._id,
      items,
      total
    });
    await order.save();

    // 5. Golește coșul
    cart.items = [];
    await cart.save();

    // 6. Returnăm răspuns
    res.status(201).json({ message: "Checkout realizat cu succes.", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint pentru webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Procesăm evenimentele de tip checkout.session.completed
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;

    // Aici poți să finalizezi comanda: 
    // - citești coșul
    // - salvezi Order cu status "completed"
    // - golești coșul

    // Exemplu minimal:
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    const items = cart.items.map(i => ({
      product: i.product._id,
      quantity: i.quantity,
      price: i.product.price
    }));
    const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

    const order = new Order({ user: userId, items, total, status: "completed" });
    await order.save();

    cart.items = [];
    await cart.save();
  }

  res.json({ received: true });
};


exports.getOrders = async (req, res) => {
  try {
    const orders = await Order
      .find({ user: req.user._id })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Schimbă status-ul unei comenzi
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status }  = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Comanda nu a fost găsită." });
    }
    // opțional: verifici dacă req.user._id e egal cu order.user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Nu ai permisiunea să modifici această comandă." });
    }

    order.status = status;
    await order.save();
    res.status(200).json({ message: "Status actualizat.", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
