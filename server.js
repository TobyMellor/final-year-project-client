const express = require('express');
const path = require('path');

const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
const dist = path.join(__dirname, 'dist');

app.get('/', (req, res) => {
  res.sendFile(dist + '/index.html');
});

app.use('/', express.static(dist));

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
