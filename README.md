# Mini ERP + CRM Operations Portal

A full-stack Mini ERP and CRM system built with React, Node.js, Express, and Prisma (SQLite).

## Features
- **Role-based Auth:** Admin, Sales, Warehouse, Accounts.
- **Customer CRM:** Manage leads and active customers.
- **Product & Inventory:** Track stock, get low-stock alerts, and view stock movement logs.
- **Sales Challans:** Generate challans, which dynamically reduce stock when confirmed and prevent negative stock.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Prisma (SQLite)
- **Frontend:** React, Vite, TypeScript, Vanilla CSS (Premium styling)

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables (`.env` is already configured for SQLite local file `dev.db`):
   ```env
   PORT=5000
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="super_secret_jwt_key_for_mini_erp"
   ```
4. Push the schema to the database:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

## Test Credentials
The database automatically seeds test users on the first login attempt if the database is empty.
- **Email:** `admin@minierp.com`, `sales@minierp.com`, `warehouse@minierp.com`, `accounts@minierp.com`
- **Password:** `password123` (for all accounts)

## Postman Collection
A Postman collection `Mini_ERP_Postman_Collection.json` is included in the root directory. Import this into Postman to test the backend APIs.

## Deployment Notes
- **Backend (Render, Railway, Fly.io):** Deploy the backend folder as a Node.js web service. Change Prisma to use PostgreSQL by updating `provider = "postgresql"` in `schema.prisma` and supplying a proper `DATABASE_URL` environment variable.
- **Frontend (Vercel, Netlify):** Deploy the frontend folder using the Vite framework preset (`npm run build` as the build command, `dist` as the output directory).
