const { Router } = require('express');
const db = require('../config/db');
const router = Router();

// GET shop page
router.get('/shop', async (req, res) => {
    try {
      const query = 'SELECT * FROM Product';
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching products:', err);
          return res.status(500).json({ message: 'Error fetching products' });
        }
        res.render('shop', { products: results, title: 'Shop' });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'An error occurred while fetching products' });
    }
});

// GET products by category
router.get('/shop/:category', (req, res) => {
  const { category } = req.params;
  const query = 'SELECT * FROM Product WHERE category = ?';
  db.query(query, [category], (err, results) => {
      if (err) {
          console.error('Error fetching products by category:', err);
          return res.status(500).json({ message: 'Error fetching products' });
      }
      res.render('shop', { products: results, title: `Shop | ${category}` });
  });
});

module.exports = router;
