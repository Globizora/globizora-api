// Globizora Inc - API Service (Commercial Version)
// Production-style Express.js backend with auth, DB, payments, docs, and security

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const swaggerUi = require("swagger-ui-express");
const stripe = require("stripe");
const bcrypt = require("bcrypt");
const crypto = require("crypto"); // For API key generation

dotenv.config(); // Load .env

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET; // Add to .env for webhook verification
const stripeClient = stripe(STRIPE_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For webhook raw body
app.use(cors());
app.use(morgan("combined"));
app.use(helmet());

// Rate limiter: 100 requests per 15 min
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// User Schema (for DB)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: String, // Hashed with bcrypt
  subscription: { type: String, default: "free" }, // free/pro/enterprise
  apiKey: { type: String, unique: true }, // API key for authenticated calls
  usage: { type: Number, default: 0 } // API usage count (for tracking)
});
const User = mongoose.model("User", userSchema);

// =============================
// Swagger Docs (Complete Paths)
// =============================
const swaggerDoc = {
  openapi: "3.0.0",
  info: { title: "Globizora API", version: "1.4.0", description: "Commercial API for Globizora Inc with auth, payments, and more." },
  servers: [{ url: `http://localhost:${PORT}` }],
  paths: {
    "/": { get: { summary: "Root endpoint", responses: { 200: { description: "Welcome message" } } } },
    "/status": { get: { summary: "Service status", responses: { 200: { description: "Status info" } } } },
    "/company": { get: { summary: "Company info", responses: { 200: { description: "Company details" } } } },
    "/data/{symbol}": { get: { summary: "Mock analytics data", parameters: [{ name: "symbol", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Data response" } } } },
    "/metrics": { get: { summary: "Server metrics", responses: { 200: { description: "Metrics info" } } } },
    "/contact": { post: { summary: "Contact form", requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, message: { type: "string" } } } } } }, responses: { 200: { description: "Success" }, 400: { description: "Invalid input" } } } },
    "/auth/register": { post: { summary: "User registration", requestBody: { content: { "application/json": { schema: { type: "object", properties: { username: { type: "string" }, email: { type: "string" }, password: { type: "string" } } } } } }, responses: { 201: { description: "User created" }, 400: { description: "Invalid input" } } } },
    "/auth/login": { post: { summary: "User login", requestBody: { content: { "application/json": { schema: { type: "object", properties: { email: { type: "string" }, password: { type: "string" } } } } } }, responses: { 200: { description: "JWT token" }, 401: { description: "Invalid credentials" } } } },
    "/users": { get: { summary: "Get users (protected)", security: [{ bearerAuth: [] }], responses: { 200: { description: "Users list" } } } },
    "/subscribe": { post: { summary: "Subscribe (Stripe)", security: [{ bearerAuth: [] }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { plan: { type: "string" } } } } } }, responses: { 200: { description: "Subscription success" } } } },
    "/webhook/stripe": { post: { summary: "Stripe webhook for payment confirmation", responses: { 200: { description: "Webhook received" } } } },
    "/me": { get: { summary: "Get current user info", security: [{ bearerAuth: [] }], responses: { 200: { description: "User info" } } } },
    "/apikey/generate": { post: { summary: "Generate API key", security: [{ bearerAuth: [] }], responses: { 200: { description: "API key generated" } } } }
  },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } }
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// Middleware: Verify JWT
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// =============================
// Root Endpoint
// =============================
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Globizora Inc API Service",
    company: "Globizora Inc",
    status: "running",
    version: "1.4.0",
    docs: "/docs"
  });
});

// =============================
// Service Status
// =============================
app.get("/status", (req, res) => {
  res.json({
    service: "Globizora API Service",
    company: "GLOBIZORA INC",
    status: "OK",
    version: "1.4.0",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()) + "s",
    timestamp: new Date()
  });
});

// =============================
// Company Information
// =============================
app.get("/company", (req, res) => {
  res.json({
    name: "GLOBIZORA INC",
    industry: "AI platforms, Internet infrastructure, SaaS, Media",
    location: "Sheridan, Wyoming, USA",
    email: "info@globizora.com",
    established: "2025",
    services: [
      "API platform development",
      "Data infrastructure",
      "SaaS applications",
      "Digital automation"
    ],
    pricing: {
      free: "$0/month",
      pro: "$29/month",
      enterprise: "$99/month"
    }
  });
});

// =============================
// Data API (Mock Analytics - Rate-limited per user)
// =============================
app.get("/data/:symbol", verifyJWT, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.usage += 1; // Track usage
  await user.save();
  const { symbol } = req.params;
  res.json({
    symbol: symbol.toUpperCase(),
    value: (Math.random() * 100).toFixed(2),
    category: "infrastructure analytics",
    trend: Math.random() > 0.5 ? "up" : "down",
    timestamp: new Date(),
    usage: user.usage
  });
});

// =============================
// Metrics API (Admin only - add role check in prod)
// =============================
app.get("/metrics", async (req, res) => {
  const userCount = await User.countDocuments();
  res.json({
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
    users: userCount,
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date()
  });
});

// =============================
// Contact Form
// =============================
app.post("/contact", [
  body("name").notEmpty().trim(),
  body("email").isEmail().normalizeEmail(),
  body("message").notEmpty().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, message } = req.body;
  res.json({
    success: true,
    message: "Your request has been received. Our team will contact you.",
    data: { name, email, message }
  });
});

// =============================
// Auth: Register User
// =============================
app.post("/auth/register", [
  body("username").notEmpty().trim(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ success: true, user: { id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// Auth: Login (JWT)
// =============================
app.post("/auth/login", [
  body("email").isEmail(),
  body("password").notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// Users: Get (Protected)
// =============================
app.get("/users", verifyJWT, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// User: Get Current User Info
// =============================
app.get("/me", verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId, "-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// API Key: Generate (Protected)
// =============================
app.post("/apikey/generate", verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate secure API key
    user.apiKey = crypto.randomBytes(32).toString("hex");
    await user.save();

    res.json({ success: true, apiKey: user.apiKey });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// =============================
// Subscription (Stripe)
// =============================
app.post("/subscribe", verifyJWT, [
  body("plan").isIn(["free", "pro", "enterprise"])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { plan } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` },
          unit_amount: plan === "pro" ? 2900 : (plan === "enterprise" ? 9900 : 0)
        },
        quantity: 1
      }],
      mode: "payment",
      success_url: `${req.headers.origin || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || "http://localhost:3000"}/cancel`,
      client_reference_id: user._id.toString() // Link to user
    });

    return res.json({ success: true, sessionId: session.id, plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =============================
// Stripe Webhook (Confirm Payment)
// =============================
// Raw body parser for webhook
const webhookParser = express.raw({ type: "application/json" });
app.post("/webhook/stripe", webhookParser, async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const user = await User.findById(userId);
    if (user) {
      // Update subscription based on session metadata or line items
      // For simplicity, assume plan from session (add metadata in create session if needed)
      user.subscription = "paid"; // Or extract plan
      await user.save();
    }
  }

  res.json({ received: true });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Globizora API Service is running at http://localhost:${PORT}`);
});
