import express from 'express';
import mysql from 'mysql2/promise';

const app = express();
app.use(express.json());

// Database connection pool pointing to your Aiven Cloud MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { 
        rejectUnauthorized: false 
    }
});

// Test database connection route
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: 'Connected to Aiven Cloud MySQL!', solution: rows[0].solution });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Export the Express app for Vercel Serverless Functions
export default app;