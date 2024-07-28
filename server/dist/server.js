"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const thread_1 = __importDefault(require("./routers/thread"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
app.use("/api/thread", thread_1.default);
const httpServer = (0, http_1.createServer)(app);
const PORT = 5050;
httpServer.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
});
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: [process.env.CLIENT_URL],
        credentials: true,
    },
});
exports.io = io;
io.on("connection", (socket) => {
    console.log("connection");
    socket.on("disconnect", () => {
        console.log("disconnect");
    });
});
