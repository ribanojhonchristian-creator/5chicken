import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Use /tmp directory on Vercel for writable SQLite storage, or local path for development
const dbPath = process.env.VERCEL ? '/tmp/inventory.db' : path.join(__dirname, '../inventory.db');

async function getDb() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    // Create table and insert default products if they don't exist yet
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

    return db;
}

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