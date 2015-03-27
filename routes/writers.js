var express = require('express');
var Article = require('../models/article');

var router = express.Router();

/* GET all writers listing. */
router.get('/', function(req, res, next) {
  Article.distinct('author', function (err, values) {
    if (err) res.send(err);
    res.send(values);
  });
});

/* GET all writers listing from specific site. */
router.get(/\/(.+)/, function(req, res, next) {
  Article.distinct('author', {site_id: req.params[0]}, function (err, values) {
    if (err) res.send(err);
    res.send(values);
  });
});

module.exports = router;
