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
app.use(multer({
  dest: './uploads/',
  rename: function (fieldname, filename) {
    return filename.replace(/\W+/g, '-').toLowerCase() + Date.now()
  }
}));

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/node-forge'));
app.use(express.static(__dirname + '/node_modules/node-uuid'));

var routes = require("./routes/routes.js")(app);

var cluster = new couchbase.Cluster(config.couchbase.server);
module.exports.bucket = cluster.openBucket(config.couchbase.bucket);
module.exports.pictureBucket = cluster.openBucket(config.couchbase.pictureBucket);

// enable N1QL for the primary bucket 'Users'
module.exports.bucket.enableN1ql("http://localhost:8093");

// startup our app at http://localhost:8080
var port = process.env.PORT || 3000;
app.listen(port);               

// inform user of IP                     
console.log('View Touchbase at localhost:3000');