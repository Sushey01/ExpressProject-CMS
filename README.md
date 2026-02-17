# MyContacts Backend API - Complete Documentation

A comprehensive RESTful API for managing contacts with user authentication, built with Node.js, Express, and MongoDB.

## 📚 Table of Contents

- [Project Overview](#project-overview)
- [What is a RESTful API?](#what-is-a-restful-api)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Understanding the Architecture](#understanding-the-architecture)
- [API Endpoints](#api-endpoints)
- [Building This Project From Scratch](#building-this-project-from-scratch)
- [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 Project Overview

This is a backend API that allows users to:

- **Register** and **login** with secure authentication
- **Create, Read, Update, and Delete (CRUD)** their personal contacts
- **Protect** their contacts so only they can access/modify them

**Real-world analogy:** Think of this like a digital phonebook app where each user has their own private contact list that no one else can see or edit.

---

## 🛠 Technologies Used

| Technology                | Purpose                    | Why We Use It                                              |
| ------------------------- | -------------------------- | ---------------------------------------------------------- |
| **Node.js**               | JavaScript Runtime         | Allows us to run JavaScript on the server                  |
| **Express.js**            | Web Framework              | Simplifies creating REST APIs and handling HTTP requests   |
| **MongoDB**               | Database                   | Stores users and contacts data in a flexible NoSQL format  |
| **Mongoose**              | ODM (Object Data Modeling) | Makes working with MongoDB easier using schemas and models |
| **bcrypt**                | Password Hashing           | Encrypts passwords before storing them in database         |
| **jsonwebtoken (JWT)**    | Authentication             | Creates secure tokens for user session management          |
| **express-async-handler** | Error Handling             | Simplifies async/await error handling in Express           |
| **dotenv**                | Environment Variables      | Keeps sensitive data (like database URLs) secure           |

---

## 📁 Project Structure

```
mycontacts-backend/
│
├── config/                    # Configuration files
│   └── dbConnection.js        # MongoDB connection setup
│
├── controllers/               # Business logic (what happens when routes are hit)
│   ├── contactController.js   # Logic for contact CRUD operations
│   └── userController.js      # Logic for user registration/login
│
├── middleware/                # Functions that run between request and response
│   ├── errorHandler.js        # Handles errors and sends proper error messages
│   └── validateTokenHandler.js # Checks if user is authenticated
│
├── models/                    # Database schemas (structure of data)
│   ├── contactModel.js        # Defines what a contact looks like
│   └── userModel.js           # Defines what a user looks like
│
├── routes/                    # API endpoints (URLs that clients can hit)
│   ├── contactRoutes.js       # Routes for /api/contacts
│   └── userRoutes.js          # Routes for /api/users
│
├── .env                       # Environment variables (NOT committed to Git)
├── constants.js               # HTTP status code constants
├── package.json               # Project dependencies and scripts
└── server.js                  # Main entry point of the application
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher) installed
- **MongoDB Atlas** account (free tier) or local MongoDB
- **Thunder Client** or **Postman** for testing APIs

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd mycontacts-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create `.env` file** in the root directory

   ```env
   PORT=5001
   CONNECTION_STRING=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_super_secret_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   You should see:

   ```
   Server running on port 5001
   Database connected successfully
   ```

---

## 🏗 Understanding the Architecture

### 1. **Server.js - The Entry Point**

**What it does:** This is where your application starts. It sets up Express, connects to MongoDB, and registers all routes and middleware.

**Flow:**

```javascript
1. Load environment variables from .env file
2. Connect to MongoDB database
3. Create Express application
4. Add middleware to parse JSON
5. Register routes (/api/contacts, /api/users)
6. Add error handler middleware
7. Start listening on specified port
```

**Code breakdown:**

```javascript
const express = require("express"); // Import Express framework
const connectDB = require("./config/dbConnection"); // Import DB connection function
const errorHandler = require("./middleware/errorHandler"); // Import error handler
const dotenv = require("dotenv").config(); // Load .env variables

connectDB(); // Connect to MongoDB
const app = express(); // Create Express app

app.use(express.json()); // Parse incoming JSON data

const port = process.env.PORT || 5000; // Use port from .env or default 5000

// Register routes
app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use(errorHandler); // Handle all errors

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

---

### 2. **Config Folder - Database Connection**

**Purpose:** Separate configuration from business logic for better organization.

**File: `config/dbConnection.js`**

**What it does:** Connects to MongoDB using Mongoose.

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect to MongoDB using connection string from .env
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);

    console.log(
      "Database connected successfully:",
      connect.connection.host, // MongoDB server address
      connect.connection.name,
    ); // Database name
  } catch (err) {
    console.log(err);
    process.exit(1); // Exit the app if database connection fails
  }
};

module.exports = connectDB;
```

**Why async/await?** Database operations take time, so we use async/await to wait for the connection before proceeding.

---

### 3. **Models Folder - Data Structure**

**Purpose:** Define the structure of data stored in MongoDB.

**Analogy:** Like creating a form template - what fields are required, their types, etc.

#### **File: `models/userModel.js`**

```javascript
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the username"], // Validation message
    },
    email: {
      type: String,
      required: [true, "Please add the email"],
      unique: [true, "Email already exists"], // Ensure no duplicate emails
    },
    password: {
      type: String,
      required: [true, "Please add the password"],
    },
  },
  { timestamps: true },
); // Automatically add createdAt and updatedAt fields

module.exports = mongoose.model("User", userSchema);
```

**Key points:**

- `mongoose.Schema()` defines the structure
- `required` makes fields mandatory
- `unique` ensures no duplicates
- `timestamps` adds createdAt/updatedAt automatically
- `mongoose.model()` creates a model for database operations

#### **File: `models/contactModel.js`**

```javascript
const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User model
      required: true,
      ref: "User", // Links to User collection
    },
    name: {
      type: String,
      required: [true, "Please add the name"],
    },
    email: {
      type: String,
      required: [true, "Please add the email"],
    },
    phone: {
      type: String,
      required: [true, "Please add the phone number"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", contactSchema);
```

**Important:** The `user_id` field creates a **relationship** between contacts and users. Each contact belongs to one user.

---

### 4. **Routes Folder - API Endpoints**

**Purpose:** Define which URLs are available and what they do.

**Analogy:** Like a restaurant menu - lists what's available and how to order it.

#### **File: `routes/userRoutes.js`**

```javascript
const express = require("express");
const {
  registerUser,
  currentUser,
  loginUser,
} = require("../controllers/userController");

const router = express.Router();

// Public routes (no authentication needed)
router.post("/register", registerUser); // POST /api/users/register
router.post("/login", loginUser); // POST /api/users/login

// Protected route (needs authentication)
router.get("/current", currentUser); // GET /api/users/current

module.exports = router;
```

#### **File: `routes/contactRoutes.js`**

```javascript
const express = require("express");
const router = express.Router();
const {
  getContacts,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
} = require("../controllers/contactController");

const validateToken = require("../middleware/validateTokenHandler");

// All contact routes are protected
router.use(validateToken); // This middleware runs BEFORE all routes below

// Chaining routes with same path
router
  .route("/")
  .get(getContacts) // GET /api/contacts - Get all contacts
  .post(createContact); // POST /api/contacts - Create new contact

router
  .route("/:id")
  .get(getContactById) // GET /api/contacts/:id - Get one contact
  .put(updateContact) // PUT /api/contacts/:id - Update contact
  .delete(deleteContact); // DELETE /api/contacts/:id - Delete contact

module.exports = router;
```

**Key concepts:**

- `router.route()` chains multiple HTTP methods for same path
- `:id` is a route parameter (dynamic value)
- `validateToken` middleware protects all routes below it

---

### 5. **Middleware Folder - Request Processing**

**Purpose:** Functions that run between receiving a request and sending a response.

**Analogy:** Like security checkpoints at an airport - checking tickets, scanning bags before boarding.

#### **File: `middleware/errorHandler.js`**

**What it does:** Catches all errors and sends user-friendly responses.

```javascript
const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
  // Use existing status code or default to 500
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case constants.VALIDATION_ERROR: // 400
      res.json({
        title: "Validation Failed",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.NOT_FOUND: // 404
      res.json({
        title: "Not Found",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.UNAUTHORIZED: // 401
      res.json({
        title: "Unauthorized",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.FORBIDDEN: // 403
      res.json({
        title: "Forbidden",
        message: err.message,
        stackTrace: err.stack,
      });
      break;

    case constants.INTERNAL_SERVER_ERROR: // 500
      res.json({
        title: "Internal Server Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
  }
};

module.exports = errorHandler;
```

**How it works:**

1. Controller throws an error: `throw new Error("User not found")`
2. Error handler catches it
3. Checks the status code
4. Sends appropriate JSON response

#### **File: `middleware/validateTokenHandler.js`**

**What it does:** Checks if user is authenticated before allowing access to protected routes.

```javascript
const asynchandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateTokenHandler = asynchandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with "Bearer"
  if (authHeader && authHeader.startsWith("Bearer")) {
    // Extract token (format: "Bearer <token>")
    token = authHeader.split(" ")[1];

    // Verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized");
      }
      // Add user info to request object
      req.user = decoded.user;
      next(); // Pass control to next middleware/controller
    });

    if (!token) {
      res.status(401);
      throw new Error("User is not authorized, no token");
    }
  }
});

module.exports = validateTokenHandler;
```

**Authentication Flow:**

1. User logs in → receives JWT token
2. User includes token in request header: `Authorization: Bearer <token>`
3. Middleware extracts and verifies token
4. If valid, adds user info to `req.user`
5. Controller can now access `req.user.id`

---

### 6. **Controllers Folder - Business Logic**

**Purpose:** Contains the actual logic that executes when routes are hit.

**Analogy:** Like the kitchen in a restaurant - where the actual work happens.

#### **File: `controllers/userController.js`**

**1. Register User**

```javascript
const registerUser = asynchandler(async (req, res) => {
  // Step 1: Get data from request body
  const { username, email, password } = req.body;

  // Step 2: Validate all fields are provided
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  // Step 3: Check if user already exists
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Step 4: Hash the password for security
  const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds
  console.log("Hashed password is:", hashedPassword);

  // Step 5: Create user in database
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  console.log(`User created successfully ${user}`);

  // Step 6: Send response
  if (user) {
    res.status(201).json({ _id: user.id, email: user.email });
  } else {
    res.status(400);
    throw new Error("User data is not valid");
  }
});
```

**Why hash passwords?**

- Storing plain passwords is dangerous
- If database is hacked, passwords are exposed
- Hashing converts "password123" → "gibberish" (irreversible)

**2. Login User**

```javascript
const loginUser = asynchandler(async (req, res) => {
  // Step 1: Get credentials
  const { email, password } = req.body;

  // Step 2: Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  // Step 3: Find user by email
  const user = await User.findOne({ email });

  // Step 4: Compare password with hashed password
  if (user && (await bcrypt.compare(password, user.password))) {
    // Step 5: Create JWT token
    const accessToken = jwt.sign(
      {
        user: {
          username: user.username,
          email: user.email,
          id: user.id,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15min" }, // Token expires in 15 minutes
    );

    // Step 6: Send token to client
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Email or password is incorrect or invalid");
  }
});
```

**JWT Token explained:**

- Contains user information (username, email, id)
- Signed with secret key (only server can create/verify)
- Has expiration time
- Client stores it and sends with each request

#### **File: `controllers/contactController.js`**

**1. Get All Contacts**

```javascript
const getContacts = asynchandler(async (req, res) => {
  // Find only contacts that belong to logged-in user
  const contacts = await Contact.find({ user_id: req.user.id });
  res.status(200).json(contacts);
});
```

**Key point:** `req.user.id` comes from the JWT token (added by validateToken middleware)

**2. Create Contact**

```javascript
const createContact = asynchandler(async (req, res) => {
  console.log("The request body is:", req.body);

  // Step 1: Extract data
  const { name, email, phone } = req.body;

  // Step 2: Validate
  if (!name || !email || !phone) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  // Step 3: Create contact with user_id
  const contact = await Contact.create({
    name,
    email,
    phone,
    user_id: req.user.id, // Associate contact with logged-in user
  });

  res.status(201).json(contact);
});
```

**3. Get Contact By ID**

```javascript
const getContactById = asynchandler(async (req, res) => {
  // req.params.id comes from URL: /api/contacts/:id
  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  res.status(200).json(contact);
});
```

**4. Update Contact**

```javascript
const updateContact = asynchandler(async (req, res) => {
  // Step 1: Find the contact
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  // Step 2: Check if user owns this contact
  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      "User don't have permission to update other user's contact",
    );
  }

  // Step 3: Update the contact
  const updatedContact = await Contact.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }, // Return updated document instead of old one
  );

  res.status(200).json(updatedContact);
});
```

**5. Delete Contact**

```javascript
const deleteContact = asynchandler(async (req, res) => {
  // Step 1: Find contact
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  // Step 2: Check ownership
  if (contact.user_id.toString() !== req.user.id) {
    res.status(403);
    throw new Error(
      "User don't have permission to delete other user's contact",
    );
  }

  // Step 3: Delete contact
  await contact.deleteOne(); // Deletes this specific document
  res.status(200).json(contact);
});
```

**Why check ownership?**

- Prevents users from modifying/deleting other users' contacts
- Security measure to ensure data privacy

---

### 7. **Constants.js - HTTP Status Codes**

**Purpose:** Store commonly used status codes in one place.

```javascript
exports.constants = {
  VALIDATION_ERROR: 400, // Bad request (missing/invalid data)
  UNAUTHORIZED: 401, // Not logged in
  FORBIDDEN: 403, // Logged in but no permission
  NOT_FOUND: 404, // Resource doesn't exist
  INTERNAL_SERVER_ERROR: 500, // Server error
};
```

**Why use constants?**

- Avoid typos (typing 400 vs 4000)
- Easy to update in one place
- More readable code

---

## 📡 API Endpoints

### User Endpoints

| Method | Endpoint              | Description           | Access  | Request Body                  |
| ------ | --------------------- | --------------------- | ------- | ----------------------------- |
| POST   | `/api/users/register` | Register new user     | Public  | `{username, email, password}` |
| POST   | `/api/users/login`    | Login user            | Public  | `{email, password}`           |
| GET    | `/api/users/current`  | Get current user info | Private | N/A                           |

### Contact Endpoints

All contact endpoints require authentication (Bearer token).

| Method | Endpoint            | Description             | Request Body           |
| ------ | ------------------- | ----------------------- | ---------------------- |
| GET    | `/api/contacts`     | Get all user's contacts | N/A                    |
| POST   | `/api/contacts`     | Create new contact      | `{name, email, phone}` |
| GET    | `/api/contacts/:id` | Get specific contact    | N/A                    |
| PUT    | `/api/contacts/:id` | Update contact          | `{name, email, phone}` |
| DELETE | `/api/contacts/:id` | Delete contact          | N/A                    |

---

## 🔨 Building This Project From Scratch

### Step 1: Initialize Project

```bash
mkdir mycontacts-backend
cd mycontacts-backend
npm init -y
```

### Step 2: Install Dependencies

```bash
npm install express mongoose dotenv express-async-handler bcrypt jsonwebtoken
npm install --save-dev nodemon
```

### Step 3: Update package.json Scripts

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Step 4: Create Folder Structure

```bash
mkdir config controllers middleware models routes
```

### Step 5: Create Files in Order

**5.1 Create `.env` file**

```env
PORT=5001
CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/mycontacts
ACCESS_TOKEN_SECRET=your_random_secret_key_12345
```

**5.2 Create `constants.js`**

```javascript
exports.constants = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
```

**5.3 Create `config/dbConnection.js`**

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(
      "Database connected successfully:",
      connect.connection.host,
      connect.connection.name,
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**5.4 Create `models/userModel.js`**

```javascript
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the username"],
    },
    email: {
      type: String,
      required: [true, "Please add the email"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Please add the password"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
```

**5.5 Create `models/contactModel.js`**

```javascript
const mongoose = require("mongoose");

const contactSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please add the name"],
    },
    email: {
      type: String,
      required: [true, "Please add the email"],
    },
    phone: {
      type: String,
      required: [true, "Please add the phone number"],
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Contact", contactSchema);
```

**5.6 Create `middleware/errorHandler.js`**

```javascript
const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.json({
        title: "Validation Failed",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.NOT_FOUND:
      res.json({
        title: "Not Found",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.UNAUTHORIZED:
      res.json({
        title: "Unauthorized",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.FORBIDDEN:
      res.json({
        title: "Forbidden",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
    case constants.INTERNAL_SERVER_ERROR:
      res.json({
        title: "Internal Server Error",
        message: err.message,
        stackTrace: err.stack,
      });
      break;
  }
};

module.exports = errorHandler;
```

**5.7 Create `middleware/validateTokenHandler.js`**

```javascript
const asynchandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateTokenHandler = asynchandler(async (req, res, next) => {
  let token;
  let authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.status(401);
        throw new Error("User is not authorized");
      }
      req.user = decoded.user;
      next();
    });

    if (!token) {
      res.status(401);
      throw new Error("User is not authorized, no token");
    }
  }
});

module.exports = validateTokenHandler;
```

**5.8 Create controllers** (use code from Controllers section above)

**5.9 Create routes** (use code from Routes section above)

**5.10 Create `server.js`**

```javascript
const express = require("express");
const connectDB = require("./config/dbConnection");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();

connectDB();
const app = express();

app.use(express.json());

const port = process.env.PORT || 5000;

app.use("/api/contacts", require("./routes/contactRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

### Step 6: Test Your API

**6.1 Start the server**

```bash
npm run dev
```

**6.2 Register a user**

- Method: POST
- URL: `http://localhost:5001/api/users/register`
- Body:

```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**6.3 Login**

- Method: POST
- URL: `http://localhost:5001/api/users/login`
- Body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

- Copy the `accessToken` from response

**6.4 Create a contact**

- Method: POST
- URL: `http://localhost:5001/api/contacts`
- Headers: `Authorization: Bearer <your_token>`
- Body:

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "1234567890"
}
```

**6.5 Get all contacts**

- Method: GET
- URL: `http://localhost:5001/api/contacts`
- Headers: `Authorization: Bearer <your_token>`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Processing..." on API Request

**Problem:** Request hangs and shows "Processing..."

**Causes:**

1. Missing `res.json()` or `res.send()` in controller
2. Duplicate response sending
3. Database connection failed
4. Middleware not calling `next()`

**Solution:**

- Ensure every route sends exactly ONE response
- Check database connection logs
- Verify middleware calls `next()` when needed

### Issue 2: "User is not authorized"

**Problem:** Can't access protected routes

**Causes:**

1. Token not included in request
2. Token format wrong
3. Token expired
4. Wrong secret key

**Solution:**

- Include header: `Authorization: Bearer <token>`
- Check token hasn't expired (15min limit)
- Verify ACCESS_TOKEN_SECRET in .env

### Issue 3: "Cannot delete contact" or "deleteOne is not a function"

**Problem:** Using wrong delete method

**Solution:**

```javascript
// ❌ Wrong
await Contact.remove();

// ✅ Correct (instance method)
const contact = await Contact.findById(id);
await contact.deleteOne();

// ✅ Also correct (model method)
await Contact.deleteOne({ _id: id });
```

### Issue 4: Field Mismatch

**Problem:** Controller uses `username` but model expects `name`

**Solution:** Ensure field names match between:

- Request body
- Controller destructuring
- Model schema

### Issue 5: Database Connection Error

**Problem:** "Database connection failed"

**Causes:**

1. Wrong connection string
2. IP not whitelisted in MongoDB Atlas
3. Wrong credentials

**Solution:**

- Verify CONNECTION_STRING in .env
- In MongoDB Atlas: Network Access → Add your IP (or use 0.0.0.0/0 for all)
- Check username/password are correct

---

## 📖 Key Concepts Summary

### 1. **MVC Pattern** (Model-View-Controller)

- **Model:** Database schemas (models folder)
- **Controller:** Business logic (controllers folder)
- **Routes:** Connect URLs to controllers

### 2. **Middleware**

- Functions that run in the middle of request-response cycle
- Can modify `req` and `res` objects
- Must call `next()` to pass control

### 3. **Authentication Flow**

1. User registers → password hashed → stored in DB
2. User logs in → password verified → JWT created → sent to client
3. Client stores token
4. Client sends token with each request
5. Server verifies token → allows/denies access

### 4. **Mongoose Operations**

- `Model.find()` - Get multiple documents
- `Model.findOne()` - Get single document by condition
- `Model.findById()` - Get single document by ID
- `Model.create()` - Create new document
- `Model.findByIdAndUpdate()` - Find and update
- `document.deleteOne()` - Delete instance
- `Model.deleteOne()` - Delete by condition

### 5. **HTTP Status Codes**

- **200** OK - Success
- **201** Created - Resource created successfully
- **400** Bad Request - Invalid data
- **401** Unauthorized - Not authenticated
- **403** Forbidden - Authenticated but no permission
- **404** Not Found - Resource doesn't exist
- **500** Internal Server Error - Server error

### 6. **async/await**

- Used for asynchronous operations (database calls, API calls)
- `await` waits for promise to resolve
- Must be inside `async` function

---

## 🎓 Learning Path

If you're building this project to learn, follow this sequence:

1. ✅ **Understand Node.js and npm** basics
2. ✅ **Learn Express.js** fundamentals (routing, middleware)
3. ✅ **MongoDB basics** (documents, collections)
4. ✅ **Mongoose** (schemas, models, queries)
5. ✅ **REST API** principles
6. ✅ **Authentication** (hashing, JWT)
7. ✅ **Error handling** in Express
8. ✅ **Environment variables**

---

## 🚀 Next Steps

To improve this project:

1. **Add input validation** (use express-validator)
2. **Add pagination** for contacts list
3. **Add search/filter** functionality
4. **Add refresh tokens** for better security
5. **Add email verification** on registration
6. **Add password reset** functionality
7. **Add profile picture upload**
8. **Add rate limiting** to prevent abuse
9. **Add logging** (use Winston or Morgan)
10. **Write tests** (use Jest/Mocha)

---

## 📝 License

MIT

---

## 👨‍💻 Author

Shekhar Magar

---

## 🙏 Acknowledgments

This project demonstrates:

- RESTful API design
- JWT authentication
- MongoDB relationships
- Express middleware
- Error handling best practices

Perfect for learning backend development with Node.js!

---

**Happy Coding! 🎉**
