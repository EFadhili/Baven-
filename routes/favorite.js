const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Add to favorite
router.post('/favorite/add', (req, res) => {
    const { user } = req.session;
    const { productID } = req.body;

    if (!user) {
        return res.redirect('/login'); // Redirect if user is not authenticated
    }

    db.query('INSERT INTO favorite (userId, productID) VALUES (?, ?)', [user.id, productID], (err, result) => {
        if (err) {
            console.error('Error adding to favorite:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.redirect('/favorite');
    });
});

// Remove from favorite
router.post('/favorite/remove', (req, res) => {
    const { user } = req.session;
    const { productID } = req.body;

    if (!user) {
        return res.redirect('/login'); // Redirect if user is not authenticated
    }

    db.query('DELETE FROM favorite WHERE userId = ? AND productID = ?', [user.id, productID], (err, result) => {
        if (err) {
            console.error('Error removing from favorite:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.redirect('/favorite');
    });
});

// Display favorite items
router.get('/favorite', (req, res) => {
    const { user } = req.session;

    if (!user) {
        return res.redirect('/login'); // Redirect if user is not authenticated
    }

    db.query('SELECT f.*, p.productImg, p.productName, p.unitPrice FROM favorite f JOIN product p ON f.productID = p.id WHERE f.userId = ?', [user.id], (err, favoriteItems) => {
        if (err) {
            console.error('Error retrieving favorite items:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.render('favorite', { title: 'Your Favorites', user, favoriteItems });
    });
});

module.exports = router;
