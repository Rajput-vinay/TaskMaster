"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const userMiddleware_1 = __importDefault(require("../middlewares/userMiddleware"));
const index_1 = __importDefault(require("../db/index"));
const todoRouter = (0, express_1.Router)();
const creteParser = zod_1.z.object({
    title: zod_1.z.string(),
    description: zod_1.z.string()
});
const updateParser = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional()
});
todoRouter.post('/api/v1/create', userMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = creteParser.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "data not in proper format"
        });
    }
    try {
        const userId = req.userId;
        const { title, description } = result.data;
        const createQuery = `INSERT INTO todos (title,description,userId) VALUES ($1,$2, $3)  RETURNING *`;
        const data = yield index_1.default.query(createQuery, [title, description, userId]);
        return res.status(201).json({
            message: "todos created",
            todos: data.rows[0]
        });
    }
    catch (error) {
        console.log("error message", error);
        return res.status(500).json({
            message: "internal server error"
        });
    }
}));
todoRouter.get('/api/v1/todos', userMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(402).json({
                message: "userid not found"
            });
        }
        const findQuery = `SELECT * FROM todos WHERE userId = $1`;
        const data = yield index_1.default.query(findQuery, [userId]);
        if (data.rows[0].length < 0) {
            return res.status(403).json({
                message: "user have not any data"
            });
        }
        return res.status(201).json({
            message: "user Data",
            todos: data.rows
        });
    }
    catch (error) {
        console.log("error message", error);
        return res.status(500).json({
            message: "internal server error"
        });
    }
}));
todoRouter.post('/api/v1/delete/:id?', userMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userId = req.userId;
        if (!userId) {
            return res.status(404).json({
                message: "user not login or signup"
            });
        }
        if (!id) {
            return res.status(402).json({
                message: "todo id not found"
            });
        }
        const deleteQuery = `DELETE FROM todos id = $1 AND userId = $2`;
        const dataDeleteTodo = yield index_1.default.query(deleteQuery, [id, userId]);
        if (dataDeleteTodo.rowCount === 0) {
            return res.status(402).json({
                message: "todo not found"
            });
        }
        return res.status(200).json({
            message: 'deleted todo '
        });
    }
    catch (error) {
        console.log("error message", error);
        return res.status(500).json({
            message: "internal server error"
        });
    }
}));
todoRouter.post('/api/v1/edit/:id?', userMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = updateParser.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Data not in proper format",
        });
    }
    try {
        const id = req.params.id;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                message: "User not logged in",
            });
        }
        const { title, description } = result.data;
        if (!id) {
            return res.status(400).json({
                message: "Todo ID is required",
            });
        }
        const updateQuery = `
            UPDATE todos
            SET title = $1, description = $2, updated_at = NOW()
            WHERE id = $3 AND userId = $4
        `;
        const updateTodo = yield index_1.default.query(updateQuery, [title, description, id, userId]);
        if (updateTodo.rowCount === 0) {
            return res.status(404).json({
                message: "Todo not found or unauthorized",
            });
        }
        return res.status(200).json({
            message: "Todo updated successfully",
        });
    }
    catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
}));
exports.default = todoRouter;
