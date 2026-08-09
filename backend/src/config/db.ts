import pg from 'pg';
import dotenv from 'dotenv';

// Load environmental variables safely
dotenv.config();

const { Pool } = pg;

// Check if we are running in local development or production
// (If NODE_ENV is not set, it defaults to local development)
const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// Establish a connection pool configuration profile
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    // FIXED: Only use SSL when connecting to live Render tables, disable it for local postgres
    ssl: isLocal ? false : { rejectUnauthorized: false }
});

// Event listener to check if the connection to PostgreSQL is running smoothly
pool.on('connect', () => {
    console.log('🗄️  PostgreSQL Database connected successfully!');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database pool connection failure:', err);
});

export default pool;
