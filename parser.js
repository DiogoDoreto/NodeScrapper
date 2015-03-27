var _ = require('underscore');
var cheerio = require('cheerio');
var debug = require('debug')('NodeScrapper:parser');
var request = require('request');

// This function will parse the contents of a page, get basic information and
// find all article links. Then it will request each article and extract the
// relevant informations.
//
// Example:
// var parser = require('parser');
// parser('http://techcrunch.com', function (data) {
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
//       title: 'Article title'
//       url: 'http://...'
//       author: {
//         name: 'John'
//         url: 'http://...'
//         twitter: 'http://twitter.com/john'
//       }
//       content: 'Full content'
//       date: 'Posted date'
//       image: 'http://'
//     },
//     { ... }
//   ]
// }
var Parser = function (url, onsuccess, onerror) {
  var responseData = {
    siteInfo: {url: url},
    articles: []
  };
  var _links = [];

  var noop = function () {};
  onsuccess = onsuccess || noop;
  onerror = onerror || noop;

  // start processing
  parseHomePage(url, parseLinks, onerror);


  // request home page and process it
  function parseHomePage(url, onsuccess, onerror) {
    var tcLink = new RegExp('http://techcrunch.com/\\d{4}/\\d{2}/\\d{2}/.+');

    request(url, function (err, res, body) {
      if (err) {
        onerror(err);
        return;
      }
      if (res.statusCode != 200) {
        onerror(new Error('Bad status code'));
        return;
      }

      debug('Got homepage: ' + url);

      var $ = cheerio.load(body);

      $('meta').each(function () {
        var el = $(this);
        switch (el.attr('property')) {
          case 'og:title': responseData.siteInfo.title = el.attr('content'); break;
          case 'og:description': responseData.siteInfo.description = el.attr('content'); break;
          case 'og:image': responseData.siteInfo.image = el.attr('content'); break;
        }
      });

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

      _links = _.keys(links);

      onsuccess();
    });
  }

  // loop throught found links and request and parse then
  function parseLinks() {
    var doneCount = 0;
    var total = _links.length;

    for (var i = 0; i < total; i++) {
      parseArticle(_links[i], function (data) {
        responseData.articles.push(data);
        done();
      }, function (err) {
        error('ParseArticle', err);
        done();
      });
    }

    function done() {
      doneCount++;
      if (doneCount === total) onsuccess(responseData);
    }
  }

  // request an article and process it
  function parseArticle(url, onsuccess, onerror) {
    request(url, function (err, res, body) {
      if (err) {
        onerror(err);
        return;
      }
      if (res.statusCode != 200) {
        onerror(new Error('Bad status code'));
        return;
      }

      debug('Got article: ' + url);

      var data = {}

      var $ = cheerio.load(body);
      var article = $('article').eq(0);

      data.title = article.find('h1').text();
      data.url = url;
      data.author = {
        name: article.find('a[rel=author]').text(),
        url: responseData.siteInfo.url + article.find('a[rel=author]').attr('href'),
        twitter: article.find('span.twitter-handle a').attr('href')
      };
      data.content = article.find('.article-entry').html();
      data.date = article.find('time').attr('datetime');
      data.image = article.find('img.img-hero').attr('src');

      if (!data.image) {
        data.image = article.find('.article-entry img').eq(0).attr('src');
      }

      onsuccess(data);
    });
  }
}

module.exports = Parser;
