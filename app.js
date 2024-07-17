const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const shopRoutes = require('./routes/shop');
const productRoutes = require('./routes/products');
const favoriteRoutes = require('./routes/favorite');
const salesRoutes = require('./routes/sales');
const db = require('./config/db');
const morgan = require('morgan');

// express app
const app = express();

const options = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'bookshop'
};

const sessionStore = new MySQLStore(options);

//register view engine
app.set('view engine', 'ejs');

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  key: 'session_cookie_name',
  secret: 'your_secret_key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));

// Routes Middleware
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use(authRoutes);
app.use(favoriteRoutes);
app.use(productRoutes);
app.use(cartRoutes);
app.use(shopRoutes);
app.use(salesRoutes);


//listen for requests
app.listen(3000);

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(morgan('dev'));


app.get('/', (req, res) =>{
    res.render('index')
});

app.get('/about', (req, res) =>{
    res.render('about')
});

//redirects
app.get('/about-us', (req, res) => {
    res.redirect('/about');
});

app.get('/homepage', async (req, res) => {
    try {
      // Fetch a limited number of products from the database
      const query = 'SELECT * FROM Product LIMIT 6';
      db.query(query, (err, results) => {
        if (err) {
          console.error('Error fetching products:', err);
          return res.status(500).json({ message: 'Error fetching products' });
        }
        res.render('homepage', { products: results, title: 'Home' });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'An error occurred while fetching products' });
    }
});

app.get('/inventory', async (req, res) => {
  try {
    // Fetch a limited number of products from the database
    const query = 'SELECT * FROM Product ';
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ message: 'Error fetching products' });
      }
      res.render('inventory', { products: results, title: 'Inventory'});
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching products' });
  }
});

app.get('/product/:id', (req, res) => {
  const productId = req.params.id;
  const queryProduct = 'SELECT * FROM Product WHERE id = ?';
  const queryRelatedProducts = 'SELECT * FROM Product WHERE category = (SELECT category FROM Product WHERE id = ?) AND id != ? LIMIT 6';
  
  db.query(queryProduct, [productId], (err, productResults) => {
      if (err) {
          console.error('Error fetching product:', err);
          return res.status(500).json({ message: 'Error fetching product' });
      }
      
      if (productResults.length === 0) {
          return res.status(404).json({ message: 'Product not found' });
      }
      
      const product = productResults[0];
      
      db.query(queryRelatedProducts, [productId, productId], (err, relatedProducts) => {
          if (err) {
              console.error('Error fetching related products:', err);
              // Continue rendering even if related products are not available
              return res.render('details', { product, title: 'Product Details', products: [] });
          }
          
          res.render('details', { product, title: 'Product Details', products: relatedProducts });
      });
  });
});

app.get('/login', (req, res) =>{
    res.render('login', {title : 'Login'})
});

app.get('/signup', (req, res) =>{
    res.render('signup', {title : 'Sign-Up'})
});

app.get('/dashboard', (req, res) =>{
    res.render('dashboard',{title: 'Add Products'})
});


//404 page
app.use((req, res) => {
    res.status(404).render('404')
});