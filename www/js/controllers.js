angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, appDB) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
              //POUCHDB -------------
  $scope.online = false;
    $scope.toggleOnline = function() {
      $scope.online = !$scope.online;
      if ($scope.online) {  // Read http://pouchdb.com/api.html#sync
        $scope.sync = appDB.sync('adoptapp.iriscouch.com/adoptappdb', {live: true})
          .on('error', function (err) {
            console.log("Syncing stopped");
            console.log(err);
          });
      } else {
        $scope.sync.cancel();
      }
    };

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
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

.controller('MyProfileCtrl', function($scope) {

})

.controller('RegisCtrl', function($scope) {
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('PubsCtrl', function($scope, $state, $cordovaGeolocation){
  $scope.cards = [
    {id: 1, date: 'Ayer', description:'Encontré este perrito debajo de un puente. Ya lo vacuné y quiero que alguien lo cuide porque económicamente no puedo.', breed: 'Beagle', photo: 'img/beagle1.jpg', reporter: 'Mateo Nieto',userPhoto: 'img/test-photo.jpg'},
    {id: 2, date: '10 de Octubre', description:'Una mamá pincher dió a luz a cachorritos y están todos disponibles para adopción.', breed: 'Pincher', photo: 'img/pincher1.jpg', reporter: 'Carlos Useche',userPhoto: 'img/test-photo2.jpg'},
    {id: 3, date: '30 de Septiembre', description:'Ya no tengo los medios para mantener a mi gato. Si alguien lo quiere cuidar.', breed: 'Snowshoe', photo: 'img/snowshoe1.jpg', reporter: 'Carlos Useche',userPhoto: 'img/test-photo2.jpg'},
    {id: 4, date: '29 de Septiembre', description:'asasssa sas sa   as as ablablablabal', breed: 'Pastor Alemán', photo: 'img/perro.jpg', reporter: 'Pepito1'},
    {id: 5, date: '15 de Septiembre', description:'asasssa sas sa   as as ablablablabal', breed: 'Persa', photo: 'img/perro.jpg', reporter: 'Pepito1'}
  ];
})

.controller('PubCtrl', function($scope, $state, $ionicModal, $cordovaGeolocation) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){

    $scope.latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    $scope.mapOptions = {
      center: $scope.latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    //$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  }, function(error){
    console.log("Could not get location");
  });

  $ionicModal.fromTemplateUrl('templates/publication.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.modal = modal;
  });

  $scope.closePub = function() {
    $scope.modal.hide();
  };

  // Open the publication modal details window

  $scope.openPub = function($pubId) {
    $scope.pub = $pubId;
    $scope.modal.show();
    $scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);

  };
})

.controller('CamCtrl', function($scope, $location, GetUU) {

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
    //console.log("got camera button click");
    var options =   {
      quality: 50,
      destinationType: destinationType,
      sourceType: pictureSource,
      encodingType: 0,
      saveToPhotoAlbum: true
      };
    if (!navigator.camera)
      {
      // error handling
      return;
      }
    navigator.camera.getPicture(
      function (imageURI) {
        //console.log("got camera success ", imageURI);
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
