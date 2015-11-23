angular.module('starter.services', [])

// get upload url for file transfer (upload to http post service)

.factory('GetUU', [GetUU])
.factory('appDB', ['$q', dbService])
.factory('authService', ['$q', '$http', 'auth', authService])
.factory('utilService', [utilService])
.factory('camService', ['$q', camService]);

function GetUU() {
    var uploadurl = "http://localhost:8100/upl";
    return  {
        query: function() {
            return uploadurl;
        }
    }
}

function camService($q){
    return{
        getPicture: getPicture
    }
    function getPicture(options){
        var q = $q.defer();
        if(navigator.camera !== undefined)
        navigator.camera.getPicture(function(result){
            q.resolve(result);
        }, function(err){

            q.reject(err);
        }, options);

        return q.promise;
    }
}

function utilService(){
    return{
        stringDate: stringDate
    }
    function stringDate (date){
        var dias = new Array('Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado');
        var meses = new Array('Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre');
        var fecha_actual = date;
        var offset = fecha_actual.getTimezoneOffset()/60;

          dia_mes = fecha_actual.getDate(); //dia del mes
          dia_semana = fecha_actual.getDay(); //dia de la semana
          mes = fecha_actual.getMonth() + 1;
          anio = fecha_actual.getFullYear();

          var fechaHora = date;
          var horas = fechaHora.getHours();//GMT
          var minutos = fechaHora.getMinutes();
          var segundos = fechaHora.getSeconds();
          var sufijo = 'AM';

          if(horas > 12) {
              horas = horas - 12;
              sufijo = 'PM';
          }

          if(horas < 10) { horas = '0' + horas; }
          if(minutos < 10) { minutos = '0' + minutos; }
          if(segundos < 10) { segundos = '0' + segundos; }

          //escribe en pagina

          return (dias[dia_semana] + ', ' + dia_mes + ' de ' + meses[mes - 1] + ' de ' + anio + ', '+ horas + ':'+minutos + ' ' + sufijo)
      }

}

function authService($q, $http){
    return{
        callUser: callUser,
    }
    function callUser(userId){
        return $q.when($http.get('https://adoptapp.auth0.com/api/v2/users/'+ userId)
        .then(function(response){
            return response;
        }).catch(function(err){
            console.log(JSON.stringify(err));
        }))
    }
}

function dbService($q){
    var db;
    var remoteCouch;
    var publications;

    return{
    	initDB: initDB,
    	getPublications: getPublications,
    	addPublication: addPublication,
        getPublication: getPublication,
        getUser: getUser,
        addUser: addUser,
        getAttachment: getAttachment,
        filterBySize: filterBySize,
        filterByBreed: filterByBreed,
        filterByReporter: filterByReporter,
        removePub: removePub
    };

    function initDB(){
        //db = new PouchDB('adoptappdb');
        //var PouchDB = require('pouchdb').plugin(require('pouchdb-find'));
        db = new PouchDB('https://adoptapp.smileupps.com/adoptappdb', {auth: {username: 'admin', password: 'b690aca5d376'}});
/*
        db.sync(remotedb, {
          live: true,
          retry: true
        }).on('change', function (change) {
          // yo, something changed!
        }).on('paused', function (info) {
          // replication was paused, usually because of a lost connection
        }).on('active', function (info) {
          // replication was resumed
        }).on('error', function (err) {
          // totally unhandled error (shouldn't happen)
        });
*/
        var typeIndex = {
            _id: '_design/type_index',
            views: {
                animal: {
                    map: function (doc) {
                        if (doc.type == 'animal')
                            emit(doc.type, doc);
                    }.toString()
                },
                user: {
                    map: function (doc) {
                        if (doc.type == 'user')
                            emit(doc.type, doc);
                    }.toString()
                },
            }
        };

        db.put(typeIndex).then(function(){
            console.log('Índice agregado');
        }).catch(function(err){
            if(err.status === 409){
                console.log('Índice existente')
            }
        })
        db.query('type_index/animal', {limit: 0}).then(function (res) {
            // index was built!
        }).catch(function (err) {
            // some error
        });
    };

    function getPublications(all){
    	//if(!publications){
        if(!all){
            return $q.when(db.query('type_index/animal', {descending: true, attachments: true, limit: 10}).then(function(docs){
                publications = docs.rows.map(function(row){
                    row.value._id = new Date(row.value._id);
                    row.value.expirationDate = new Date(row.value.expirationDate);

                    return row.value;
                });

                db.changes({live: true, since: 'now', include_docs: true, filter: 'type_indes/animal'})
                    .on('change', onDatabaseChange);

                return publications;
                }));
        }else{
            return $q.when(db.query('type_index/animal', {descending: true, attachments: true}).then(function(docs){
                publications = docs.rows.map(function(row){
                    row.value._id = new Date(row.value._id);
                    row.value.expirationDate = new Date(row.value.expirationDate);

                    return row.value;
                });

                db.changes({live: true, since: 'now', include_docs: true, filter: 'type_indes/animal'})
                    .on('change', onDatabaseChange);

                return publications;
                }));
        }
    	//}else{
    	//	return $q.when(publications);
    	//}

    };

    function removePub(pubID){
        return $q.when(db.get(pubID).then(function (doc) {
            doc._deleted = true;
            return db.put(doc);
        }));
    }

    function filterByBreed(value){
        return $q.when(db.query(function (doc) {
            emit(doc.breed);
        }, {key: value, include_docs:true}).then(function (result) {
            var docs = result.rows.map(function(row){
                row.doc._id = new Date(row.doc._id);
                row.doc.expirationDate = new Date(row.doc.expirationDate);

                return row.doc;
            });

            return docs;
        }).catch(function (err) {
            return err
            console.log('Breed filter error', JSON.stringify(err))
        }));
    }

    function filterBySize(value){
        return $q.when(db.query(function (doc) {
            emit(doc.size);
        }, {key: value, include_docs:true}).then(function (result) {
            var docs = result.rows.map(function(row){
                row.doc._id = new Date(row.doc._id);
                row.doc.expirationDate = new Date(row.doc.expirationDate);

                return row.doc;
            });
            return docs;
        }).catch(function (err) {
            return err;
            console.log('Size filter error', JSON.stringify(err))
        }));
    }

    function filterByReporter(value){
        return $q.when(db.query(function (doc) {
            emit(doc.reporter);
        }, {key: value, include_docs:true}).then(function (result) {
            var docs = result.rows.map(function(row){
                row.doc._id = new Date(row.doc._id);
                row.doc.expirationDate = new Date(row.doc.expirationDate);

                return row.doc;
            });
            return docs;
        }).catch(function (err) {
            return err;
            console.log('Reporter filter error', JSON.stringify(err))
        }));
    }

    function addPublication(publication){
    	return $q.when(db.put(publication, function callback(err, result) {
      		if (!err) {
       			console.log('Successfully posted!');
      		}
    	}));
    }
    function addUser(user){
        return $q.when(db.put(user, function callback(err, result){
            if(!err){
                console.log('Successfully registered');
            }
        }));
    }
    function getUser(userID){
        return $q.when(db.get(userID).catch(function (err) {
            return err;
        }).then(function(doc){
            return doc;
        }));
    }
    function getAttachment(pubID){
        return $q.when(db.getAttachment(pubID, 'pubImage').then(function(attach){
            return attach;
        }));
    }
    function getPublication(publicationID){
        return $q.when(db.get(publicationID, {attachments: true}).then(function (doc) {
            return doc;
        }));
    }
    function onDatabaseChange(change) {
	    var index = findIndex(publications, change.id);
	    var publication = publications[index];

	    if (change.deleted) {
	        if (publication) {
	            publications.splice(index, 1); // delete
	        }
	    } else {
	        if (publication && publication._id === change.id) {
	            publications[index] = change.doc; // update
	        } else {
	            publications.splice(index, 0, change.doc); // insert
	        }
	    }
	};
	function findIndex(array, id) {
	    var low = 0, high = array.length, mid;
	    while (low < high) {
		    mid = (low + high) >>> 1;
		    array[mid]._id < id ? low = mid + 1 : high = mid
	    }
	    return low;
	}
    function contains(a, obj) {
        for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }
};
