var express = require('express');
var Article = require('../models/article');

var router = express.Router();

/* GET articles listing. */
router.get(/\/(.+)/, function(req, res, next) {
  var q_opts = {site_id: req.params[0]};
  if (req.query.query) {
    q_opts['$text'] = {'$search': req.query.query};
  }

  Article.find(q_opts).exec(function (err, articles) {
    if (err) res.send(err);

    res.send(articles);
  });
});

module.exports = router;
