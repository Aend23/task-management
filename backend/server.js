import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
})); 
   
app.use(express.json());
  app.use(cookieParser());
 
app.use('/api/auth', authRoutes);
 

app.use('/api/tasks', taskRoutes);

app.use('/api/user', userRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

