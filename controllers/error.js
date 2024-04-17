exports.error = (req, res, next) => {
  res.render('404', {
    pageTitle: '404 Found',
    path:"/error"
  })
};