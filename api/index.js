import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// In-memory persistent product list for this deployment
let products = [
    { product_id: 1, item_code: 'WC01', item_name: 'Whole Chicken', unit_price: 380.00, stock_level: 25, low_stock_threshold: 5 },
    { product_id: 2, item_code: 'CP01', item_name: 'Chicken Piece (1pc)', unit_price: 85.00, stock_level: 50, low_stock_threshold: 10 },
    { product_id: 3, item_code: 'GR01', item_name: 'Gravy (Regular)', unit_price: 25.00, stock_level: 40, low_stock_threshold: 10 }
];

// Serve your frontend index.html file at the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Get all inventory products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// Buy endpoint to reduce stock when a customer makes a purchase
app.post('/api/sell', (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const product = products.find(p => p.product_id === product_id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock_level < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock!' });
    }

    product.stock_level -= quantity;
    res.json({ success: true, message: 'Stock updated successfully', product });
});

// Export the Express app for Vercel Serverless Functions
export default app;