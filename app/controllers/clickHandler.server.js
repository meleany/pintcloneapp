'use strict';

var Imagelink = require("../models/images.js");

function clickHandler () {

  this.getList = function (req, res) {
    Imagelink
      .find({}, {username:1, caption:1, src: 1, likes: 1})
      .exec(function (err, images) {
        if(err) { throw err; }
        if(images) {
          res.send({images});
        }else{
          res.send({images: 0});
        }
      });
  };
  
  this.getUserList = function (req, res) {
    Imagelink
      .find({username: req.params.user}, {username:1, caption:1, src: 1, likes: 1})
      .exec(function (err, images) {
        if(err) { throw err; }
        if(images) {
          res.send({images});
        }else{
          res.send({images: 0});
        }
      });    
  };
  
  this.getLikes = function (req, res) {
    Imagelink
      .find({username: req.params.user, src: req.params.image, caption: req.params.caption}, {username:1, caption:1, src: 1, likes: 1, voters: 1})
      .exec(function (err, image) {
        if(err) { throw err; }
        if(image) {
          res.send({image})
        }else{
          res.send({image: 0})
        }
      });
  };
  
  this.updateImage = function (req, res) {
    if(req) {
      req = req.body;
      Imagelink
        .findOneAndUpdate({username: req.username, src: req.src, caption: req.caption},
                         {likes: req.likes, voters: req.voters}, {upsert: true})
        .exec(function(err, res) {
          if(err) { throw err; }
        });
    }
  };
  
  this.addNewImage = function (req, res, err) {
    if(req) {
      var newImagelink = new Imagelink();
      newImagelink.username = req.username;
      newImagelink.caption = req.caption;
      newImagelink.src = req.src;
      newImagelink.likes = req.likes;
      newImagelink.save(function (err) {
        if(err) { throw err; }
      });
    }
  };
  
  this.deleteImage = function (req, res, err) {
    Imagelink
      .findOne({username: req.params.user, src: req.params.image, caption: req.params.caption})
      .remove().exec(function (err) {
        if(err) { throw err; }
        res.json({message: "Image has been deleted from database"});
      });
  };
  
}

module.exports = clickHandler;