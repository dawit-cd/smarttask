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

// Standard API Security and Parsing Middlewares
app.use(cors());
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
