var _ = require('underscore');
var cheerio = require('cheerio');
var debug = require('debug')('NodeScrapper:parser');
var request = require('request');
var Promise = require('promise');

// This class will parse the contents of a page, get basic information and
// find all article links. Then it will request each article and extract the
// relevant informations.
//
// Example:
// var Parser = require('./parser');
// var p = new Parser('http://techcrunch.com');
// p.start().then(function (data) {
//   console.log(data);
// }, function (err) {
//   console.error(err);
// });
//
// `data` will have the following structure:
// {
//   siteInfo: {
//     url: 'http://...',
//     title: 'Site Title',
//     description: 'Site description',
//     image: 'http://...'
//   },
//   articles: [
//     {
//       title: 'Article title',
//       url: 'http://...',
//       author: {
//         name: 'John',
//         url: 'http://...',
//         twitter: 'http://twitter.com/john'
//       }
//       content: 'Full content',
//       content_html: 'Full HTML content',
//       date: 'Posted date',
//       image: 'http://'
//     },
//     { ... }
//   ]
// }
var Parser = function (url) {
  this.siteInfo = {url: url};
  this.articles = [];
};

// Start will fecth and parse every needed link. Returns a promise.
Parser.prototype.start = function() {
  var p = this;

  return p._fecthLink(p.siteInfo.url)
    .then(function (body) {
      return p._parseHomePage(body);
    })
    .then(function (links) {
      var pLinks = links.map(function (l) {
        return p._fecthLink(l).then(function (body) {
          var article = p._parseArticle(body);
          article.url = l;
          p.articles.push(article);
        });
      });

      return Promise.all(pLinks);
    })
    .then(function (articles) {
      return {
        siteInfo: p.siteInfo,
        articles: p.articles
      };
    });
};

// Fetch a URL. Returns a promise which resolves with the body contents.
Parser.prototype._fecthLink = function(url) {
  return new Promise(function (resolve, reject) {
    request(url, function (err, res, body) {
      if (err) {
        reject(err);
        return;
      }
      if (res.statusCode != 200) {
        reject(new Error('Bad status code'));
        return;
      }

      debug('Got link: ' + url);

      resolve(body);
    });
  }.bind(this));
};

// Parses the body of a home page. Returns the found links and fill this.siteInfo data.
Parser.prototype._parseHomePage = function (body) {
  var p = this;
  var $ = cheerio.load(body);

  $('meta').each(function () {
    var el = $(this);
    switch (el.attr('property')) {
      case 'og:title': p.siteInfo.title = el.attr('content'); break;
      case 'og:description': p.siteInfo.description = el.attr('content'); break;
      case 'og:image': p.siteInfo.image = el.attr('content'); break;
    }
  });

  var tcLink = new RegExp('http://techcrunch.com/\\d{4}/\\d{2}/\\d{2}/.+');
  var links = {};

  $('a').each(function () {
    var el = $(this);
    var href = el.attr('href');

    if (!tcLink.test(href)) return;

    var i = href.indexOf('#');
    if (i >= 0) {
      href = href.substr(0, i);
    }
    links[href] = true;
  });

  return _.keys(links);
};

// Parses the body of an article. Returns its information.
Parser.prototype._parseArticle = function (body) {
  var article = {};

  var $ = cheerio.load(body);
  var $article = $('article').eq(0);

  article.title = $article.find('h1').text();
  article.author = {
    name: $article.find('a[rel=author]').text(),
    url: this.siteInfo.url + $article.find('a[rel=author]').attr('href'),
    twitter: $article.find('span.twitter-handle a').attr('href')
  };
  article.content = $article.find('.article-entry').text().trim();
  article.content_html = $article.find('.article-entry').html().trim();
  article.date = $article.find('time').attr('datetime');
  article.image = $article.find('img.img-hero').attr('src') || $article.find('.article-entry img').eq(0).attr('src');

  return article;
};

module.exports = Parser;
