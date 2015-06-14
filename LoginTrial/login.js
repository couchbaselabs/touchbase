//login.js

//modules ====================================
var couchbase 	= require('couchbase');
var n1ql 		= require('couchbase').N1ql;
var express		= require('express');
var app 		= express();
var bodyParser	= require('body-parser');
var methodOverride = require('method-override');
var morgan 		= require('morgan');

//config =====================================
var port 		= process.env.PORT || 8080;
var cluster 	= new couchbase.Cluster('http://localhost:8091');	// could later add this to a config folder OR file
var bucket		= cluster.openBucket('loginData');

//user operations ============================
console.log("hello couchbase");

app.post('/login/create', function(req, res) {
	console.log("hello");
	var makelog=N1qlQuery.fromString("INSERT INTO loginData (KEY, VALUE) VALUES (UUID(),{email: " + req.body.email+ ", password: "+req.body.password+"}");
	if (req.body.password != req.body.confPassword) {
		console.log("Confirmed password did not match password");
	}
	else {
		bucket.query(makelog, function(err, result) {
		if (err) {
			res.send(err);
		}
		res.json(result);
		console.log("Login Added!");
		});
	}
});


// start app =================================
app.get('*', function(req, res) {
	    console.log("getting to indez.html"); // load the single view file (angular will handle the page changes on the front-end)
        res.sendfile('./public/index.html');
    });
// startup our app at http://localhost:8080
app.listen(port);               

// inform user of IP                     
console.log('Login at localhost:8080');