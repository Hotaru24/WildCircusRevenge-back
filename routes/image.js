const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/:name', (req, res) => {
  res.sendFile(`uploads/${req.params.name}`, { root: path.join(__dirname, '../public') });
});

router.get('/default', (req, res) => {
  res.sendFile('uploads/default.jpeg', { root: path.join(__dirname, '../public') });
});

module.exports = router;
