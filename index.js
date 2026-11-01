import express from 'express';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
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
    button {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
    button:hover {
      opacity: 0.9;
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
      <tbody id="table-body">
        <tr><td colspan="6" style="text-align:center;">Loading products...</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    let products = [
      { id: 1, item_code: 'A01', item_name: 'Whole Chicken', unit_price: 180, stock_level: 50, low_stock_threshold: 10 },
      { id: 2, item_code: 'A02', item_name: 'Chicken Wings (1kg)', unit_price: 160, stock_level: 30, low_stock_threshold: 5 },
      { id: 3, item_code: 'A03', item_name: 'Gravy Sauce (Pack)', unit_price: 25, stock_level: 50, low_stock_threshold: 10 }
    ];

    function renderTable() {
      const tbody = document.getElementById('table-body');
      tbody.innerHTML = '';
      products.forEach(p => {
        const isLow = p.stock_level <= p.low_stock_threshold;
        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td>\${p.item_code}</td>
          <td>\${p.item_name}</td>
          <td>₱\${p.unit_price}</td>
          <td>\${p.stock_level}</td>
          <td>\${isLow ? '<span class="badge">Low Stock</span>' : '<span style="color:#22c55e;">In Stock</span>'}</td>
          <td><button onclick="buyProduct(\${p.id})">Buy 1</button></td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function buyProduct(id) {
      const product = products.find(p => p.id === id);
      if (product && product.stock_level > 0) {
        product.stock_level -= 1;
        renderTable();
      } else {
        alert('Out of stock!');
      }
    }

    renderTable();
  </script>
</body>
</html>`);
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
  res.json([
    { id: 1, item_code: 'A01', item_name: 'Whole Chicken', unit_price: 180, stock_level: 50, low_stock_threshold: 10 },
    { id: 2, item_code: 'A02', item_name: 'Chicken Wings (1kg)', unit_price: 160, stock_level: 30, low_stock_threshold: 5 },
    { id: 3, item_code: 'A03', item_name: 'Gravy Sauce (Pack)', unit_price: 25, stock_level: 50, low_stock_threshold: 10 }
  ]);
});

export default app;