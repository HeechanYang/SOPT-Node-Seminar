var express = require('express');
var router = express.Router();

router.use('/news', require('./news'));

router.get('/', function(req, res, next) {
  res.writeHead(302, {
    'Location': '/postNews.html'
    //add other headers here...
  });
  res.end();
});

module.exports = router;
