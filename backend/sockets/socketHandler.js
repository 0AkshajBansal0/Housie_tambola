import Draw from "../models/Draw.js";

const setupSocket = (io) => {

  io.on("connection", async (socket) => {
    console.log("Socket connected:", socket.id);

    try {
      // Send full draw history immediately on connection
      const draws = await Draw.find().sort({ drawnAt: 1 });
      const drawnNumbers = draws.map(d => d.number);

      socket.emit("initialDrawnNumbers", drawnNumbers);

    } catch (error) {
      console.error("Error sending initial draw history:", error);
    }

    // Optional: Listen for client readiness
    socket.on("clientReady", () => {
      console.log("Client ready:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

};

export default setupSocket;