const jwt = require('jsonwebtoken');
const User = require("../model/user.model");
const authGuard= async( req,res,next) =>{
    try{
        const authorization = req.get('authorization');
        const bearerToken = authorization?.startsWith('Bearer ')
            ? authorization.slice(7)
            : null;
        const token = bearerToken || req.cookies?.token;
        if(!token){
            return res.status(401).json({
                success: false,
                message:"access denied, no token provided"
            })
        }
        const payload= jwt.verify(token, process.env.JWT_SECRET);
      
        const user= await User.findById(payload.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "access denied, user no longer exists"
            });
        }

        req.user= user;
        
        next();
    }catch(error){
        res.status(401).json({
            success: false,
            message: error.message,
        })
    }
}

module.exports = authGuard;
