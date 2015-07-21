var uuid 			= require("uuid");
var forge 			= require("node-forge");
var userBucket		= require("../app").userBucket;
var userBucketName	= require("../config").couchbase.userBucket;
var N1qlQuery 		= require('couchbase').N1qlQuery;

var stringAttributes 	= ["skype", "name", "jobTitle"];
var arrayAttributes		= ["hobbies", "expertise"];
var dropdownAttributes	= ["baseOffice", "division"];

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

User.create = function(params, callback) {
	var currentTime = new Date().toISOString();	
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
	// uuid, login, & timeTracker will remain constant; only the attributes can be changed
    var userDoc = {
    	uuid: uuid.v4(),
        login: {
	        email: params.email,
	        password: forge.md.sha1.create().update(params.password).digest().toHex(),
	        administrator: false,
	        hasPicture: false
	    },
	    stringAttributes: {
	    	skype: params.skype,
        	name: params.name,
	        jobTitle: params.title
	    },
        arrayAttributes: {
	        hobbyArray: stringToArray(params.hobbyArray),
	        expertiseArray: stringToArray(params.expertiseArray)
	    },
	    dropdownAttributes: {
	        baseOffice: params.baseOffice,
	        division: params.division
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
    var insertUser = N1qlQuery.fromString('INSERT INTO ' + userBucketName + ' (KEY, VALUE) VALUES ($1, $2)');
    console.log(insertUser);
    userBucket.query(insertUser, [userDoc.uuid, userDoc], function (err, result) {
    	if (err) {
    		console.log("ERROR IN USERMODEL QUERY: ");
    		console.log(err);
    		callback(err, null);
    		return;
    	}
    	callback(null, {message: "success", data: result, userID: userDoc.uuid});
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
	var addLoginTime = N1qlQuery.fromString("UPDATE " + userBucketName + " SET timeTracker.loginTimes=ARRAY_PREPEND($1, timeTracker.loginTimes) WHERE META(" + userBucketName + ").id =$2");
	console.log("addLoginTime: " + addLoginTime);
    userBucket.query(addLoginTime, [currentTime, uuid], function (err, result) {
    	if (err) {
    		callback(error, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
};

User.advancedSearch = function(params, callback) {
	var email, name, administrator, hobbies, expertise, division, title, baseOffice, userID;
	name = administrator = hobbies = expertise = division = title = baseOffice = userID ="";
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
	if (params.userID) {
		userID = ("AND uuid = \"" + params.userID + "\"");
	}
	var advancedQuery = N1qlQuery.fromString("SELECT * FROM " + userBucketName + " " + email + " " + name + " " + administrator + " " +  hobbies + " " + expertise + " " + division + " " + title + " " + baseOffice + " " + userID);
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
	if (!params.searchTerm) {
		return callback(null, {status: "error", message: "Please enter a search term."});
	}
	var intelliQuery = '';
	var arrayName = '';
	for (i=0; i<arrayAttributes.length; i++) {
		arrayName = arrayAttributes[i];
		if (i>0) {
			intelliQuery += 'UNION ALL ';
		}
		if (arrayName) {
			intelliQuery += ('SELECT COUNT(*) as count, \"'+arrayName+'\" AS field FROM'+userBucketName+'where ANY blah IN '+ userBucketName + '.arrayAttributes.' + arrayName + ' SATISFIES LOWER(blah) LIKE LOWER(\"%'+params.searchTerm+'%\") END ');
		}
	}
	var stringName = '';
	for (j=0; j<stringAttributes.length; j++) {
		stringName = stringAttributes[j];
		if (j>0 || intelliQuery.length != -1) {
			intelliQuery += 'UNION ALL ';
		}
		if (stringName) {
			intelliQuery+= ('SELECT COUNT(*) as count, \"'+stringName+'\" AS field FROM'+userBucketName+'where LOWER(stringAttributes.'+stringName+') LIKE LOWER(\"%'+params.searchTerm+'%\") ');
		}
	}
	var dropdownName = '';
	for (k=0; k<dropdownAttributes.length; k++) {
		dropdownName = dropdownAttributes[k];
		if (k>0 || intelliQuery.length != -1) {
			intelliQuery += 'UNION ALL ';
		}
		if (dropdownName) {
			intelliQuery+= ('SELECT COUNT(*) as count, \"'+dropdownName+'\" AS field FROM'+userBucketName+'where dropdownAttributes.'+dropdownName+' = '+params.searchTerm+' ');
		}
	}
	intelliQuery += 'ORDER BY count DESC';
	var intelliQueryN1ql = N1qlQuery.fromString(intelliQuery);
	console.log(intelliQueryN1ql);
	userBucket.query(intelliQueryN1ql, function(error, result) {
		if(error) {
			callback(error, null);
			return;
		}
		console.log(result);
		callback(null, result);
	});
	// want to loop through each type of array, and go through all array elements and string elements
	// for each type of text/array field, you will want to loop through to find all instances of it
	// you will then do a query like SELECT COUNT(*) FROM userBucketName WHERE (textfield/array loop)
	// then ouput the field name and count type in order of descending count
	/*else if (type == 'intelligent') {
		// could put in a loop for each one so that people can verify each type with a count (set up an array)
		var intelligentQuery = N1qlQuery.fromString("SELECT COUNT(*) FROM " + userBucketName + " " + email + " " + name + " " + administrator + " " +  hobbies + " " + expertise + " " + division + " " + title + " " + baseOffice);
		console.log(intelligentQuery);
		userBucket.query(intelligentQuery, function (error, result) {
			if (error) {
	    		callback(error, null);
	    		return;
	    	}
	    	console.log(result);
	    	callback(null, {message: "success", data: result});
		});
	} */
};

module.exports = User;

