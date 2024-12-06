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
const db_1 = __importDefault(require("../db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRouter = (0, express_1.Router)();
const signupParser = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().min(3).max(50).email()
});
const loginParser = zod_1.z.object({
    email: zod_1.z.string().min(3).max(50).email(),
    password: zod_1.z.string().min(3).max(50)
});
userRouter.post("/api/v1/auth/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = signupParser.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "data not in proper format",
            error: result.error.errors
        });
    }
    try {
        const { email, password, username } = result.data;
        const findQuery = `SELECT * FROM users WHERE email = $1`;
        const existingUser = yield db_1.default.query(findQuery, [email]);
        if (existingUser.rows.length > 0) {
            return res.status(402).json({
                message: "user already exist"
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const createQuery = `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id`;
        const newUser = yield db_1.default.query(createQuery, [username, email, hashedPassword]);
        console.log("newUser", newUser);
        const jwtSecret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ id: newUser.rows[0].id }, jwtSecret, {
            expiresIn: "8h",
        });
        return res.status(200).json({
            message: "userCreated",
            token,
        });
    }
    catch (error) {
        console.error("Error in /signup route:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
userRouter.post("/api/v1/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const result = loginParser.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "incorrect format"
        });
    }
    try {
        const { email, password } = result.data;
        const findQuery = `SELECT * FROM  users WHERE email = $1`;
        const existingUser = yield db_1.default.query(findQuery, [email]);
        if (existingUser.rows.length === 0) {
            return res.status(402).json({
                message: "user not exist, Please register"
            });
        }
        const verifyPassword = yield bcryptjs_1.default.compare(password, (_a = existingUser.rows[0]) === null || _a === void 0 ? void 0 : _a.password);
        if (!verifyPassword) {
            return res.status(401).json({
                message: "Password incorrect"
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ id: (_b = existingUser.rows[0]) === null || _b === void 0 ? void 0 : _b.id }, jwtSecret, {
            expiresIn: "8h",
        });
        return res.status(200).json({
            message: "User login successful",
            token
        });
    }
    catch (error) {
        console.log("login error", error);
        return res.status(500).json({
            message: "internal server error"
        });
    }
}));
exports.default = userRouter;
