const Products = require('../models/product-mongoose');
const Orders = require('../models/orders');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');


const ITEMS_PER_PAGE = 1;

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  console.log(prodId)
  Products.findById(prodId)
      .then((product) => {
        console.log(product)
        res.render('shop/product-detail', {
          pageTitle: 'Product Details',
          path: '/details',
          product: product,
          isAuthenticated: req.isLoggedIn,
        })
      })
}


exports.getAllProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Products.find().countDocuments().then((prodNumber) => {
    totalItems = prodNumber;
    return Products.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
  }).then((products) => {
    res.render('shop/product-list', {
      pageTitle: 'All products',
      path: '/',
      products: products,
      isAuthenticated: req.session.isLoggedIn,
      currentPage: page,
      hasNextPage: page * ITEMS_PER_PAGE < totalItems,
      hasPrevPage: page > 1,
      nextPage: page + 1,
      prevPage: page - 1,
      lastPage: Math.ceil( totalItems / ITEMS_PER_PAGE)
    })
  }).catch((err) => {
    console.log(err)
  })
}

exports.getCart = (req, res, next) => {
  req.user.populate('cart.items.productId').then((products) => {
    console.log(products.cart.items)
    res.render('shop/cart', {
      pageTitle: 'Cart',
      path: '/cart',
      products: products.cart.items,
      isAuthenticated: req.session.isLoggedIn
    })
  }).catch((err) => {
    console.log(err)
  })
}

exports.postCart = (req, res, next) => {
  console.log(req);
  const prodId = req.body._id;
  Products.findById(prodId)
      .then(product => {
        return req.user.addToCart(product);
      })
      .then((result) => {
        console.log(result)
        res.redirect('/product-cart');
      })
}


exports.getOrders = (req, res, next) => {
  Orders.find({"user.userId": req.user._id})
      .then((orders) => {
        console.log(orders)
        res.render('shop/orders', {
          pageTitle: 'Orders',
          path: "/orders",
          orders,
          isAuthenticated: req.session.isLoggedIn
        })
      });
}

exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId').then((user) => {
    const products = user.cart.items.map(i => {
      return {quantity: i.quantity, product: {...i.productId._doc}}
    });
    const order = new Orders({
      user: {
        email: req.user.email,
        userId: req.user
      },
      products: products
    })
    return order.save();
  }).then((result) => {
    return req.user.clearCart();
  })
      .then(() => {
        res.redirect('/orders');
      })
}

exports.postDeleteCart = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
      .then(() => {
        res.redirect('/product-cart');
      })
      .catch((err) => {
        console.log(err)
      })
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Orders.findById(orderId)
      .then((order) => {
        if (!order) {
          return next(new Error('No order found.'));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
          return next(new Error('Unauthorized.'));
        }
        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join('data', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=' + invoiceName);
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
          underline: true,
        });
        let totalPrice = 0;
        order.products.forEach((prod) => {
          totalPrice += prod.quantity * prod.product.price;
          pdfDoc.text(prod.product.title + '-' + prod.quantity + 'x' + '$' + prod.product.price);
        })
        pdfDoc.text('Total Price: $' + totalPrice);

        pdfDoc.end();


        // fs.readFile(invoicePath, (err, data) => {
        //   if (err) {
        //     return next(err);
        //   }
        //
        //   res.setHeader('Content-Type', 'application/pdf');
        //   res.setHeader('Content-Disposition', 'inline; filename=' + invoiceName);
        //   res.send(data);
        // });

        // const file = fs.createReadStream(invoicePath);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename=' + invoiceName);
        // file.pipe(res);
      }).catch((err) => {
    next(err);
  })
}
