MERN Stack Application

Overview
This repository contains a full-stack MERN (MongoDB, Express, React, Node.js) application developed as part of the Round 2 Machine Test for the MERN Stack Developer role at Design of Time. The project includes both frontend and backend in the same repository.

Folder Structure

root/
│
├── frontend/         #  Next.js frontend
├── backend/          # Node.js / Express backend /mongodb
├── .gitignore
└── README.txt

Setup Instructions

Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance cloud using driver options
- Code editor (VS Code recommended)

Backend Setup
1. Navigate to the backend folder:
   cd backend
2. Install dependencies:
   npm install
3. Create a .env file in the backend folder with the following variables:
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
4. Start the backend server:
   npm start
   The server will run on http://localhost:5000 by default.

Frontend Setup
1. Navigate to the frontend folder:
   cd frontend
2. Install dependencies:
   npm install
3. Create a .env file in the frontend folder (if required by the project):
   REACT_APP_API_URL=http://localhost:5000
4. Start the frontend server:
   npm run dev      # or npm start if using create-react-app
   The frontend will run on http://localhost:3000 by default.

Assumptions
- MongoDB is already set up and accessible via the connection string.
- The frontend communicates with the backend API hosted at http://localhost:5000.
- Node.js and npm are installed and configured correctly.
- Basic error handling is implemented.
