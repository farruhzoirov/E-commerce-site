const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const MONGODBStore = require('connect-mongodb-session')(session);
const multer = require('multer');
// const csrf = require('csurf');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.json());

const MONGODB_URI = 'mongodb+srv://fzoirov29:9hbVYteBL35W9vu5@cluster0.yycvn5d.mongodb.net/shop?retryWrites=true&w=majority&appName=Cluster0'

const store = new MONGODBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});

// const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})


// const {mongoConnect} = require('./util/db-mongo')
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorRoutes = require('./routes/errors');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

// const mongoConnect = require('./util/db-mongo').mongoConnect;
const Users = require('./models/user');
app.use(express.urlencoded({extended: false}));
app.use('/images', express.static('images'));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store
    }));

app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  Users.findById(req.session.user._id)
      .then((user) => {
        req.user = user;
        next();
      })
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // res.locals.csrfToken = req.csrfToken();
  next();
})


app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorRoutes);


mongoose.connect(MONGODB_URI)
    .then((result) => {
      console.log('Connected!');
      app.listen(5000);
    }).catch((err) => {
  console.error(err)
});
