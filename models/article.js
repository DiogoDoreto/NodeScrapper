var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
  _id: String,
  site_id: String,
  title: String,
  author: {
    name: String,
    url: String,
    twitter: String,
  },
  content: String,
  content_html: String,
  date: Date,
  image: String
});

articleSchema.index({
  title: 'text',
  content: 'text'
});

articleSchema.virtual('url').get(function () {
  return this._id;
});
articleSchema.virtual('url').set(function (url) {
  this._id = url;
});

module.exports = mongoose.model('Article', articleSchema);
