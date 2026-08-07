import pg from 'pg';
import dotenv from 'dotenv';

// Load environmental variables safely
dotenv.config();

const { Pool } = pg;

// Establish a connection pool configuration profile
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    // FIXED: Enforce secure cloud SSL connection for Render production tables
    ssl: {
        rejectUnauthorized: false
    }
});

// Event listener to check if the connection to PostgreSQL is running smoothly
pool.on('connect', () => {
    console.log('🗄️  PostgreSQL Database connected successfully!');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database pool connection failure:', err);
});

export default pool;
