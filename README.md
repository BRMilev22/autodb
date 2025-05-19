# AutoDB - Auto Parts Inventory Management System

AutoDB is a full-stack web application for managing an auto parts inventory. It allows users to track parts, monitor stock levels, and manage inventory efficiently.

## Features
    
- User authentication and role-based access control
- Complete inventory management (add, update, delete parts)
- Search and filter parts by various criteria
- Low stock alerts
- Stock movement history tracking
- Import/export functionality (Excel/CSV)
- Responsive interface for desktop and mobile devices

## Screenshots

<div align="center">
  <img src="client/public/assets/sc1.png" alt="Dashboard View" width="45%" />
  <img src="client/public/assets/sc2.png" alt="Inventory Management" width="45%" />
</div>

<div align="center">
  <img src="client/public/assets/sc3.png" alt="Part Details" width="45%" />
  <img src="client/public/assets/sc4.png" alt="Stock Analytics" width="45%" />
</div>

## Technology Stack

- **Frontend**: React, React Bootstrap, Axios
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14+ recommended)
- MySQL Server (v8+ recommended)

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/brmilev22/autodb.git
cd autodb
```

2. **Install dependencies**

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

3. **Configure environment variables**

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=auto_parts_db
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

4. **Set up the database**

Create a MySQL database and run the initialization script:

```bash
mysql -u your_mysql_username -p < server/config/db_init.sql
```

Alternatively, you can run the SQL commands in the `server/config/db_init.sql` file using a database management tool like MySQL Workbench or phpMyAdmin.

5. **Start the development server**

```bash
npm run dev
```

This will start both the backend server and the React frontend application.

- The API server will run on: http://localhost:5000
- The React app will run on: http://localhost:3000

## Default Admin Account

The system comes with a pre-configured admin account:

- **Email**: admin@autodb.com
- **Password**: admin123

## API Documentation

### Authentication

- `POST /api/auth` - Authenticate user & get token
- `GET /api/auth/user` - Get logged in user data

### Users

- `POST /api/users` - Register a new user
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Parts

- `GET /api/parts` - Get all parts (with optional filters)
- `GET /api/parts/low-stock` - Get low stock items
- `GET /api/parts/categories` - Get all categories
- `GET /api/parts/:id` - Get part by ID
- `POST /api/parts` - Create a new part
- `PUT /api/parts/:id` - Update a part
- `DELETE /api/parts/:id` - Delete a part
- `PUT /api/parts/:id/stock` - Update part stock quantity
- `POST /api/parts/import` - Import parts from Excel/CSV
- `GET /api/parts/export` - Export parts to Excel

## License

MIT