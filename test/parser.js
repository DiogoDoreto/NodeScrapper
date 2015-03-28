var fs = require('fs');
var expect = require('chai').expect;
var Parser = require('../parser');

describe('Parser', function () {
  describe('#_parseHomePage', function () {
    it('should parse correctly', function () {
      var body = fs.readFileSync(__dirname + '/data/home.html');
      var p = new Parser('http://techcrunch.com');

      var links = p._parseHomePage(body);
      var siteInfo = p.siteInfo;

      expect(links).to.have.length(19);
      expect(siteInfo).to.deep.equal({
        title: 'TechCrunch',
        description: 'TechCrunch is a leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.',
        image: 'https://s0.wp.com/wp-content/themes/vip/techcrunch-2013/assets/images/logo-large.png',
        url: 'http://techcrunch.com'
      });
    })
  });

  describe('#_parseArticle', function () {
    it('should parse correctly', function () {
      var body = fs.readFileSync(__dirname + '/data/article.html');
      var p = new Parser('http://techcrunch.com');

      var article = p._parseArticle(body);

      expect(article).to.deep.equal({
        title: 'The Live Stream Goes Mainstream',
        author: {
          name: 'Sarah Perez',
          twitter: 'https://twitter.com/sarahintampa',
          url: 'http://techcrunch.com/author/sarah-perez/'
        },
        content: 'Example of content.',
        content_html: '<img src="https://tctechcrunch2011.files.wordpress.com/2015/03/live-streaming-meerkat-periscope.png?w=738" class=""> Example of <strong>content</strong>.',
        date: '2015-03-27 11:46:47',
        image: 'https://tctechcrunch2011.files.wordpress.com/2015/03/live-streaming-meerkat-periscope.png?w=738'
      });
    })
  });
});
