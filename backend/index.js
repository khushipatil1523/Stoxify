require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

// Models
const { HoldingModel } = require("./model/HoldingModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const { UserModel } = require("./model/UserModel");

// Env config
const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

// ------------------ API ROUTES ------------------ //

// ✅ Get all Holdings
app.get('/allHoldings', async (req, res) => {
  try {
    const holdings = await HoldingModel.find({});
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

// ✅ Get all Positions
app.get('/allPositions', async (req, res) => {
  try {
    const positions = await PositionsModel.find({});
    res.json(positions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// ✅ Post new Order
app.post('/newOrder', async (req, res) => {
  try {
    const newOrder = new OrdersModel({
      name: req.body.name,
      qty: req.body.qty,
      price: req.body.price,
      mode: req.body.mode,
    });
    await newOrder.save();
    res.status(201).send("Order saved");
  } catch (err) {
    res.status(500).json({ error: "Failed to save order" });
  }
});

// ✅ Get all Orders
app.get('/allOrders', async (req, res) => {
  try {
    const orders = await OrdersModel.find({});
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Signup Route
app.post("/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  console.log("📥 Signup request received:", username);

  try {
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      console.log("⚠️ Username already exists");
      return res.status(400).json({ error: "Username already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await new UserModel({ username, password: hashed }).save();
    console.log("✅ User created:", username);

    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ✅ Login Route
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ------------------ MONGODB CONNECTION ------------------ //
mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
