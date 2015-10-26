angular.module('starter.services', [])

// get upload url for file transfer (upload to http post service)

.factory('LoginService', function($q) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            if (name == 'user' && pw == 'secret') {
                deferred.resolve('Welcome ' + name + '!');
            } else {
                deferred.reject('Wrong credentials.');
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

.factory('GetUU', function() {
    var uploadurl = "http://localhost/upl";
    return  {
        query: function() {
            return uploadurl;
        }
    }
})
.factory('appDB', ['$q', dbService]);

function dbService($q){
    var db;
    var remoteCouch;
    var publications;

    return{
    	initDB: initDB,
    	getPublications: getPublications,
    	addPublication: addPublication
    };

    function initDB(){
    	db = new PouchDB('adoptappdb');
    	remoteCouch = 'https://adoptapp.smileupps.com/adoptappdb';
    	PouchDB.sync('adoptappdb', remoteCouch, {live: true});
    };

    function getPublications(){
    	if(!publications){
    		return $q.when(db.allDocs({include_docs: true}))
    			.then(function(docs){
    				publications = docs.rows.map(function(row){
    					row.doc._id = new Date(row.doc._id);
      					row.doc.expirationDate = new Date(row.doc.expirationDate);

      					return row.doc;
    				});

    				db.changes({live: true, since: 'now', include_docs: true})
    					.on('change', onDatabaseChange);
    				return publications;
    			});
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
