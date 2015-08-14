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

Publish.search = function(params, callback) {
	var pubQuery = "SELECT * FROM "+publishBucketName+" WHERE `e703eab0-3740-424b-8bd3-03ae4ca909df` IS MISSING ";
	if (params.pubType) {
		pubQuery+= ("AND pubType = \""+params.pubType+"\" ");
	}
	if (params.authorID) {
		pubQuery+= ("AND authorID = \""+params.authorID+"\" ");
	}
	if (params.title) {
		pubQuery+= ("AND title LIKE LOWER(%\""+params.title+"\"%) ");
	}
	if (params.author) {
		pubQuery+= ("AND author LIKE LOWER(%\""+params.author+"\"%) ");
	}
	pubQuery += "ORDER BY time DESC";
	pubQueryN1ql = N1qlQuery.fromString(pubQuery);
	console.log(pubQueryN1ql);
	publishBucket.query(pubQueryN1ql, function (error, result) {
		if (error) {
			console.log(error);
			callback(error, null);
    		return;
		}
		callback(null, result);
	});
};

Publish.remove = function(params, callback) {
	console.log(params);
	var deleteQuery = N1qlQuery.fromString('DELETE FROM '+publishBucketName+' USE KEYS ($1)');
	console.log(deleteQuery);
	publishBucket.query(deleteQuery, [params.publishID], function(err, result) {
		if (err) {
			console.log(err);
			callback(err, null);
    		return;
		}
		callback(null, {message: "success", data: result});
	});
};



module.exports = Publish;