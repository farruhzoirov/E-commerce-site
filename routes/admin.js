const express = require('express');
const controllers = require('../controllers/products');
const router = express.Router();

const isAuth = require('../middleware/is-auth');

router.get('/admin/add-product', isAuth.isAuth, controllers.getAddProduct);

router.post('/add-product', isAuth.isAuth ,controllers.postAddProduct);

router.get('/products', isAuth.isAuth, controllers.getAllProduct);
// //

router.post('/delete-product', isAuth.isAuth, controllers.deleteProduct);

// //
router.get('/admin/edit-product/:productId', isAuth.isAuth, controllers.getEditProducts);

// //

router.post('/edit-product',isAuth.isAuth, controllers.postEditProduct);



module.exports = router;



