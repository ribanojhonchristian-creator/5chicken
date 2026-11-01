import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize SQLite database (creates a local file automatically)
async function getDb() {
    return open({
        filename: path.join(__dirname, '../inventory.db'),
        driver: sqlite3.Database
    });
}

// Setup database tables and insert initial products automatically
async function initDb() {
    try {
        const db = await getDb();
        await db.exec(`
            CREATE TABLE IF NOT EXISTS products (
                product_id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_code TEXT NOT NULL,
                item_name TEXT NOT NULL,
                unit_price REAL NOT NULL,
                stock_level INTEGER NOT NULL,
                low_stock_threshold INTEGER DEFAULT 10
            )
        `);

        // Check if products already exist, if not, insert them
        const existing = await db.all('SELECT * FROM products');
        if (existing.length === 0) {
            await db.run(`
                INSERT INTO products (item_code, item_name, unit_price, stock_level, low_stock_threshold) 
                VALUES 
                ('WC01', 'Whole Chicken', 380.00, 25, 5),
                ('CP01', 'Chicken Piece (1pc)', 85.00, 50, 10),
                ('GR01', 'Gravy (Regular)', 25.00, 40, 10)
            `);
        }
    } catch (err) {
        console.error('Database initialization error:', err);
    }
}
initDb();

// Serve your frontend index.html file at the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get all inventory products for the frontend
app.get('/api/products', async (req, res) => {
    try {
        const db = await getDb();
        const rows = await db.all('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Export the Express app for Vercel Serverless Functions
export default app;