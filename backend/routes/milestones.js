const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ message: 'Create milestone' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get milestone' });
});

module.exports = router;
