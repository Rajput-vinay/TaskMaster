"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = __importDefault(require("./db/index"));
const users_router_1 = __importDefault(require("./router/users.router"));
const todos_router_1 = __importDefault(require("./router/todos.router"));
dotenv_1.default.config();
const PORT = process.env.port || 5000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
index_1.default.connect();
app.use(users_router_1.default);
app.use(todos_router_1.default);
app.listen(PORT, () => {
    console.log("server start");
});
