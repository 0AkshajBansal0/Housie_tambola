import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import joinRoutes from "./routes/joinRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import setupSocket from "./sockets/socketHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ------------------ CORS CONFIG ------------------ */

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

app.use(express.json());

/* ------------------ SOCKET SETUP ------------------ */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
});

// Make io accessible inside routes
app.set("io", io);

// Initialize socket handler
setupSocket(io);

/* ------------------ DATABASE ------------------ */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

/* ------------------ ROUTES ------------------ */

app.use("/api/join", joinRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

/* ------------------ HEALTH CHECK ------------------ */

app.get("/", (req, res) => {
  res.send("Housie Backend Running");
});

/* ------------------ SERVER START ------------------ */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});