var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, null, null, function(error, results) {
    if (error) {
      throw error;
    } else {
      res.status(200).send(results);
    }
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.find({url: uri}, null, null, function(err, results) {
    if (results.length === 0) {
      // create new instance 
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        // create instance with title

        var newLink = new Link({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.shorten();
        newLink.save(function (err, link) {
          if (err) {
            return console.error(err);
          }
          res.status(200).send(link);
        });
      });
    } else {
      res.status(200).send(results[0]);
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({ username: username }, null, null, function(err, result) {
    if (err) { throw err; }
    if (result.length === 0) {
      return res.redirect('/login');
    }

    result[0].comparePassword(password, function(err, match) {
      if (err) { throw err; }

      if (!match) {
        res.redirect('/login');
      } else {
        util.createSession(req, res, result[0]);
      }
    });
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username}, function(err, result) {
    if (err) { throw err; }
    if (result.length !== 0) {
      console.log('Account already exists');
      return res.redirect('/signup');
    } else {
      var newUser = new User({ username: username, password: password });

      newUser.hashPassword();
      newUser.save(function(err, result) {
        if (err) { throw err; }
        util.createSession(req, res, result);
      });
    }
  });
};

exports.navToLink = function(req, res) {
  Link.find({ code: req.params[0] }, function(err, result) {
    if (err) { throw err; }

    if (result.length === 0) {
      res.redirect('/');
    } else {
      result[0].set({ visits: result[0].get('visits') + 1 }).save(function(err, link) {
        if (err) { throw err; }
        return res.redirect(link.get('url'));
      });
    }
  });
};