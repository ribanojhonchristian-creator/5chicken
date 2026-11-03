import express from 'express';
import session from 'express-session';

const app = express();
app.use(express.json());

// Configure session middleware
app.use(session({
    secret: '5star_chicken_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

let products = [
    { product_id: 1, item_code: 'WC01', item_name: 'Whole Chicken', unit_price: 380.00, stock_level: 25, low_stock_threshold: 5 },
    { product_id: 2, item_code: 'CP01', item_name: 'Chicken Piece (1pc)', unit_price: 85.00, stock_level: 50, low_stock_threshold: 10 },
    { product_id: 3, item_code: 'GR01', item_name: 'Gravy (Regular)', unit_price: 25.00, stock_level: 40, low_stock_threshold: 10 }
];

let salesRecords = [];

// --- Authentication Routes ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === 'admin' && password === 'admin123') {
        req.session.isAuthenticated = true;
        req.session.username = username;
        return res.json({ success: true, message: 'Logged in successfully!' });
    }
    
    res.status(401).json({ success: false, message: 'Invalid username or password!' });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out.' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully!' });
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session && req.session.isAuthenticated) {
        return res.json({ isAuthenticated: true, username: req.session.username });
    }
    res.json({ isAuthenticated: false });
});

// Middleware to protect routes
function requireAuth(req, res, next) {
    if (req.session && req.session.isAuthenticated) {
        return next();
    }
    res.status(401).json({ success: false, message: 'Unauthorized! Please log in first.' });
}

// Public Routes
app.get('/api/products', (req, res) => {
    res.json(products);
});

app.get('/api/sales', (req, res) => {
    res.json(salesRecords);
});

// Protected Routes
app.post('/api/sell', requireAuth, (req, res) => {
    const { product_id, quantity = 1 } = req.body;
    const product = products.find(p => p.product_id === product_id);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock_level < quantity) {
        return res.status(400).json({ success: false, message: 'Insufficient stock!' });
    }

    product.stock_level -= quantity;
    
    const sale = {
        transaction_id: salesRecords.length + 1,
        item_name: product.item_name,
        quantity: quantity,
        total_amount: product.unit_price * quantity,
        timestamp: new Date().toLocaleString()
    };
    salesRecords.unshift(sale);

    res.json({ success: true, message: 'Sale recorded successfully', product, sale });
});

app.post('/api/add-product', requireAuth, (req, res) => {
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

// Main HTML & Frontend Route
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
                .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
                h1 { color: #f0883e; font-size: 22px; margin: 0; }
                h2 { margin-top: 30px; font-size: 18px; color: #58a6ff; }
                .section { color: #8b949e; font-size: 14px; margin-bottom: 20px; }
                .badge { background: #238636; color: white; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
                
                .auth-container { display: flex; gap: 10px; align-items: center; }
                .auth-btn { background: #21262d; color: #c9d1d9; border: 1px solid #30363d; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; }
                .auth-btn:hover { background: #30363d; }
                .logout-btn { background: #da3633; color: white; border: none; }
                .logout-btn:hover { background: #f85149; }

                /* Login Modal Styling */
                .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); justify-content: center; align-items: center; }
                .modal-content { background: #161b22; padding: 25px; border-radius: 10px; border: 1px solid #30363d; width: 300px; }
                .modal-content input { width: 100%; padding: 8px; margin: 10px 0; background: #0d1117; border: 1px solid #30363d; color: white; border-radius: 6px; box-sizing: border-box; }
                .modal-content button { width: 100%; padding: 8px; background: #238636; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }

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
                .disabled-notice { color: #8b949e; font-style: italic; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header-top">
                    <div>
                        <h1>5 STAR Chicken Inventory System</h1>
                        <div class="section" style="margin-bottom:0;">Section: BSIT/LFSA211A015</div>
                    </div>
                    <div class="auth-container">
                        <span class="badge">Online</span>
                        <div id="auth-actions">
                            <button class="auth-btn" onclick="openLoginModal()">Login</button>
                        </div>
                    </div>
                </div>

                <!-- Add/Restock Form (Hidden if not logged in) -->
                <div id="restricted-form-container" style="display: none; margin-top: 20px;">
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
                </div>
                
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

            <!-- Login Modal -->
            <div id="loginModal" class="modal">
                <div class="modal-content">
                    <h3 style="color: #f0883e; margin-top:0;">Admin Login</h3>
                    <form onsubmit="handleLogin(event)">
                        <label style="font-size:12px; color:#8b949e;">Username</label>
                        <input type="text" id="login-username" required placeholder="admin">
                        <label style="font-size:12px; color:#8b949e;">Password</label>
                        <input type="password" id="login-password" required placeholder="admin123">
                        <button type="submit" style="margin-top: 10px;">Sign In</button>
                        <button type="button" class="auth-btn" onclick="closeLoginModal()" style="width:100%; margin-top:6px; background:#30363d;">Cancel</button>
                    </form>
                </div>
            </div>

            <script>
                let isLoggedIn = false;

                async function checkAuthStatus() {
                    try {
                        const res = await fetch('/api/check-auth');
                        const data = await res.json();
                        isLoggedIn = data.isAuthenticated;
                        
                        const authActions = document.getElementById('auth-actions');
                        const restrictedForm = document.getElementById('restricted-form-container');

                        if (isLoggedIn) {
                            authActions.innerHTML = \`<button class="auth-btn logout-btn" onclick="handleLogout()">Logout (\${data.username})</button>\`;
                            restrictedForm.style.display = 'block';
                        } else {
                            authActions.innerHTML = \`<button class="auth-btn" onclick="openLoginModal()">Login</button>\`;
                            restrictedForm.style.display = 'none';
                        }
                        loadData();
                    } catch (err) {
                        console.error('Auth check error:', err);
                    }
                }

                function openLoginModal() {
                    document.getElementById('loginModal').style.display = 'flex';
                }

                function closeLoginModal() {
                    document.getElementById('loginModal').style.display = 'none';
                }

                async function handleLogin(event) {
                    event.preventDefault();
                    const username = document.getElementById('login-username').value;
                    const password = document.getElementById('login-password').value;

                    const res = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();

                    if (data.success) {
                        closeLoginModal();
                        checkAuthStatus();
                    } else {
                        alert(data.message);
                    }
                }

                async function handleLogout() {
                    const res = await fetch('/api/logout', { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                        checkAuthStatus();
                    } else {
                        alert(data.message);
                    }
                }

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

                            const actionCell = isLoggedIn 
                                ? \`<button class="buy-btn" onclick="buyProduct(\${p.product_id})">Buy (1)</button>\`
                                : \`<span class="disabled-notice">Login to Buy</span>\`;

                            tbody.innerHTML += \`
                                <tr>
                                    <td>\${p.item_code}</td>
                                    <td>\${p.item_name}</td>
                                    <td>₱\${p.unit_price.toFixed(2)}</td>
                                    <td>\${p.stock_level}</td>
                                    <td><span class="\${statusClass}">\${statusText}</span></td>
                                    <td>\${actionCell}</td>
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

                // Initialize auth status on page load
                checkAuthStatus();
            </script>
        </body>
        </html>
    `);
});

export default app;