var forge 			= require("node-forge");
var publishBucket	= require("../app").publishBucket;
var N1qlQuery 		= require('couchbase').N1qlQuery;
//bucket.enableN1ql("http://localhost:8093");

function Publish() { };

Publish.create = function(params, callback) {
	var PublishDoc = {
		title: params.title,
		author: params.author,
		type: params.type,
		hyperlink: params.webpage,
		publishID: (uuid.v4() + "_pub_" + PublishDoc.type),
		blurb: params.blurb
	}
	var insertPub = N1qlQuery.fromString('INSERT INTO ' + publishBucket + ' (KEY, VALUE) VALUES (\"' + PublishDoc.publishID + '\", \"' + JSON.stringify(PublishDoc) + '\")');
    publishBucket.query(insertPub, function (err, result) {
    	if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
}

module.exports = Publish;