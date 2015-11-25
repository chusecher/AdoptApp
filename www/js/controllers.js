angular.module('starter.controllers', ['starter.services'])

.controller('AppCtrl', function($scope, $state, $ionicModal, $timeout, appDB, $ionicHistory, auth, store, $ionicPopup) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
              //POUCHDB -------------
    appDB.initDB();
    $scope.go = function(state){
        $ionicHistory.nextViewOptions({
        disableBack: true
    });
        $state.go(state, {}, {reload: true});
    }
    $scope.logout = function() {
        var alertPopup = $ionicPopup.alert({
            title: 'Cerrar Sesión',
            template: '¡Hasta pronto ' + auth.profile.nickname + '!'
        });
        auth.signout();
        store.remove('profile');
        store.remove('token');
        $state.go('login', {}, {reload:true});
    }
})

.controller('MyProfileCtrl', function(  $scope, $state, $ionicLoading,
                                        $ionicPopup, auth, appDB, $ionicHistory, $q, authService, utilService) {
    appDB.initDB();
    $scope.activeUser;
    $scope.adoptedList = [];
    $scope.auth = auth;
    $scope.newData = {
        phone: ''
    }
    $scope.goTo = function(adopterID){
        $state.go('app.profile', {profileID: adopterID, contact: false})
    }
    $scope.rate =  function(reporterID, pubID){
        $scope.data = {};
        var ratePopUp = $ionicPopup.show({
            scope : $scope,
            templateUrl: 'templates/rateModal.html',
            title: "Califica al reportero",
            buttons: [
              { text: '<b>Calificar</b>',
                type: 'button-positive',
                onTap: function(e) {
                  if (!$scope.data.rating) {
                    e.preventDefault();
                  } else {
                    return parseInt($scope.data.rating);
                  }
                }
              }
            ]
        });
        ratePopUp.then(function(res){
            console.log("Guardado", typeof(res), reporterID);
            appDB.getUser(reporterID).then(function(reporter){
                reporter.rating += res;
                console.log("The rating", reporter.rating);
                appDB.addUser(reporter).then(function(){
                    appDB.removePub(pubID).then(function(){
                        console.log("Publicación removida")
                        var alertPopup = $ionicPopup.alert({
                            title: '¡Calificación exitosa!',
                            template: 'Se ha concretado con éxito la adopción, la publicación ha sido removida'
                        });
                        $state.go($state.current, {}, {reload: true});
                    }).catch(function(err){
                        console.log("Error en remover", JSON.stringify(err))
                    })                 
                }).catch(function(err){
                    console.log("Error calificar", JSON.stringify(err))
                })
            });

        })

    }

    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }

    appDB.getUser(auth.profile.user_id).then(function(user){
        $scope.activeUser = user;
    });
    appDB.filterByReporter(auth.profile.user_id).then(function(filtereds){
        for(var i in filtereds){
            (function (i){
                appDB.getAttachment(filtereds[i]._id).then(function(blob){
                    filtereds[i].pubImage = URL.createObjectURL(blob);
                    return filtereds[i];
                });
                getReporter(filtereds[i].reporter).then(function(data){
                    filtereds[i].reporterData = data;
                    filtereds[i].showID = utilService.stringDate(new Date(filtereds[i]._id));
                    return filtereds[i];
                });

                for(var j=0; j<filtereds[i].adopter.length; j++){
                    (function (j){
                        getReporter(filtereds[i].adopter[j]).then(function(aauth){
                            appDB.getUser(aauth.user_id).then(function(apouch){
                                var adopterData = {
                                    id: aauth.user_id,
                                    phone: apouch.phone,
                                    name: aauth.name,
                                    image: aauth.picture
                                }
                                filtereds[i].adopter[j] = adopterData
                                return filtereds[i];
                                
                            })
                        })
                    })(j)
                }
                    
            })(i);
        }
        $scope.foundDocs = filtereds;
    });
    appDB.getPublications(true).then(function(filtereds){
        for(var i in filtereds){
            if(contains(filtereds[i].adopter, auth.profile.user_id)){
                (function (i){
                    appDB.getAttachment(filtereds[i]._id).then(function(blob){
                        filtereds[i].pubImage = URL.createObjectURL(blob);
                        return filtereds[i];
                  });
                    getReporter(filtereds[i].reporter).then(function(data){
                        filtereds[i].reporterData = data;
                        filtereds[i].showID = utilService.stringDate(new Date(filtereds[i]._id));
                        return filtereds[i];
                    });
                })(i);
                $scope.adoptedList.push(filtereds[i]);
            }
        } 
    })
    getReporter = function(reporterID){
        return $q.when(authService.callUser(reporterID).then(function(reporter){
            return reporter.data;
        }));
    }

    $scope.updateUser = function(phone){
        var user = {
            _id: auth.profile.user_id,
            _rev: $scope.activeUser._rev,
            phone: phone,
            rating: $scope.activeUser.rating,
            type: $scope.activeUser.type,
            status: $scope.activeUser.status

        }
        $ionicLoading.show({template: 'Cargando...'});
        appDB.addUser(user).then(function(){
          var alertPopup = $ionicPopup.alert({
              title: '¡Actualización Exitosa!',
              template: 'Tus datos han sido actualizados con éxito'
          });
          $ionicHistory.nextViewOptions({
              disableBack: true
          });
          $state.go('app.news', {}, {reload: true});
            appDB.getUser(auth.profile.user_id).then(function(user){
                $scope.activeUser = user;
            });
            $ionicLoading.hide();
        }, function(err){
            $ionicLoading.hide();
            console.log(JSON.stringify(err))
          var alertPopup = $ionicPopup.alert({
              title: 'Actualización Fallida',
              template: 'Ha ocurrido un problema con tu actualización'
          });
        });
    }
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
                console.log("Login", "Usuario nuevo");
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
                console.log("Login", 'Usuario registrado');
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
            }else{
                var alertPopup = $ionicPopup.alert({
                    title: 'Error Fatal',
                    template: 'Registro de usuario corrupto, ponerse en contacto con soporte'
                });
                $state.go($state.current, {}, {reload: true});
            }
        });

    }, function(err){
        console.log(JSON.stringify(err));
    });
//    }
})
.controller('ProfileCtrl', function($q, $scope, $stateParams, authService, appDB){
    $scope.contact = $stateParams.contact;
    getReporter = function(reporterID){
        return $q.when(authService.callUser(reporterID).then(function(reporter){
            return reporter.data;
        }));
    }
    getReporter($stateParams.profileID).then(function(reporter){
        $scope.reporter = reporter;
    })
    appDB.getUser($stateParams.profileID).then(function(user){
        $scope.user = user;
    })
})

.controller('PubsCtrl', function($scope, $q, $ionicLoading, $ionicPopup, $state, $cordovaGeolocation, appDB, authService, utilService, ngFB, auth){

    getReporter = function(reporterID){
        return $q.when(authService.callUser(reporterID).then(function(reporter){
            return reporter.data;
        }));
    }

    $scope.doRefresh = function() {
        $ionicLoading.show({template: 'Cargando...'});
        pubs = appDB.getPublications(false);
        pubs.then(function(docs) {
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
          $ionicLoading.hide();
          $scope.docs = docs;
          $scope.$broadcast('scroll.refreshComplete');

        });
    };

    $scope.promiseShare = function (social){
        var alertPopup = $ionicPopup.alert({
            title: 'Compartir a través de ' + social,
            template: 'Podrás compartir a través de ' + social + ' muy pronto'
        });
    }

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

      $ionicLoading.show({template: 'Compartiendo...'});
      ngFB.init({appId: '199784313686540', accessToken: toky});
      ngFB.api({
          method: 'POST',
          path: '/me/feed',
          params: {
              message: message
          }
      }).then(
          function () {
              $ionicLoading.hide();
              console.log("Nice");
              var alertPopup = $ionicPopup.alert({
                  title: 'Facebook',
                  template: 'Se ha compartido exitosamente'
              });
          },
          function (err) {
              $ionicLoading.hide();
              var alertPopup = $ionicPopup.alert({
                  title: 'Error',
                  template: JSON.stringify(err)
              });
          });
  };

  $scope.doRefresh();
})

.controller('SearchCtrl', function($scope, $q, authService, $ionicModal, $ionicLoading, appDB, utilService){
    $scope.search = {
        bySize: false,
        byBreed: true,
        breed: 'Akita',
        size: "2"
    }


    getReporter = function(reporterID){
        return $q.when(authService.callUser(reporterID).then(function(reporter){
            return reporter.data;
        }));
    }

    $scope.breedSearch = function(breed){
        console.log("Searching for: ", breed);
        $ionicLoading.show({template: 'Buscando...'});
        appDB.filterByBreed(breed).then(function(filtereds){
            for(var i in filtereds){
                (function (i){
                    appDB.getAttachment(filtereds[i]._id).then(function(blob){
                        filtereds[i].pubImage = URL.createObjectURL(blob);
                        return filtereds[i];
                  });
                    getReporter(filtereds[i].reporter).then(function(data){
                        filtereds[i].reporterData = data;
                        filtereds[i].showID = utilService.stringDate(new Date(filtereds[i]._id));
                        return filtereds[i];
                    });
                })(i);
            }
            $ionicLoading.hide();
            $scope.foundDocs = filtereds;
        });
    };

    $scope.sizeSearch = function(size){
        console.log("Searching for: ", size);
        $ionicLoading.show({template: 'Buscando...'});
        appDB.filterBySize(size).then(function(filtereds){
            for(var i in filtereds){
                (function (i){
                    appDB.getAttachment(filtereds[i]._id).then(function(blob){
                        filtereds[i].pubImage = URL.createObjectURL(blob);
                        return filtereds[i];
                  });
                    getReporter(filtereds[i].reporter).then(function(data){
                        filtereds[i].reporterData = data;
                        filtereds[i].showID = utilService.stringDate(new Date(filtereds[i]._id));
                        return filtereds[i];
                    });
                })(i);
            }
            $ionicLoading.hide();
            $scope.foundDocs = filtereds;
        });
    };

    $scope.bothSearch = function(size, breed){
        console.log("Searching for: ", size, breed);
        $ionicLoading.show({template: 'Buscando...'});
        appDB.filterByBreed(breed).then(function(filtereds){
            var refiltereds = []
            for(var i=0; i<filtereds.length; i++){
                if(filtereds[i].size == size){
                    refiltereds.push(filtereds[i])
                }
            }
            filtereds = refiltereds;
            for(var i in filtereds){

                (function (i){

                    appDB.getAttachment(filtereds[i]._id).then(function(blob){
                        filtereds[i].pubImage = URL.createObjectURL(blob);
                        return filtereds[i];
                    });
                    getReporter(filtereds[i].reporter).then(function(data){
                        filtereds[i].reporterData = data;
                        filtereds[i].showID = utilService.stringDate(new Date(filtereds[i]._id));
                        return filtereds[i];
                    });
                })(i);
            }
            $ionicLoading.hide();
            $scope.foundDocs = filtereds;
        });
    };

    $scope.filter = function(breed, size){
        if($scope.search.byBreed && !$scope.search.bySize){
            $scope.breedSearch(breed);
        }else if(!$scope.search.byBreed && $scope.search.bySize){
            $scope.sizeSearch(size);
        }else if($scope.search.byBreed && $scope.search.bySize){
            $scope.bothSearch(size, breed);
        }else{
            console.log("Searching for: Everything");
            $ionicLoading.show({template: 'Buscando...'});
            appDB.getPublications(true).then(function(filtereds){

                for(var i in filtereds){
                    (function (i){
                        appDB.getAttachment(filtereds[i]._id).then(function(blob){
                            filtereds[i].pubImage = URL.createObjectURL(blob);
                            return filtereds[i];
                      });
                        getReporter(filtereds[i].reporter).then(function(data){
                            filtereds[i].reporterData = data;
                            filtereds[i].showID = utilService.stringDate(new Date(filtereds[i]._id));
                            return filtereds[i];
                        });
                    })(i);
                }
                $ionicLoading.hide();
                $scope.foundDocs = filtereds;
            });
        }

    }
})

.controller('PubCtrl', function($scope, $state, $ionicLoading, $ionicPopup, $ionicModal, $ionicLoading, $cordovaGeolocation, appDB, authService, utilService, auth) {

	$ionicModal.fromTemplateUrl('templates/publication.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(function(modal){
		$scope.modal = modal;
	});

    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }
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

  $scope.go = function(){
    $state.go('app.profile', {profileID: $scope.reporter.user_id, contact: false})
  }

  // Open the publication modal details window

  $scope.openPub = function(pubId) {
    $ionicLoading.show({template: 'Cargando...'});
    appDB.getPublication(pubId).then(function(pub){
        pub.showID = utilService.stringDate(new Date(pub._id));
        blobUtil.base64StringToBlob(pub._attachments.pubImage.data).then(function(blob){
            $scope.pubImageURL = URL.createObjectURL(blob);
        })
        authService.callUser(pub.reporter).then(function(reporter){
            $scope.reporter = reporter.data;
        });
    	$scope.pub = pub;
    	$scope.latLng = new google.maps.LatLng(pub.location.lat, pub.location.lng);

		$scope.mapOptions = {
			center: $scope.latLng,
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
        $ionicLoading.hide();
		$scope.modal.show();
    	$scope.map = new google.maps.Map(document.getElementById("map"), $scope.mapOptions);
    	$scope.flag = new google.maps.InfoWindow({map: $scope.map});
    	$scope.flag.setPosition($scope.pub.location);
    	$scope.flag.setContent('Ubicación aproximada');

    });
  };
  $scope.adopt = function(){
    $ionicLoading.show({template: 'Registrando...'});
    appDB.getPublication($scope.pub._id).then(function(original){
        if(!contains(original.adopter, auth.profile.user_id) && auth.profile.user_id !== original.reporter){
            original.adopter.push(auth.profile.user_id);
        }else{
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Error en adopción',
                template: 'Ya estas registrado para adoptar esta mascota o fuiste quien la publicó'
            });
            return;
        }
        
        appDB.addPublication(original).then(function(){
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: '¡Adopción Exitosa!',
                template: 'Has sido registrado como adoptante de esta mascota, se le notificará al cuidador en proceso y puedes contactarlo inmediatamente'
            });            
            $state.go('app.profile',{profileID: $scope.reporter.user_id, contact: true});
            $scope.closePub();
        }).catch(function(err){
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Error en adopción',
                template: 'No pudiste ser registrado: '+JSON.stringify(err)
            });
        })
    })
  }
})

.controller('PublishCtrl', function($scope, $state, $location, $cordovaGeolocation, $ionicHistory, $ionicLoading,
                                    $ionicPopup, GetUU, appDB, auth, camService) {
    appDB.initDB();
    $scope.pub = {
        breed: "Akita",
        size: "2",
        reporter: auth.profile.user_id
    }
    var defaultPic = "img/profile_default_pet.jpg";

    var defaultPos = {lat: 4.658781, lng: -74.099271}
    var options = {timeout: 10000, enableHighAccuracy: true};
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
        $scope.pub.pos = {lat: position.coords.latitude, lng: position.coords.longitude};
    }, function(error){
        $scope.pub.pos = defaultPos;
        var alertPopup = $ionicPopup.alert({
          title: '¡Error de localización!',
          template: 'No se pudo procesar tu ubicación, se usará una ubicación por defecto'
        });
    });

    $scope.createPub = function(reporter, breed, size, description, name, pos, imageSrc){
        blobUtil.imgSrcToBlob(imageSrc).then(function(blob){
            var id = new Date();
            id.setHours(id.getHours());
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
            $ionicLoading.show({template: 'Publicando...'});
            appDB.addPublication(publication).then(function(){
                var alertPopup = $ionicPopup.alert({
                    title: '¡Publicación Exitosa!',
                    template: 'Tu publicación ha sido registrada con éxito'
                });
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                $ionicLoading.hide();
                $state.go('app.news');
                $scope.myPicture = defaultPic;
            }).catch(function(err){
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                    title: 'Publicación Fallida',
                    template: 'Ha ocurrido un problema: ' + JSON.stringify(err)
                });
            });
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
