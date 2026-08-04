import { Router } from 'express';
import { 
    getAllTasks, 
    createTask, 
    updateTaskStatus, 
    deleteTask 
} from '../controllers/taskController.ts';

const router = Router();

// 1. GET /api/tasks -> Fetches all tasks from the PostgreSQL database
router.get('/', getAllTasks);

// 2. POST /api/tasks -> Creates a new task ticket row in the database
router.post('/', createTask);

// 3. PATCH /api/tasks/:id -> Updates an existing task's workflow status state
router.patch('/:id', updateTaskStatus);

// 4. DELETE /api/tasks/:id -> Permanently erases a task row from the database
router.delete('/:id', deleteTask);

export default router;
