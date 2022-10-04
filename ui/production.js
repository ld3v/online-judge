const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config();

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(process.env.PORT, () => {
  console.log("🚀 - Online-Judge's UI running on port", process.env.PORT);
});
