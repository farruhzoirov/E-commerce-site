const express = require('express');

const authController = require('../controllers/auth');
const { check, body } = require("express-validator");
const router = express.Router();
const User = require('../models/user');

router.get('/login', authController.getLogin);

router.post('/login',
    [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email address.')],
       authController.postLogin);

router.post('/logout', authController.postLogout);

router.post('/signup',
    [check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, {req}) => {
            //   if (value === 'fzoirov29@gmail.com') {
            //     throw new Error('This email address is forbidden!');
            //   }
            //   return true;
           return User.findOne({email: value}).then((user) => {
                if (user) {
                  return Promise.reject('Email exists already. Please pick a different one');
                }
            })
            }
        ),
      body('password', 'This password must be at least 5 character and a valid!')
          .isLength({min: 5})
          .isAlphanumeric(),
      body('confirmPassword').custom((value, {req}) => {
        if (value !== req.body.password) {
          throw  new Error('Passwords have to match');
        }
        return true;
      })
    ],
    authController.postSignup)

router.get('/signup', authController.getSignup);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;