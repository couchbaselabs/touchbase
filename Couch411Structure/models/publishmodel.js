var uuid 				= require("uuid");
var forge 				= require("node-forge");
var publishBucket		= require("../app").publishBucket;
var publishBucketName	= require("../config").couchbase.publishBucket;
var N1qlQuery 			= require('couchbase').N1qlQuery;

function Publish() { };

Publish.create = function(params, callback) {
	var currentTime = new Date().toISOString();
	var publishDoc = {
		time: currentTime,
		pubType: params.pubType,
		publishID: (uuid.v4() + "_pub_" + params.pubType),
		title: params.title,
		author: params.author,
		authorID: params.authorID,
		hyperlink: params.webpage,
		blurb: params.blurb
	}
	console.log(publishDoc);
	var insertPub = N1qlQuery.fromString('INSERT INTO ' + publishBucketName + ' (KEY, VALUE) VALUES ($1, $2)');
    publishBucket.query(insertPub, [publishDoc.publishID, publishDoc], function (err, result) {
    	if (err) {
    		console.log(err);
    		callback(err, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
};

Publish.remove = function(params, callback) {
	publishBucket.remove(params.publishID, function(err, result) {
		if (err) {
			console.log(err);
			callback(err, null);
    		return;
		}
		callback(null, {message: "success", data: result});
	});
};



module.exports = Publish;