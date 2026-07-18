# 🏢 TradeFlow ERP

A full-stack Enterprise Resource Planning system built for UAE-based electronics and appliances trading companies.

---

## 📌 Overview

TradeFlow ERP is a web-based business management system that helps trading companies manage their daily operations from a single platform. 

---

## 🛠️ Tech Stack

**Frontend**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Shadcn/UI
- Recharts
- Axios
- Lucide React

**Backend**
- NestJS
- TypeScript
- Prisma 7
- PostgreSQL (Neon)
- JWT Authentication
- bcryptjs
- class-validator

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → Neon (serverless PostgreSQL)

---

## ✨ Features

### 🔐 Authentication & Access Control
- JWT-based authentication with bcrypt password hashing
- Two roles: **Admin** (full access) and **Staff** (limited access)
- Protected routes — all pages require valid token
- Admin creates and manages staff accounts

### 📊 Dashboard
- Total sales this month (delivered orders only)
- Total orders, products, and low stock count
- Sales chart for last 7 days (Recharts area chart)
- Recent orders table with status badges

### 📦 Inventory Management
- Add, edit, delete products with SKU and category
- Auto-generated reference numbers (PROD-2026-001)
- Low stock alert badge when quantity falls below 10
- Filter by category (Electronics / Appliances)

### 👥 Customer Management
- Full CRUD with soft delete (archive instead of permanent delete)
- Restore archived customers
- Email and phone uniqueness validation
- Search by name, email, or company

### 🏭 Supplier Management
- Full CRUD for supplier records
- Track purchase history per supplier

### 🛒 Sales Orders
- Create orders with multiple products
- Auto-calculate order total
- Status flow: PENDING → CONFIRMED → DELIVERED → CANCELLED
- On DELIVERED: stock auto-decreases + invoice auto-created
- View order details with all items

### 📥 Purchase Orders
- Order stock from suppliers with multiple products
- Status flow: PENDING → CONFIRMED → DELIVERED
- On DELIVERED: stock auto-increases for each product

### 🧾 Invoices
- Auto-generated when sales order is marked DELIVERED
- Subtotal + 5% VAT + Grand Total calculation
- Mark as PAID when payment received
- Auto-generated reference numbers (INV-2026-001)
- Print-friendly invoice view

### 📈 Reports
- Sales Report: filter by date range, export to CSV
- Inventory Report: total stock value, low stock highlights, export to CSV

### 👤 User Management (Admin only)
- View all staff accounts
- Create new staff with name, email, password
- Activate / Deactivate staff accounts
- Admin account protected from deactivation

---


## 🗄️ Database Schema

- User — Login accounts (ADMIN / STAFF)
- Product — Inventory items
- Customer — Buyers (with soft delete)
- Supplier — Stock suppliers
- SalesOrder — Customer orders
- SalesOrderItem — Products inside each order
- PurchaseOrder — Stock reorders from suppliers
- PurchaseOrderItem — Products inside each purchase
- Invoice — Auto-generated bills with VAT

---

## ⚡ Key Business Logic

### Auto Stock Management
When a Sales Order is marked DELIVERED:
- Stock quantity decreases for every product in the order
- An Invoice is automatically created with VAT calculation

When a Purchase Order is marked DELIVERED:
- Stock quantity increases for every product in the order


## 👩‍💻 Author

Built by **Raifa NP** as a portfolio project demonstrating full-stack development skills 

---

## 📄 License

This project is open source and available under the MIT License.

---

> Built with ❤️ in UAE 🇦🇪
