const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add the name"],
  },
  email: {
    type: String,
    required: [true, "Please add the email"],
    unique: [true, "Email already exists"], // to ensure that the email is unique in the database
  },

  password: {
    type: String,
    required: [true, "Please add the password"],
  },
  
}, {timestamps: true});

module.exports = mongoose.model("User", userSchema)