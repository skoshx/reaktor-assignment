/**
 * SkoshX (https://skoshx.com)
 * Express server to host reaktor-assignment on Heroku
 */

const express = require('express');
const path = require('path');
const port = process.env.PORT ?? 3000;
const app = express();
const releasePath = path.join(__dirname, '..', 'dist', 'web');

app.use(express.static(releasePath));

app.get('*', (req, res) => {
  res.sendFile(path.join(releasePath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});




