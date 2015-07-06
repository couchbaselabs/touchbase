var uuid 		= require("uuid");
var forge 		= require("node-forge");
var bucket		= require("../app").bucket;
var bucket		= require("../app").pictureBucket;
var N1qlQuery 	= require('couchbase').N1qlQuery;
var couchbase 	= require('couchbase');

function User() { };

User.create = function(params, callback) {
	var currentTime = new Date().toUTCString();	
	var stringToArray = function(anyString) {
		var tempArray=anyString.split(",");
		var resultArray=[];
		for (i=0; i<tempArray.length; i++) {
			var str = tempArray[i];
			resultArray[i]= str.trim();
			if (resultArray[i]=="") {
				resultArray.splice(i, 1);
			}
		}
	}
    var userDoc = {
    	email: params.email,
        uuid: uuid.v4(),
        name: params.name,
        username: params.username,
        password: forge.md.sha1.create().update(params.password).digest().toHex(),
        administrator: false,
        hobbyArray: stringToArray(params.hobbyArray),
        expertiseArray: stringToArray(params.expertiseArray),
        division: params.division,
        jobTitle: params.title,
        baseOffice: params.baseOffice,
        registerTime: currentTime,
        loginTimes: [currentTime]
    };
    var insertUser = N1qlQuery.fromString('INSERT INTO ' + bucket + ' (KEY, VALUE) VALUES (\"' + userDoc.uuid + '\", \"' + JSON.stringify(userDoc) + '\")');
    bucket.query(insertUser, function (err, result) {
    	if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
    if (params.picture) {
    	pictureBucket.insert((userDoc.uuid + "_pic"), params.picture, function (err, res) {
			if (err) {
			    callback(error, null);
			    return;
	  		}
			callback(null, {message: "success", data: result});		
		});
    }
};

User.searchByEmail = function (params, callback) {
	var searchUsers = N1qlQuery.fromString('SELECT * FROM ' + bucket + ' WHERE email LIKE \"%' + params.email + '%\"');
	bucket.query(searchUsers, function (err, result) {
		if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
	});
};

User.validatePassword = function(rawPassword, hashedPassword) {
    if (forge.md.sha1.create().update(rawPassword).digest().toHex() === hashedPassword) {
    	return true;
    }
    else {
    	return false;
    }
};

User.addLoginTime = function(uuid, callback) {
	var currentTime = new Date().toUTCString();
	var addLoginTime = N1qlQuery.fromString("UPDATE " + bucket + " SET loginTimes=ARRAY_PREPEND(\"" + currentTime + "\", loginTimes) WHERE META(" + bucket + ").id =\"" + uuid + "\"");
    bucket.query(addLoginTime, function (err, result) {
    	if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
};
// must incorporate images here somehow!

module.exports = User;

