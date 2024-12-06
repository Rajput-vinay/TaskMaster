import { Router } from "express";
import {Request, Response} from 'express'
import {z} from 'zod'
import db from "../db";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const userRouter = Router()


const signupParser = z.object({
 username:z.string().min(3).max(50),
 password:z.string().min(3).max(50),
 email:z.string().min(3).max(50).email()
})

const loginParser = z.object({
    email: z.string().min(3).max(50).email(),
    password: z.string().min(3).max(50)
})

type inputInterface = z.infer<typeof signupParser>
type loginInterface = z.infer<typeof loginParser>



userRouter.post("/api/v1/auth/signup", async(req: Request, res: Response): Promise<any> =>{
    
    const result = signupParser.safeParse(req.body)

    if(!result.success){
        return res.status(400).json({
            message:"data not in proper format",
             error:result.error.errors
        })
    }

    try {
        
        const {email, password,username}: inputInterface = result.data;
         
        const findQuery = `SELECT * FROM users WHERE email = $1`
        const existingUser = await db.query(findQuery,[email]) 

        if(existingUser.rows.length > 0){
            return res.status(402).json({
                message:"user already exist"
            })
        }

      const hashedPassword = await bcrypt.hash(password,10)

      const createQuery = `INSERT INTO users (username,email,password) VALUES ($1,$2,$3) RETURNING id`
       
      const newUser = await db.query(createQuery, [username,email,hashedPassword])

      console.log("newUser", newUser)
      const jwtSecret = process.env.JWT_SECRET as string
      
      const token = jwt.sign({ id: newUser.rows[0].id }, jwtSecret, {
        expiresIn: "8h",
      });

      return res.status(200).json({
        message:"userCreated",
        token,
      })
    } catch (error) {
        console.error("Error in /signup route:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

})


userRouter.post("/api/v1/auth/login", async(req: Request, res: Response): Promise<any> =>{
      const result = loginParser.safeParse(req.body)

      if(!result.success){
        return res.status(400).json({
            message:"incorrect format"
        })
      }

      try {
        const {email, password}: loginInterface = result.data

        const findQuery = `SELECT * FROM  users WHERE email = $1`

        const existingUser = await db.query(findQuery,[email]);

        if(existingUser.rows.length === 0){
            return res.status(402).json({
                message:"user not exist, Please register"
            })
        }
        const verifyPassword = await bcrypt.compare(password,existingUser.rows[0]?.password)
        
        if(!verifyPassword){
            return res.status(401).json({
                message:"Password incorrect"
            })
        }
         
        const jwtSecret = process.env.JWT_SECRET as string
        const token = jwt.sign({id:existingUser.rows[0]?.id}, jwtSecret,{
            expiresIn: "8h",
        })

        return res.status(200).json({
            message:"User login successful",
            token
        })
    } catch (error) {
        console.log("login error", error)
        return res.status(500).json({
            message:"internal server error"
        })
      }
})

export default userRouter