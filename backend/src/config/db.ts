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
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

// AUTOMATIC TABLE CREATOR: Run a query immediately on pool startup to secure tables
const initializeDatabase = async () => {
  try {
    console.log('🔄 Checking database table structures inside cloud cluster...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'Todo',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Production "tasks" table is successfully verified and ready!');
  } catch (err: any) {
    console.error('❌ Failed to run startup table initialization migrations:', err.message);
  }
};

// Event listener to check if the connection to PostgreSQL is running smoothly
pool.on('connect', () => {
  console.log('🗄️  PostgreSQL Database connected successfully!');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database pool connection failure:', err);
});

// Run table initializations right now
initializeDatabase();

export default pool;
