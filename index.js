import express from 'express';

const app = express();

// Test route tailored for your inventory system
app.get('/', (req, res) => {
  res.json({ 
    system: '5 STAR Chicken Inventory System',
    status: 'Online',
    message: 'Backend server successfully running on Vercel!' 
  });
});

export default app;