const express = require('express');
const path = require('path');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
const dist = path.join(__dirname, 'dist');

app.get('/dist', (_, res) => {
  res.sendFile(dist + '/index.html');
});

app.use('/dist', express.static(dist));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
