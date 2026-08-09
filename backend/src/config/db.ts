import pg from 'pg';
import dotenv from 'dotenv';

// Load environmental variables safely
dotenv.config();

const { Pool } = pg;

// Check if we are running in local development or production
const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

// Establish a connection pool configuration profile dynamically
const pool = isLocal
  ? new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      ssl: false,
    })
  : new Pool({
      // FIXED: Use Render's single connection string variable in production
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

// Event listener to check if the connection to PostgreSQL is running smoothly
pool.on('connect', () => {
  console.log('🗄️  PostgreSQL Database connected successfully!');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool connection failure:', err);
});

export default pool;
