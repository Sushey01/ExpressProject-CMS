# API Testing Guide - Thunder Client / Postman

Complete guide for testing all API endpoints with examples.

---

## 🔧 Setup

1. **Install Thunder Client** (VS Code Extension) or **Postman**
2. **Start your server**: `npm run dev`
3. **Base URL**: `http://localhost:5001`

---

## 📌 Test Sequence

Follow this order to test properly:

1. Register a user
2. Login to get token
3. Use token for all contact operations

---

## 1️⃣ User Registration

### Register First User

**Endpoint:** `POST /api/users/register`

**URL:** `http://localhost:5001/api/users/register`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201 Created):**

```json
{
  "_id": "65f123abc456def789012345",
  "email": "john@example.com"
}
```

### Register Second User (for testing isolation)

**Body (JSON):**

```json
{
  "username": "Jane Smith",
  "email": "jane@example.com",
  "password": "password456"
}
```

**Expected Response (201 Created):**

```json
{
  "_id": "65f123abc456def789012346",
  "email": "jane@example.com"
}
```

### Test: Register with Missing Fields

**Body (JSON):**

```json
{
  "username": "Test User",
  "email": "test@example.com"
}
```

**Expected Response (400 Bad Request):**

```json
{
  "title": "Validation Failed",
  "message": "All fields are mandatory",
  "stackTrace": "..."
}
```

### Test: Register Duplicate Email

**Body (JSON):**

```json
{
  "username": "Another User",
  "email": "john@example.com",
  "password": "password789"
}
```

**Expected Response (400 Bad Request):**

```json
{
  "title": "Validation Failed",
  "message": "User already exists",
  "stackTrace": "..."
}
```

---

## 2️⃣ User Login

### Login with Valid Credentials

**Endpoint:** `POST /api/users/login`

**URL:** `http://localhost:5001/api/users/login`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200 OK):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJpZCI6IjY1ZjEyM2FiYzQ1NmRlZjc4OTAxMjM0NSJ9LCJpYXQiOjE3MDg0MjM1MDAsImV4cCI6MTcwODQyNDQwMH0.abc123def456ghi789"
}
```

**⚠️ IMPORTANT:** Copy this token! You'll need it for all contact operations.

### Test: Login with Wrong Password

**Body (JSON):**

```json
{
  "email": "john@example.com",
  "password": "wrongpassword"
}
```

**Expected Response (401 Unauthorized):**

```json
{
  "title": "Unauthorized",
  "message": "Email or password is incorrect or invalid",
  "stackTrace": "..."
}
```

### Test: Login with Non-existent Email

**Body (JSON):**

```json
{
  "email": "notexist@example.com",
  "password": "password123"
}
```

**Expected Response (401 Unauthorized):**

```json
{
  "title": "Unauthorized",
  "message": "Email or password is incorrect or invalid",
  "stackTrace": "..."
}
```

---

## 3️⃣ Get Current User Info

**Endpoint:** `GET /api/users/current`

**URL:** `http://localhost:5001/api/users/current`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200 OK):**

```json
{
  "message": "current user information"
}
```

---

## 4️⃣ Create Contact

### Create First Contact

**Endpoint:** `POST /api/contacts`

**URL:** `http://localhost:5001/api/contacts`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "1234567890"
}
```

**Expected Response (201 Created):**

```json
{
  "user_id": "65f123abc456def789012345",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "1234567890",
  "_id": "65f789ghi012jkl345mno678",
  "createdAt": "2026-02-17T10:30:00.000Z",
  "updatedAt": "2026-02-17T10:30:00.000Z",
  "__v": 0
}
```

### Create More Contacts

**Contact 2:**

```json
{
  "name": "Bob Williams",
  "email": "bob@example.com",
  "phone": "9876543210"
}
```

**Contact 3:**

```json
{
  "name": "Carol Davis",
  "email": "carol@example.com",
  "phone": "5555555555"
}
```

### Test: Create Contact Without Token

**Remove the Authorization header**

**Expected Response (401 Unauthorized):**

```json
{
  "title": "Unauthorized",
  "message": "User is not authorized, no token",
  "stackTrace": "..."
}
```

### Test: Create Contact with Missing Fields

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "name": "Incomplete Contact",
  "email": "incomplete@example.com"
}
```

**Expected Response (400 Bad Request):**

```json
{
  "title": "Validation Failed",
  "message": "All fields are mandatory",
  "stackTrace": "..."
}
```

---

## 5️⃣ Get All Contacts

**Endpoint:** `GET /api/contacts`

**URL:** `http://localhost:5001/api/contacts`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No Body Required**

**Expected Response (200 OK):**

```json
[
  {
    "_id": "65f789ghi012jkl345mno678",
    "user_id": "65f123abc456def789012345",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "phone": "1234567890",
    "createdAt": "2026-02-17T10:30:00.000Z",
    "updatedAt": "2026-02-17T10:30:00.000Z",
    "__v": 0
  },
  {
    "_id": "65f789ghi012jkl345mno679",
    "user_id": "65f123abc456def789012345",
    "name": "Bob Williams",
    "email": "bob@example.com",
    "phone": "9876543210",
    "createdAt": "2026-02-17T10:35:00.000Z",
    "updatedAt": "2026-02-17T10:35:00.000Z",
    "__v": 0
  }
]
```

**Note:** You'll only see contacts created by your logged-in user.

---

## 6️⃣ Get Single Contact

**Endpoint:** `GET /api/contacts/:id`

**URL:** `http://localhost:5001/api/contacts/65f789ghi012jkl345mno678`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No Body Required**

**Expected Response (200 OK):**

```json
{
  "_id": "65f789ghi012jkl345mno678",
  "user_id": "65f123abc456def789012345",
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "phone": "1234567890",
  "createdAt": "2026-02-17T10:30:00.000Z",
  "updatedAt": "2026-02-17T10:30:00.000Z",
  "__v": 0
}
```

### Test: Get Non-existent Contact

**URL:** `http://localhost:5001/api/contacts/000000000000000000000000`

**Expected Response (404 Not Found):**

```json
{
  "title": "Not Found",
  "message": "Contact not found",
  "stackTrace": "..."
}
```

---

## 7️⃣ Update Contact

**Endpoint:** `PUT /api/contacts/:id`

**URL:** `http://localhost:5001/api/contacts/65f789ghi012jkl345mno678`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON) - Update All Fields:**

```json
{
  "name": "Alice Johnson Updated",
  "email": "alice.updated@example.com",
  "phone": "1111111111"
}
```

**Expected Response (200 OK):**

```json
{
  "_id": "65f789ghi012jkl345mno678",
  "user_id": "65f123abc456def789012345",
  "name": "Alice Johnson Updated",
  "email": "alice.updated@example.com",
  "phone": "1111111111",
  "createdAt": "2026-02-17T10:30:00.000Z",
  "updatedAt": "2026-02-17T11:00:00.000Z",
  "__v": 0
}
```

### Update Partial Fields

**Body (JSON) - Update Only Name:**

```json
{
  "name": "Alice J."
}
```

**Expected Response (200 OK):**

```json
{
  "_id": "65f789ghi012jkl345mno678",
  "user_id": "65f123abc456def789012345",
  "name": "Alice J.",
  "email": "alice.updated@example.com",
  "phone": "1111111111",
  "createdAt": "2026-02-17T10:30:00.000Z",
  "updatedAt": "2026-02-17T11:05:00.000Z",
  "__v": 0
}
```

### Test: Update Another User's Contact

1. Login as second user (jane@example.com)
2. Get Jane's token
3. Try to update John's contact using Jane's token

**Expected Response (403 Forbidden):**

```json
{
  "title": "Forbidden",
  "message": "User don't have permission to update other user's contact",
  "stackTrace": "..."
}
```

---

## 8️⃣ Delete Contact

**Endpoint:** `DELETE /api/contacts/:id`

**URL:** `http://localhost:5001/api/contacts/65f789ghi012jkl345mno678`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**No Body Required**

**Expected Response (200 OK):**

```json
{
  "_id": "65f789ghi012jkl345mno678",
  "user_id": "65f123abc456def789012345",
  "name": "Alice J.",
  "email": "alice.updated@example.com",
  "phone": "1111111111",
  "createdAt": "2026-02-17T10:30:00.000Z",
  "updatedAt": "2026-02-17T11:05:00.000Z",
  "__v": 0
}
```

### Test: Delete Another User's Contact

**Expected Response (403 Forbidden):**

```json
{
  "title": "Forbidden",
  "message": "User don't have permission to delete other user's contact",
  "stackTrace": "..."
}
```

### Test: Delete Already Deleted Contact

**Expected Response (404 Not Found):**

```json
{
  "title": "Not Found",
  "message": "Contact not found",
  "stackTrace": "..."
}
```

---

## 🧪 Complete Test Checklist

### User Tests

- [ ] ✅ Register new user successfully
- [ ] ✅ Register with missing fields (should fail)
- [ ] ✅ Register with duplicate email (should fail)
- [ ] ✅ Login with valid credentials
- [ ] ✅ Login with wrong password (should fail)
- [ ] ✅ Login with non-existent email (should fail)
- [ ] ✅ Get current user info with valid token

### Contact Tests

- [ ] ✅ Create contact with valid data
- [ ] ✅ Create contact without token (should fail)
- [ ] ✅ Create contact with missing fields (should fail)
- [ ] ✅ Get all contacts (should only show user's contacts)
- [ ] ✅ Get single contact by ID
- [ ] ✅ Get non-existent contact (should fail)
- [ ] ✅ Update own contact
- [ ] ✅ Update another user's contact (should fail)
- [ ] ✅ Delete own contact
- [ ] ✅ Delete another user's contact (should fail)
- [ ] ✅ Delete already deleted contact (should fail)

---

## 🔍 Thunder Client Collection (JSON)

Save this as a Thunder Client collection:

```json
{
  "clientName": "Thunder Client",
  "collectionName": "MyContacts API",
  "collectionId": "mycontacts-api",
  "dateExported": "2026-02-17",
  "requests": [
    {
      "name": "Register User",
      "method": "POST",
      "url": "http://localhost:5001/api/users/register",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"username\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
      }
    },
    {
      "name": "Login User",
      "method": "POST",
      "url": "http://localhost:5001/api/users/login",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
      }
    },
    {
      "name": "Get All Contacts",
      "method": "GET",
      "url": "http://localhost:5001/api/contacts",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_TOKEN_HERE"
        }
      ]
    },
    {
      "name": "Create Contact",
      "method": "POST",
      "url": "http://localhost:5001/api/contacts",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer YOUR_TOKEN_HERE"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"name\": \"Alice Johnson\",\n  \"email\": \"alice@example.com\",\n  \"phone\": \"1234567890\"\n}"
      }
    },
    {
      "name": "Get Contact by ID",
      "method": "GET",
      "url": "http://localhost:5001/api/contacts/CONTACT_ID_HERE",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_TOKEN_HERE"
        }
      ]
    },
    {
      "name": "Update Contact",
      "method": "PUT",
      "url": "http://localhost:5001/api/contacts/CONTACT_ID_HERE",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer YOUR_TOKEN_HERE"
        }
      ],
      "body": {
        "type": "json",
        "raw": "{\n  \"name\": \"Alice Updated\",\n  \"email\": \"alice.updated@example.com\",\n  \"phone\": \"9999999999\"\n}"
      }
    },
    {
      "name": "Delete Contact",
      "method": "DELETE",
      "url": "http://localhost:5001/api/contacts/CONTACT_ID_HERE",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer YOUR_TOKEN_HERE"
        }
      ]
    }
  ]
}
```

---

## 💡 Pro Tips

### Setting Environment Variables in Thunder Client

1. Click on "Env" tab
2. Create new environment: "Local Dev"
3. Add variables:
   ```
   baseUrl: http://localhost:5001
   token: (paste your token here after login)
   contactId: (paste a contact ID here)
   ```
4. Use in requests:
   - URL: `{{baseUrl}}/api/contacts`
   - Header: `Bearer {{token}}`

### Common Mistakes to Avoid

1. **Forgetting Bearer prefix**
   - ❌ `Authorization: your_token`
   - ✅ `Authorization: Bearer your_token`

2. **Token expired**
   - Tokens expire in 15 minutes
   - Login again to get new token

3. **Wrong Content-Type**
   - Always use `Content-Type: application/json` for POST/PUT

4. **Not URL encoding**
   - If ID has special characters, URL encode it

5. **Testing with wrong user**
   - Remember: users can only access their own contacts

---

## 🎯 Quick Test Workflow

1. **Register** → Copy user ID
2. **Login** → Copy token
3. **Create 3 contacts** → Copy their IDs
4. **Get all contacts** → Verify 3 contacts returned
5. **Get contact by ID** → Verify single contact
6. **Update contact** → Verify changes
7. **Delete contact** → Verify deletion
8. **Get all contacts again** → Verify only 2 remain

---

**Happy Testing! 🚀**
