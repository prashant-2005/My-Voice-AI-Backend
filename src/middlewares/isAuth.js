import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config()

const isAuth = async (req,res,next)=>{
    try {
        const token = req.cookies.token
        if(!token){
            return res.status(400).json({
                message:"token not found"
            })
        }

        const verifyToken = await jwt.verify(token,process.env.JWT_SECRETKEY) 
        req.userId = verifyToken.userId //userId

        next();

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"isAuth error"
        });
        
    }

}

export default isAuth