import  pg from "pg";
import dotenv from 'dotenv'
dotenv.config()

const dburl = process.env.DB_URI as string 

if (!dburl) {
    throw new Error('DB_URI environment variable is not set');
  }
const db = new pg.Client({connectionString:dburl})
export default db