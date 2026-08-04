import type { Request, Response } from 'express';
import pool from '../config/db.ts';

// 1. Fetch all tasks from the database (with owner details)
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
    try {
        // Advanced SQL JOIN operation to pull the creator's identity seamlessly
        const queryText = `
            SELECT tasks.*, users.name as assignee_name, users.email as assignee_email 
            FROM tasks 
            LEFT JOIN users ON tasks.user_id = users.id
            ORDER BY tasks.created_at DESC
        `;
        const result = await pool.query(queryText);
        res.status(200).json(result.rows);
    } catch (err: any) {
        console.error('Fetch tasks failure:', err.message);
        res.status(500).json({ error: 'Server failed to aggregate workspace tasks.' });
    }
};

// 2. Create a brand new task ticket
export const createTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, status, priority, user_id } = req.body;

        // Basic robust input validation requirement
        if (!title) {
            res.status(400).json({ error: 'Task title attribute is strictly required.' });
            return;
        }

        const queryText = `
            INSERT INTO tasks (title, description, status, priority, user_id) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const values = [title, description, status || 'Todo', priority || 'Medium', user_id || null];
        
        const result = await pool.query(queryText, values);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error('Create task failure:', err.message);
        res.status(500).json({ error: 'Server database record initialization failed.' });
    }
};

// 3. Update an existing task's status or details
export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({ error: 'Status update parameter is required.' });
            return;
        }

        const queryText = `
            UPDATE tasks 
            SET status = $1 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await pool.query(queryText, [status, id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Task not found.' });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (err: any) {
        console.error('Update task failure:', err.message);
        res.status(500).json({ error: 'Server database modification execution failed.' });
    }
};

// 4. Delete an existing task entirely from the PostgreSQL cluster
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const queryText = `DELETE FROM tasks WHERE id = $1 RETURNING *`;
        const result = await pool.query(queryText, [id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: 'Task not found in database.' });
            return;
        }

        res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (err: any) {
        console.error('Delete task failure:', err.message);
        res.status(500).json({ error: 'Server database deletion execution failed.' });
    }
};
