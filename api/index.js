import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Database connection pool with extended timeout for Vercel & Aiven
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectTimeout: 30000, // 30 seconds timeout
    ssl: { 
        rejectUnauthorized: false 
    }
});

// Serve your frontend index.html file at the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get all inventory products for the frontend
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Setup route to create tables and insert products automatically
app.get('/api/setup-db', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                product_id INT AUTO_INCREMENT PRIMARY KEY,
                item_code VARCHAR(50) NOT NULL,
                item_name VARCHAR(100) NOT NULL,
                unit_price DECIMAL(10,2) NOT NULL,
                stock_level INT NOT NULL,
                low_stock_threshold INT DEFAULT 10
            )
        `);

        await pool.query(`
            INSERT INTO products (item_code, item_name, unit_price, stock_level, low_stock_threshold) 
            VALUES 
            ('WC01', 'Whole Chicken', 380.00, 25, 5),
            ('CP01', 'Chicken Piece (1pc)', 85.00, 50, 10),
            ('GR01', 'Gravy (Regular)', 25.00, 40, 10)
        `);

        res.json({ success: true, message: 'Products table created and items inserted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Export the Express app for Vercel Serverless Functions
export default app;