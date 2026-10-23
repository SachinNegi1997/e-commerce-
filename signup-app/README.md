# Signup App (Node.js + Express + MySQL)

## Setup
1. Install Node.js (v18+) and MySQL.
2. Create the database and table:
   mysql -u root -p < schema.sql
3. Install dependencies:
   npm install
4. Copy `.env.example` to `.env` and fill in your MySQL password.
5. Start the server:
   npm start
6. Open http://localhost:3000

## API
- POST /api/register  { fullName, email, phone?, password }
- POST /api/login     { email, password }

Passwords are hashed with bcrypt before being stored.
