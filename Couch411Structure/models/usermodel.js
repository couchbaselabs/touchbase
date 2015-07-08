var uuid 			= require("uuid");
var forge 			= require("node-forge");
var bucket			= require("../app.js").bucket;
//var pictureBucket	= require("../app.js").pictureBucket;
var N1qlQuery 		= require('couchbase').N1qlQuery;
//bucket.enableN1ql("http://localhost:8093");

function User() { };

User.create = function(newID, params, callback) {
	var currentTime = new Date().toUTCString();	
	var stringToArray = function(anyString) {
		var tempArray=anyString.split(",");
		var resultArray=[];
		for (i=0; i<tempArray.length; i++) {
			var str = tempArray[i];
			resultArray[i]= str.trim();
			if (resultArray[i]=="") {
				resultArray.splice(i, 1);
			}
		}
		return resultArray;
	}
    var userDoc = {
    	email: params.email,
        uuid: newID,
        name: params.name,
        password: forge.md.sha1.create().update(params.password).digest().toHex(),
        administrator: false,
        hobbyArray: stringToArray(params.hobbyArray),
        expertiseArray: stringToArray(params.expertiseArray),
        division: params.division,
        jobTitle: params.title,
        baseOffice: params.baseOffice,
        registerTime: currentTime,
        loginTimes: [currentTime]
    };
    var insertUser = N1qlQuery.fromString('INSERT INTO ' + bucket + ' (KEY, VALUE) VALUES (\"' + userDoc.uuid + '\", \"' + JSON.stringify(userDoc) + '\")');
    bucket.query(insertUser, function (err, result) {
    	if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
};

User.searchByEmail = function (params, callback) {
	var searchUsers = N1qlQuery.fromString('SELECT * FROM ' + bucket + ' WHERE email LIKE \"%' + params.email + '%\"');
	bucket.query(searchUsers, function (err, result) {
		if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
	});
};

User.validatePassword = function(rawPassword, hashedPassword) {
    if (forge.md.sha1.create().update(rawPassword).digest().toHex() === hashedPassword) {
    	return true;
    }
    else {
    	return false;
    }
};

User.addLoginTime = function(uuid, callback) {
	var currentTime = new Date().toUTCString();
	var addLoginTime = N1qlQuery.fromString("UPDATE " + bucket + " SET loginTimes=ARRAY_PREPEND(\"" + currentTime + "\", loginTimes) WHERE META(" + bucket + ").id =\"" + uuid + "\"");
    bucket.query(addLoginTime, function (err, result) {
    	if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
};

User.advancedSearch = function(params, callback) {
	var email, name, administrator, hobbies, expertise, division, title, baseOffice;
	name = administrator = hobbies = expertise = division = title = baseOffice = "";
	var stringToArray = function(anyString) {
			var tempArray=anyString.split(",");
			var resultArray=[];
			for (i=0; i<tempArray.length; i++) {
				var str = tempArray[i];
				resultArray[i]= str.trim();
				if (resultArray[i]=="") {
					resultArray.splice(i, 1);
				}
			}
			return resultArray;
	}
	if (!params.email) {
		email = "WHERE email LIKE \"%%\"";
	}
	else {
		email = ("WHERE email LIKE \"%" + params.email + "%\"");
	}
	if (params.name) {
		name = ("AND name LIKE \"%" + params.name + "%\"");
	}
	if (params.administrator) {
		administrator = ("AND administrator = true");
	}
	if (params.hobbies) {
		var hobbyArray = stringToArray(params.hobbies);
		var arrayName = "hobbyArray";
		for (i=0; i<hobbyArray.length; i++) {
			hobbies += ("AND ANY blah IN " + bucket + "." + arrayName + " SATISFIES blah LIKE \"%" + hobbyArray[i] + "%\" END ");
		}
	}
	if (params.expertise) {
		var expertiseArray = stringToArray(params.expertise);
		var arrayName = "expertiseArray";
		for (i=0; i<expertiseArray.length; i++) {
			hobbies += ("AND ANY blah IN " + bucket + "." + arrayName + " SATISFIES blah LIKE \"%" + expertiseArray[i] + "%\" END ");
		}
	}
	if (params.division) {
		division = ("AND division = \"" + params.division + "\"");
	}
	if (params.title) {
		title = ("AND title LIKE \"%" + params.title + "%\"");
	}
	if (params.baseOffice) {
		baseOffice = ("AND division = \"" + params.baseOffice + "\"");
	}
	if(typeof bucket === "undefined") {console.log("bucket variable is undefined in userModel")};
	var advancedQuery = N1qlQuery.fromString("SELECT * FROM " + " " + bucket + " " + email + " " + name + " " + administrator + " " +  hobbies + " " + expertise + " " + division + " " + title + " " + baseOffice);
	console.log(advancedQuery);
	bucket.query(advancedQuery, function (err, result) {
		if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
	});
};
// must incorporate images here somehow!

module.exports = User;

