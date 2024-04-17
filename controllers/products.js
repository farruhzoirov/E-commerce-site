const Products = require('../models/product-mongoose');

const fileHelper = require('../util/file');

const path = require('path');
const fs = require('fs');
const multer = require('multer');
const p = path.join(path.dirname(process.mainModule.filename));
const ITEMS_PER_PAGE = 1;

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add product',
    path: "/admin/add-product"
  });
}
//
//
exports.getAllProduct = (req, res, next) => {
  const page = +req.query.page || 1 ;
  let totalItems;
  Products.find({userId: req.user._id}).countDocuments().then((prodNumber) => {
    totalItems = prodNumber;
    return Products.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
  })
      // .select('title price -_id')
      // .populate('userId')
      .then((products) => {
        console.log(products)
        res.render('admin/products', {
          pageTitle: 'Admin products',
          path: '/products',
          prods: products,
          currentPage: page,
          hasNextPage: page * ITEMS_PER_PAGE < totalItems,
          hasPrevPage: page > 1,
          nextPage: page + 1,
          prevPage: page - 1,
          lastPage: Math.ceil( totalItems / ITEMS_PER_PAGE)
        })
      })
}

exports.postAddProduct = (req, res, next) => {
  const image = req.file;
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;

  if (!image) {
    return res.status(400).send({
      ok: false,
      message: "Attached file's type is not image"
    })
  }

  const imageUrl = image.path;

  const product = new Products({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.user
  });
  product.save()
      .then((products) => {
        console.log(products);
        res.redirect('/');
      })
};


exports.getEditProducts = (req, res, next) => {
  // const editMode = req.query.edit;
  const prodId = req.params.productId;
  console.log(prodId);

  Products.findById(prodId)
      .then((product) => {
        console.log(product)
        res.render('admin/edit-product', {
          pageTitle: 'Edit product',
          editing: true,
          path: '/edit-products',
          product: product
        })
      })
      .catch((err) => {
        console.log(err)
      })
}

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.id;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedPrice = req.body.price;
  const updatedDescription = req.body.description;

  Products.findById(prodId).then((product) => {
    product.title = updatedTitle
    product.imageUrl = updatedImageUrl;
    product.price = updatedPrice;
    product.description = updatedDescription;
    return product.save();
  }).then((product) => {
    console.log(product);
    res.redirect('/');

  })
      .catch((err) => {
        console.log(err)
      })
}
exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.id;
  Products.findById(prodId)
      .then((product) => {
        if (!product) {
          return next(new Error('Product not found.'));
        }
        fileHelper.deleteFile(product.imageUrl);
        return Products.findByIdAndDelete(prodId);
      })
      .then((result) => {
        console.log(result)
        res.redirect('/products');
      }).catch((err) => {
    return next(err);
  })


};


