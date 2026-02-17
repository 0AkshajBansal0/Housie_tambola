import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import joinRoutes from "./routes/joinRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import setupSocket from "./sockets/socketHandler.js";

import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

/* ------------------ SOCKET SETUP ------------------ */

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set("io", io);

// Initialize socket handler
setupSocket(io);

/* ------------------ MIDDLEWARE ------------------ */

app.use(cors());
app.use(express.json());

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

/* ------------------ SERVER START ------------------ */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});