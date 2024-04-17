const express = require('express');

const errorController = require('../controllers/error');

const router = express.Router();


router.get('/reset/:something', errorController.error);


module.exports  = router;
