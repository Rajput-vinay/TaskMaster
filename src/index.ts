import express from "express";
import dotenv from 'dotenv'
import db from './db/index'
import userRouter from "./router/users.router";
import todoRouter from "./router/todos.router";

dotenv.config()
const PORT = process.env.port || 5000
 const app = express()


 app.use(express.json())
 db.connect()
  

  app.use(userRouter)
  app.use(todoRouter)
 app.listen(PORT, () =>{
    console.log("server start")
 })