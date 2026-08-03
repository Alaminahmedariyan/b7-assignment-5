# GearUp API Documentation

**Base URL**: `https://your-railway-app-url.com/api/v1` (or `http://localhost:5000/api/v1` for local development)

All API responses follow a standardized envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message.",
  "data": { ... }
}
```

Paginated responses include a `meta` object:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message.",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

---

## Authentication

Most endpoints require authentication via JWT. The server uses HTTP-only cookies (`accessToken`, `refreshToken`) for token storage.

Alternatively, you can pass the access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

### Cookie Details

| Cookie         | Type      | Max Age | Description                                  |
| :------------- | :-------- | :------ | :------------------------------------------- |
| `accessToken`  | HTTP-only | 1 day   | Short-lived JWT for API authorization        |
| `refreshToken` | HTTP-only | 7 days  | Long-lived token for refreshing access token |

---

## Error Responses

### Validation Error

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "statusCode": 401,
  "message": "You are not authorized."
}
```

### Authorization Error

```json
{
  "success": false,
  "statusCode": 403,
  "message": "You are not allowed to access this resource."
}
```

### Not Found Error

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Resource not found."
}
```

### Suspended Account Error

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Your account has been suspended."
}
```

---

## Endpoints

### Health Check

#### GET /

Returns a simple health check response.

**Response (200):**

```json
{
  "success": true,
  "message": "GearUp Rental API is running."
}
```

---

### Auth

#### POST /auth/login

Authenticate user with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):** Sets `accessToken` and `refreshToken` HTTP-only cookies.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### POST /auth/google

Authenticate user with Google ID token.

**Request Body:**

```json
{
  "idToken": "google-id-token-here"
}
```

**Response (200):** Sets `accessToken` and `refreshToken` HTTP-only cookies.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Google login successful.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### POST /auth/refresh-token

Refresh access token using refresh token cookie.

**Cookie Required:** `refreshToken`

**Response (200):** Sets new `accessToken` HTTP-only cookie.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Access token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

#### POST /auth/logout

Clear authentication cookies.

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful.",
  "data": null
}
```

---

#### POST /auth/forgot-password

Request a password reset email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset email sent successfully.",
  "data": null
}
```

---

#### POST /auth/reset-password

Reset password using the token received in email.

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully.",
  "data": null
}
```

---

### Users

#### POST /users/register

Register a new user account.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": "123 Main Street",
  "role": "CUSTOMER"
}
```

**Validation Rules:**
| Field | Type | Required | Constraints |
| :---- | :--- | :------- | :---------- |
| `name` | string | Yes | 2-100 characters |
| `email` | string | Yes | Valid email, lowercase |
| `password` | string | Yes | Min 6 characters |
| `phone` | string | No | — |
| `address` | string | No | — |
| `nidUrl` | string | No | Valid URL |
| `role` | enum | No | `CUSTOMER` or `PROVIDER` (default: `CUSTOMER`) |
| `image` | string | No | — |

**Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully.",
  "data": {
    "id": "cm0abcdefghijklmnop1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "provider": "LOCAL",
    "image": null,
    "createdAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### GET /users/me

Retrieve the currently authenticated user's profile.

**Authentication:** Required (`CUSTOMER`, `PROVIDER`, or `ADMIN`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile retrieved successfully.",
  "data": {
    "id": "cm0abcdefghijklmnop1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main Street",
    "image": "https://res.cloudinary.com/...",
    "role": "CUSTOMER",
    "status": "ACTIVE",
    "provider": "LOCAL",
    "createdAt": "2026-08-03T10:00:00.000Z",
    "updatedAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### PATCH /users/me

Update the currently authenticated user's profile.

**Authentication:** Required (`CUSTOMER`, `PROVIDER`, or `ADMIN`)

**Request:** `multipart/form-data`

| Field     | Type   | Required | Constraints              |
| :-------- | :----- | :------- | :----------------------- |
| `name`    | string | No       | 2-100 characters         |
| `phone`   | string | No       | —                        |
| `address` | string | No       | —                        |
| `nidUrl`  | string | No       | Valid URL                |
| `role`    | enum   | No       | `CUSTOMER` or `PROVIDER` |
| `image`   | file   | No       | Image file to upload     |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully.",
  "data": {
    "id": "cm0abcdefghijklmnop1",
    "name": "John Updated",
    "phone": "+1234567890",
    "address": "456 New Street",
    "image": "https://res.cloudinary.com/...",
    "role": "CUSTOMER",
    "updatedAt": "2026-08-03T11:00:00.000Z"
  }
}
```

---

#### PATCH /users/change-password

Change the authenticated user's password.

**Authentication:** Required (`CUSTOMER`, `PROVIDER`, or `ADMIN`)

**Request Body:**

```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully.",
  "data": null
}
```

---

#### GET /users

Retrieve all users. (Admin only)

**Authentication:** Required (`ADMIN`)

**Query Parameters:**
| Parameter | Type | Default | Description |
| :-------- | :--- | :------ | :---------- |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | — | Search by name or email |
| `role` | enum | — | Filter by role (`CUSTOMER`, `PROVIDER`, `ADMIN`) |
| `status` | enum | — | Filter by status (`ACTIVE`, `SUSPENDED`) |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully.",
  "data": [
    {
      "id": "cm0...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "CUSTOMER",
      "status": "ACTIVE",
      "createdAt": "2026-08-03T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

#### PATCH /users/:id/status

Update a user's status (activate/suspend). (Admin only)

**Authentication:** Required (`ADMIN`)

**Request Body:**

```json
{
  "status": "SUSPENDED"
}
```

**Valid Status Values:** `ACTIVE`, `SUSPENDED`, `VERIFICATION_PENDING`

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated successfully.",
  "data": {
    "id": "cm0...",
    "name": "John Doe",
    "status": "SUSPENDED"
  }
}
```

---

### Categories

#### POST /categories

Create a new category. (Admin only)

**Authentication:** Required (`ADMIN`)

**Request Body:**

```json
{
  "name": "Camping Gear",
  "description": "All camping-related equipment",
  "parentId": null
}
```

**Validation Rules:**
| Field | Type | Required | Constraints |
| :---- | :--- | :------- | :---------- |
| `name` | string | Yes | 2-100 characters, unique |
| `description` | string | No | Max 500 characters |
| `parentId` | string | No | Valid category ID for subcategory |

**Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Category created successfully.",
  "data": {
    "id": "cm0abcdefghijklmnop2",
    "name": "Camping Gear",
    "slug": "camping-gear",
    "description": "All camping-related equipment",
    "parentId": null,
    "createdAt": "2026-08-03T10:00:00.000Z",
    "updatedAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### GET /categories

Retrieve all categories.

**Authentication:** None (Public)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Categories retrieved successfully.",
  "data": [
    {
      "id": "cm0...",
      "name": "Camping Gear",
      "slug": "camping-gear",
      "description": "All camping-related equipment",
      "parentId": null,
      "children": [],
      "createdAt": "2026-08-03T10:00:00.000Z",
      "updatedAt": "2026-08-03T10:00:00.000Z"
    }
  ]
}
```

---

#### GET /categories/:id

Retrieve a single category by ID.

**Authentication:** None (Public)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category retrieved successfully.",
  "data": {
    "id": "cm0...",
    "name": "Camping Gear",
    "slug": "camping-gear",
    "description": "All camping-related equipment",
    "parentId": null,
    "children": [],
    "createdAt": "2026-08-03T10:00:00.000Z",
    "updatedAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### PATCH /categories/:id

Update a category. (Admin only)

**Authentication:** Required (`ADMIN`)

**Request Body:**

```json
{
  "name": "Camping & Hiking Gear",
  "description": "Updated description"
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category updated successfully.",
  "data": {
    "id": "cm0...",
    "name": "Camping & Hiking Gear",
    "slug": "camping-hiking-gear",
    "description": "Updated description",
    "updatedAt": "2026-08-03T11:00:00.000Z"
  }
}
```

---

#### DELETE /categories/:id

Delete a category. (Admin only)

**Authentication:** Required (`ADMIN`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Category deleted successfully.",
  "data": null
}
```

---

### Gears

#### GET /gears

Retrieve all listed gear items with search, filter, and pagination.

**Authentication:** None (Public)

**Query Parameters:**
| Parameter | Type | Default | Description |
| :-------- | :--- | :------ | :---------- |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `search` | string | — | Search by name, description, or brand |
| `category` | string | — | Filter by category ID |
| `brand` | string | — | Filter by brand |
| `minPrice` | number | — | Minimum price per day |
| `maxPrice` | number | — | Maximum price per day |
| `sortBy` | string | `createdAt` | Sort field (`pricePerDay`, `createdAt`, `name`) |
| `sortOrder` | enum | `desc` | Sort order (`asc` or `desc`) |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gears retrieved successfully.",
  "data": [
    {
      "id": "cm0abcdefghijklmnop3",
      "name": "Premium Camping Tent",
      "slug": "premium-camping-tent",
      "description": "A spacious 4-person tent...",
      "brand": "OutdoorPro",
      "pricePerDay": 25,
      "originalPricePerDay": 35,
      "totalQuantity": 5,
      "specifications": { "capacity": "4 person", "weight": "5kg" },
      "isListed": true,
      "provider": {
        "id": "prov1",
        "name": "Provider Name"
      },
      "category": {
        "id": "cat1",
        "name": "Camping Gear"
      },
      "images": [
        {
          "id": "img1",
          "imageUrl": "https://res.cloudinary.com/...",
          "isPrimary": true
        }
      ],
      "createdAt": "2026-08-03T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1
  }
}
```

---

#### GET /gears/:id

Retrieve a single gear item by ID.

**Authentication:** None (Public)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gear retrieved successfully.",
  "data": {
    "id": "cm0abcdefghijklmnop3",
    "name": "Premium Camping Tent",
    "slug": "premium-camping-tent",
    "description": "A spacious 4-person tent...",
    "brand": "OutdoorPro",
    "pricePerDay": 25,
    "originalPricePerDay": 35,
    "totalQuantity": 5,
    "specifications": { "capacity": "4 person", "weight": "5kg" },
    "isListed": true,
    "provider": {
      "id": "prov1",
      "name": "Provider Name",
      "email": "provider@example.com",
      "phone": "+1234567890"
    },
    "category": {
      "id": "cat1",
      "name": "Camping Gear",
      "slug": "camping-gear"
    },
    "images": [
      {
        "id": "img1",
        "imageUrl": "https://res.cloudinary.com/...",
        "isPrimary": true
      }
    ],
    "createdAt": "2026-08-03T10:00:00.000Z",
    "updatedAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### GET /gears/:id/availability

Check real-time availability for specific dates.

**Authentication:** None (Public)

**Query Parameters:**
| Parameter | Type | Required | Description |
| :-------- | :--- | :------- | :---------- |
| `startDate` | string | Yes | Start date (YYYY-MM-DD) |
| `endDate` | string | Yes | End date (YYYY-MM-DD) |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Availability checked successfully.",
  "data": {
    "gearId": "cm0abcdefghijklmnop3",
    "name": "Premium Camping Tent",
    "totalQuantity": 5,
    "bookedQuantity": 2,
    "availableQuantity": 3,
    "startDate": "2026-08-10",
    "endDate": "2026-08-15",
    "isAvailable": true
  }
}
```

---

#### POST /gears

Create a new gear listing. (Provider only)

**Authentication:** Required (`PROVIDER`)

**Request:** `multipart/form-data`

| Field                 | Type          | Required | Constraints          |
| :-------------------- | :------------ | :------- | :------------------- |
| `name`                | string        | Yes      | 2-150 characters     |
| `description`         | string        | Yes      | Min 10 characters    |
| `brand`               | string        | No       | —                    |
| `pricePerDay`         | number        | Yes      | Must be positive     |
| `originalPricePerDay` | number        | No       | Must be positive     |
| `totalQuantity`       | number        | Yes      | Min 1                |
| `categoryId`          | string        | Yes      | Valid category ID    |
| `specifications`      | string (JSON) | No       | JSON string          |
| `images`              | files         | No       | Up to 10 image files |

**Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Gear created successfully.",
  "data": {
    "id": "cm0abcdefghijklmnop3",
    "name": "Premium Camping Tent",
    "slug": "premium-camping-tent",
    "pricePerDay": 25,
    "totalQuantity": 5,
    "isListed": true,
    "images": [{ "id": "img1", "imageUrl": "https://res.cloudinary.com/...", "isPrimary": true }],
    "createdAt": "2026-08-03T10:00:00.000Z",
    "updatedAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### GET /gears/my-gears

Retrieve the authenticated provider's own gear listings.

**Authentication:** Required (`PROVIDER`)

**Query Parameters:** Same as `GET /gears`.

**Response (200):** Same format as `GET /gears` but filtered to the provider's items.

---

#### PATCH /gears/:id

Update a gear listing. (Provider only, own gear only)

**Authentication:** Required (`PROVIDER`)

**Request:** `multipart/form-data`

| Field            | Type          | Required | Constraints          |
| :--------------- | :------------ | :------- | :------------------- |
| `name`           | string        | No       | 2-150 characters     |
| `description`    | string        | No       | Min 10 characters    |
| `brand`          | string        | No       | —                    |
| `pricePerDay`    | number        | No       | Must be positive     |
| `totalQuantity`  | number        | No       | Min 1                |
| `categoryId`     | string        | No       | Valid category ID    |
| `specifications` | string (JSON) | No       | JSON string          |
| `isListed`       | boolean       | No       | —                    |
| `images`         | files         | No       | Up to 10 image files |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gear updated successfully.",
  "data": {
    "id": "cm0...",
    "name": "Updated Tent Name",
    "pricePerDay": 30,
    "updatedAt": "2026-08-03T11:00:00.000Z"
  }
}
```

---

#### DELETE /gears/:id

Delete a gear listing. (Provider only, own gear only)

**Authentication:** Required (`PROVIDER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gear deleted successfully.",
  "data": null
}
```

---

#### GET /gears/admin

Retrieve all gear items (including unlisted) for admin.

**Authentication:** Required (`ADMIN`)

**Query Parameters:** Same as `GET /gears`.

**Response (200):** Same format as `GET /gears` but includes unlisted items.

---

#### PATCH /gears/:id/moderate

Moderate a gear listing (approve/unlist). (Admin only)

**Authentication:** Required (`ADMIN`)

**Request Body:**

```json
{
  "isListed": false
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Gear moderation updated.",
  "data": {
    "id": "cm0...",
    "name": "Premium Camping Tent",
    "isListed": false
  }
}
```

---

### Rentals

#### POST /rentals

Create a new rental order. (Customer only)

**Authentication:** Required (`CUSTOMER`)

**Request Body:**

```json
{
  "items": [
    {
      "gearItemId": "cm0abcdefghijklmnop3",
      "quantity": 1,
      "startDate": "2026-08-10",
      "endDate": "2026-08-15"
    }
  ]
}
```

**Validation Rules:**
| Field | Type | Required | Constraints |
| :---- | :--- | :------- | :---------- |
| `items` | array | Yes | Min 1 item |
| `items[].gearItemId` | string | Yes | Valid gear ID |
| `items[].quantity` | number | Yes | Positive integer |
| `items[].startDate` | string | Yes | Date string (YYYY-MM-DD) |
| `items[].endDate` | string | Yes | Date string (YYYY-MM-DD) |

**Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Rental order created successfully.",
  "data": {
    "id": "cm0abcdefghijklmnop5",
    "orderNumber": "RENT-ABC123",
    "status": "PENDING_PAYMENT",
    "paymentStatus": "PENDING",
    "totalAmount": 125,
    "customerId": "cm0...",
    "items": [
      {
        "id": "item1",
        "gearItemId": "cm0...",
        "quantity": 1,
        "pricePerDay": 25,
        "subtotal": 125,
        "startDate": "2026-08-10",
        "endDate": "2026-08-15",
        "status": "CONFIRMED"
      }
    ],
    "createdAt": "2026-08-03T10:00:00.000Z",
    "updatedAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### GET /rentals/my-rentals

Retrieve the authenticated customer's rental history.

**Authentication:** Required (`CUSTOMER`)

**Query Parameters:**
| Parameter | Type | Default | Description |
| :-------- | :--- | :------ | :---------- |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `status` | enum | — | Filter by order status |
| `sortBy` | string | `createdAt` | Sort field |
| `sortOrder` | enum | `desc` | Sort order |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rentals retrieved successfully.",
  "meta": { "page": 1, "limit": 10, "total": 1 },
  "data": [
    {
      "id": "cm0...",
      "orderNumber": "RENT-ABC123",
      "status": "PENDING_PAYMENT",
      "paymentStatus": "PENDING",
      "totalAmount": 125,
      "items": [
        {
          "id": "item1",
          "gearItem": { "id": "gear1", "name": "Premium Camping Tent" },
          "quantity": 1,
          "startDate": "2026-08-10",
          "endDate": "2026-08-15",
          "status": "CONFIRMED"
        }
      ],
      "createdAt": "2026-08-03T10:00:00.000Z"
    }
  ]
}
```

---

#### GET /rentals/:id

Retrieve a single rental order details. (Customer only, own rental)

**Authentication:** Required (`CUSTOMER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rental retrieved successfully.",
  "data": {
    "id": "cm0...",
    "orderNumber": "RENT-ABC123",
    "status": "PLACED",
    "paymentStatus": "COMPLETED",
    "totalAmount": 125,
    "items": [
      {
        "id": "item1",
        "gearItem": {
          "id": "gear1",
          "name": "Premium Camping Tent",
          "images": [{ "imageUrl": "https://...", "isPrimary": true }]
        },
        "quantity": 1,
        "pricePerDay": 25,
        "subtotal": 125,
        "startDate": "2026-08-10",
        "endDate": "2026-08-15",
        "status": "CONFIRMED",
        "pickedUpAt": null,
        "returnedAt": null
      }
    ],
    "createdAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### PATCH /rentals/:id/cancel

Cancel a pending rental order. (Customer only)

**Authentication:** Required (`CUSTOMER`)

**Request Body:**

```json
{
  "cancellationReason": "Changed my mind about the rental"
}
```

**Validation Rules:**
| Field | Type | Required | Constraints |
| :---- | :--- | :------- | :---------- |
| `cancellationReason` | string | Yes | 5-500 characters |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rental cancelled successfully.",
  "data": {
    "id": "cm0...",
    "status": "CANCELLED",
    "cancellationReason": "Changed my mind about the rental"
  }
}
```

---

#### GET /rentals/provider/rentals

Retrieve rental orders for the provider's gear.

**Authentication:** Required (`PROVIDER`)

**Query Parameters:**
| Parameter | Type | Default | Description |
| :-------- | :--- | :------ | :---------- |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `status` | enum | — | Filter by item rental status |
| `startDate` | string | — | Filter by start date |
| `endDate` | string | — | Filter by end date |

**Response (200):** Similar to `GET /rentals/my-rentals` but filtered to provider's gear.

---

#### GET /rentals/provider/rentals/:id

Retrieve a single rental order details for provider.

**Authentication:** Required (`PROVIDER`)

**Response (200):** Similar to `GET /rentals/:id` but for provider's gear rentals.

---

#### PATCH /rentals/provider/rentals/:id/status

Update rental item status. (Provider only)

**Authentication:** Required (`PROVIDER`)

**Request Body:**

```json
{
  "status": "READY_FOR_PICKUP"
}
```

**Valid Status Values:** `READY_FOR_PICKUP`, `PICKED_UP`, `RETURNED`

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Rental status updated successfully.",
  "data": {
    "id": "item1",
    "status": "READY_FOR_PICKUP",
    "updatedAt": "2026-08-03T11:00:00.000Z"
  }
}
```

---

### Payments

#### POST /payments/create

Create a Stripe Payment Intent for a rental order.

**Authentication:** Required (`CUSTOMER`)

**Request Body:**

```json
{
  "rentalOrderId": "cm0abcdefghijklmnop5"
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment intent created successfully.",
  "data": {
    "clientSecret": "pi_abc123_secret_xyz",
    "paymentIntentId": "pi_abc123",
    "amount": 12500,
    "currency": "usd"
  }
}
```

---

#### POST /payments/confirm

Confirm a payment after successful Stripe confirmation.

**Authentication:** Required (`CUSTOMER`)

**Request Body:**

```json
{
  "paymentIntentId": "pi_abc123"
}
```

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment confirmed successfully.",
  "data": {
    "paymentIntentId": "pi_abc123",
    "status": "succeeded",
    "orderStatus": "PLACED"
  }
}
```

---

#### GET /payments

Retrieve the authenticated customer's payment history.

**Authentication:** Required (`CUSTOMER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payments retrieved successfully.",
  "data": [
    {
      "id": "pay1",
      "transactionId": "pi_abc123",
      "amount": 125,
      "method": "STRIPE",
      "status": "COMPLETED",
      "paidAt": "2026-08-03T10:05:00.000Z",
      "rentalOrderId": "cm0...",
      "createdAt": "2026-08-03T10:00:00.000Z"
    }
  ]
}
```

---

#### GET /payments/:id

Retrieve a single payment details.

**Authentication:** Required (`CUSTOMER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payment retrieved successfully.",
  "data": {
    "id": "pay1",
    "transactionId": "pi_abc123",
    "amount": 125,
    "refundAmount": null,
    "method": "STRIPE",
    "status": "COMPLETED",
    "paidAt": "2026-08-03T10:05:00.000Z",
    "rentalOrderId": "cm0...",
    "createdAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### GET /payments/admin

Retrieve all payments with pagination. (Admin only)

**Authentication:** Required (`ADMIN`)

**Query Parameters:**
| Parameter | Type | Default | Description |
| :-------- | :--- | :------ | :---------- |
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Payments retrieved successfully.",
  "data": [ ... ],
  "meta": { "page": 1, "limit": 10, "total": 5 }
}
```

---

#### POST /payments/webhook

Stripe Webhook endpoint for asynchronous payment events.

**Authentication:** None (Public - signature verified)

**Request:** Raw JSON body with `stripe-signature` header.

**Response (200):**

```json
{
  "received": true
}
```

---

### Reviews

#### POST /reviews

Submit a review for a returned rental item. (Customer only)

**Authentication:** Required (`CUSTOMER`)

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Excellent tent, very sturdy and easy to set up!",
  "rentalOrderItemId": "item1"
}
```

**Validation Rules:**
| Field | Type | Required | Constraints |
| :---- | :--- | :------- | :---------- |
| `rating` | number | Yes | 1-5 (integer) |
| `comment` | string | No | 5-500 characters |
| `rentalOrderItemId` | string | Yes | Valid rental order item ID, must be unique |

**Response (201):**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Review submitted successfully.",
  "data": {
    "id": "rev1",
    "rating": 5,
    "comment": "Excellent tent, very sturdy and easy to set up!",
    "customerId": "cm0...",
    "gearItemId": "cm0...",
    "rentalOrderItemId": "item1",
    "createdAt": "2026-08-03T10:00:00.000Z",
    "updatedAt": "2026-08-03T10:00:00.000Z"
  }
}
```

---

#### GET /reviews/:gearId

Retrieve all reviews for a specific gear item.

**Authentication:** None (Public)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reviews retrieved successfully.",
  "data": [
    {
      "id": "rev1",
      "rating": 5,
      "comment": "Excellent tent!",
      "customer": {
        "id": "cust1",
        "name": "John Doe"
      },
      "createdAt": "2026-08-03T10:00:00.000Z"
    }
  ]
}
```

---

#### GET /reviews/my-reviews

Retrieve the authenticated customer's own reviews.

**Authentication:** Required (`CUSTOMER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Your reviews retrieved successfully.",
  "data": [
    {
      "id": "rev1",
      "rating": 5,
      "comment": "Excellent tent!",
      "gearItem": {
        "id": "gear1",
        "name": "Premium Camping Tent"
      },
      "createdAt": "2026-08-03T10:00:00.000Z"
    }
  ]
}
```

---

#### GET /reviews/provider-reviews

Retrieve reviews for the authenticated provider's gear items.

**Authentication:** Required (`PROVIDER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reviews retrieved successfully.",
  "data": [
    {
      "id": "rev1",
      "rating": 5,
      "comment": "Excellent tent!",
      "customer": {
        "id": "cust1",
        "name": "John Doe"
      },
      "gearItem": {
        "id": "gear1",
        "name": "Premium Camping Tent"
      },
      "createdAt": "2026-08-03T10:00:00.000Z"
    }
  ]
}
```

---

### Dashboard

#### GET /dashboard/admin

Retrieve platform-wide admin analytics.

**Authentication:** Required (`ADMIN`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard fetched successfully.",
  "data": {
    "totalUsers": 150,
    "totalProviders": 25,
    "totalGears": 300,
    "totalOrders": 500,
    "totalRevenue": 25000,
    "recentOrders": [...],
    "recentUsers": [...]
  }
}
```

---

#### GET /dashboard/provider

Retrieve provider earnings and gear analytics.

**Authentication:** Required (`PROVIDER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard fetched successfully.",
  "data": {
    "totalGears": 10,
    "activeRentals": 3,
    "totalEarnings": 1500,
    "pendingOrders": 2,
    "recentOrders": [...]
  }
}
```

---

#### GET /dashboard/customer

Retrieve customer rental statistics.

**Authentication:** Required (`CUSTOMER`)

**Response (200):**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Dashboard fetched successfully.",
  "data": {
    "totalRentals": 5,
    "activeRentals": 1,
    "completedRentals": 3,
    "cancelledRentals": 1,
    "totalSpent": 500,
    "recentOrders": [...]
  }
}
```

---

## Rate Limiting

Login endpoints (`POST /auth/login`, `POST /auth/google`) are rate-limited to prevent brute-force attacks. Excessive requests will receive a `429 Too Many Requests` response.

---

## Pagination

Endpoints supporting pagination accept `page` and `limit` query parameters:

| Parameter | Type   | Default | Description              |
| :-------- | :----- | :------ | :----------------------- |
| `page`    | number | 1       | Page number              |
| `limit`   | number | 10      | Number of items per page |

Paginated endpoints return a `meta` object containing `page`, `limit`, and `total` fields.

### Paginated Endpoints

- `GET /gears`
- `GET /gears/admin`
- `GET /gears/my-gears`
- `GET /users`
- `GET /rentals/my-rentals`
- `GET /rentals/provider/rentals`
- `GET /payments/admin`

---

## Search & Filtering

### Gear Search

`GET /gears` supports the following search and filter parameters:

- `search`: Searches across `name`, `description`, and `brand` fields.
- `category`: Filter by exact category ID.
- `brand`: Filter by exact brand name.
- `minPrice` / `maxPrice`: Filter by price range.
- `sortBy`: Sort by `pricePerDay`, `createdAt`, or `name`.
- `sortOrder`: `asc` or `desc`.

### User Search (Admin)

`GET /users` supports:

- `search`: Searches across `name` and `email` fields.
- `role`: Filter by role.
- `status`: Filter by user status.

---

## Roles

| Role       | Description                                          |
| :--------- | :--------------------------------------------------- |
| `CUSTOMER` | Can rent gear, make payments, submit reviews         |
| `PROVIDER` | Can list gear, manage rentals for own gear           |
| `ADMIN`    | Full platform control, user/category/gear management |

---

## Postman Collection

A complete Postman collection is included in the repository root: `gearup.postman_collection.json`. Import it into Postman to explore all pre-configured API requests.
