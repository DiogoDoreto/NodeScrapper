var express = require('express');
var Article = require('../models/article');

var router = express.Router();

/* GET articles listing. */
router.get(/\/(.+)/, function(req, res, next) {
  Article.find({site_id: req.params[0]}).exec(function (err, articles) {
    if (err) res.send(err);

    res.send(articles);
  });
});

module.exports = router;
