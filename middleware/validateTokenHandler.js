const asynchandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateTokenHandler = asynchandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer")){
        token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
            if(err){
                res.status(401);
                throw new Error("User is not authorized");
            }
            req.user = decoded.user;
            next();  // this will pass the control to the next middleware function which is currentUser in this case
        })

        if(!token){
            res.status(401);
            throw new Error("User is not authorized, no token");
        }
    }
    });

    module.exports = validateTokenHandler;