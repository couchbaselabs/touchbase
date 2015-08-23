var uuid 				= require("uuid");
var forge 				= require("node-forge");
var userBucket			= require("../app").userBucket;
var userBucketName		= require("../config").couchbase.userBucket;
var pictureBucket		= require("../app").pictureBucket;
var pictureBucketName	= require("../config").couchbase.pictureBucket;
var publishBucket		= require("../app").publishBucket;
var publishBucketName	= require("../config").couchbase.publishBucket;
var N1qlQuery 			= require('couchbase').N1qlQuery;
var configData 			= require("../config.json").dataModel;

var stringAttributes 	= configData.stringAttributes;
var arrayAttributes		= configData.arrayAttributes;
var dropdownAttributes	= configData.dropdownAttributes;
var primaryAttribute	= configData.primaryAttribute;

function User() { };

User.createPrimaryIndexes = function(callback) {
	var indexCreator = function(bucketname) {
		var indexOnUsers = N1qlQuery.fromString("CREATE PRIMARY INDEX ON " + bucketname);
		console.log(indexOnUsers);
		return indexOnUsers;
	}; 
    userBucket.query(indexCreator(userBucketName), function (err, result) {
		if (err) {
    		callback((userBucketName + err), null);
    		return;
    	}
    	console.log(result);
    	userBucket.query(indexCreator(pictureBucketName), function (err, result) {
			if (err) {
	    		callback((pictureBucketName + err), null);
	    		return;
	    	}
	    	console.log(result);
	    	userBucket.query(indexCreator(publishBucketName), function (err, result) {
				if (err) {
		    		callback((publishBucketName + err), null);
		    		return;
		    	}
		    	console.log(result);
    			callback(null, 'Primary Indexes Created!');
    		});
    	});
	});
};

User.create = function(params, callback) {
	var currentTime = new Date().toISOString();	
	console.log('params: ' + params);
	var stringToArray = function(anyString) {
		if (typeof anyString === "undefined" || !anyString) {
			return "";
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
	if (!params.arrayAttributes) {
		params.arrayAttributes = {};
	}
	if (!params.dropdownAttributes) {
		params.dropdownAttributes = {};
	}
	if (!params.stringAttributes) {
		params.stringAttributes = {};
	}
	/*if (!params.arrayAttributes.hobbies) {
		params.arrayAttributes.hobbies = "";
	}
	if (!params.arrayAttributes.expertise) {
		params.arrayAttributes.expertise="";
	}*/
	// uuid, login, & timeTracker will remain constant; only the attributes can be changed
    var userDoc = {
    	// should add a type here, ex. type: "user"
    	uuid: uuid.v4(),
    	password: forge.md.sha1.create().update(params.login.password).digest().toHex(),
    	stringAttributes: {},
    	arrayAttributes: {},
    	dropdownAttributes: {},
        login: {
        	type: "user",
	        email: params.login.email,
	        administrator: false,
	        hasPicture: false,
	        emailVerified: false
	    },
	    timeTracker: {
	        registerTime: currentTime,
	        updateTimes: [],
	        loginTimes: [currentTime]
    	}
    };
    for (i=0; i<stringAttributes.length; i++) {
    	userDoc.stringAttributes[stringAttributes[i]] = params.stringAttributes[stringAttributes[i]];
    }
    for (j=0; j<arrayAttributes.length; j++) {
    	userDoc.arrayAttributes[arrayAttributes[j]] = stringToArray(params.arrayAttributes[arrayAttributes[j]]);
    }
    for (k=0; k<dropdownAttributes.length; k++) {
    	userDoc.dropdownAttributes[dropdownAttributes[k].varname] = params.dropdownAttributes[dropdownAttributes[k].varname];
    }
    userDoc[primaryAttribute] = params[primaryAttribute];
    console.log(userDoc);
    var insertUser = N1qlQuery.fromString('INSERT INTO ' + userBucketName + ' (KEY, VALUE) VALUES ($1, $2)');
    console.log(insertUser);
    userBucket.query(insertUser, [userDoc.uuid, userDoc], function (err, result) {
    	if (err) {
    		console.log("ERROR IN USERMODEL QUERY: ");
    		console.log(err);
    		callback(err, null);
    		return;
    	}
    	callback(null, {message: "success", data: result, userID: userDoc.uuid, userDoc: userDoc});
    });
};

User.newUpdate = function (userDoc, callback) {
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
	if (!userDoc.arrayAttributes) {
		userDoc.arrayAttributes = {};
	}
	if (!userDoc.dropdownAttributes) {
		userDoc.dropdownAttributes = {};
	}
	if (!userDoc.stringAttributes) {
		userDoc.stringAttributes = {};
	}
	Object.keys(userDoc.arrayAttributes).forEach(function (key) {
		userDoc.arrayAttributes[key] = stringToArray(userDoc.arrayAttributes[key]);
		// use val
	});
	var updateUser = N1qlQuery.fromString('UPSERT INTO ' + userBucketName + ' (KEY, VALUE) VALUES ($1, $2)');
	console.log(updateUser);
	userBucket.query(updateUser, [userDoc.uuid, userDoc], function (err, result) {
    	if (err) {
    		console.log("ERROR IN USERMODEL QUERY: ");
    		console.log(err);
    		callback(err, null);
    		return;
    	}
    	console.log('userDoc updated: '+ result);
    	callback(null, result);
    });
};

/*
User.update = function(params, currentDoc, callback) {
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
    var userDocUpdate = {
    	uuid: currentDoc.uuid,
        login: {
	        email: params.email,
	        password: currentDoc.login.password,
	        administrator: currentDoc.login.administrator,
	        hasPicture: currentDoc.login.hasPicture,
	        emailVerified: currentDoc.login.emailVerified
	    },
	    stringAttributes: {
	    	skype: params.skype,
        	name: params.name,
	        jobTitle: params.jobTitle
	    },
        arrayAttributes: {
	        hobbies: stringToArray(params.hobbies),
	        expertise: stringToArray(params.expertise)
	    },
	    dropdownAttributes: {
	        baseOffice: params.baseOffice,
	        division: params.division
	    },
	    timeTracker: {
	        registerTime: currentDoc.timeTracker.registerTime,
	        updateTimes: [currentTime].concatenate(currentDoc.timeTracker.updateTimes),
	        loginTimes: currentDoc.timeTracker.loginTimes
    	}
    };
    console.log(JSON.stringify(userDoc));
    var updateUser = N1qlQuery.fromString('UPDATE ' + userBucketName + ' SET ' + userBucketName + ' (KEY, VALUE) VALUES ($1, $2) WHERE META(' + userBucketName+ ').id = $1');
    console.log(updateUser);
    userBucket.query(updateUser, [userDocUpdate.uuid, userDocUpdate], function (err, result) {
    	if (err) {
    		console.log("ERROR IN USERMODEL QUERY: ");
    		console.log(err);
    		callback(err, null);
    		return;
    	}
    	callback(null, {message: "success", data: result, userID: userDocUpdate.uuid});
    });
};
*/

User.searchByEmail = function (params, callback) {
	var searchUsers = N1qlQuery.fromString('SELECT login.email FROM ' + userBucketName + ' WHERE LOWER(login.email) LIKE LOWER($1)');
	console.log("searchByEmail: " + searchUsers);
	userBucket.query(searchUsers, [params.email], function (err, result) {
		if (err) {
    		callback(err, null);
    		return;
    	}
    	callback(null, result);
	});
};

User.validatePassword = function(rawPassword, hashedPassword) {
    return (forge.md.sha1.create().update(rawPassword).digest().toHex() === hashedPassword); 
};

User.addLoginTime = function(userID, callback) {
	var currentTime = new Date().toISOString();
	var addLoginTime = N1qlQuery.fromString("UPDATE " + userBucketName + " USE KEYS($2) SET timeTracker.loginTimes=ARRAY_PREPEND($1, timeTracker.loginTimes)");
	console.log("addLoginTime: " + addLoginTime);
    userBucket.query(addLoginTime, [currentTime, userID], function (err, result) {
    	if (err) {
    		console.log(err);
    		callback(err, null);
    		return;
    	}
    	callback(null, {message: "success", data: result});
    });
};

User.advancedSearch = function(params, callback) {
	/*var email, name, administrator, hobbies, expertise, division, title, baseOffice, userID;
	name = administrator = hobbies = expertise = division = title = baseOffice = userID =""; */
	var advancedQuery = ('SELECT * FROM ' + userBucketName + ' WHERE login.type="user" ');
	/*var stringToArray = function(anyString) {
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
	}*/
	if (params.userID) {
		advancedQuery += ("AND uuid = \"" + params.userID + "\" ");
	}
	if (params.email) {
		advancedQuery += ("AND LOWER(login.email) LIKE LOWER(\"%" + params.email + "%\") ");
	}
	if (params.administrator) {
		advancedQuery += ("AND login.administrator = true ");
	}
	for (i=0; i<stringAttributes.length;i++) {
		if (params[stringAttributes[i]]) {
			advancedQuery += ("AND LOWER(stringAttributes."+stringAttributes[i]+") LIKE LOWER (\"%" + params[stringAttributes[i]] + "%\") ");
		}
	}
	for (j=0; j<arrayAttributes.length; j++) {
		if (params[arrayAttributes[j]]) {
			advancedQuery += ("AND ANY blah IN " + userBucketName + ".arrayAttributes." + arrayAttributes[j] + " SATISFIES LOWER(blah) LIKE LOWER(\"%" + params[arrayAttributes[j]] + "%\") END ");
		}
	}
	for (k=0; k<dropdownAttributes.length; k++) {
		if (params[dropdownAttributes[k]]) {
			advancedQuery += ("AND dropdownAttributes."+dropdownAttributes[k]+" = \"" + params[dropdownAttributes[k]] + "\" ");
		}
	}
	// create the parts of the file you need, using a for loop in the script, and use += to add them to advancedQuery
	/*if (params.administrator) {
		advancedQuery += ("AND login.administrator = true ");
	}
	if (params.name) {
		advancedQuery += ("AND LOWER(stringAttributes.name) LIKE LOWER (\"%" + params.name + "%\") ");
	}
	if (params.jobTitle) {
		advancedQuery += ("AND LOWER(stringAttributes.jobTitle) LIKE LOWER(\"%" + params.jobTitle + "%\") ");
	}
	if (params.skype) {
		advancedQuery += ("AND LOWER(stringAttributes.skype) LIKE LOWER(\"%" + params.skype + "%\") ");
	}
	if (params.hobbies) {
		var hobbyArray = stringToArray(params.hobbies);
		var arrayName = "hobbies";
		for (i=0; i<hobbyArray.length; i++) {
			advancedQuery += ("AND ANY blah IN " + userBucketName + ".arrayAttributes." + arrayName + " SATISFIES LOWER(blah) LIKE LOWER(\"%" + hobbyArray[i] + "%\") END ");
		}
	}
	if (params.expertise) {
		var expertiseArray = stringToArray(params.expertise);
		var arrayName = "expertise";
		for (i=0; i<expertiseArray.length; i++) {
			advancedQuery += ("AND ANY blah IN " + userBucketName + ".arrayAttributes." + arrayName + " SATISFIES LOWER(blah) LIKE LOWER(\"%" + expertiseArray[i] + "%\") END ");
		}
	}
	if (params.division) {
		advancedQuery += ("AND dropdownAttributes.division = \"" + params.division + "\" ");
	}
	if (params.baseOffice) {
		advancedQuery += ("AND dropdownAttributes.baseOffice = \"" + params.baseOffice + "\" ");
	}
	*/
	// var advancedQuery = N1qlQuery.fromString("SELECT * FROM " + userBucketName + " " + email + " " + name + " " + administrator + " " +  hobbies + " " + expertise + " " + division + " " + title + " " + baseOffice + " " + userID);
	if (params.loginAuth) {
		advancedQuery+= ("ORDER BY "+primaryAttribute);
	}
	else {
		advancedQuery += ("AND login.emailVerified=true ORDER BY "+primaryAttribute);
	}
	var advancedQueryN1ql = N1qlQuery.fromString(advancedQuery);
	console.log(advancedQueryN1ql);
	userBucket.query(advancedQueryN1ql, function (error, result) {
		if (error) {
    		callback(error, null);
    		return;
    	}
    	console.log(result);
    	callback(null, result);
	});
};

User.intelligentCount = function(params, callback) {
	/*if (!params.searchTerm) {
		return callback(null, {status: "error", message: "Please enter a search term."});
	}*/
	var intelliQuery = '';
	var arrayName = '';
	for (i=0; i<arrayAttributes.length; i++) {
		arrayName = arrayAttributes[i];
		if (i>0) {
			intelliQuery += 'UNION ALL ';
		}
		if (arrayName) {
			intelliQuery += ('SELECT COUNT(*) as count, \"'+arrayName+'\" AS field FROM '+userBucketName+' where ANY blah IN '+ userBucketName + '.arrayAttributes.' + arrayName + ' SATISFIES LOWER(blah) LIKE LOWER(\"%'+params.searchTerm+'%\") END AND login.emailVerified=true ');
		}
	}
	var stringName = '';
	for (j=0; j<stringAttributes.length; j++) {
		stringName = stringAttributes[j];
		if (j>0 || intelliQuery.length != -1) {
			intelliQuery += 'UNION ALL ';
		}
		if (stringName) {
			intelliQuery+= ('SELECT COUNT(*) as count, \"'+stringName+'\" AS field FROM '+userBucketName+' where LOWER(stringAttributes.'+stringName+') LIKE LOWER(\"%'+params.searchTerm+'%\") AND login.emailVerified=true ');
		}
	}
	var dropdownName = '';
	for (k=0; k<dropdownAttributes.length; k++) {
		dropdownName = dropdownAttributes[k];
		if (k>0 || intelliQuery.length != -1) {
			intelliQuery += 'UNION ALL ';
		}
		if (dropdownName) {
			intelliQuery+= ('SELECT COUNT(*) as count, \"'+dropdownName+'\" AS field FROM '+userBucketName+' where dropdownAttributes.'+dropdownName+' = \"'+params.searchTerm+'\" AND login.emailVerified=true ');
		}
	}
	intelliQuery += ' ORDER BY count DESC, field';
	var intelliQueryN1ql = N1qlQuery.fromString(intelliQuery);
	console.log(intelliQueryN1ql);
	userBucket.query(intelliQueryN1ql, function(error, result) {
		if(error) {
			callback(error, null);
			return;
		}
		var refinedArray = [];
		for (z=0; z<result.length; z++) {
			if (result[z].count > 0) {
				refinedArray.push(result[z]);
			}
		}
		if (refinedArray.length === 0) {
			refinedArray[0] = {"field": "Sorry, there are no results for your search."};
		}
		console.log('result: ' + result);
		console.log('refinedArray: ' + refinedArray);
		callback(null, refinedArray);
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

