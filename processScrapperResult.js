var debug = require('debug')('NodeScrapper:processResult');
var Site = require('./models/site');
var Article = require('./models/article');

function processResult(data) {
  site = new Site(data.siteInfo);

  Site.update({_id: site._id}, site.toObject(), {upsert: true}, function (err) {
    if (err) debug('ERROR', err);

    processArticles(data.articles);
  });
}

function processArticles(articles) {
  for (var i = 0, l = articles.length; i < l; i++) {
    var article = new Article(articles[i]);

    Article.update({_id: article._id}, article.toObject(), {upsert: true}, function (err) {
      if (err) debug('ERROR', err);
    });
  }
}

module.exports = processResult
