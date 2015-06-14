// app/models/user.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema ({
	administrator: {type: Boolean, default: false},
	email: String,
	fname: String,
	lname: String,
	password: String
	date: {type: Date, default: Date.now}
});

var User = mongoose.model('User', userSchema); 
module.exports = User;