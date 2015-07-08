// modules
var couchbase 		= require('couchbase');
var express			= require('express');
var app 			= express();
var config 			= require("./config");
var bodyParser		= require('body-parser');
var methodOverride 	= require('method-override');
var morgan 			= require('morgan');
var multer  		= require('multer');

// use commands
app.use(bodyParser.urlencoded({extended:true, limit: '3mb'}));
app.use(bodyParser.json({limit: '3mb'}));
app.use(morgan('dev'));
/*app.use(multer({dest: './uploads/',
rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}})); */

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/models'));
app.use(express.static(__dirname + '/node_modules/node-forge'));
app.use(express.static(__dirname + '/node_modules/node-uuid'));

var routes = require("./routes/routes.js")(app);

var cluster = new couchbase.Cluster(config.couchbase.server);
module.exports.bucket = cluster.openBucket(config.couchbase.bucket);
module.exports.pictureBucket = cluster.openBucket(config.couchbase.pictureBucket);

if(typeof module.exports.bucket === "undefined") {
	console.log("bucket variable is undefined")
}
else {
	console.log("defined in app.js")
}

// enable N1QL for the primary bucket 'Users'
//module.exports.bucketN1QL = bucket.enableN1ql("http://localhost:8093");

// startup our app at http://localhost:8080
var port = process.env.PORT || 3000;
app.listen(port);               

// inform user of IP                     
console.log('View Touchbase at localhost:3000');