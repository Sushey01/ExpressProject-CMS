const express = require("express");
const {registerUser, currentUser, loginUser} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser)

router.get("/current", currentUser);

// router.post("/logout", (req, res)=>{
//     res.json({message: "Logout the user"});
// })


module.exports = router;