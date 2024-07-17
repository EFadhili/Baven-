const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET route to render cart page
router.get('/cart', (req, res) => {
    const { user } = req.session;

    if (!user) {
        return res.redirect('/login'); // Redirect if user is not authenticated
    }

    db.query('SELECT c.*, p.productImg, p.productName, p.unitPrice FROM cart c JOIN product p ON c.productID = p.id WHERE c.userId = ?', [user.id], (err, cartItems) => {
        if (err) {
            console.error('Error retrieving cart items:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Calculate total
        let total = 0;
        cartItems.forEach(item => {
            total += item.unitPrice * item.quantity;
        });

        // Render the cart.ejs template with cartItems and total
        res.render('cart', { title: 'Your Cart', user, cartItems, total });
    });
});

// Add to cart
router.post('/cart/add', (req, res) => {
    const { user } = req.session;
    const { productID, quantity } = req.body;

    if (!user) {
        return res.redirect('/login'); // Redirect if user is not authenticated
    }

    db.query('INSERT INTO cart (userId, productID, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?', [user.id, productID, quantity, quantity], (err, result) => {
        if (err) {
            console.error('Error adding to cart:', err);
            return res.status(500).send('Internal Server Error');
        }
        
        res.redirect('/cart');
    });
});

// Update cart quantity
router.post('/cart/update', (req, res) => {
  const { user } = req.session;

  if (!user) {
    return res.redirect('/login'); // Redirect if user is not authenticated
  }

  const productIds = req.body.productIds;
  const quantities = req.body.quantities;

  if (productIds && quantities && productIds.length === quantities.length) {
    productIds.forEach((productId, index) => {
      const quantity = parseInt(quantities[index], 10);
      if (quantity > 0) {
        db.query('UPDATE cart SET quantity = ? WHERE userId = ? AND productID = ?', [quantity, user.id, productId], (err, result) => {
          if (err) {
            console.error('Error updating cart:', err);
          }
        });
      }
    });
  }

  res.redirect('/cart');
});


// Remove from cart
router.post('/cart/remove', (req, res) => {
    const { user } = req.session;
    const { productID } = req.body;

    if (!user) {
        return res.redirect('/login'); // Redirect if user is not authenticated
    }

    db.query('DELETE FROM cart WHERE userId = ? AND productID = ?', [user.id, productID], (err, result) => {
        if (err) {
            console.error('Error removing from cart:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.redirect('/cart');
    });
});

module.exports = router;
