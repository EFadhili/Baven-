const { Router } = require('express');
const db = require('../config/db');
const router = Router();

// GET sales page
router.get('/sales', (req, res) => {
    res.render('sales', { title: 'Make Sales' });
  });

// Fetch product details by ID
router.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM Product WHERE productID = ?';
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ message: 'Error fetching product' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(results[0]);
    });
});

// Process checkout
router.post('/api/sales/checkout', (req, res) => {
    const sales = req.body.sales;

    sales.forEach(sale => {
        const query = 'UPDATE Product SET quantity = quantity - ? WHERE productID = ?';
        db.query(query, [sale.quantity, sale.productId], (err, result) => {
            if (err) {
                console.error('Error updating product quantity:', err);
                return res.status(500).json({ message: 'Error processing checkout' });
            }
        });
    });

    res.json({ message: 'Checkout successful' });
});

module.exports = router;
