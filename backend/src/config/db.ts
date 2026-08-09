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

// CRITICAL FIX: Make the migration check run on immediate client connection with strict type safety
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database connection failure during startup initialization:', err.stack);
  }
  
  // FIXED: Safety check to satisfy TypeScript compiler
  if (!client) {
    return console.error('❌ Database client connection is undefined.');
  }
  
  console.log('🗄️ Connected to PostgreSQL. Verifying table structure...');
  
  client.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      priority VARCHAR(50) DEFAULT 'Medium',
      status VARCHAR(50) DEFAULT 'Todo',
      created_at TIMESTAMP DEFAULT NOW()
    );
  `, (queryErr) => {
    release(); // Return the connection back to the pool
    
    if (queryErr) {
      console.error('❌ Failed to run table schema creation:', queryErr.stack);
    } else {
      console.log('✅ Production "tasks" table is successfully verified, built, and ready!');
    }
  });
});

export default pool;
