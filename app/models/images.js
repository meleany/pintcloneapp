'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Imagelink = new Schema({
  username: String,
  caption: String,
  src: String,
  likes: Number,
  voters: []
});

module.exports = mongoose.model("Imagelink", Imagelink);