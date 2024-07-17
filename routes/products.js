const express = require('express');
const multer = require('multer');
const db = require('../config/db'); // Adjust the path as needed

const router = express.Router();


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/add', upload.array('productImg'), async (req, res) => {
  try {
    const products = JSON.parse(req.body.products);

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'No products provided' });
    }

    products.forEach((product, index) => {
      const { id, productName, category, unitPrice, quantity, description } = product;
      const productImg = req.files[index] ? req.files[index].filename : null;

      const query = `
        INSERT INTO Product (productID, productName, category, unitPrice, quantity, description, productImg)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [id, productName, category, unitPrice, quantity, description, productImg];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error('Error inserting product:', err);
          return res.status(500).json({ message: 'Error inserting product' });
        }
      });
    });

    res.status(200).json({ message: 'Products added successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while adding products' });
  }
});

router.get('/inventory/:id', (req, res) => {
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
    res.render('inventoryUpdate', { product: results[0], title: 'Edit Product'});
  });
});

// Route to handle product update
router.post('/inventory/:id/update', upload.single('productImg'), (req, res) => {
  const productId = req.params.id;
  const { productName, quantity, unitPrice, category, description } = req.body;
  let productImg = req.file ? req.file.filename : req.body.existingImg;

  const query = 'UPDATE Product SET productName = ?, quantity = ?, unitPrice = ?, category = ?, description = ?, productImg = ? WHERE id = ?';
  db.query(query, [productName, quantity, unitPrice, category, description, productImg, productId], (err, results) => {
    if (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ message: 'Error updating product' });
    }
    res.redirect('/inventory');
  });
});

// Route to handle product delete
router.post('/inventory/:id/delete', (req, res) => {
  const productId = req.params.id;
  const query = 'DELETE FROM Product WHERE productID = ?';
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error('Error deleting product:', err);
      return res.status(500).json({ message: 'Error deleting product' });
    }
    res.redirect('/inventory');
  });
});

module.exports = router;
