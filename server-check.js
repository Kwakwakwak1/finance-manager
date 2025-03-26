// Simple server check application
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Finance Manager Server is running!');
});

app.listen(port, () => {
  console.log(`Server check application running at http://localhost:${port}`);
});