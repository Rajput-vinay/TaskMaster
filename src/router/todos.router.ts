import {Router, Request, Response}  from 'express'
import  {z} from 'zod'
import userMiddleware from '../middlewares/userMiddleware'
import db from '../db/index'
const todoRouter = Router()


const creteParser = z.object({
  title: z.string(),
  description: z.string()
})


const updateParser = z.object({
    title: z.string().optional(),
    description: z.string().optional()
  })

type createInterface = z.infer<typeof creteParser>
type updateInterface = z.infer<typeof updateParser>


todoRouter.post('/api/v1/create', userMiddleware ,async (req: Request,res: Response): Promise<any> =>{
  
    const result = creteParser.safeParse(req.body)

    if(!result.success){
       return res.status(400).json({
        message:"data not in proper format"
       })
    }

    try {
        const userId = req.userId
        const {title,description}: createInterface =  result.data

        const createQuery = `INSERT INTO todos (title,description,userId) VALUES ($1,$2, $3)  RETURNING *`

        const data = await db.query(createQuery,[title,description,userId])

        return res.status(201).json({
            message:"todos created",
            todos:data.rows[0]
        })
    } catch (error) {
        console.log("error message", error)
        return res.status(500).json({
            message:"internal server error"
        })
    }

})

todoRouter.get('/api/v1/todos', userMiddleware ,async (req: Request,res: Response): Promise<any> =>{

  try {
    const userId = req.userId

    if(!userId){
        return res.status(402).json({
            message:"userid not found"
        })
    }

    const findQuery = `SELECT * FROM todos WHERE userId = $1`

    const data = await db.query(findQuery, [userId])

    if(data.rows[0].length < 0){
        return res.status(403).json({
            message:"user have not any data"
        })
    }

    return res.status(201).json({
        message:"user Data",
        todos: data.rows
    })
  } catch (error) {
    console.log("error message", error)
    return res.status(500).json({
        message:"internal server error"
    })
}

})


todoRouter.delete('/api/v1/delete/:id', userMiddleware,async (req: Request,res: Response): Promise<any> =>{

try {
    const id = req.params.id
    const userId = req.userId

    if(!userId){
        return res.status(404).json({
            message:"user not login or signup"
        })
    }
    if(!id){
        return res.status(402).json({
            message:"todo id not found"
        })
    }

    const deleteQuery = `DELETE FROM todos id = $1 AND userId = $2`

     const dataDeleteTodo = await db.query(deleteQuery,[id, userId])

     if(dataDeleteTodo.rowCount === 0){
        return res.status(402).json({
            message:"todo not found"
        })
    }

    return res.status(200).json({
        message: 'deleted todo '
    })
}catch (error) {
    console.log("error message", error)
    return res.status(500).json({
        message:"internal server error"
    })
}
})

todoRouter.put('/api/v1/edit/:id', userMiddleware, async (req: Request, res: Response): Promise<any> => {
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
        const updateTodo = await db.query(updateQuery, [title, description, id, userId]);

        
        if (updateTodo.rowCount === 0) {
            return res.status(404).json({
                message: "Todo not found or unauthorized",
            });
        }

        return res.status(200).json({
            message: "Todo updated successfully",
        });
    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});


export default todoRouter
