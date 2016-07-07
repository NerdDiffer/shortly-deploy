var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/shortly');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  username: String,
  password: String
});

var LinkSchema = new Schema({
  url: String,
  code: String,
  title: String,
  baseUrl: String,
  visits: {
    min: 0,
    default: 0,
    type: Number
  }
});

module.exports = {
  mongoose: mongoose,
  UserSchema: UserSchema,
  LinkSchema: LinkSchema
};