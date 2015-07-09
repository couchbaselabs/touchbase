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
		var b64string = params.picture;
		if (b64string.search("data:image/jpg;base64") == -1 && b64string.search("data:image/jpeg;base64") == -1 && b64string.search("data:image/png;base64") == -1 && b64string.search("data:image/gif;base64") == -1) {
			callback(null, {status: 400, message: "ERROR: please use a valid image format (jpg, jpeg, png, gif)"});
			// is this callback appropriate??
		}
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
	// params.hasPicture will be in user Document as a boolean; set to true upon upload of picture
	if (params.hasPicture) {
		pictureBucket.get((params.uuid + "_pic"), function (err, result) {
			if (err) {
			    callback(error, null);
			    return;
	  		}
			callback(null, {message: "success", data: result});		
		});
	}
	else {
		// there will be a default_pic chosen by the developer, which will exist in the database
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