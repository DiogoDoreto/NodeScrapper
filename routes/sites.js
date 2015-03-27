var express = require('express');
var Site = require('../models/site');

var router = express.Router();

/* GET sites listing. */
router.get('/', function(req, res, next) {
  Site.find({}).exec(function (err, sites) {
    if (err) res.send(err);
    res.send(sites);
  });
});

module.exports = router;
