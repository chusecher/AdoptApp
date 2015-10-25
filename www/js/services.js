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
.factory('appDB', function() {
    var db = new PouchDB('adoptappdb');
    return db;
});
