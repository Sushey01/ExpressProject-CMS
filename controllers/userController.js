const asynchandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

//@desc Get all users
//@route GET /api/users/register
//@access public
const registerUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const userAvailable = await User.findOne({ email }); // need to pass email in object so {}
  if (userAvailable) {
    res.status(400);
    throw new Error("User already exists");
  }

  //HASH PASSWORD
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password is :", hashedPassword);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  console.log(`User created successfully ${user}`);

  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }

  res.json({ message: "Register the user", user });
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
