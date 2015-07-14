var uuid 			= require("uuid");
var forge 			= require("node-forge");
var userBucket		= require("../app").userBucket;
var userBucketName	= require("../config").couchbase.userBucket;
var N1qlQuery 		= require('couchbase').N1qlQuery;

function User() { };

User.createPrimaryIndexes = function(callback) {
	var indexOnUsers = ("CREATE PRIMARY INDEX ON " + userBucketName);
    userBucket.query(indexOnUsers, function (err, result) {
		if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
	});
};

User.create = function(newID, params, callback) {
	var currentTime = new Date().ISOString();	
	var stringToArray = function(anyString) {
		if (typeof anyString === "undefined") {
			return anyString;
		}
		else {
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
	};
    var userDoc = {
    	uuid: newID,
        name: params.name,
        login: {
	        email: params.email,
	        password: forge.md.sha1.create().update(params.password).digest().toHex(),
	        administrator: false,
	        hasPicture: false
	    },
        handles: {
        	skype: params.skype
        },
        arrayAttributes: {
	        hobbyArray: stringToArray(params.hobbyArray),
	        expertiseArray: stringToArray(params.expertiseArray)
	    },
	    jobAttributes: {
	        division: params.division,
	        jobTitle: params.title,
	        baseOffice: params.baseOffice
	    },
	    timeTracker: {
	        registerTime: currentTime,
	        loginTimes: [currentTime]
    	}
    };
    if (params.picture) {
    	userDoc.login.hasPicture = true;
    }
    console.log(JSON.stringify(userDoc));
    var insertUser = N1qlQuery.fromString('INSERT INTO ' + userBucketName + ' (KEY, VALUE) VALUES (\"' + userDoc.uuid + '\", ' + JSON.stringify(userDoc) + ')');
    console.log(insertUser);
    userBucket.query(insertUser, function (err, result) {
    	if (err) {
    		console.log("ERROR IN USERMODEL QUERY: ");
    		console.log(err);
    		callback(err, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
};

User.searchByEmail = function (params, callback) {
	var searchUsers = N1qlQuery.fromString('SELECT * FROM ' + userBucketName + ' WHERE LOWER(login.email) LIKE LOWER(\"%' + params.email + '%\")');
	console.log("searchByEmail: " + searchUsers);
	userBucket.query(searchUsers, function (err, result) {
		if (err) {
    		callback(err, null);
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
	var currentTime = new Date().toISOString();
	var addLoginTime = N1qlQuery.fromString("UPDATE " + userBucketName + " SET timeTracker.loginTimes=ARRAY_PREPEND(\"" + currentTime + "\", timeTracker.loginTimes) WHERE META(" + userBucketName + ").id =\"" + uuid + "\"");
	console.log("addLoginTime: " + addLoginTime);
    userBucket.query(addLoginTime, function (err, result) {
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
		email = "WHERE login.email LIKE \"%%\"";
	}
	else {
		email = ("WHERE LOWER(login.email) LIKE LOWER(\"%" + params.email + "%\")");
	}
	if (params.name) {
		name = ("AND LOWER(name) LIKE LOWER(\"%" + params.name + "%\")");
	}
	if (params.administrator) {
		administrator = ("AND login.administrator = true");
	}
	if (params.hobbies) {
		var hobbyArray = stringToArray(params.hobbies);
		var arrayName = "hobbyArray";
		for (i=0; i<hobbyArray.length; i++) {
			hobbies += ("AND ANY blah IN " + userBucketName + ".arrayAttributes." + arrayName + " SATISFIES LOWER(blah) LIKE LOWER(\"%" + hobbyArray[i] + "%\") END ");
		}
	}
	if (params.expertise) {
		var expertiseArray = stringToArray(params.expertise);
		var arrayName = "expertiseArray";
		for (i=0; i<expertiseArray.length; i++) {
			hobbies += ("AND ANY blah IN " + userBucketName + ".arrayAttributes." + arrayName + " SATISFIES LOWER(blah) LIKE LOWER(\"%" + expertiseArray[i] + "%\") END ");
		}
	}
	if (params.division) {
		division = ("AND jobAttributes.division = \"" + params.division + "\"");
	}
	if (params.title) {
		title = ("AND LOWER(jobAttributes.title) LIKE LOWER(\"%" + params.title + "%\")");
	}
	if (params.baseOffice) {
		baseOffice = ("AND jobAttributes.baseOffice = \"" + params.baseOffice + "\"");
	}
	var advancedQuery = N1qlQuery.fromString("SELECT * FROM" + " " + userBucketName + " " + email + " " + name + " " + administrator + " " +  hobbies + " " + expertise + " " + division + " " + title + " " + baseOffice);
	console.log(advancedQuery);
	userBucket.query(advancedQuery, function (error, result) {
		if (error) {
    		callback(error, null);
    		return;
    	}
    	console.log(result);
    	callback(null, {message: "success", data: result});
	});
};

User.intelligentCount = function(params, callback) {
	// for each type of text/array field, you will want to loop through to find all instances of it
	// you will then do a query like SELECT COUNT(*) FROM userBucketName WHERE (textfield/array loop)
	// then ouput the field name and count type in order of descending count
};
// must incorporate images here somehow!

module.exports = User;

