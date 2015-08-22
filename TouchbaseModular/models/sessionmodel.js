var uuid 				= require("uuid");
var forge 				= require("node-forge");
var userBucket			= require("../app").userBucket;
var userBucketName		= require("../config").couchbase.userBucket;
var N1qlQuery 			= require('couchbase').N1qlQuery;
var nodemailer			= require("nodemailer");
var sgTransport 		= require('nodemailer-sendgrid-transport');
var Email 				= require("./emailmodel");

function Session() {};

// not currently in use, was an idea for redirecting to home page. Could be used to parse host.
Session.pathToLogin = function (req) {
	console.log(req.originalUrl);
	console.log(req.headers.host);
	var urlPath = req.originalUrl;
	var exitString = "";
	function generateExit (str) {
		var path = "";
		for (i=0; i<str.length; i++) {
			if (str[i] === "/") {
				path+="../";

			}
		}
		path+="index.html";
		return path;
	}
	exitString = generateExit(urlPath);
	console.log(exitString);
	return exitString;
};

// creates session, and inserts the document with 1 hour expiry in the users bucket, and includes corresponding userID. 
// used in '/api/loginAuth'.
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

// authenticates the sessionID sent from the front-end. 
// adds the user ID to 'req' if authentication is successful.
// used in all protected routes.
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
			return;
		}
	}
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
			//var path = req.protocol + '://' + req.headers.host + '/index.html#/login';
			//console.log(path);
			res.send({currentSession: false});
			return;
		}
		req.userID = result[0].userID;
		next();
	});
};

// inserts verification document with 1 day expiration into the 'users' bucket, with according userID.
// then sends the email generated in 'Email.create' using the Sendgrid API with Nodemailer. 
// used in '/api/registerUser'.
Session.makeVerification = function (pathInfo, userDoc, callback) {
	var verifyModel = {
		type: "verify",
		userID: userDoc.uuid,
		sessionID: (uuid.v4()+"_verify"),
		expiry: 86400
	};
	var options = {
	  auth: {
	    api_user: '',
	    api_key: ''
	  }
	};
	var client = nodemailer.createTransport(sgTransport(options));
	var email = {
	  	from: 'Touchbase <touchbase-noreply@couchbase.com>',
	  	to: userDoc.login.email,
	  	subject: 'Verify Your Touchbase Account',
	  	html: Email.create(pathInfo, verifyModel)
	};
	userBucket.insert(verifyModel.sessionID, verifyModel, {expiry: verifyModel.expiry}, function (error, result) {
		if (error) {
    		callback(error, null);
    		return;
    	}
    	console.log(JSON.stringify(verifyModel));
    	console.log('email: '+email);
    	client.sendMail(email, function(err, info){
		    if (err){
		      console.log(err);
		    }
		    else {
		      console.log('woot!');
		      console.log('Message sent: ' + info.response);
		      callback(null, verifyModel);
		    }
		});
    });
};

// used to verify email by searching for the verify document and changing 'login.emailVerified' boolean attribute in corresponding user doc.
// used in '/api/verify/:verificationID'
Session.verify = function(verifyID, callback) {
	var findValidation = N1qlQuery.fromString('SELECT * FROM '+userBucketName+' USE KEYS($1)');
	userBucket.query(findValidation, [verifyID], function (error, result) {
		if (error) {
    		callback(error, null);
    		return;
    	}
    	console.log(result);
    	if (!result[0]) {
    		callback(null, 'email already verified/verification expired, please login again');
    		return;
    	}
    	var userID = result[0].users.userID;
    	var updateUserValidation = N1qlQuery.fromString('UPDATE '+userBucketName+' USE KEYS($1) SET login.emailVerified=true');
    	console.log(updateUserValidation);
    	userBucket.query(updateUserValidation, [userID], function (err, update) {
    		if (err) {
	    		callback(err, null);
	    		console.log(err);
	    		return;
    		}
    		console.log(update);
    		var deleteVerify = N1qlQuery.fromString('DELETE FROM '+userBucketName+' USE KEYS ($1)');
    		userBucket.query(deleteVerify, [verifyID], function (error, deleteMessage) {
    			if (error) {
		    		callback(error, null);
		    		return;
	    		}
	    		console.log(deleteMessage);
	    		callback(null, 'verifySession successfully deleted, and userModel updated');
    		});
		});
	});
};

module.exports = Session;
