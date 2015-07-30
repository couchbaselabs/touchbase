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
    	var checkInsert = N1qlQuery.fromString("SELECT * FROM "+userBucketName+" WHERE sessionID = $1");
    	var waiting=false;
    	console.log(checkInsert);
    	async.whilst(
    		function() {
    			return waiting;
	    	},
	    	function(cb){
	    		userBucket.query(checkInsert, [sessionModel.sessionID], function (error, result) {
	    			if (error) {
	    				return callback(error, null);
	    			}
	    			if (result.length === 1) {
	    				waiting = true;
	    				cb();
	    			}
	    		});
	    	}, function(err) {
	    		if (err) {
	    			callback(err, null);
	    		}
	    		callback(null, sessionModel);
	    	}
   		);
    });
};

Session.auth = function (req, res, next) {
	var sessionID = req.headers.authorization;
	console.log(sessionID);
	var sessionArray = sessionID.split(" ");
	if (sessionArray[0] === "Bearer") {
		var getSession = N1qlQuery.fromString("SELECT userID FROM `" + userBucketName + "` WHERE type = \"session\" AND sessionID = $1");
		userBucket.query(getSession, [sessionArray[1]], function (error, result) {
			if(error) {
				callback(error, null);
    			return;
			}
			if (!result[0]) {
				console.log("Session expired, please login again.");
				res.send({currentSession: false});
				return;
			}
			req.userID = result[0].userID;
			next();
		});
	}
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
		}
		console.log(result[0]);
		callback(null, result[0].userID);
	})
};



// potential Session.delete for forceful login

module.exports = Session;