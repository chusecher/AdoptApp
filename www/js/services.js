angular.module('starter.services', [])

// get upload url for file transfer (upload to http post service)
/*
.factory('LoginService', function($q) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            if (name == 'user' && pw == 'secret') {
                deferred.resolve('¡Bienvenido ' + name + '!');
            } else {
                deferred.reject('Datos incorrectos');
            }
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})
*/
.factory('GetUU', function() {
    var uploadurl = "http://localhost/upl";
    return  {
        query: function() {
            return uploadurl;
        }
    }
})

.factory('appDB', ['$q', dbService])
.factory('authService', ['$q', '$http', 'auth', authService]);

function authService($q, $http){
    return{
        callUser: callUser,
    }
    function callUser(userId){
        return $q.when($http.get('https://adoptapp.auth0.com/api/v2/users/'+ userId)
        .then(function(response){
            console.log("Successfull response", JSON.stringify(response));
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
        addUser: addUser
    };

    function initDB(){
        localdb = new PouchDB('adoptappdb');
    	remoteCouch = 'https://adoptapp.smileupps.com/adoptappdb';
        db = new PouchDB(remoteCouch);


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
            console.log('Indice agregado');
        }).catch(function(err){})

        PouchDB.sync(localdb, db, {live: true});

        db.query('type_index/animal', {limit: 0}).then(function (res) {
            // index was built!
        }).catch(function (err) {
            // some error
        });

    };

    function getPublications(){
        console.log('Obteniendo Publicaciones')
    	if(!publications){
            return $q.when(db.query('type_index/animal', {descending: true}).then(function(docs){
                publications = docs.rows.map(function(row){
                    row.value._id = new Date(row.value._id);
                    row.value.expirationDate = new Date(row.value.expirationDate);

                    return row.value;
                });

                db.changes({live: true, since: 'now', include_docs: true})
                    .on('change', onDatabaseChange);

                return publications;
                }));
            /*
    		return $q.when(db.allDocs({include_docs: true, descending: true}))
    			.then(function(docs){
    				publications = docs.rows.map(function(row){
    					row.doc._id = new Date(row.doc._id);
      					row.doc.expirationDate = new Date(row.doc.expirationDate);

                        console.log(row.doc.type);

      					return row.doc;
    				});

    				db.changes({live: true, since: 'now', include_docs: true})
    					.on('change', onDatabaseChange);

    				return publications;
    			});
            */
    	}else{
    		return $q.when(publications);
    	}

    };

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
        return db.get(userID).catch(function (err) {
            return err;
        }).then(function(doc){
            return doc;
        });
    }
    function getPublication(publicationID){
        return db.get(publicationID).then(function (doc) {
            return doc;
        });
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
};
