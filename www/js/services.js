angular.module('starter.services', [])

// get upload url for file transfer (upload to http post service)
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
    var remoteCouch = 'https://adoptapp.smileupps.com/adoptappdb';
    PouchDB.sync('adoptappdb', remoteCouch, {live: true});
    return db;
});