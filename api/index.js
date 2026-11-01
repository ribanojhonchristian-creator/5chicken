import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Built-in product list for reliable cloud performance
const products = [
    { product_id: 1, item_code: 'WC01', item_name: 'Whole Chicken', unit_price: 380.00, stock_level: 25, low_stock_threshold: 5 },
    { product_id: 2, item_code: 'CP01', item_name: 'Chicken Piece (1pc)', unit_price: 85.00, stock_level: 50, low_stock_threshold: 10 },
    { product_id: 3, item_code: 'GR01', item_name: 'Gravy (Regular)', unit_price: 25.00, stock_level: 40, low_stock_threshold: 10 }
];

// Serve your frontend index.html file at the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get all inventory products for the frontend
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Export the Express app for Vercel Serverless Functions
export default app;