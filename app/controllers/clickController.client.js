'use strict';

(function () {
  
  angular
    .module("pinapp", ["ngResource"])
    .directive("fallback", function () {
      return {
        restrict: "AC",
        link: function (scope, element, attrs) {
          element.bind("error", function (val) {
            element[0].src = "/public/images/placeholder.jpg";
          });
        }
      }
    })
    .directive("thumbnail", function () {
      return {
        restrict: "AC",
        $scope: {imgsrc: "="},
        link: function (scope, element, attrs) {
          
          scope.$watch("imgsrc", function () {
            
          });
        }
      }
    })
    .directive("pinmasonry", function () {
      return {
        restrict: "AC",
        $scope: { reload: "=", selected: "=", picture: "=", hearts: "=" },
        link: function (scope, element, attrs) {
          
          var masonryOptions = { "itemSelector": ".grid-item", "percentPosition": true, "columnWidth": ".grid-sizer", 
                                 "gutter": ".gutter-sizer", "horizontalOrder": true, "fitWidth": true };
          
          setTimeout(function () {
            $(".grid").imagesLoaded(function () {
              $(".grid").masonry(masonryOptions);
            });
          }, 1000);
          
          scope.$watch("reload", function (reload) {
            if(reload) {
              scope.reload = false;
              $(".grid").imagesLoaded(function () {
                $(".grid").masonry('layout');
              });
            }            
          });
          
          scope.$watch("append", function (val) {  // watch append testing image
            if(scope.append) {
              setTimeout(function () {
                $(".grid").imagesLoaded(function () {
                  $(".grid").masonry("reloadItems");
                  $(".grid").masonry('layout');
                });
              }, 100);
              scope.append = false;
            }
          });
          
          scope.$watch("remove", function () {
            if (scope.remove) {
              var object = "#grid-"+scope.selected;
              $(".grid").masonry("remove", $(object));
              setTimeout(function () {
                $(".grid").imagesLoaded(function () {
                  $(".grid").masonry('layout');
                });
              }, 100);
              
              scope.remove = false;
            }
          });
          
        }
      }
    })
    .controller("appController", ["$scope", "$resource", "$http", function ($scope, $resource, $http) {
      
      var fullList, loggedList;
      
      $scope.showModal = false;
      $scope.reload = false;
      $scope.append = false;
      $scope.remove = false;
      $scope.list = [];
      
      
      
      
      $scope.picture = [];
            
      
      
      var loginCheck = $resource("/api/login");
      loginCheck.get(function (res) {
        $scope.logged = res.logged;
        if($scope.logged) {
          $scope.loginName = res.userid.username;
        } else {
          $scope.loginName = "guest";
        }
      });
      
      var imgList = $resource("/api/list");
      imgList.get(function (data) {
        fullList = data.images;
        $scope.list = fullList;
      });
      
      $scope.visit = function (username) {
        var userList = [];
        for(var i=0; i<fullList.length; i++) {
          if(fullList[i].username == username) {
            userList.push(fullList[i]);
          }
        }
        $scope.list = userList;
        $scope.reload = true;
      };
      
      var loginList = $resource("/api/:user", {user: "@username"}); 
      $scope.$watch("loginName", function () {
        if($scope.loginName) {
          loginList.get({user: $scope.loginName}, function (data) {
            loggedList = data.images;
            $scope.userList = loggedList;
          });
        }
      });
      
      $scope.openModal = function () {
        $scope.showModal = true;
      };
      
      $scope.close = function () {
        $scope.imgsrc = "";
        $scope.imgcaption = "";
        $scope.showModal = false;        
      };
      
      $scope.add = function () {
        if($scope.imgsrc) {
          if(!$scope.imgcaption){
            alert("Enter a caption");
          }else{          
            var newImage = {username: $scope.loginName, caption: $scope.imgcaption, src: $scope.imgsrc, likes: 0};
            $http.post("/api/image", newImage).then(function successCallback(response) {
              // this callback will be called asynchronously when the response is available
            }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status
            $scope.userList.push(newImage);
            $scope.showModal = false;
            $scope.reload = true;
            $scope.append = true;
            $scope.imgsrc = "";
            $scope.imgcaption = "";
          }
        }
      };
      
      var selectedImage = $resource("/api/:user/:image/:caption", {user: "@username", image: "@imgsrc", caption: "@caption"});      
      $scope.delete = function (src, ngIndex) {
        selectedImage.delete({user: $scope.loginName, image: src.src, caption: src.caption}, function (res) {});
        var index = $scope.userList.indexOf(src);
        $scope.selected = ngIndex;
        $scope.remove = true;        
      };
      
      $scope.hearts = "";
      
      $scope.addlike = function (img) {
        if($scope.loginName == "guest"){
          alert("Login to leave your like");
        }else{
          var voters = [];
          selectedImage.get({user: img.username, image: img.src, caption: img.caption}, function (res) {
            voters = res.image[0].voters;
            if(voters.length > 0){
              var pos = voters.indexOf($scope.loginName);
              if( pos == -1) {
                voters.push($scope.loginName);
                img.likes++;
              }else{
                voters.splice(pos, 1);
                img.likes--;
              }
              img.voters = voters;
              $http.post("/api/:user/:image/:caption", img).then(function successCallback(response) {
                // this callback will be called asynchronously when the response is available
              }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status            
            }else{
              voters = [];
              voters.push($scope.loginName);
              img.likes++;
              img.voters = voters;
              $http.post("/api/:user/:image/:caption", img).then(function successCallback(response) {
              // this callback will be called asynchronously when the response is available
             }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status            
            }
          
          });
        }
      };
      
    }])
  
})();