var mongoose = require('mongoose');

var siteSchema = mongoose.Schema({
  _id: String,
  title: String,
  description: String,
  image: String
});

siteSchema.virtual('url').get(function () {
  return this._id;
});
siteSchema.virtual('url').set(function (url) {
  this._id = url;
});

module.exports = mongoose.model('Site', siteSchema);
