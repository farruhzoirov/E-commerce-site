const User = require('../models/user');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const {validationResult} = require("express-validator");


const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'horace.friesen@ethereal.email',
    pass: 'Xz7bKPe2GjEFvkg9Zc'
  }
});

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie').split(';')[4].trim().split('=')[1] === 'true';
  let message = req.flash('error');
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  // console.log(isLoggedIn)
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    },
    validationErrors: []
  });
};


exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: req.body.email,
        password: req.body.password
      },
      validationErrors: errors.array()
    });
  }
  User.findOne({email: email}).then((user) => {
    if (!user) {
      // req.flash('error', 'Invalid email or password.')
      // return res.redirect('/login');
      return res.status(422).render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: 'Invalid email or password.',
        oldInput: {
          email: req.body.email,
          password: req.body.password
        },
        validationErrors: errors.array()
      });
    }
    bcrypt.compare(password, user.password).then((doMatch) => {
      if (doMatch) {
        req.session.isLoggedIn = true; // 2. Setting session variables
        req.session.user = user;
        return req.session.save(() => {
          res.redirect('/');
        });
      } else {
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {
            email: req.body.email,
            password: req.body.password
          },
          validationErrors: errors.array()
        });
      }
    }).catch((err) => {
      console.log(err);
      res.redirect('/login');
    });
  });
}

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};


exports.postSignup = (req, res, next) => {
  console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array())
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Sign Up',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array()
    });
  }
  bcrypt.hash(password, 12)
      .then((hashPassword) => {
        const user = new User({
          email: email,
          password: hashPassword,
          cart: {items: []}
        })
        return user.save()
      }).catch((err) => {
    console.log(err)
  })
      .then((result) => {
        console.log(result);
        res.redirect('/login');
      })
      .catch((err) => {
        console.log(err)
      })
}


exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Sign Up',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  })
}


exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  })
}


exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      res.flash("error", 'There is error!');
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
        .then((user) => {
          if (!user) {
            res.flash('error', "No account with that email");
            res.redirect('/reset');
          }
          user.resetToken = token;
          user.resetTokenExpiration = Date.now() + 3600000;
          return user.save();

        }).then((result) => {
      res.redirect('/');
      transporter.sendMail({
        from: 'fzoirov29@gmail.com',
        to: req.body.email,
        subject: "Password reset",
        text: "Hello world?",
        html: `
            <p>Your requested a reset</p>
            <p>Click this <a href="https://localhost:5000/reset/${token}">link</a> to set a password</p>
          `
      })
          .then((result) => {
            console.log("Email:", result)
          }).catch((err) => {
        console.log('Sending email', err)
      })

    }).catch((err) => {
      console.log(err)
    })
  })
}


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}}).then((user) => {
    if (!user) {
      res.flash('error', 'Invalid token');
      return res.redirect('/reset');
    }
    let message = req.flash('error');
    if (message.length) {
      message = message[0];
    } else {
      message = null;
    }
    // console.log(isLoggedIn)
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'Update password',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  })
}

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({resetToken: passwordToken, _id: userId, resetTokenExpiration: {$gt: Date.now()}})
      .then((user) => {
        resetUser = user
        return bcrypt.hash(newPassword, 12)
      }).then((hashedPassword) => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save()
  }).then((result) => {
    console.log(result);
    res.redirect('/login');
  })
}






