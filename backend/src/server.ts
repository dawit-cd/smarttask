import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.ts';
import taskRoutes from './routes/taskRoutes.ts';

// Load our system environmental configurations securely
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// FIXED: Explicitly authorize your live Vercel and local environments
const allowedOrigins = [
  'http://localhost:3000', 
  'https://vercel.app',
  'https://vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, postman, or health checks)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json()); 

// Attach our task management operational endpoints
app.use('/api/tasks', taskRoutes);

// Base System Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'up', message: 'SmartTask backend engine is humming beautifully!' });
});

// Boot the Server engine up
app.listen(PORT, async () => {
    console.log(`🚀 Server running happily on http://localhost:${PORT}`);
    
    // Quick validation check to confirm database responsiveness on boot
    try {
        const result = await pool.query('SELECT NOW()');
        console.log(`⏱️  Database time check: ${result.rows[0].now}`);
    } catch (err: any) {
        console.error('⚠️  Could not communicate with PostgreSQL database on startup:', err.message);
    }
});
