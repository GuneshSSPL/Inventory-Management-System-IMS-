Technologies Used

- Node.js: JavaScript runtime environment.
- Express.js: Web application framework for Node.js.
- Sequelize: Promise-based Node.js ORM for SQL databases (MSSQL, PostgreSQL, MySQL, SQLite, MariaDB, DB2, Snowflake, and Firebird).
- MSSQL: Microsoft SQL Server as the database.
- dotenv: For loading environment variables from a `.env` file.
- jsonwebtoken: For implementing JWT-based authentication.
- bcryptjs: For hashing passwords.
- nodemailer: For sending emails (e.g., low stock alerts).

Setup Instructions

To set up and run the backend application, follow these steps:

1. Navigate to the Backend Directory:  
   Open your terminal or command prompt and change to the backend application directory:
   ```bash
   cd c:\IMS\IMS-main\WiloV2-Backend\WiloV2
   ```

2. Install Dependencies:  
   Install all required Node.js packages:
   ```bash
   npm install
   ```

3. Configure Environment Variables:  
   Create a `.env` file in the `WiloV2` directory (if it doesn't exist) and add your database connection details and other configurations. A typical `.env` file might look like this:
   ```
   DB_NAME=YourDatabaseName
   DB_USER=YourDbUser
   DB_PASSWORD=YourDbPassword
   DB_HOST=localhost
   DB_PORT=1433
   JWT_SECRET=YourSuperSecretKey
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   ```
   Replace placeholders with your actual database and email credentials.

4. Database Setup (Migrations):  
   Run Sequelize migrations to set up your database schema. Ensure your MSSQL server is running and accessible.
   ```bash
   npx sequelize db:migrate
   ```
   If you encounter issues, check `migration_error.log` for details.

5. Start the Backend Server:  
   Once dependencies are installed and the database is configured, start the Express server:
   ```bash
   npm start
   ```
   The server will typically run on port `3000` (or as configured in `app.js`). You should see a message indicating that the server is running.

API Endpoints

The backend exposes various RESTful API endpoints for managing users, materials, and inventory transactions. Refer to the `routes/` directory for detailed endpoint definitions.

- Authentication: `/api/auth` (e.g., login, register)
- Users: `/api/users` (e.g., get user details)
- Materials: `/api/materials` (e.g., add, update, get materials, consume material)
- Transactions: `/api/transactions` (e.g., get transaction history)

Key Features

- User Authentication: Secure user login and registration using JWT.
- Material Management: CRUD operations for material records.
- Inventory Tracking: Record consumption and other inventory transactions.
- Low Stock Alerts: Email notifications for materials reaching low stock thresholds.
- Role-Based Access Control: (If implemented) Control access to certain functionalities based on user roles.

Troubleshooting

- Database Connection Issues: Double-check your `.env` file for correct database credentials (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`). Ensure your MSSQL server is running and accessible from the backend application.
- Migration Errors: Review `migration_error.log` for specific errors during `db:migrate`. Common issues include incorrect database permissions or syntax errors in migration files.
- Date Conversion Errors: If you encounter "Conversion failed when converting date and/or time from character string" errors, ensure that the date formats being sent to the database are compatible with MSSQL's `DATETIME` or `DATETIME2` types. Sequelize typically handles this, but specific configurations or manual queries might require attention.
- Missing Dependencies: If `npm install` fails, ensure you have Node.js and npm correctly installed and configured.
