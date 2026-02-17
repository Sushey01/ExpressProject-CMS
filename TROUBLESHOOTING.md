# Troubleshooting Guide - Common Errors & Solutions

A comprehensive guide to solve common issues you might encounter.

---

## 🔴 Server Won't Start

### Error: `Cannot find module 'express'`

**What it means:** Dependencies are not installed.

**Solution:**

```bash
npm install
```

**Why it happens:** You cloned the repo but didn't install dependencies.

---

### Error: `PORT is already in use`

**What it means:** Another process is using port 5001.

**Solution 1:** Kill the process

```powershell
# Windows PowerShell
netstat -ano | findstr :5001
taskkill /PID <process_id> /F
```

**Solution 2:** Change port in `.env`

```env
PORT=5002
```

---

### Error: `MongooseServerSelectionError: connect ECONNREFUSED`

**What it means:** Cannot connect to MongoDB.

**Common causes & solutions:**

1. **Wrong connection string**

   ```env
   # Check your .env file
   CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/dbname
   ```

2. **IP not whitelisted in MongoDB Atlas**
   - Go to MongoDB Atlas
   - Navigate to Network Access
   - Click "Add IP Address"
   - Use `0.0.0.0/0` (allow from anywhere) for development

3. **Wrong username/password**
   - Verify credentials in MongoDB Atlas
   - Create new database user if needed
   - Update `.env` file

4. **Database name missing**

   ```env
   # ❌ Wrong
   CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/

   # ✅ Correct
   CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/mycontacts
   ```

---

## 🔴 Authentication Errors

### Error: `User is not authorized, no token`

**What it means:** Request is missing the authentication token.

**Solution:**
Add Authorization header:

```
Authorization: Bearer <your_token_here>
```

**Common mistakes:**

```
❌ Authorization: <token>              (missing "Bearer")
❌ Authorization: bearer <token>       (lowercase b)
❌ Auth: Bearer <token>                (wrong header name)
✅ Authorization: Bearer <token>        (correct)
```

---

### Error: `User is not authorized` (even with token)

**Common causes:**

1. **Token expired**
   - Tokens expire in 15 minutes
   - **Solution:** Login again to get new token

2. **Wrong ACCESS_TOKEN_SECRET**
   - Token was created with different secret
   - **Solution:** Verify `.env` has correct `ACCESS_TOKEN_SECRET`

3. **Token copied incorrectly**
   - Extra spaces or characters
   - **Solution:** Copy token carefully, no spaces

4. **Using old token after server restart with new secret**
   - **Solution:** Login again with new secret

---

### Error: `jwt malformed`

**What it means:** Token format is invalid.

**Solution:**

1. Ensure token starts with `eyJ`
2. Has three parts separated by dots: `header.payload.signature`
3. No extra spaces or line breaks

---

## 🔴 Validation Errors

### Error: `All fields are mandatory`

**What it means:** Required fields are missing in request body.

**For user registration:**

```json
{
  "username": "required",
  "email": "required",
  "password": "required"
}
```

**For contacts:**

```json
{
  "name": "required",
  "email": "required",
  "phone": "required"
}
```

**Common mistakes:**

- Typos in field names (`usrname` instead of `username`)
- Leaving fields empty (`"username": ""`)
- Not sending JSON (`Content-Type` must be `application/json`)

---

### Error: `User validation failed: email: Path 'email' is required.`

**What it means:** Mongoose schema validation failed.

**Solution:**
Check your request body matches the model schema exactly.

**Model expects:**

```javascript
{
  username: String,  // required
  email: String,     // required
  password: String   // required
}
```

**Your request must have:**

```json
{
  "username": "value",
  "email": "value",
  "password": "value"
}
```

---

## 🔴 CRUD Operation Errors

### Error: `Contact not found`

**What it means:** Contact with that ID doesn't exist.

**Common causes:**

1. **Wrong ID format**
   - Must be valid MongoDB ObjectId (24 hex characters)
   - Example: `65f789ghi012jkl345mno678`

2. **Contact was deleted**
   - Get all contacts to verify IDs

3. **Trying to access another user's contact**
   - Each user can only see their own contacts

**Solution:**

```bash
# Get all contacts first
GET /api/contacts
# Copy correct ID from response
# Use that ID in subsequent requests
```

---

### Error: `User don't have permission to update other user's contact`

**What it means:** You're trying to modify someone else's contact.

**What's happening:**

```javascript
// Contact belongs to User A (ID: 123)
contact.user_id = "123";

// But you're logged in as User B (ID: 456)
req.user.id = "456";

// 123 !== 456 → Permission denied!
```

**Solution:**
Only update/delete your own contacts. Use the token from YOUR login.

---

### Error: `Cast to ObjectId failed for value "abc" at path "_id"`

**What it means:** Invalid ID format.

**Wrong:**

```
GET /api/contacts/abc
GET /api/contacts/123
GET /api/contacts/undefined
```

**Correct:**

```
GET /api/contacts/65f789ghi012jkl345mno678
```

**Solution:**
Ensure you're using the actual `_id` returned from database, not a random string.

---

## 🔴 Request Stuck "Processing..."

**What it means:** Server received request but didn't send response.

**Common causes:**

### 1. Missing response

```javascript
// ❌ Wrong - no response sent
const getContacts = async (req, res) => {
  const contacts = await Contact.find();
  // Forgot res.json(contacts)!
};

// ✅ Correct
const getContacts = async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
};
```

### 2. Duplicate responses

```javascript
// ❌ Wrong - sending response twice
if (user) {
  res.status(201).json(user);
} else {
  res.status(400).json({ error: "Invalid" });
}
res.json({ message: "Done" }); // ← Second response causes hang!

// ✅ Correct - return after first response
if (user) {
  return res.status(201).json(user);
} else {
  return res.status(400).json({ error: "Invalid" });
}
// Code below never executes
```

### 3. Middleware not calling next()

```javascript
// ❌ Wrong
const myMiddleware = (req, res, next) => {
  console.log("Middleware ran");
  // Forgot next()!
};

// ✅ Correct
const myMiddleware = (req, res, next) => {
  console.log("Middleware ran");
  next(); // Pass control to next handler
};
```

### 4. Database operation failed

- Check if database is connected
- Look at terminal for error messages
- Verify MongoDB Atlas is running

---

## 🔴 Database Issues

### Error: `E11000 duplicate key error collection`

**What it means:** Trying to insert duplicate value for unique field.

**Example:**

```javascript
// User with email "john@example.com" already exists
// Trying to register again with same email
// Email field is unique in schema → Error!
```

**Solution:**

1. For registration: Use different email
2. For development: Delete the existing document
3. For production: Handle error gracefully

```javascript
const userAvailable = await User.findOne({ email });
if (userAvailable) {
  res.status(400);
  throw new Error("User already exists");
}
```

---

### Error: `buffering timed out after 10000ms`

**What it means:** Mongoose couldn't connect to MongoDB.

**Solutions:**

1. Check `CONNECTION_STRING` in `.env`
2. Ensure MongoDB Atlas cluster is running
3. Check network/firewall settings
4. Verify IP whitelist in MongoDB Atlas

---

### Documents not updating

**Problem:** Update request succeeds but data doesn't change.

**Cause:** Not returning updated document.

```javascript
// ❌ Wrong - returns old document
const updated = await Contact.findByIdAndUpdate(id, data);

// ✅ Correct - returns new document
const updated = await Contact.findByIdAndUpdate(
  id,
  data,
  { new: true }, // ← Important!
);
```

---

## 🔴 Password Issues

### Error: `Email or password is incorrect` (but you're sure it's correct)

**Common causes:**

1. **Field name mismatch**

   ```javascript
   // Model has "username" but you're sending "name"
   // Model expects:
   {
     username: String;
   }

   // You're sending:
   {
     name: "John";
   } // ❌ Wrong field name
   ```

2. **Password not hashed during registration**

   ```javascript
   // ❌ Wrong
   await User.create({
     username,
     email,
     password, // Plain text password!
   });

   // ✅ Correct
   const hashedPassword = await bcrypt.hash(password, 10);
   await User.create({
     username,
     email,
     password: hashedPassword,
   });
   ```

3. **Comparing wrong way**

   ```javascript
   // ❌ Wrong
   if (password === user.password) {
     // Won't work - comparing plain vs hashed
   }

   // ✅ Correct
   if (await bcrypt.compare(password, user.password)) {
     // Properly compares plain with hashed
   }
   ```

---

## 🔴 Environment Variable Issues

### Error: `process.env.PORT is undefined`

**What it means:** Environment variables not loaded.

**Solutions:**

1. **Check `.env` file exists in root directory**

   ```
   mycontacts-backend/
   ├── .env          ← Must be here
   ├── server.js
   ├── package.json
   ```

2. **Check dotenv is loaded in server.js**

   ```javascript
   require("dotenv").config(); // Must be at top!
   ```

3. **Restart server after changing .env**
   - Stop server (Ctrl+C)
   - Start again (`npm run dev`)

4. **Check file is named correctly**
   - Must be `.env` not `env.txt` or `.env.txt`
   - No spaces in filename

---

### Variables are undefined even with .env file

**Check:**

1. No quotes needed in .env

   ```env
   # ❌ Wrong
   PORT="5001"
   ACCESS_TOKEN_SECRET="mysecret"

   # ✅ Correct
   PORT=5001
   ACCESS_TOKEN_SECRET=mysecret
   ```

2. No spaces around `=`

   ```env
   # ❌ Wrong
   PORT = 5001

   # ✅ Correct
   PORT=5001
   ```

3. No comments on same line

   ```env
   # ❌ Wrong
   PORT=5001 # This is the port

   # ✅ Correct
   # This is the port
   PORT=5001
   ```

---

## 🔴 JSON/Body Parser Issues

### Error: `req.body is undefined`

**What it means:** Body parser middleware not configured.

**Solution:**
Ensure `server.js` has:

```javascript
app.use(express.json()); // Must be BEFORE routes!

// Routes come after
app.use("/api/contacts", contactRoutes);
```

---

### Error: `Unexpected token in JSON at position 0`

**What it means:** Malformed JSON in request body.

**Common mistakes:**

```json
// ❌ Wrong - trailing comma
{
  "name": "John",
  "email": "john@example.com",
}

// ❌ Wrong - single quotes
{
  'name': 'John'
}

// ❌ Wrong - unquoted keys
{
  name: "John"
}

// ✅ Correct
{
  "name": "John",
  "email": "john@example.com"
}
```

**Tools to validate JSON:**

- jsonlint.com
- VS Code (shows errors)
- Thunder Client (validates automatically)

---

## 🔴 Module/Import Errors

### Error: `Cannot find module './models/userModel'`

**Causes:**

1. **File doesn't exist**
   - Create the file
   - Check spelling matches exactly

2. **Wrong path**

   ```javascript
   // From: controllers/userController.js

   // ❌ Wrong
   require("./models/userModel"); // models is not in controllers/
   require("../model/userModel"); // typo: model vs models

   // ✅ Correct
   require("../models/userModel"); // up one level, then into models
   ```

3. **Wrong file extension**

   ```javascript
   // ❌ Don't include .js
   require("../models/userModel.js");

   // ✅ Omit extension
   require("../models/userModel");
   ```

---

### Error: `<function> is not a function`

**Example:** `registerUser is not a function`

**Cause:** Export/import mismatch.

```javascript
// ❌ Wrong
// userController.js
module.exports = registerUser;

// userRoutes.js
const { registerUser } = require("../controllers/userController");
// Using {} when it's default export!

// ✅ Correct Option 1
// Export as object
module.exports = { registerUser, loginUser };
// Import with {}
const { registerUser } = require("../controllers/userController");

// ✅ Correct Option 2
// Export as default
module.exports = registerUser;
// Import without {}
const registerUser = require("../controllers/userController");
```

---

## 🔴 Nodemon Issues

### Error: `nodemon: command not found`

**Solution:**

```bash
# Install nodemon globally
npm install -g nodemon

# OR use npx
npx nodemon server.js

# OR add to package.json scripts (already done)
npm run dev
```

---

### Nodemon not restarting on file changes

**Solutions:**

1. **Check nodemon is actually running**

   ```bash
   # Should say "[nodemon] starting `node server.js`"
   npm run dev
   ```

2. **Restart nodemon**
   - Type `rs` and press Enter
   - Or Ctrl+C and run `npm run dev` again

3. **Check file is in watch directory**
   - By default watches all files in project
   - `.env` changes require manual restart

---

## 🔴 Thunder Client / Postman Issues

### Request shows "Could not send request"

**Solutions:**

1. **Check server is running**

   ```bash
   # Should see "Server running on port 5001"
   npm run dev
   ```

2. **Check URL is correct**

   ```
   http://localhost:5001/api/users/register
   # NOT https (no 's')
   # NOT 127.0.0.1 (use localhost)
   # Check port number matches .env
   ```

3. **Check request method**
   - GET for fetching
   - POST for creating
   - PUT for updating
   - DELETE for deleting

---

### Response shows HTML instead of JSON

**What it means:** Request hit wrong endpoint or error page.

**Check:**

1. URL is exactly correct
2. Method (GET/POST/PUT/DELETE) matches route definition
3. Server is running without errors

---

## 🔴 Git/Version Control Issues

### `.env` file committed to Git

**Problem:** Sensitive data exposed!

**Solution:**

1. **Remove from Git**

   ```bash
   git rm --cached .env
   ```

2. **Add to .gitignore**

   ```
   # .gitignore
   .env
   node_modules/
   ```

3. **Commit changes**

   ```bash
   git add .gitignore
   git commit -m "Remove .env from tracking"
   git push
   ```

4. **Change secrets immediately**
   - New MongoDB password
   - New ACCESS_TOKEN_SECRET
   - Update .env locally

---

## 🔴 Mongoose/Schema Issues

### Error: `Schema hasn't been registered for model "User"`

**Cause:** Model imported before connection established.

**Solution:**

```javascript
// server.js
connectDB(); // Connect FIRST

// THEN import routes (which import controllers, which import models)
app.use("/api/users", require("./routes/userRoutes"));
```

---

### Timestamps not working

**Check schema definition:**

```javascript
// ❌ Wrong
const userSchema = mongoose.Schema({
  name: String,
});

// ✅ Correct
const userSchema = mongoose.Schema(
  {
    name: String,
  },
  { timestamps: true },
); // ← Add this option
```

---

## 🛠 Debugging Tips

### 1. Use console.log strategically

```javascript
console.log("1. Starting function");
console.log("2. Request body:", req.body);
console.log("3. User found:", user);
console.log("4. About to send response");
```

### 2. Check terminal output

- Server logs show errors
- Database connection status
- Request logs

### 3. Use try-catch for debugging

```javascript
try {
  const user = await User.findOne({ email });
  console.log("User:", user);
} catch (error) {
  console.error("Database error:", error);
}
```

### 4. Test routes individually

1. Start with user registration
2. Then login
3. Then one contact operation at a time
4. Don't test everything at once!

### 5. Check MongoDB Atlas directly

- Go to Collections tab
- Verify data is actually stored
- Check field names match your code

---

## 📋 Pre-flight Checklist

Before testing API:

- [ ] MongoDB Atlas cluster is running
- [ ] IP is whitelisted in Network Access
- [ ] `.env` file exists with all variables
- [ ] Dependencies installed (`npm install`)
- [ ] Server started (`npm run dev`)
- [ ] Server shows "Database connected successfully"
- [ ] Thunder Client/Postman ready
- [ ] `Content-Type: application/json` header set
- [ ] Request body is valid JSON

---

## 🆘 Still Stuck?

### Systematic debugging approach:

1. **Read the error message carefully**
   - What file is mentioned?
   - What line number?
   - What's the exact error?

2. **Check the terminal**
   - Look for stack trace
   - Look for file/line numbers
   - Check if server crashed

3. **Verify basics**
   - Server running?
   - Database connected?
   - Correct URL?
   - Correct method (GET/POST/PUT/DELETE)?

4. **Isolate the problem**
   - Test one thing at a time
   - Use console.log to see values
   - Comment out code to find issue

5. **Check documentation**
   - README.md for setup
   - CODE_FLOW_GUIDE.md for logic
   - API_TESTING_GUIDE.md for endpoints

6. **Common fixes that work 80% of the time**
   - Restart server
   - Reinstall dependencies (`rm -rf node_modules && npm install`)
   - Check .env file
   - Verify MongoDB connection
   - Login again to get fresh token

---

## 📞 Error Reference Quick Lookup

| Error Code | Meaning      | Common Cause                             |
| ---------- | ------------ | ---------------------------------------- |
| 400        | Bad Request  | Missing/invalid data in request body     |
| 401        | Unauthorized | Missing/invalid/expired token            |
| 403        | Forbidden    | Trying to access someone else's resource |
| 404        | Not Found    | Resource doesn't exist or wrong URL      |
| 500        | Server Error | Bug in code or database issue            |

---

**Remember: Every developer faces these errors. Debugging is a skill that improves with practice! 💪**
