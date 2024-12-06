"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = __importDefault(require("pg"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// const db = new pg.Client("postgresql://neondb_owner:fizy9her2Fad@ep-young-sea-a5k0fvl0.us-east-2.aws.neon.tech/neondb?sslmode=require")
const dburl = process.env.DB_URI;
if (!dburl) {
    throw new Error('DB_URI environment variable is not set');
}
const db = new pg_1.default.Client({ connectionString: dburl });
exports.default = db;
