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

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('MyProfileCtrl', function($scope, auth, appDB) {
    appDB.initDB();
    $scope.activeUser;
    $scope.auth = auth;

    appDB.getUser(auth.profile.user_id).then(function(user){
        $scope.activeUser = user;
        console.log(user.rating);
    });
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

.controller('LoginCtrl', function($scope, $location, $ionicPopup, store, auth, $state, appDB, authService) {
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
            console.log(JSON.stringify(doc));
            if(doc.status === 404){
                console.log("Usuario nuevo");
                var user = {
                    _id : auth.profile.user_id,
                    phone: '',
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

.controller('PubsCtrl', function($scope, $state, $cordovaGeolocation, appDB, authService, utilService,ngFB){
  $scope.docs;
  $scope.showID;

  appDB.initDB();
  pubs = appDB.getPublications();
  pubs.then(function(docs) {
      for(var i in docs){
          (function (i){
              $scope.getReporter(docs[i].reporter).then(function(data){
                  docs[i].reporterData = data;
                  $scope.showID = utilService.stringDate(new Date(docs[i]._id));
                  return docs[i];
              });
          })(i);
      }
      $scope.docs = docs;
      //console.log(JSON.stringify($scope.docs))
  });
  $scope.getReporter = function(reporterID){
      return authService.callUser(reporterID).then(function(reporter){
          return reporter.data;
      });
  }

  $scope.share = function (event, auth) {
      console.log("Trying to share");
      console.log(auth.profile.identities.access_token);
      ngFB.api({
          method: 'POST',
          path: '/me/feed',
          params: {
              message: "Este animalito se encuentra solitario. Adóptalo con AdoptApp."
          },
          headers: {Authorization: auth.profile.identities.access_token}
      }).then(
          function () {
              console.log("Nice");
              alert('Se ha comartido satisfactoriamente');
          },
          function () {
              console.log("Tabarnacle");
              alert('Un error ocurrió al compartir en Facebook');
          });
  };

  $scope.cards = [
    {id: 1, date: 'Ayer'            , description:'Encontré este perrito debajo de un puente. Ya lo vacuné y quiero que alguien lo cuide porque económicamente no puedo.', breed: 'Beagle', photo: 'img/beagle1.jpg', reporter: 'Mateo Nieto',userPhoto: 'img/test-photo.jpg'},
    {id: 2, date: '10 de Octubre'   , description:'Una mamá pincher dió a luz a cachorritos y están todos disponibles para adopción.', breed: 'Pincher', photo: 'img/pincher1.jpg', reporter: 'Carlos Useche',userPhoto: 'img/test-photo2.jpg'},
    {id: 3, date: '30 de Septiembre', description:'Ya no tengo los medios para mantener a mi gato. Si alguien lo quiere cuidar.', breed: 'Snowshoe', photo: 'img/snowshoe1.jpg', reporter: 'Carlos Useche',userPhoto: 'img/test-photo2.jpg'},
    {id: 4, date: '29 de Septiembre', description:'asasssa sas sa   as as ablablablabal', breed: 'Pastor Alemán', photo: 'img/perro.jpg', reporter: 'Pepito1'},
    {id: 5, date: '15 de Septiembre', description:'asasssa sas sa   as as ablablablabal', breed: 'Persa', photo: 'img/perro.jpg', reporter: 'Pepito1'}
  ];
/*
  var publication = {
      _id: id.toISOString(),
      expirationDate: exp.toISOString(),
      reporter: reporter,
      adopter: [],
      description: description,
      size: size,
      breed: breed,
      name: name,
      state: 'ACTIVE',
      type: 'animal'
  }*/
})

.controller('PubCtrl', function($scope, $state, $ionicModal, $cordovaGeolocation, appDB, authService) {

	$ionicModal.fromTemplateUrl('templates/publication.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});

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

.controller('PublishCtrl', function($scope, $state, $location, $cordovaGeolocation, $ionicPopup, GetUU, appDB, auth) {
  appDB.initDB();
  $scope.pub={
    size: 2,
    reporter: auth.profile.user_id
  }

  var options = {timeout: 10000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

	$scope.pub.pos = {lat: position.coords.latitude, lng: position.coords.longitude};

  }, function(error){
		console.log("Could not get location");
  });
  $scope.createPub = function(reporter, breed, size, description, name, pos){
  	console.log('Creating register', reporter, breed, size, description, name, pos);
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
      location: pos
    }
    appDB.addPublication(publication).then(function(){
        var alertPopup = $ionicPopup.alert({
          title: '¡Publicación Exitosa!',
          template: '´Tu publicación ha sido registrada con éxito'
        });
        state.go('app.news');
      }, function(err){
        var alertPopup = $ionicPopup.alert({
          title: 'Publicación Fallida',
          template: 'Ha ocurrido un problema'
        });
        state.go('app.news');
      });
  }
  //----------------------CAMERA---------------------
  // init variables
  $scope.data = {};
  $scope.obj;
  var pictureSource;   // picture source
  var destinationType; // sets the format of returned value
  var url;

  // on DeviceReady check if already logged in (in our case CODE saved)
  ionic.Platform.ready(function() {
    //console.log("ready get camera types");
    if (!navigator.camera)
      {
      // error handling
      return;
      }
    //pictureSource=navigator.camera.PictureSourceType.PHOTOLIBRARY;
    pictureSource=navigator.camera.PictureSourceType.CAMERA;
    destinationType=navigator.camera.DestinationType.FILE_URI;
    });

  // get upload URL for FORM
  GetUU.query(function(response) {
    $scope.data = response;
    //console.log("got upload url ", $scope.data.uploadurl);
    });

  // take picture
  $scope.takePicture = function() {
    console.log("got camera button click");
    var options =   {
      quality: 50,
      destinationType: destinationType,
      sourceType: pictureSource,
      encodingType: 0,
      saveToPhotoAlbum: true
      };
    if (!navigator.camera){
        console.log("error de camera, no hay camara");
        return;
      }
    navigator.camera.getPicture(
      function (imageURI) {
        console.log("got camera success ", imageURI);
        $scope.mypicture = imageURI;
        },
      function (err) {
        //console.log("got camera error ", err);
        // error handling camera plugin
        },
      options);
    };

  // do POST on upload url form by http / html form
  $scope.update = function(obj) {
    if (!$scope.data.uploadurl)
      {
      // error handling no upload url
      return;
      }
    if (!$scope.mypicture)
      {
      // error handling no picture given
      return;
      }
    var options = new FileUploadOptions();
    options.fileKey="ffile";
    options.fileName=$scope.mypicture.substr($scope.mypicture.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";
    var params = {};
    params.other = obj.text; // some other POST fields
    options.params = params;

    //console.log("new imp: prepare upload now");
    var ft = new FileTransfer();
    ft.upload($scope.mypicture, encodeURI($scope.data.uploadurl), uploadSuccess, uploadError, options);
    function uploadSuccess(r) {
      // handle success like a message to the user
      }
    function uploadError(error) {
      //console.log("upload error source " + error.source);
      //console.log("upload error target " + error.target);
      }
    };
});
