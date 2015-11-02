angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, appDB) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
              //POUCHDB -------------
  appDB.initDB();
})

.controller('MyProfileCtrl', function($scope, $state, $ionicPopup, auth, appDB, $ionicHistory) {
    appDB.initDB();
    $scope.activeUser;
    $scope.auth = auth;
    $scope.newData = {
        phone: ''
    }

    appDB.getUser(auth.profile.user_id).then(function(user){
        $scope.activeUser = user;
        console.log(user.rating);
    });
    $scope.updateUser = function(phone){
        var user = {
            _id: auth.profile.user_id,
            _rev: $scope.activeUser._rev,
            phone: phone,
            rating: 0,
            type: 'user',
            status: 'OK'
        }
        appDB.addUser(user).then(function(){
          var alertPopup = $ionicPopup.alert({
              title: '¡Actualización Exitosa!',
              template: 'Tus datos han sido actualizados con éxito'
          });
          $ionicHistory.nextViewOptions({
              disableBack: true
          });
          $state.go('app.news', {}, {reload: true});
        }, function(err){
            console.log(JSON.stringify(err))
          var alertPopup = $ionicPopup.alert({
              title: 'Actualización Fallida',
              template: 'Ha ocurrido un problema con tu actualización'
          });
        });
    }
})

.controller('RegisCtrl', function($scope, $ionicPopup, appDB, $http) {
  appDB.initDB();
  $scope.user = {};
  $scope.createUser = function(email, name, lastname, phone, password){
    var user = {
      _id: email,
      name: name,
      lastname: lastname,
      phone: phone,
      password: password,
      type: 'user'
    }
    appDB.addUser(user).then(function(){
      var alertPopup = $ionicPopup.alert({
          title: '¡Registro Exitoso!',
          template: 'Te has con éxito'
      });
    }, function(err){
      var alertPopup = $ionicPopup.alert({
          title: 'Registro Fallido',
          template: 'Ha ocurrido un problema con tu registro'
      });
    });

  }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

.controller('LoginCtrl', function($scope, $location, $ionicHistory, $ionicPopup, store, auth, $state, appDB, authService) {
    appDB.initDB();
    $scope.data = {};

//    $scope.login = function() {
    auth.signin({
        container: 'hiw-login-container',
        dict: 'es',
        authParams:{
            scope: 'openid offline_access',
            device: 'Mobile device'
        }
    }, function(profile, token, accessToken, state, refreshToken){
        store.set('profile', profile);
        store.set('token', token);
        store.set('refreshToken', refreshToken);

        appDB.getUser(auth.profile.user_id).then(function(doc){
            if(doc.status === 404){
                console.log("Usuario nuevo");
                var user = {
                    _id : auth.profile.user_id,
                    phone: 'Escribe un número para que puedan contactarte',
                    rating: 0,
                    type: 'user',
                    status: 'OK'
                }
                appDB.addUser(user).then(function(){
                    var alertPopup = $ionicPopup.alert({
                        title: '¡Registro Exitoso!',
                        template: 'Por favor edita tus datos en tu perfil'
                    });
                    $location.path('/');
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('app.myprofile');
                });
            }else if (doc.status === "OK") {
                console.log("Login", 'Usuario registrado', JSON.stringify(doc));
                authService.callUser(auth.profile.user_id).then(function(user){
                    $scope.data = user.data;
                    var alertPopup = $ionicPopup.alert({
                        title: '¡Bienvenido!',
                        template: 'Bienvenido '+$scope.data.nickname
                    });
                    $location.path('/');
                    $ionicHistory.nextViewOptions({
                        disableBack: true
                    });
                    $state.go('app.news');
                });
            }
        });

        //appDB.addUser(user).then(function(){
        //    console.log('Registrado en appDB');
        //}, function(err){});
    }, function(){
        //error
    });
//    }
})

.controller('PubsCtrl', function($scope, $q, $ionicPopup, $state, $cordovaGeolocation, appDB, authService, utilService, ngFB, auth){
  appDB.initDB();
  pubs = appDB.getPublications();
  $q.when(pubs.then(function(docs) {
      for(var i in docs){
          (function (i){
              appDB.getAttachment(docs[i]._id).then(function(blob){
                  docs[i].pubImage = URL.createObjectURL(blob);
                  return docs[i];
              });
              getReporter(docs[i].reporter).then(function(data){
                  docs[i].reporterData = data;
                  docs[i].showID = utilService.stringDate(new Date(docs[i]._id));
                  return docs[i];
              });
          })(i);
      }
      $scope.docs = docs;
  }));

  getReporter = function(reporterID){
      return authService.callUser(reporterID).then(function(reporter){
          return reporter.data;
      });
  }

  $scope.doRefresh = function() {
      
      appDB.initDB();
      pubs = appDB.getPublications();
      $q.when(pubs.then(function(docs) {
          for(var i in docs){
              (function (i){
                  appDB.getAttachment(docs[i]._id).then(function(blob){
                      docs[i].pubImage = URL.createObjectURL(blob);
                      return docs[i];
                  });
                  getReporter(docs[i].reporter).then(function(data){
                      docs[i].reporterData = data;
                      docs[i].showID = utilService.stringDate(new Date(docs[i]._id));
                      return docs[i];
                  });
              })(i);
          }
          $scope.docs = docs;
      }));
      console.log("Aparently finished")
      $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.fbShare = function (message) {
      var ids = auth.profile.identities;
      var isFB = false;
      var id = 0;
      for(var id in ids){
          if(ids[id].provider === 'facebook'){isFB = true};
      }
      if(!isFB){
          var alertPopup = $ionicPopup.alert({
              title: 'Error de conexiones',
              template: 'No estas conectado a través de facebook'
          });
          return;
      }
      console.log("Trying to share");
      var toky = auth.profile.identities[id].access_token;

      console.log("Token",toky);

      ngFB.init({appId: '199784313686540', accessToken: toky});
      ngFB.api({
          method: 'POST',
          path: '/me/feed',
          params: {
              message: message
          }
      }).then(
          function () {
              console.log("Nice");
              var alertPopup = $ionicPopup.alert({
                  title: 'Facebook',
                  template: 'Se ha compartido exitosamente'
              });
          },
          function (err) {
              console.log("Tabarnacle", JSON.stringify(err));
              var alertPopup = $ionicPopup.alert({
                  title: 'Error',
                  template: JSON.stringify(err)
              });
          });
  };
})

.controller('PubCtrl', function($scope, $state, $ionicModal, $cordovaGeolocation, appDB, authService, utilService) {

	$ionicModal.fromTemplateUrl('templates/publication.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});

    $scope.mySearch = function(breed){
        console.log("Searching for: ",breed);
    };


  $scope.closePub = function() {
    $scope.modal.hide();
    $scope.modal.remove();
    $scope.pub = null;
    $scope.reporter = null;
	$ionicModal.fromTemplateUrl('templates/publication.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});
  };

  // Open the publication modal details window

  $scope.openPub = function(pubId) {
    appDB.getPublication(pubId).then(function(pub){
        pub.showID = utilService.stringDate(new Date(pub._id));
        console.log(pub.showID);
        blobUtil.base64StringToBlob(pub._attachments.pubImage.data).then(function(blob){
            $scope.pubImageURL = URL.createObjectURL(blob);
        })
        authService.callUser(pub.reporter).then(function(reporter){
            $scope.reporter = reporter.data;
        });
    	$scope.pub = pub;
    	$scope.latLng = new google.maps.LatLng($scope.pub.location.lat, $scope.pub.location.lng);

		$scope.mapOptions = {
			center: $scope.latLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		$scope.modal.show();
    	$scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);
    	$scope.flag = new google.maps.InfoWindow({map: $scope.map});
    	$scope.flag.setPosition($scope.pub.location);
    	$scope.flag.setContent('Ubicación aproximada');

    });


  };
})

.controller('PublishCtrl', function($scope, $state, $location, $cordovaGeolocation, $ionicHistory,
                                    $ionicPopup, GetUU, appDB, auth, camService) {
    appDB.initDB();
    $scope.pub = {
        breed: "Akita",
        size: 2,
        reporter: auth.profile.user_id
    }
  var defaultPic = "img/profile_default_pet.jpg";
  var options = {timeout: 10000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    $scope.pub.pos = {lat: position.coords.latitude, lng: position.coords.longitude};

  }, function(error){
		console.log("Could not get location");
  });
  $scope.createPub = function(reporter, breed, size, description, name, pos, imageSrc){
  	console.log('Creating register', reporter, breed, size, description, name, pos, imageSrc);
    console.log("SRC", imageSrc);

    blobUtil.imgSrcToBlob(imageSrc).then(function(blob){
        var id = new Date();
        id.setHours(id.getHours()-5);
        var exp = new Date(id);
        exp.setDate(id.getDate()+30)
        var publication= {
          _id: id.toISOString(),
          expirationDate: exp.toISOString(),
          reporter: reporter,
          adopter: [],
          description: description,
          size: size,
          breed: breed,
          name: name,
          state: 'ACTIVE',
          type: 'animal',
          location: pos,
          _attachments:{
              'pubImage': {
                  content_type: 'image/jpg',
                  data: blob
              }
          }
        }
        appDB.addPublication(publication).then(function(){
            var alertPopup = $ionicPopup.alert({
              title: '¡Publicación Exitosa!',
              template: '´Tu publicación ha sido registrada con éxito'
            });
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $state.go('app.news');
            $scope.myPicture = defaultPic;
        }).catch(function(err){
              console.log(JSON.stringify(err));
            var alertPopup = $ionicPopup.alert({
              title: 'Publicación Fallida',
              template: 'Ha ocurrido un problema: ' + JSON.stringify(err)
            });
          });
        console.log(JSON.stringify(publication));
    });
  }
  //----------------------CAMERA---------------------
  // init variables
  $scope.myPicture = defaultPic;
  $scope.cameraData = {};
  var destinationType;
  var sourceTypeCam;
  var sourceTypeLoad;

  // on DeviceReady check if already logged in (in our case CODE saved)
  ionic.Platform.ready(function() {
    //console.log("ready get camera types");
    if (!navigator.camera){
      return;
    }
    destinationType = navigator.camera.DestinationType.FILE_URI;
    sourceTypeCam = navigator.camera.PictureSourceType.CAMERA;
    sourceTypeLoad = navigator.camera.PictureSourceType.PHOTOLIBRARY
    });

  // get upload URL for FORM
    GetUU.query(function(response) {
        $scope.cameraData = response;
        //console.log("got upload url ", $scope.data.uploadurl);
    });

    $scope.optionsCam = {
        quality: 100,
        destinationType: destinationType,
        targetWidth: 800,
        targetHeight: 600,
        sourceType: sourceTypeCam,
        encodingType: 0,
        saveToPhotoAlbum: true
    };
    $scope.optionsLoad = {
        quality: 50,
        destinationType: destinationType,
        targetWidth: 800,
        targetHeight: 600,
        sourceType: sourceTypeLoad,
        encodingType: 0
    };
    $scope.getPicture = function(options){
        camService.getPicture(options).then(function(picture){
            console.log("Photo", picture);
            $scope.myPicture = picture;
        }, function(err){
            var alertPopup = $ionicPopup.alert({
              title: 'Error de captura',
              template: 'Ha ocurrido un problema: ' + JSON.stringify(err)
            });
            console.err(err);
        });
    }
});
