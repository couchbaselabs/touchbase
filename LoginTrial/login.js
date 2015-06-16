//login.js

//modules ====================================
var couchbase 	= require('couchbase');
var N1qlQuery 	= require('couchbase').N1qlQuery;
var express		= require('express');
var app 		= express();
var bodyParser	= require('body-parser');
var methodOverride = require('method-override');
var morgan 		= require('morgan');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//config =====================================
var port 		= process.env.PORT || 8080;
var cluster 	= new couchbase.Cluster('http://localhost:8091');	// could later add this to a config folder OR file
var bucket		= cluster.openBucket('loginData');
bucket.enableN1ql("http://localhost:8093");

//user operations ============================
console.log("hello couchbase");

app.post('/addUser', function(req, res) {
	console.log("hello");
	console.log(req.body);
	
	var primIndex=N1qlQuery.fromString("CREATE PRIMARY INDEX ON loginData");
	bucket.query(primIndex, function(err, result) {
		if (err) {
			console.log("Index already made on loginData, OK");
		}
		console.log(result);
		});

	var makelog=N1qlQuery.fromString("INSERT INTO loginData (KEY, VALUE) VALUES (UUID(),{\"email\": \"" + req.body.email+ "\", \"password\": \""+req.body.password+"\"})");
	console.log(makelog);
	bucket.query(makelog, function(err, result) {
		if (err) {
			console.log(err);
			console.log("ERROR ON NODE QUERY");
		}
		res.json(result);
		});
});

app.use(express.static(__dirname + '/public'));
//Store all HTML files in public folder.

// start app =================================
app.get('*', function(req, res) {
	    console.log("getting to index.html"); // load the single view file (angular will handle the page changes on the front-end)
        res.sendfile('index.html');
    });
// startup our app at http://localhost:8080
app.listen(port);               

// inform user of IP                     
console.log('Login at localhost:8080');