const express = require('express');
const controllers = require('../controllers/shop');
const router = express.Router();
const isAuth = require('../middleware/is-auth');

router.get('/', controllers.getAllProducts);
//
router.get('/product-cart', isAuth.isAuth, controllers.getCart);
//
router.post('/cart', isAuth.isAuth, controllers.postCart);
//
router.post('/cart-delete-item', isAuth.isAuth, controllers.postDeleteCart);
//
router.post('/create-order', isAuth.isAuth, controllers.postOrder);
//
router.get('/orders', isAuth.isAuth, controllers.getOrders);


router.get('/get-product/:productId', controllers.getProduct);

router.get('/orders/:orderId', isAuth.isAuth,  controllers.getInvoice);


module.exports = router;