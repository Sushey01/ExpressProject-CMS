# Code Flow & Logic - Step by Step

Visual guide to understand how requests flow through the application.

---

## 🔄 Complete Request Flow

```
Client (Thunder Client)
    ↓
    | HTTP Request (POST /api/users/login)
    ↓
Server.js (Port 5001)
    ↓
    | app.use(express.json()) → Parse JSON body
    ↓
Route Matcher
    ↓
    | app.use("/api/users", userRoutes)
    ↓
routes/userRoutes.js
    ↓
    | router.post("/login", loginUser)
    ↓
controllers/userController.js
    ↓
    | loginUser function executes
    | 1. Extract email & password from req.body
    | 2. Find user in database
    | 3. Compare passwords
    | 4. Create JWT token
    | 5. Send token in response
    ↓
Response sent back to client
```

---

## 📊 Detailed Flow Diagrams

### 1. User Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: POST /api/users/register                            │
│ Body: { username, email, password }                         │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ SERVER.JS                                                   │
│ • Receives request on port 5001                            │
│ • express.json() parses body                               │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ ROUTE MATCHING: /api/users                                 │
│ • Matches app.use("/api/users", userRoutes)                │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ routes/userRoutes.js                                       │
│ • router.post("/register", registerUser)                   │
│ • No middleware (public route)                             │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ controllers/userController.js → registerUser()             │
│                                                             │
│ STEP 1: Extract data                                       │
│   const { username, email, password } = req.body           │
│                                                             │
│ STEP 2: Validate                                           │
│   if (!username || !email || !password)                    │
│     throw error "All fields are mandatory"                 │
│                                                             │
│ STEP 3: Check if user exists                               │
│   const userAvailable = await User.findOne({ email })      │
│   if (userAvailable)                                       │
│     throw error "User already exists"                      │
│                                                             │
│ STEP 4: Hash password                                      │
│   const hashedPassword = await bcrypt.hash(password, 10)   │
│   // Converts "password123" → "$2b$10$abc...xyz"          │
│                                                             │
│ STEP 5: Create user in database                            │
│   const user = await User.create({                         │
│     username,                                              │
│     email,                                                 │
│     password: hashedPassword                               │
│   })                                                       │
│                                                             │
│ STEP 6: Send response                                      │
│   res.status(201).json({ _id: user.id, email: user.email })│
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                         │
│ Status: 201 Created                                        │
│ Body: { "_id": "...", "email": "..." }                    │
└────────────────────────────────────────────────────────────┘
```

**If Error Occurs:**

```
Error thrown
    ↓
middleware/errorHandler.js
    ↓
Switch based on status code
    ↓
Send formatted error response
```

---

### 2. User Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: POST /api/users/login                               │
│ Body: { email, password }                                   │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ controllers/userController.js → loginUser()                │
│                                                             │
│ STEP 1: Extract credentials                                │
│   const { email, password } = req.body                     │
│                                                             │
│ STEP 2: Validate input                                     │
│   if (!email || !password)                                 │
│     throw error "All fields are mandatory"                 │
│                                                             │
│ STEP 3: Find user by email                                 │
│   const user = await User.findOne({ email })               │
│   // Returns user object or null                           │
│                                                             │
│ STEP 4: Verify password                                    │
│   if (user && await bcrypt.compare(password, user.password))│
│     // bcrypt.compare("password123", "$2b$10$abc...")      │
│     // Returns true if match, false if not                 │
│                                                             │
│ STEP 5: Create JWT token                                   │
│   const accessToken = jwt.sign(                            │
│     {                                                       │
│       user: {                                              │
│         username: user.username,                           │
│         email: user.email,                                 │
│         id: user.id                                        │
│       }                                                     │
│     },                                                      │
│     process.env.ACCESS_TOKEN_SECRET,                       │
│     { expiresIn: "15min" }                                 │
│   )                                                         │
│                                                             │
│ STEP 6: Send token to client                               │
│   res.status(200).json({ accessToken })                    │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ CLIENT RECEIVES TOKEN                                      │
│ { "accessToken": "eyJhbGciOi..." }                        │
│                                                             │
│ CLIENT STORES TOKEN                                        │
│ • In memory / localStorage / cookie                        │
│ • Will send with each subsequent request                   │
└────────────────────────────────────────────────────────────┘
```

---

### 3. Create Contact Flow (Protected Route)

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: POST /api/contacts                                  │
│ Headers: Authorization: Bearer eyJhbGciOi...                │
│ Body: { name, email, phone }                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ routes/contactRoutes.js                                    │
│ • router.use(validateToken) ← RUNS FIRST!                  │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ middleware/validateTokenHandler.js                         │
│                                                             │
│ STEP 1: Extract Authorization header                       │
│   let authHeader = req.headers.authorization               │
│   // "Bearer eyJhbGciOi..."                                │
│                                                             │
│ STEP 2: Check if header exists and starts with "Bearer"    │
│   if (authHeader && authHeader.startsWith("Bearer"))       │
│                                                             │
│ STEP 3: Extract token                                      │
│   token = authHeader.split(" ")[1]                         │
│   // "eyJhbGciOi..."                                       │
│                                                             │
│ STEP 4: Verify token                                       │
│   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, ...)  │
│   // Checks if token is valid and not expired             │
│                                                             │
│ STEP 5: Add user info to request                           │
│   req.user = decoded.user                                  │
│   // Now req.user = { username, email, id }               │
│                                                             │
│ STEP 6: Pass to next handler                               │
│   next()                                                    │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ routes/contactRoutes.js                                    │
│ • router.post("/", createContact)                          │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ controllers/contactController.js → createContact()         │
│                                                             │
│ STEP 1: Extract data from body                             │
│   const { name, email, phone } = req.body                  │
│                                                             │
│ STEP 2: Validate                                           │
│   if (!name || !email || !phone)                           │
│     throw error "All fields are mandatory"                 │
│                                                             │
│ STEP 3: Create contact with user ID                        │
│   const contact = await Contact.create({                   │
│     name,                                                   │
│     email,                                                  │
│     phone,                                                  │
│     user_id: req.user.id  ← FROM TOKEN!                    │
│   })                                                        │
│                                                             │
│ STEP 4: Send response                                      │
│   res.status(201).json(contact)                            │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                         │
│ Status: 201 Created                                        │
│ Body: {                                                    │
│   "_id": "...",                                            │
│   "user_id": "...",                                        │
│   "name": "Alice",                                         │
│   "email": "alice@example.com",                            │
│   "phone": "1234567890",                                   │
│   "createdAt": "...",                                      │
│   "updatedAt": "..."                                       │
│ }                                                           │
└────────────────────────────────────────────────────────────┘
```

**Authentication Failure:**

```
No token or invalid token
    ↓
validateTokenHandler throws error
    ↓
errorHandler catches it
    ↓
401 Unauthorized response
    ↓
Controller never executes
```

---

### 4. Get All Contacts Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: GET /api/contacts                                   │
│ Headers: Authorization: Bearer eyJhbGciOi...                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ middleware/validateTokenHandler.js                         │
│ • Verifies token                                            │
│ • Adds req.user = { username, email, id }                  │
│ • Calls next()                                              │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ controllers/contactController.js → getContacts()           │
│                                                             │
│ STEP 1: Query database for user's contacts                 │
│   const contacts = await Contact.find({                    │
│     user_id: req.user.id  ← FILTER BY USER ID!            │
│   })                                                        │
│   // Only returns contacts belonging to this user          │
│                                                             │
│ STEP 2: Send response                                      │
│   res.status(200).json(contacts)                           │
│   // Array of contact objects                              │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                         │
│ Status: 200 OK                                             │
│ Body: [ {...contact1...}, {...contact2...} ]              │
└────────────────────────────────────────────────────────────┘
```

**Key Point:** Different users see different contacts because we filter by `user_id`!

---

### 5. Update Contact Flow (with Authorization Check)

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: PUT /api/contacts/:id                               │
│ Headers: Authorization: Bearer eyJhbGciOi...                │
│ Body: { name, email, phone }                                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ middleware/validateTokenHandler.js                         │
│ • Verifies token                                            │
│ • Sets req.user = { username, email, id }                  │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ controllers/contactController.js → updateContact()         │
│                                                             │
│ STEP 1: Find the contact by ID                             │
│   const contact = await Contact.findById(req.params.id)    │
│                                                             │
│ STEP 2: Check if contact exists                            │
│   if (!contact)                                            │
│     throw error "Contact not found" (404)                  │
│                                                             │
│ STEP 3: Check ownership (AUTHORIZATION)                    │
│   if (contact.user_id.toString() !== req.user.id)         │
│     throw error "No permission" (403)                      │
│   // Prevents users from editing others' contacts!         │
│                                                             │
│ STEP 4: Update contact                                     │
│   const updatedContact = await Contact.findByIdAndUpdate(  │
│     req.params.id,                                         │
│     req.body,                                              │
│     { new: true }  ← Returns updated document              │
│   )                                                         │
│                                                             │
│ STEP 5: Send response                                      │
│   res.status(200).json(updatedContact)                     │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                         │
│ Status: 200 OK                                             │
│ Body: { ...updated contact... }                            │
└────────────────────────────────────────────────────────────┘
```

**Authorization vs Authentication:**

- **Authentication:** Who are you? (validateToken middleware)
- **Authorization:** What can you do? (ownership check in controller)

---

### 6. Delete Contact Flow

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENT: DELETE /api/contacts/:id                            │
│ Headers: Authorization: Bearer eyJhbGciOi...                │
└────────────────────┬────────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ middleware/validateTokenHandler.js                         │
│ • Verifies token                                            │
│ • Sets req.user                                             │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ controllers/contactController.js → deleteContact()         │
│                                                             │
│ STEP 1: Find contact                                       │
│   const contact = await Contact.findById(req.params.id)    │
│                                                             │
│ STEP 2: Validate existence                                 │
│   if (!contact)                                            │
│     throw error "Contact not found" (404)                  │
│                                                             │
│ STEP 3: Check ownership                                    │
│   if (contact.user_id.toString() !== req.user.id)         │
│     throw error "No permission" (403)                      │
│                                                             │
│ STEP 4: Delete contact                                     │
│   await contact.deleteOne()                                │
│   // Deletes the specific contact instance                 │
│                                                             │
│ STEP 5: Send response                                      │
│   res.status(200).json(contact)                            │
│   // Returns the deleted contact for confirmation          │
└────────────────────┬───────────────────────────────────────┘
                     ↓
┌────────────────────────────────────────────────────────────┐
│ RESPONSE TO CLIENT                                         │
│ Status: 200 OK                                             │
│ Body: { ...deleted contact... }                            │
└────────────────────────────────────────────────────────────┘
```

**Two Ways to Delete:**

```javascript
// Method 1: Instance method (what we use)
const contact = await Contact.findById(id);
await contact.deleteOne(); // Deletes THIS contact

// Method 2: Model method
await Contact.deleteOne({ _id: id }); // Need to specify which one
```

---

## 🔐 Security Flow

### Password Hashing (Registration)

```
User enters: "password123"
    ↓
bcrypt.hash("password123", 10)
    ↓
Generates salt: random string
    ↓
Combines password + salt
    ↓
Runs hashing algorithm 10 times
    ↓
Produces hash: "$2b$10$abc...xyz"
    ↓
Stored in database
```

### Password Verification (Login)

```
User enters: "password123"
    ↓
Retrieved from DB: "$2b$10$abc...xyz"
    ↓
bcrypt.compare("password123", "$2b$10$abc...xyz")
    ↓
Extracts salt from hash
    ↓
Hashes input password with same salt
    ↓
Compares both hashes
    ↓
Returns true/false
```

**Why this is secure:**

- Same password produces different hashes (random salt)
- One-way function (can't reverse hash to get password)
- Computationally expensive (slows down brute force attacks)

---

### JWT Token Flow

**Creating Token (Login):**

```
User data
    ↓
jwt.sign(
  { user: { username, email, id } },  ← Payload
  "SECRET_KEY",                        ← Secret
  { expiresIn: "15min" }              ← Options
)
    ↓
Creates 3 parts:
  1. Header (algorithm info)
  2. Payload (user data) - Base64 encoded
  3. Signature (verifies integrity)
    ↓
Combines: "header.payload.signature"
    ↓
Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJu..."
    ↓
Sent to client
```

**Verifying Token (Each Request):**

```
Client sends: "Bearer eyJhbGciOi..."
    ↓
Extract token
    ↓
jwt.verify(token, "SECRET_KEY")
    ↓
Splits token into parts
    ↓
Checks signature with secret key
    ↓
Checks expiration time
    ↓
If valid: returns decoded payload
If invalid: throws error
```

**Token Structure:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9  ← Header (Base64)
.
eyJ1c2VyIjp7InVzZXJuYW1lIjoiSm9obiIsImVtYW...  ← Payload (Base64)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c  ← Signature
```

---

## 🔄 Error Handling Flow

```
Error occurs in controller
    ↓
throw new Error("Message")
    ↓
express-async-handler catches it
    ↓
Passes to next error handler
    ↓
middleware/errorHandler.js
    ↓
Checks res.statusCode
    ↓
Switch statement based on code
    ↓
Formats error response
    ↓
Sends JSON to client
```

**Example:**

```javascript
// In controller
if (!contact) {
  res.status(404);  ← Sets status code
  throw new Error("Contact not found");  ← Throws error
}
    ↓
// In errorHandler
case constants.NOT_FOUND:  // 404
  res.json({
    title: "Not Found",
    message: err.message,  ← "Contact not found"
    stackTrace: err.stack
  });
```

---

## 📦 Database Operations Flow

### Creating Document

```
Controller:
  await Contact.create({ name, email, phone, user_id })
    ↓
Mongoose:
  1. Validates data against schema
  2. Adds default values
  3. Runs validators
  4. Converts to MongoDB document
    ↓
MongoDB:
  1. Inserts document
  2. Generates _id
  3. Sets timestamps
    ↓
Returns created document to controller
```

### Finding Documents

```
Controller:
  await Contact.find({ user_id: "123" })
    ↓
Mongoose:
  1. Builds query
  2. Applies filters
    ↓
MongoDB:
  1. Searches collection
  2. Returns matching documents
    ↓
Mongoose:
  1. Converts to JavaScript objects
  2. Returns array to controller
```

### Updating Document

```
Controller:
  await Contact.findByIdAndUpdate(id, data, { new: true })
    ↓
Mongoose:
  1. Finds document by ID
  2. Validates new data
  3. Updates fields
  4. { new: true } returns updated doc
    ↓
MongoDB:
  1. Updates document
  2. Returns updated document
    ↓
Returns to controller
```

---

## 🎯 Key Takeaways

### Request-Response Cycle

1. **Client** sends request
2. **Server** receives on specified port
3. **Middleware** processes request (parse JSON, validate token)
4. **Router** matches URL to controller
5. **Controller** executes business logic
6. **Model** interacts with database
7. **Response** sent back to client
8. **Error Handler** catches any errors

### Middleware Chain

```
Request
  → express.json() (parse body)
  → validateToken (authenticate)
  → controller (business logic)
  → errorHandler (if error occurs)
  → Response
```

### Security Layers

1. **Password hashing** - Protects passwords
2. **JWT tokens** - Stateless authentication
3. **Token validation** - Authenticates user
4. **Ownership checks** - Authorizes actions
5. **Expiring tokens** - Limits exposure

### Data Flow

1. **Client** → JSON in request body
2. **Server** → Parse with express.json()
3. **Controller** → Extract with destructuring
4. **Model** → Validate with schema
5. **Database** → Store/retrieve data
6. **Response** → Send JSON back to client

---

**This flow repeats for every request! 🔄**
