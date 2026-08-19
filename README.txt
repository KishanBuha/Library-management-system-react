Library Management System

This project is a Library Management System that allows administrators to manage books, students, and borrowing/returning processes. Students can browse available books, view their issued books, and check their transaction history.

Project Structure:
------------------
backend/
  - Contains the server-side code for the application.
  - Built with Node.js, Express, and MongoDB.

frontend/
  - Contains the client-side code for the application.
  - Built with React.js.

Features:
---------
1. Admin Features:
   - Add, issue, and return books.
   - Manage students and view reports.
   - Clear transaction history.

2. Student Features:
   - Browse available books.
   - View issued books and penalties.
   - Check transaction history.

3. General Features:
   - Authentication for both admins and students.
   - Penalty calculation for late returns.

Setup Instructions:
-------------------
1. Backend:
   - Navigate to the `backend` directory.
   - Run `npm install` to install dependencies.
   - Start the server with `npm run dev`.

2. Frontend:
   - Navigate to the `frontend` directory.
   - Run `npm install` to install dependencies.
   - Start the client with `npm start`.

3. Access the application:
   - Open your browser and navigate to `http://localhost:3000`.

Dependencies:
-------------
- Backend:
  - express
  - mongoose
  - bcryptjs
  - jsonwebtoken
  - concurrently
  - nodemon

- Frontend:
  - react
  - react-router-dom
  - axios
  - @material-ui/core

Author
[ Kishan Buha ]