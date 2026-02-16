const express = require("express");
const connectDB = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();


connectDB();
const app = express();


app.use(express.json()); //inbuilt middleware to handle json data in the request body, it will help us to access the data in the request body using req.body

const port = process.env.PORT || 5000;

app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use(errorHandler); // it will help us to handle the error in the application, it will be called when there is an error in the application, it will be called in the controllers when there is an error in the application

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


