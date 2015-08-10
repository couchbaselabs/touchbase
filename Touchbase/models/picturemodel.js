var uuid 				= require("uuid");
var forge 				= require("node-forge");
var userBucket			= require("../app").userBucket;
var pictureBucket		= require("../app").pictureBucket;
var userBucketName		= require("../config").couchbase.userBucket;
var pictureBucketName	= require("../config").couchbase.pictureBucket;
var N1qlQuery 			= require('couchbase').N1qlQuery;
var multer 				= require('multer');
var fs 					= require('fs');
var gm 					= require('gm');				// you MUST 'brew install graphicsmagick' to use this library

function Picture() { };

/*Picture.upload = function(newID, params, callback) {
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
    	var returnMessage = "no picture to upload; stock photo will be applied";
    	console.log(returnMessage);
    	callback(null, {message: "success", data: returnMessage});	
    }
};*/


Picture.attempt = function(userID, params, fileInfo, callback) {
	if (!fileInfo) {
		return callback(null, 'blah');
	}/*
	if (fileInfo.extension != 'png' && fileInfo.extension != 'jpg' && fileInfo.extension != 'jpeg' && fileInfo.extension != 'gif') {
		return callback(null, {status: 400, message: "ERROR: please use a valid image format (jpg, jpeg, png, gif)"});
	}*/
	// check mimetype instead
	// check with GM NOT multer
	var cropDim = JSON.parse(params.cropDim);
	console.log(cropDim);
	if(done==true) {
		if (fileInfo.size >= 5000000) {
			fs.unlink(fileInfo.path, function (err) {
				if (err) {
				  	return callback(err, null);
				}
				console.log('deleted file that was too large: '+fileInfo.size);
				return callback({status: "error", message: "Picture was too large; not uploaded. Please try again."}, null);
			});
		}
		else {
			gm(fileInfo.path)
				.format(function(err, value) {
					if (err) {
						return callback(err, null);
					}
					else if(value.toLowerCase() != 'png' && value.toLowerCase() != 'jpg' && value.toLowerCase() != 'jpeg' && value.toLowerCase() != 'gif') {
						fs.unlink(fileInfo.path, function (err) {
							if (err) {
							  	return callback(err, null);
							}
							console.log('deleted file that was of wrong format: '+value);
							return callback({status: "error", message: "Please use a valid image format (jpg, jpeg, png, gif)."}, null);
						});
					}
					console.log(value);
				})
				.crop(cropDim.width, cropDim.height, cropDim.x, cropDim.y)
				.scale(200, 200)
				.quality(50)
				.write(fileInfo.path, function(error) {
					if(error) {
						console.log(error);
						return;
					}
					
			    	fs.readFile(fileInfo.path, function(error, data) {
			    		if(error) {
			    			return callback(error, null);
			    		}
			    		var base64data = new Buffer(data, 'binary').toString('base64');
			    		pictureBucket.upsert((userID+"_picMulterNode"), base64data, function(issue, resultz) {
			    			if(issue) {
			    				return callback(issue, null);
			    			}
			    			fs.unlink(fileInfo.path, function (err) {
								if (err) {
								  	return callback(err, null);
								}
								console.log('successfully deleted /tmp/hello');
								var updateUserhasPic = N1qlQuery.fromString('UPDATE '+userBucketName+' SET login.hasPicture = true WHERE uuid=$1');
								console.log(userID);
								userBucket.query(updateUserhasPic, [userID], function(error, result) {
									if (error) {
										console.log(error);
										return;
									}
									console.log({message: "success", data: resultz});
								});
							});
			    		});
			    	});
			});
		}
  	}
};

Picture.receive = function(params, callback) {
	// params.hasPicture will be in user Document as a boolean; set to true upon upload of picture
	console.log('params for picModel: ' + JSON.stringify(params));
	if (params.login.hasPicture) {
		console.log('IDs: ' + params.uuid);
		pictureBucket.get((params.uuid + "_picMulterNode"), function (err, result) {
			if (err) {
			    return callback(err, null);
	  		}
	  		/*if (result.length === 0) {
	  			return callback(null, 'profile-default-red.png');
	  		}*/
	  		//console.log(result);
	  		result.value = ("data:image/jpeg;base64," + result.value);
			callback(null, result);		
		});
	}
	else {
		callback(null, {value: 'default_picture.png'});
		// there will be a default_pic chosen by the developer, which will exist in the database
		/*pictureBucket.get(("default_pic"), function (err, result) {	
			if (err) {
			    callback(error, null);
			    return;
	  		}
			callback(null, result);	
		});*/
	}
};

module.exports = Picture;