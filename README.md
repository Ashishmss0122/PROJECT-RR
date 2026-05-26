# SecureFreelance Full Stack Web Application

SecureFreelance is a secure freelance marketplace platform combining elements of Upwork, Fiverr, and Freelancer. It is built using React (Vite) on the frontend, Node.js/Express on the backend, and MySQL for database storage. It features a unified action-based role system, escrow payment state-tracking, secure work file deliveries, and live chat messaging.

---

## Technical Stack Overview

* **Frontend**: React.js, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React Icons
* **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, CORS
* **Database**: MySQL

---

## Directory Structure

```
SecureFreelance/
├── backend/                  # REST API Server
│   ├── config/               # Database pool and self-initialization scripts
│   ├── controllers/          # Controllers (Auth, Project, Bid, Contracts, Messages, etc.)
│   ├── middleware/           # Protected route token checks and error managers
│   ├── routes/               # API endpoint routing
│   └── server.js             # Main server setup and uploads configurations
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       # Common UI elements (Navbar, Footer, GlassCard)
│   │   ├── context/          # Authentication states Context
│   │   ├── pages/            # View pages (Marketplace, Dashboards, Profile, Chat, Admin)
│   │   └── main.jsx          # Entry point
│   └── index.html            # Core layout page
└── schema.sql                # Relational DDL & seed records
```

---

## Getting Started & Setup Instructions

### Prerequisites
1. **Node.js** (v18+ recommended) installed on your system.
2. **MySQL Server** active locally on default port `3306`.

### Step 1: Database Setup
1. Open your MySQL client (e.g. MySQL Workbench, command-line client, or phpMyAdmin).
2. Start the local server. **The backend will automatically create the database `securefreelance`, create all tables, and insert dummy seed data on startup.**
3. *(Alternative manual setup)*: If you wish to import the database manually, execute the SQL script in `schema.sql`:
   ```bash
   mysql -u root -p < schema.sql
   ```

### Step 2: Backend Configuration & Run
1. Navigate to the `backend` folder.
2. Create or verify the `.env` settings file. Sample values:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=securefreelance
   JWT_SECRET=supersecurefreelancesecret123!
   CORS_ORIGIN=http://localhost:5173
   ```
3. Start the API server:
   ```bash
   npm run start
   ```
   *(or `npm run dev` to start in hot-reload monitoring mode)*.

The server should output:
```
Connected to MySQL server. Initializing tables...
Tables initialized successfully.
Database empty. Seeding initial data...
Seeding complete.
SecureFreelance server is running on port 5000
```

### Step 3: Frontend Configuration & Run
1. Navigate to the `frontend` folder.
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Start the dev client:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## Seed Accounts for Testing

The system is seeded with standard test accounts. You can sign in using these credentials to verify cross-role workflows:

| Role Account | Email | Password | Purpose |
| --- | --- | --- | --- |
| **Platform Admin** | `admin@securefreelance.com` | `admin123` | Moderate users, spam projects, audit active contract escrows. |
| **Alice Client** | `client@securefreelance.com` | `client123` | Post projects, receive bids, download deliverables, release escrow. |
| **Bob Freelancer** | `freelancer@securefreelance.com` | `freelancer123` | Bid on projects, upload deliverables, message clients, audit earnings. |
| **Charlie Dev** | `dev@securefreelance.com` | `dev123` | General user available for bidding or messaging. |

---

## Primary API Endpoints Reference

| Method | Endpoint | Protection | Description |
| --- | --- | --- | --- |
| **POST** | `/api/auth/register` | Public | Create new account (returns JWT) |
| **POST** | `/api/auth/login` | Public | Authenticate user credentials (returns JWT) |
| **GET** | `/api/auth/me` | Protected | Verify active session |
| **POST** | `/api/projects` | Protected | Post a new job opportunity |
| **GET** | `/api/projects` | Public | Browse open jobs on the marketplace board |
| **POST** | `/api/bids` | Protected | Submit a bid proposal to a project |
| **PUT** | `/api/bids/:id/status` | Protected | Accept/Reject bid (Accept creates a Contract) |
| **GET** | `/api/contracts/my-contracts` | Protected | Fetch user's active/completed projects |
| **POST** | `/api/files/upload/:contractId` | Protected | Upload work deliverable (Multer upload) |
| **GET** | `/api/files/download/:fileId` | Protected | Download secure project deliverables |
| **PUT** | `/api/contracts/:id/complete` | Protected | Release escrow payment and complete project |
| **GET** | `/api/messages/users` | Protected | Get list of active chat dialogue threads |
| **GET** | `/api/messages/thread/:userId` | Protected | Load chat thread details |
| **POST** | `/api/messages` | Protected | Deliver text message to user |
| **GET** | `/api/admin/users` | Admin-only | Directory listing of all platform accounts |
| **DELETE** | `/api/admin/projects/:id` | Admin-only | Delete spam project posting |
