angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

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

.controller('PlaylistCtrl', function($scope, $stateParams) {
})
.controller('PubsCtrl', function($scope, $ionicModal){
  $scope.pub;
  $scope.cards = [
    {id: 1, date: 'Hoy', description:'asasssa sas sa   as as ablablablabal', breed: 'Beagle', photo: 'textico', reporter: 'Pepito1'},
    {date: 'Mañana', description:'asasssa sas sa   as as ablablablabal', breed: 'Pincher', photo: 'textico', reporter: 'Pepito1'},
    {id: 3, date: 'Pasado Mañana', description:'asasssa sas sa   as as ablablablabal', breed: 'Criollito', photo: 'textico', reporter: 'Pepito1'},
    {id: 4, date: 'Antepasado Mañana', description:'asasssa sas sa   as as ablablablabal', breed: 'Pastor Alemán', photo: 'textico', reporter: 'Pepito1'},
    {id: 5, date: 'Ultraantepasado mañana', description:'asasssa sas sa   as as ablablablabal', breed: 'Persa', photo: 'textico', reporter: 'Pepito1'}
  ];

  $ionicModal.fromTemplateUrl('templates/publication.html', {
    scope: $scope
  }).then(function(modal){
    $scope.modal = modal;
  });

  $scope.closePub = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.openPub = function($pubId) {
    $scope.pub = $pubId;
    console.log('Doing login '+ parseInt($scope.pub), $scope.pub);
    $scope.modal.show();
    console.log('Testing cards '+$scope.cards[1].id, $scope.cards[1].id == $scope.pub);
  };


});
