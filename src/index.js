// src/index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// simple route
app.get('/', (req, res) => {
  res.send('Hello — server is working! 🎉');
});

// example JSON route
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
