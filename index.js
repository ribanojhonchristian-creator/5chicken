import express from 'express';

const app = express();

app.use(express.json());

let products = [
  { id: 1, item_code: 'A01', item_name: 'Whole Chicken', unit_price: 180, stock_level: 50, low_stock_threshold: 10 },
  { id: 2, item_code: 'A02', item_name: 'Chicken Wings (1kg)', unit_price: 160, stock_level: 30, low_stock_threshold: 5 },
  { id: 3, item_code: 'A03', item_name: 'Gravy Sauce (Pack)', unit_price: 25, stock_level: 50, low_stock_threshold: 10 }
];

app.get('/', (req, res) => {
  const rows = products.map(p => {
    const isLow = p.stock_level <= p.low_stock_threshold;
    return `
      <tr>
        <td>${p.item_code}</td>
        <td>${p.item_name}</td>
        <td>₱${p.unit_price}</td>
        <td id="stock-${p.id}">${p.stock_level}</td>
        <td id="status-${p.id}">${isLow ? '<span class="badge">Low Stock</span>' : '<span style="color:#22c55e;">In Stock</span>'}</td>
        <td><button onclick="buyProduct(${p.id})" style="background:#f59e0b; color:#0f172a; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-weight:bold;">Buy 1</button></td>
      </tr>
    `;
  }).join('');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>5 STAR Chicken Inventory System</title>
  <style>
    :root {
      --bg-color: #0f172a;
      --card-bg: #1e293b;
      --accent: #f59e0b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --border: #334155;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 950px;
      margin: 40px auto;
      background: var(--card-bg);
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      border: 1px solid var(--border);
    }
    header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 15px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      color: var(--accent);
      font-size: 24px;
      margin: 0;
    }
    .meta {
      font-size: 14px;
      color: var(--text-muted);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background-color: #0f172a;
      color: var(--accent);
    }
    tr:hover {
      background-color: #273548;
    }
    .badge {
      background: #ef4444;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .status-badge {
      background: #22c55e;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>5 STAR Chicken Inventory System</h1>
        <div class="meta">Section: BSIT/LFSA211A015</div>
      </div>
      <div>
        <span class="status-badge" id="system-status">Online</span>
      </div>
    </header>

    <h3>Live Inventory Products & Sales Logging</h3>
    <table id="product-table">
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
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>

  <script>
    function buyProduct(id) {
      fetch('/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      })
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          const product = data.product;
          document.getElementById('stock-' + product.id).innerText = product.stock_level;
          const statusCell = document.getElementById('status-' + product.id);
          if(product.stock_level <= product.low_stock_threshold) {
            statusCell.innerHTML = '<span class="badge">Low Stock</span>';
          } else {
            statusCell.innerHTML = '<span style="color:#22c55e;">In Stock</span>';
          }
        } else {
          alert(data.message);
        }
      });
    }
  </script>
</body>
</html>`);
});

app.post('/api/buy', (req, res) => {
  const { id } = req.body;
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  if (product.stock_level <= 0) {
    return res.json({ success: false, message: 'Out of stock!' });
  }
  product.stock_level -= 1;
  res.json({ success: true, product });
});

app.get('/api', (req, res) => {
  res.json({
    system: '5 STAR Chicken Inventory System',
    status: 'Online',
    developers: ['Lopez Mark John', 'Naig, Gabriel', 'Tomagan, Sidrey', 'Ribano Jhonchristian'],
    section: 'BSIT/LFSA211A015'
  });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

export default app;