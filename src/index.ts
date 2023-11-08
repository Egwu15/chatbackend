import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // replace with your client's origin
    credentials: true,
  },
});
app.use(cors({ origin: "http://localhost:300p" }));

const PORT = process.env.PORT || 4000;

// Server-side
const users = {};

io.on("connection", (socket) => {
  // When a user connects, they should send their ID
  socket.on("setUserId", (userId) => {
    // Store the user's ID and socket ID in the users object
    users[userId] = socket.id;
  });

  // When a user sends a message
  socket.on("privateMessage", ({ content, to, userId }) => {
    // Look up the recipient's socket ID in the users object
    const recipientSocketId = users[to];

    // If the recipient's socket ID is not found, emit an error message to the sender
    if (!recipientSocketId) {
      socket.emit("errorMessage", { message: "Recipient not found" });
      return;
    }

    // Send the message only to the recipient's socket ID and the sender's room ID
    socket
      .to(recipientSocketId)
      .to(socket.id)
      .emit("privateMessage", { content, userId });
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
