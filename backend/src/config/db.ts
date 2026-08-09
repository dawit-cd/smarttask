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

// CRITICAL FIX: Build user dependencies and multi-table column mapping migrations synchronously
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Database connection failure during startup initialization:', err.stack);
  }
  
  if (!client) {
    return console.error('❌ Database client connection is undefined.');
  }
  
  console.log('🗄️ Connected to PostgreSQL. Wiping legacy locked tables and rebuilding relational structures...');
  
  // FIXED: Drop old tables first to wipe out structural blocks, then create them correctly
  const setupSchemaQuery = `
    DROP TABLE IF EXISTS tasks CASCADE;
    DROP TABLE IF EXISTS users CASCADE;

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(50) DEFAULT 'Todo',
      priority VARCHAR(50) DEFAULT 'Medium',
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  client.query(setupSchemaQuery, (queryErr) => {
    release(); // Return the connection back to the pool
    
    if (queryErr) {
      console.error('❌ Failed to construct advanced relational schema:', queryErr.stack);
    } else {
      console.log('✅ Advanced multi-table workspace database schema is verified and ready!');
    }
  });
});

export default pool;
