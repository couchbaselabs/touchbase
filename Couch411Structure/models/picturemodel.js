var uuid 			= require("uuid");
var forge 			= require("node-forge");
var bucket			= require("../app").bucket;
var pictureBucket	= require("../app").pictureBucket;
var N1qlQuery 		= require('couchbase').N1qlQuery;
var couchbase 		= require('couchbase');
//var multer  		= require('multer');

function Picture() { };

Picture.upload = function(newID, params, callback) {
	if (params.picture) {
    	pictureBucket.insert((newID + "_pic"), params.picture, function (err, result) {
			if (err) {
			    callback(error, null);
			    return;
	  		}
			callback(null, {message: "success", data: result});		
		});
    }
    else {
    	console.log("no picture to upload; stock photo will be applied");
    }
};

Picture.attempt = function(body, files, callback) {
	if(done==true) {
    console.log("body:  " + JSON.stringify(body));
    console.log("files  " + JSON.stringify(files));
    console.log("File uploaded.");
  	}
};

Picture.receive = function(params, callback) {
	// params.hasImage will be in user Document as a boolean, selected on upload
	if (params.hasImage) {
		pictureBucket.get((params.uuid + "_pic"), function (err, result) {
			if (err) {
			    callback(error, null);
			    return;
	  		}
			callback(null, {message: "success", data: result});		
		});
	}
	else {
		pictureBucket.get(("default_pic"), function (err, result) {
			if (err) {
			    callback(error, null);
			    return;
	  		}
			callback(null, {message: "success", data: result});	
		});
	}
};

module.exports = Picture;