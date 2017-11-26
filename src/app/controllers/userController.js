'use strict';

var mongoose  = require('mongoose');
var jwt       = require('jsonwebtoken');
var bcrypt    = require('bcrypt');
var User      = mongoose.model('User');
var config    = require('../../../config.js');

// ====== USER ROUTES ======

exports.listAllUsers = function (req, res) {
  User.find({}, { hash_password: 0 }, function (err, user) {
    if (err)
      return res.send(err);
    user.hash_password = undefined;
    return res.status(200).send(user);
  });
};

exports.getUserByID = function (req, res) {
  User.findById(req.params.uid, { hash_password: 0 }, function (err, user) {
    if (err)
      return res.send(err);
    return res.json(user);
  });
};

exports.updateUserByID = function (req, res) {
  User.findByIdAndUpdate(req.params.uid, req.body, { new: true }, function (err, user) {
    if (err) return res.status(500).send("There was a problem updating the user.");

    user.hash_password = undefined;
    return res.status(200).send(user);
  });
};

exports.deleteUserByID = function (req, res) {

  User.findByIdAndRemove(req.params.uid, function (err, user) {
    if (err) {
      return res.status(500).send("There was a problem deleting the user.");
    } else {
      if (user == null) {
        return res.status(200).send("User was already deleted.");
      } else {
        return res.status(200).send("User " + user.name + " is removed");
      }
    }
  });
};