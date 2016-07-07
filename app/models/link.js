var db = require('../config');
var crypto = require('crypto');

var LinkSchema = db.LinkSchema;

LinkSchema.methods.shorten = function() {
  var model = this; // TODO: Figure out receiver

  var shasum = crypto.createHash('sha1');
  shasum.update(model.get('url'));
  model.set('code', shasum.digest('hex').slice(0, 5));
};

var Link = db.mongoose.model('Link', LinkSchema);
module.exports = Link;
