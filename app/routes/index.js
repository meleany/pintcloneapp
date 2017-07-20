'use strict';

var path = process.cwd();
var ClickHandler = require(path + "/app/controllers/clickHandler.server.js");

module.exports = function (app, passport) {
  
  var clickHandler = new ClickHandler();
  
  function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  }
  
  app.route("/")
    .get(function (req, res) {
      res.sendFile(path + "/public/main.html");
    });
  
  app.route("/profile")
    .get(function (req, res) {
      res.sendFile(path + "/public/profile.html");
    });
  
  app.route("/logout")
    .get(function (req, res) {
      req.logout();
      res.redirect("/");
    });

  app.route("/auth/github")
    .get(passport.authenticate("github"));
  
  app.route("/auth/github/callback")
    .get(passport.authenticate("github", {
      successRedirect: "/profile",
      failureRedirect: "/"
    }));
  
  app.route("/api/login")
	  .get(function (req, res) {
      if(req.isAuthenticated()) {
        res.send({logged: true, userid: req.user.github});        
      } else {
        res.send({logged: false});     
      }
	  });
  
  app.route("/api/list")
    .get(clickHandler.getList);
  
  app.route("/api/image")
    .post(function (req, res) {
      clickHandler.addNewImage(req.body);
    });

  app.route("/api/:user")
    .get(clickHandler.getUserList);
  
  app.route("/api/:user/:image/:caption")
    .get(clickHandler.getLikes)
    .post(clickHandler.updateImage)
    .delete(clickHandler.deleteImage);
    
};