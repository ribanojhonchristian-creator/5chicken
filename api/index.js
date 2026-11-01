import express from 'express';

const app = express();
app.use(express.json());

// Persistent in-memory product list for Vercel
let products = [
    { product_id: 1, item_code: 'WC01', item_name: 'Whole Chicken', unit_price: 380.00, stock_level: 25, low_stock_threshold: 5 },
    { product_id: 2, item_code: 'CP01', item_name: 'Chicken Piece (1pc)', unit_price: 85.00, stock_level: 50, low_stock_threshold: 10 },
    { product_id: 3, item_code: 'GR01', item_name: 'Gravy (Regular)', unit_price: 25.00, stock_level: 40, low_stock_threshold: 10 }
];

// API endpoint to get products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// API endpoint to buy/reduce stock
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

// Serve the full HTML dashboard directly
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>5 STAR Chicken Inventory System</title>
            <style>
                body { background-color: #0d1117; color: #c9d1d9; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: #161b22; padding: 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); width: 850px; border: 1px solid #30363d; }
                h1 { color: #f0883e; font-size: 22px; margin-bottom: 5px; }
                .section { color: #8b949e; font-size: 14px; margin-bottom: 20px; }
                .badge { background: #238636; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; float: right; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #30363d; }
                th { color: #f0883e; font-size: 14px; }
                .in-stock { color: #3fb950; font-weight: bold; }
                .low-stock { color: #f85149; font-weight: bold; }
                .buy-btn { background: #238636; color: white; border: none; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .buy-btn:hover { background: #2ea043; }
            </style>
        </head>
        <body>
            <div class="container">
                <span class="badge">Online</span>
                <h1>5 STAR Chicken Inventory System</h1>
                <div class="section">Section: BSIT/LFSA211A015</div>
                
                <h2>Live Inventory Products</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Item Code</th>
                            <th>Product Name</th>
                            <th>Unit Price (₱)</th>
                            <th>Stock Level</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="product-table-body">
                        <tr><td colspan="6" style="text-align:center;">Loading products...</td></tr>
                    </tbody>
                </table>
            </div>

            <script>
                async function loadProducts() {
                    try {
                        const res = await fetch('/api/products');
                        const products = await res.json();
                        const tbody = document.getElementById('product-table-body');
                        tbody.innerHTML = '';

                        products.forEach(p => {
                            const isLow = p.stock_level <= p.low_stock_threshold;
                            const statusText = isLow ? 'Low Stock' : 'In Stock';
                            const statusClass = isLow ? 'low-stock' : 'in-stock';

                            tbody.innerHTML += \`
                                <tr>
                                    <td>\${p.item_code}</td>
                                    <td>\${p.item_name}</td>
                                    <td>₱\${p.unit_price.toFixed(2)}</td>
                                    <td>\${p.stock_level}</td>
                                    <td><span class="\${statusClass}">\${statusText}</span></td>
                                    <td>
                                        <button class="buy-btn" onclick="buyProduct(\${p.product_id})">Buy (1)</button>
                                    </td>
                                </tr>
                            \`;
                        });
                    } catch (err) {
                        console.error('Error loading products:', err);
                    }
                }

                async function buyProduct(productId) {
                    const res = await fetch('/api/sell', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ product_id: productId, quantity: 1 })
                    });
                    const data = await res.json();
                    if (data.success) {
                        loadProducts(); // Instantly updates stock on screen!
                    } else {
                        alert(data.message);
                    }
                }

                loadProducts();
            </script>
        </body>
        </html>
    `);
});

export default app;