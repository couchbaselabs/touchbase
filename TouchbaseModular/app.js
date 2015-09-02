// modules for the application
var couchbase       = require('couchbase');
var express         = require('express');
var app             = express();
var config          = require("./config");
var bodyParser      = require('body-parser');
var morgan          = require('morgan');
var multer          = require('multer');
var fs              = require('fs');
var gm              = require('gm');
var https           = require('https');
var http            = require('http');

// HTTPS with self-signed certs
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// use commands
app.use(bodyParser.urlencoded({extended:true, limit: '4mb'}));
app.use(bodyParser.json({limit: '4mb'}));
app.use(morgan('dev'));

// connect directories to save in memory before app is run, makes filepaths simpler
app.use(express.static(__dirname + '/'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + '/icons'));
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/bower_components/angular-cookies'));
app.use(multer({dest: './uploads/', 
    onFileUploadStart: function (file) {
      console.log(file.originalname + ' is starting ...')
    },
    onFileUploadComplete: function (file) {
      console.log(file.fieldname + ' uploaded to  ' + file.path)
      done=true;
    },
    limits: {
      fieldNameSize: 100,
      fileSize: 20000000,
      files: 1
    }
}));

// create cluster and create buckets using config file
var cluster = new couchbase.Cluster(config.couchbase.server);
module.exports.userBucket = cluster.openBucket(config.couchbase.userBucket);
module.exports.pictureBucket = cluster.openBucket(config.couchbase.pictureBucket);
module.exports.publishBucket = cluster.openBucket(config.couchbase.publishBucket);

// include API endpoints
var routes = require("./routes/routes.js")(app);

// set up HTTP and HTTPS if possible
var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);
httpServer.listen(config.couchbase.TouchbasePort);
httpsServer.listen(8443);
/*https.createServer({
    key: options.key,
    cert: options.cert
}, app).listen(443);*/

//http.createServer(app).listen(80);
//https.createServer(options, app).listen(443);
// startup our app at http://localhost:3000
//var port = process.env.PORT || config.couchbase.TouchbasePort;
//app.listen(3000);               

// inform user of IP                     
console.log('View Touchbase at localhost:' + config.couchbase.TouchbasePort);
