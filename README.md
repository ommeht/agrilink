# 🌾 AgriLink — Farm to Table Marketplace

A full-stack web application connecting farmers directly with customers.

## Tech Stack
- **Frontend**: React.js + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt

---

## 📁 Project Structure

```
agrilink/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── controllers/      # authController, productController, orderController, reviewController, cartController, farmerController
│   │   ├── middleware/        # auth.js, errorHandler.js, upload.js
│   │   ├── models/            # User, Product, Order, Review, Cart
│   │   ├── routes/            # auth, products, orders, reviews, cart, farmers
│   │   └── server.js
│   ├── uploads/               # Uploaded images
│   └── .env
└── frontend/
    └── src/
        ├── components/        # Navbar, ProtectedRoute, ui/
        ├── context/           # AuthContext, CartContext, ThemeContext
        ├── pages/
        │   ├── farmer/        # Dashboard, Products, Orders
        │   ├── admin/         # Dashboard
        │   └── ...            # Home, Login, Register, Products, Cart, etc.
        └── utils/api.js
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

---

## 🚀 Setup Instructions

### 1. Clone / Navigate to project
```bash
cd agrilink
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Edit `.env` if needed:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/agrilink
JWT_SECRET=agrilink_super_secret_jwt_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install --legacy-peer-deps
npm start
```

App opens at **http://localhost:3000**

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/profile | Update profile |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/products | List products (with filters) |
| GET | /api/products/:id | Get product |
| POST | /api/products | Create product (farmer) |
| PUT | /api/products/:id | Update product (farmer) |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/my | Farmer's own products |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders | Place order (customer) |
| GET | /api/orders/my | Customer's orders |
| GET | /api/orders/farmer | Farmer's incoming orders |
| GET | /api/orders/stats | Farmer stats |
| GET | /api/orders/:id | Order detail |
| PUT | /api/orders/:id/status | Update order status |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reviews/product/:productId | Add review |
| GET | /api/reviews/product/:productId | Product reviews |
| GET | /api/reviews/farmer/:farmerId | Farmer reviews |
| DELETE | /api/reviews/:id | Delete review |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get cart |
| POST | /api/cart | Add to cart |
| PUT | /api/cart/:productId | Update item qty |
| DELETE | /api/cart/:productId | Remove item |
| DELETE | /api/cart | Clear cart |

### Farmers / Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/farmers | List all farmers |
| GET | /api/farmers/:id | Farmer profile |
| POST | /api/farmers/wishlist/:productId | Toggle wishlist |
| GET | /api/farmers/notifications/me | Get notifications |
| PUT | /api/farmers/notifications/read | Mark all read |
| GET | /api/farmers/admin/stats | Admin stats |
| GET | /api/farmers/admin/users | All users |
| DELETE | /api/farmers/admin/users/:id | Delete user |
| GET | /api/farmers/admin/orders | All orders |

---

## 👤 User Roles

| Role | Access |
|------|--------|
| **customer** | Browse, cart, checkout, orders, reviews, wishlist |
| **farmer** | Dashboard, product CRUD, order management |
| **admin** | Full system access, user/order management |

### Create Admin User
Use MongoDB shell or Compass:
```js
db.users.updateOne({ email: "admin@agrilink.com" }, { $set: { role: "admin" } })
```

---

## ✨ Features

- 🔐 JWT Authentication with role-based access
- 🌙 Dark/Light mode toggle
- 🛒 Real-time cart management
- 📦 Order tracking with status updates
- ⭐ Product reviews (only for verified purchasers)
- 🔔 In-app notifications
- ❤️ Wishlist
- 🔍 Search + filters (category, price, rating)
- 📱 Fully responsive mobile-first design
- 🎨 Framer Motion animations throughout
- 🖼️ Image upload with Multer
- 📊 Farmer analytics dashboard
- 👑 Admin panel with system stats
