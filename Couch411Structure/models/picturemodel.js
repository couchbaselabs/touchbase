var uuid 		= require("uuid");
var forge 		= require("node-forge");
var bucket		= require("../app").bucket;
var bucket		= require("../app").pictureBucket;
var N1qlQuery 	= require('couchbase').N1qlQuery;
var couchbase 	= require('couchbase');

function Picture() { };



module.exports = Picture;