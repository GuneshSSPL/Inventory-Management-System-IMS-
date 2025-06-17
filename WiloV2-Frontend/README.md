Technologies Used

- Angular: A platform and framework for building single-page client applications using HTML and TypeScript.
- TypeScript: A superset of JavaScript that adds static types.
- Node.js: Used for running Angular CLI and development server.
- npm: Package manager for Node.js.
- HTML5/CSS3: For structuring and styling the web pages.
- Angular CLI: Command Line Interface for Angular development.

Setup Instructions

To set up and run the frontend application, follow these steps:

1. Ensure Backend is Running  
   The frontend application communicates with the backend. Make sure your `WiloV2-Backend` is running and accessible (typically on `http://localhost:3000`).

2. Navigate to the Frontend Directory  
   Open your terminal or command prompt and change to the frontend application directory:
   ```bash
   cd c:\IMS\IMS-main\WiloV2-Frontend
   ```

3. Install Dependencies  
   Install all required Node.js packages:
   ```bash
   npm install
   ```

4. Configure API Proxy (Development)  
   During development, the frontend often needs to proxy API requests to the backend to avoid CORS issues. The `proxy.conf.json` file is typically configured for this. Ensure it points to your backend's address (e.g., `"target": "http://localhost:3000"`).

5. Start the Development Server  
   Once dependencies are installed, start the Angular development server:
   ```bash
   ng serve
   ```
   This command will compile the application and launch a development server, usually accessible at `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

6. Build for Production (Optional)  
   To build the application for production deployment:
   ```bash
   ng build --configuration production
   ```
   This will create optimized and minified static files in the `dist/` directory, ready for deployment to a web server.

Usage

After starting the development server, open your web browser and navigate to `http://localhost:4200/`.

- Login: Use the login page to authenticate with the system (requires a running backend and registered users).
- Navigation: Explore the various sections of the application, such as Material Management, Inventory Transactions, and User Management.
- Data Entry: Add new materials, record consumption, and view transaction history.

Key Features

- User Interface: Intuitive and responsive design for easy navigation and data interaction.
- Material Management: View, add, edit, and delete material records.
- Inventory Transactions: Record material consumption and track inventory movements.
- User Management: (If implemented) Manage user accounts and roles.
- Dashboard/Reporting: Visualizations or reports on inventory status and activity.

Troubleshooting

- `ng serve` fails: Check if Node.js and Angular CLI are correctly installed. Ensure all dependencies are installed (`npm install`). Look for error messages in the console for specific issues.
- API calls fail: Verify that the backend server is running and accessible. Check the `proxy.conf.json` configuration. Open your browser's developer console (F12) and check the Network tab for failed API requests and their error messages (e.g., CORS issues, 404 Not Found, 500 Internal Server Error).
- Blank page after `ng serve`: Check the browser's developer console for JavaScript errors. Ensure the `index.html` and `main.ts` files are correctly configured.
- Slow compilation: For larger projects, compilation can take time. Ensure you have sufficient system resources. Consider using `ng serve --poll=2000` if changes aren't being picked up automatically in certain environments.
