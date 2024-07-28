import express from "express";
import type { Express } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

import threadRoute from "./routers/thread";

const app: Express = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

app.use("/api/thread", threadRoute);

const httpServer = createServer(app);
const PORT = 5050;

httpServer.listen(PORT, () => {
  console.log(`listening on PORT ${PORT}`);
});

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL as string],
    credentials: true,
  },
});

io.on("connection", (socket: Socket) => {
  console.log("connection");

  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

export { io };
