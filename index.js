import express from 'express';

const app = express();

// Middleware to parse incoming JSON data
app.use(express.json());

// Main entry / status route for your inventory system
app.get('/', (req, res) => {
  res.json({
    system: '5 STAR Chicken Inventory System',
    status: 'Online',
    message: 'Backend server successfully running on Vercel!',
    developers: ['Lopez Mark John', 'Naig, Gabriel', 'Tomagan, Sidrey', 'Ribano Jhonchristian'],
    section: 'BSIT/LFSA211A015'
  });
});

// Example API route for managing inventory products
app.get('/api/products', (req, res) => {
  res.json([
    { id: 1, item_code: 'A01', item_name: 'Whole Chicken', unit_price: 180, stock_level: 50, low_stock_threshold: 10 },
    { id: 2, item_code: 'A02', item_name: 'Chicken Wings (1kg)', unit_price: 160, stock_level: 30, low_stock_threshold: 5 },
    { id: 3, item_code: 'A03', item_name: 'Gravy Sauce (Pack)', unit_price: 25, stock_level: 8, low_stock_threshold: 10 } // Low stock example
  ]);
});

export default app;