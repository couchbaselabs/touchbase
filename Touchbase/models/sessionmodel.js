var uuid 				= require("uuid");
var forge 				= require("node-forge");
var userBucket			= require("../app").userBucket;
var userBucketName		= require("../config").couchbase.userBucket;
var N1qlQuery 			= require('couchbase').N1qlQuery;
var async      			= require("async");

function Session() {};

Session.create = function(userID, callback) {
	var sessionModel = {
		type: "session",
		userID: userID,
		sessionID: (uuid.v4()+"_session"),
		expiry: 3600
	};
	userBucket.insert(sessionModel.sessionID, sessionModel, {expiry: sessionModel.expiry}, function (error, result) {
		if (error) {
    		callback(error, null);
    		return;
    	}
    	console.log(sessionModel);
    	callback(null, sessionModel);
    });
};

Session.auth = function (req, res, next) {
	console.log('req.body: ' + JSON.stringify(req.body));
	console.log('req.files: ' + JSON.stringify(req.files));
	var sessionID="";
	if (req.body.sessionID) {
		sessionID = req.body.sessionID;
	}
	else {
		var token = req.headers.authorization;
		console.log(token);
		var sessionArray = token.split(" ");
		if (sessionArray[0] === "Bearer") {
			sessionID = sessionArray[1];
		}
		else {
			console.log('error with: ' + token);
			res.send('error in Session.auth with Bearer token');
			return;
		}
	}
	/*
	userBucket.get(sessionID, function (error, result) {
		if(error) {
			console.log('session expired: ' + error);
			res.redirect('../index.html');				// make this an absolute path once there is an actual domain
			return;
		}
		console.log(result);
		if (!result.value) {
			console.log("Session expired, please login again.");
			res.send({currentSession: false});
			return;
		}
		req.userID = result.value.userID;
		console.log('userID: '+req.userID);
		next();
	});*/
	var getSession = N1qlQuery.fromString("SELECT userID FROM `" + userBucketName + "` USE KEYS($1)");
	userBucket.query(getSession, [sessionID], function (error, result) {
		if(error) {
			callback(error, null);
			console.log('session expired: '+error);
			return;
		}
		console.log(result);
		if (!result[0]) {
			console.log("Session expired, please login again.");
			res.send({currentSession: false});
			// SHOULD JUST CHANGE TO res.redirect('/public/index.html');
			return;
		}
		req.userID = result[0].userID;
		next();
	});
};

/*Session.remove = function(sessionID, callback) {
	userBucket.remove(sessionID, function(error, result) {				HANDLE THIS ON FRONT-END (sessionModel will delete in 1 hr anyways)
																		simply delete the cookie upon logout
		if(error) {
			callback(error, null);
			return;
		}
		callback(null, result);
	});
}; */

// interim solution until figure out auth with Nic
Session.findUser = function (sessionID, callback) {
	var findUser = N1qlQuery.fromString('SELECT userID FROM `'+userBucketName+'` WHERE sessionID=$1 AND type=\"session\"');
	userBucket.query(findUser,[sessionID], function (error, result) {
		if(error) {
			callback(error, null);
			return;
		}
		if (!result[0]) {
			res.send({currentSession: false});
			return;
		}
		console.log(result[0]);
		callback(null, result[0].userID);
	})
};



// potential Session.delete for forceful login

module.exports = Session;