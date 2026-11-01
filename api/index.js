import express from 'express';

const app = express();
app.use(express.json());

// Persistent in-memory data for Vercel
let products = [
    { product_id: 1, item_code: 'WC01', item_name: 'Whole Chicken', unit_price: 380.00, stock_level: 25, low_stock_threshold: 5 },
    { product_id: 2, item_code: 'CP01', item_name: 'Chicken Piece (1pc)', unit_price: 85.00, stock_level: 50, low_stock_threshold: 10 },
    { product_id: 3, item_code: 'GR01', item_name: 'Gravy (Regular)', unit_price: 25.00, stock_level: 40, low_stock_threshold: 10 }
];

let salesRecords = [];

// API endpoint to get products
app.get('/api/products', (req, res) => {
    res.json(products);
});

// API endpoint to get sales records
app.get('/api/sales', (req, res) => {
    res.json(salesRecords);
});

// API endpoint to buy/reduce stock & record transaction
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
    
    // Record the sale
    const sale = {
        transaction_id: salesRecords.length + 1,
        item_name: product.item_name,
        quantity: quantity,
        total_amount: product.unit_price * quantity,
        timestamp: new Date().toLocaleString()
    };
    salesRecords.unshift(sale); // Add newest sale to the top

    res.json({ success: true, message: 'Sale recorded successfully', product, sale });
});

// API endpoint to add new products OR restock existing items
app.post('/api/add-product', (req, res) => {
    const { item_code, item_name, unit_price, stock_level, low_stock_threshold } = req.body;

    if (!item_code || !stock_level) {
        return res.status(400).json({ success: false, message: 'Please provide Item Code and Stock amount.' });
    }

    const code = item_code.trim().toUpperCase();
    const addStock = parseInt(stock_level);
    const existingProduct = products.find(p => p.item_code === code);

    if (existingProduct) {
        existingProduct.stock_level += addStock;
        if (unit_price) existingProduct.unit_price = parseFloat(unit_price);
        return res.json({ success: true, message: 'Stock added successfully!', product: existingProduct });
    }

    if (!item_name || !unit_price) {
        return res.status(400).json({ success: false, message: 'Please provide name and price for new products.' });
    }

    const newProduct = {
        product_id: products.length > 0 ? Math.max(...products.map(p => p.product_id)) + 1 : 1,
        item_code: code,
        item_name,
        unit_price: parseFloat(unit_price),
        stock_level: addStock,
        low_stock_threshold: low_stock_threshold ? parseInt(low_stock_threshold) : 5
    };

    products.push(newProduct);
    res.json({ success: true, message: 'Product added successfully!', product: newProduct });
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
                body { background-color: #0d1117; color: #c9d1d9; font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; padding: 20px; }
                .container { background: #161b22; padding: 30px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); width: 950px; border: 1px solid #30363d; }
                h1 { color: #f0883e; font-size: 22px; margin-bottom: 5px; }
                h2 { margin-top: 30px; font-size: 18px; color: #58a6ff; }
                .section { color: #8b949e; font-size: 14px; margin-bottom: 20px; }
                .badge { background: #238636; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; float: right; }
                
                .add-form { background: #21262d; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #30363d; display: grid; grid-template-columns: 1fr 2fr 1fr 1fr auto; gap: 10px; align-items: end; }
                .add-form input { background: #0d1117; border: 1px solid #30363d; color: white; padding: 8px; border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box; }
                .add-form label { font-size: 12px; color: #8b949e; display: block; margin-bottom: 4px; }
                .add-btn { background: #1f6feb; color: white; border: none; padding: 9px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; height: 37px; }
                .add-btn:hover { background: #388bfd; }

                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #30363d; font-size: 14px; }
                th { color: #f0883e; font-size: 13px; }
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

                <!-- Add/Restock Form -->
                <form class="add-form" onsubmit="addProduct(event)">
                    <div>
                        <label>Item Code</label>
                        <input type="text" id="item_code" placeholder="e.g. WC01" required>
                    </div>
                    <div>
                        <label>Product Name (Optional)</label>
                        <input type="text" id="item_name" placeholder="Whole Chicken">
                    </div>
                    <div>
                        <label>Unit Price (₱)</label>
                        <input type="number" step="0.01" id="unit_price" placeholder="380.00">
                    </div>
                    <div>
                        <label>Stock / Add</label>
                        <input type="number" id="stock_level" placeholder="10" required>
                    </div>
                    <div>
                        <button type="submit" class="add-btn">Save</button>
                    </div>
                </form>
                
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

                <h2>Sales Transaction History</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Tx ID</th>
                            <th>Item Name</th>
                            <th>Qty</th>
                            <th>Total Amount (₱)</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody id="sales-table-body">
                        <tr><td colspan="5" style="text-align:center;">No sales recorded yet.</td></tr>
                    </tbody>
                </table>
            </div>

            <script>
                async function loadData() {
                    try {
                        // Load Products
                        const prodRes = await fetch('/api/products');
                        const products = await prodRes.json();
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

                        // Load Sales Records
                        const salesRes = await fetch('/api/sales');
                        const sales = await salesRes.json();
                        const salesTbody = document.getElementById('sales-table-body');
                        
                        if (sales.length === 0) {
                            salesTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#8b949e;">No sales recorded yet.</td></tr>';
                        } else {
                            salesTbody.innerHTML = '';
                            sales.forEach(s => {
                                salesTbody.innerHTML += \`
                                    <tr>
                                        <td>#\${s.transaction_id}</td>
                                        <td>\${s.item_name}</td>
                                        <td>\${s.quantity}</td>
                                        <td>₱\${s.total_amount.toFixed(2)}</td>
                                        <td>\${s.timestamp}</td>
                                    </tr>
                                \`;
                            });
                        }
                    } catch (err) {
                        console.error('Error loading data:', err);
                    }
                }

                async function addProduct(event) {
                    event.preventDefault();
                    const item_code = document.getElementById('item_code').value;
                    const item_name = document.getElementById('item_name').value;
                    const unit_price = document.getElementById('unit_price').value;
                    const stock_level = document.getElementById('stock_level').value;

                    const res = await fetch('/api/add-product', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ item_code, item_name, unit_price, stock_level })
                    });
                    const data = await res.json();

                    if (data.success) {
                        document.getElementById('item_code').value = '';
                        document.getElementById('item_name').value = '';
                        document.getElementById('unit_price').value = '';
                        document.getElementById('stock_level').value = '';
                        loadData(); 
                    } else {
                        alert(data.message);
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
                        loadData(); 
                    } else {
                        alert(data.message);
                    }
                }

                loadData();
            </script>
        </body>
        </html>
    `);
});

export default app;