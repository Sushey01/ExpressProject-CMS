const asynchandler = require("express-async-handler");

//@desc Get all users
//@route GET /api/users/register
//@access public
const registerUser = asynchandler(async (req, res) => {
  res.json({ message: "Register the user" });
});

//@desc POST all users
//@route POST /api/users/login
//@access public
const loginUser = asynchandler(async (req, res) => {
  res.json({ message: "Login user" });
});

//@descCurrent user info
//@route POST /api/users/current
//@access private
const currentUser = asynchandler(async (req, res) => {
  res.json({ message: "current user information" });
});

module.exports = { registerUser, loginUser, currentUser };
