var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginCheckSchema = new Schema ({
	email: String,
	password: String
});

//potentially have an array of logins to track logins, using Date.now()
//will prepend/append the latest login at the time of the submit button

var loginCheck = mongoose.model('loginCheck', loginCheckSchema); 
module.exports = loginCheck;