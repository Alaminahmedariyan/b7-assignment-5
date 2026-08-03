# Admin Credentials

Use the following credentials to access the admin panel and admin-protected API endpoints.

> **⚠️ IMPORTANT**: These credentials are for the **seed database only**. If the database has been reset or reseeded, these credentials will be re-created. For production, change the password immediately after first login.

---

## Admin Account

| Field        | Value                             |
| :----------- | :-------------------------------- |
| **Name**     | Alamin Ahmed                      |
| **Email**    | `alaminahmedariyan2022@gmail.com` |
| **Password** | `admin123`                        |
| **Role**     | `ADMIN`                           |
| **Phone**    | `01323396163`                     |
| **Address**  | Sherpur, Bangladesh               |

---

## How to Log In as Admin

### Option 1: Via API

Send a `POST` request to `/api/v1/auth/login` with the following body:

```json
{
  "email": "alaminahmedariyan2022@gmail.com",
  "password": "admin123"
}
```

The server will respond with `accessToken` and `refreshToken` in the response body and set them as HTTP-only cookies.

### Option 2: Via Frontend

Use the login form on the frontend application with the email and password above.

---

## Admin Capabilities

Once logged in as an admin, you can access the following endpoints:

| Method   | Endpoint                     | Description                              |
| :------- | :--------------------------- | :--------------------------------------- |
| `GET`    | `/api/v1/users`              | View all users                           |
| `PATCH`  | `/api/v1/users/:id/status`   | Suspend or activate users                |
| `POST`   | `/api/v1/categories`         | Create categories                        |
| `PATCH`  | `/api/v1/categories/:id`     | Update categories                        |
| `DELETE` | `/api/v1/categories/:id`     | Delete categories                        |
| `GET`    | `/api/v1/gears/admin`        | View all gear items (including unlisted) |
| `PATCH`  | `/api/v1/gears/:id/moderate` | Moderate gear listings                   |
| `GET`    | `/api/v1/payments/admin`     | View all payments                        |
| `GET`    | `/api/v1/dashboard/admin`    | View platform analytics                  |

---

## Security Note

For production deployments, it is strongly recommended to:

1. Change the admin password immediately after first login.
2. Use a strong, unique password.
3. Enable any available multi-factor authentication on the frontend.
4. Regularly audit admin account activity.
