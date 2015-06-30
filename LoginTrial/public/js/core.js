var createLogin = angular.module('createLogin', []);

createLogin.controller("mainController", function ($scope, $http) {
	$scope.formData={};
	$scope.loginData={};
	$scope.yes={};
	$scope.hobbiesPull={};
	$scope.image={};

	$scope.makeLogin = function(userInfo) {
		var d = new Date();
	    var n = d.toUTCString();
	    userInfo.registerTime = n;
	    userInfo.loginTimes = [n];
		console.log("inMakeLogin, no Post yet: " + userInfo);
		$http({method: "POST", url: "/addUser", data: userInfo})
			.success(function(data) {
				console.log($scope.formData);
				$scope.formData={};
				$scope.yesRegister="";
				$scope.create=data;
				console.log(data);
				console.log("SUCCESS!");
			})
			.error(function(data) {
				console.log('PROBLEM!');
				console.log('Error: ' + data);
			});
	};

	$scope.checkRegisterPass = function() {
		function checkPassword() {
		    // at least one number, one lowercase and one uppercase letter
		    // at least six characters
		    var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
		    return re.test($scope.password);
		} 
		if (!checkPassword())
		{
			$scope.errorMessage="Please make sure that your password contains 1 lower case character, 1 upper case character, 1 number and > 6 total characters";
			$scope.errorAlert="ERROR"; 
			$("#errorDiv").removeClass('hidden');
		}
		else {
			$("#errorDiv").addClass('hidden');
		}
	};

	$scope.checkRegisterConfPass =function() {
		if ($scope.password != $scope.confPassword) {
			$scope.errorMessage="Your entry for the 'Confirm Password' field does not match your entry for 'Password'. Please try again.";
			$scope.errorAlert="ERROR"; 
			$("#errorDiv").removeClass('hidden');
		}
		else {
			$("#errorDiv").addClass('hidden');	
		}
	};

	$scope.checkRegisterBool =function() {
		function checkPassword() {
		    // at least one number, one lowercase and one uppercase letter
		    // at least six characters
		    var re = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
		    return re.test($scope.password);
		} 
		function checkEmailAvail () {
			var patt = /couchbase.com/g;
			var result = patt.test($scope.formData.email);
			if(result) {
				$http({method: "GET", url: "/emailAvailaboolean", params: $scope.formData})
					.success(function(data) {
						console.log("data from Login request: " + data[0].numEmails);
						if(data[0].numEmails == 0) {
							return false;
							// in the future this would ask for another login and not enable the user to enter the site with a button
						}
						else if (data[0].numEmails == 1) {
							return true;
							// in the future this would allow user to click button that allows them into the site
						}
					})
					.error (function(data) {
						console.log("no good for Register Request");
					});
			}
			else {
				return true;
			}
		}
		if ($scope.password != $scope.confPassword) {
			return true;
		}
		else if (!checkPassword()) {
			return true;
		}
		//else if (!checkEmailAvail()) {
		//	return true;
		//}
		else {
			return false;
		}
	};

	$scope.encryptPass = function() {
		$scope.formData.securePassword = forge.md.sha1.create().update($scope.password).digest().toHex();
	};

	$scope.checkLogin = function() {
		$scope.loginData.securePassword=forge.md.sha1.create().update($scope.loginPass).digest().toHex();
		var d = new Date();
	    var n = d.toUTCString();
		$scope.loginData.currentTime = n;
		$http({method: "GET", url: "/checkLogin", params: $scope.loginData})
			.success(function(data) {
				console.log("data from Login request: " + data[0].numEmails);
				if(data[0].numEmails == 0) {
					$scope.yes="This username and password combination does not exist, please try again or register yourself a new account!";
					// in the future this would ask for another login and not enable the user to enter the site with a button
				}
				else if (data[0].numEmails == 1) {
					$scope.yes="SUCCESS WE'RE IN";
					$http({method: "POST", url: "/addLoginTime", data: $scope.loginData})
						.success (function(result) {
							console.log("time added to loginTime array");
						})
						.error (function(result) {
							console.log("time NOT added to loginTime array");
						});
					// in the future this would allow user to click button that allows them into the site
					// insert timelog here!
				}
				$scope.loginData={};
				$scope.loginPass="";
			})
			.error (function(data) {
				console.log("no good for Login Request");
			});
	};

	$scope.emailAvailable = function() {
		var patt = /couchbase.com/g;
		var result = patt.test($scope.formData.email);
		if(result) {
			$http({method: "GET", url: "/emailAvailable", params: $scope.formData})
				.success(function(data) {
					console.log("data from Login request: " + data[0].numEmails);
					if(data[0].numEmails == 0) {
						$scope.yesRegister="This email is available!";
						// in the future this would ask for another login and not enable the user to enter the site with a button
					}
					else if (data[0].numEmails == 1) {
						$scope.yesRegister="Sorry, this email is taken. You have either created an account (Go to Login), or this is an invalid couchbase.com email address.";
						// in the future this would allow user to click button that allows them into the site
					}
				})
				.error (function(data) {
					console.log("no good for Register Request");
				});
		}
		else {
			$scope.yesRegister="Only couchbase.com emails are allowed, please use one."
		}
	};

	$scope.emailAvailaboolean = function() {
		var patt = /couchbase.com/g;
		var result = patt.test($scope.formData.email);
		if(result) {
			$http({method: "GET", url: "/emailAvailaboolean", params: $scope.formData})
				.success(function(data) {
					console.log("data from Login request: " + data[0].numEmails);
					if(data[0].numEmails == 0) {
						return false;
						// in the future this would ask for another login and not enable the user to enter the site with a button
					}
					else if (data[0].numEmails == 1) {
						return true;
						// in the future this would allow user to click button that allows them into the site
					}
				})
				.error (function(data) {
					console.log("no good for Register Request");
				});
		}
		else {
			return true;
		}

	};

	$scope.arrayExpertise = function(randyString) {
		var tempArray=randyString.split(",");
		var resultArray=[];
		for (i=0; i<tempArray.length; i++) {
			var str = tempArray[i];
			resultArray[i]= str.trim();
		}
		console.log(resultArray);
		$scope.formData.expertiseArray = resultArray;
	};

	$scope.arrayHobbies = function(randyString) {
		var tempArray=randyString.split(",");
		var resultArray=[];
		for (i=0; i<tempArray.length; i++) {
			var str = tempArray[i];
			resultArray[i]= str.trim();
			if (resultArray[i]=="") {
				resultArray.splice(i, 1);
			}
		}
		console.log(resultArray);
		$scope.formData.hobbyArray = resultArray;
	};

	$scope.convertPicToBin = function() {
		var f = document.getElementById('file').files[0],
      	r = new FileReader();
  		r.onloadend = function(e){
    			var data = e.target.result;
    	//send you binary data via $http or $resource or do anything else with it
  		}		
 		 r.readAsBinaryString(f);
	};

	$scope.getHobbies = function() {
		$http({method: "GET", url: "/getHobbies", params: $scope.searchData})		
			.success(function(response) {
				$scope.hobbiesPull={};
				console.log("shits");
				console.log(response);
				$scope.hobbiesPull = response[0].loginData.hobbyArray;
			})
			.error(function(data) {
				console.log("error with hobbyPull");
			});
	};

	$scope.getBase64Image = function() {

		function el(id){return document.getElementById(id);} // Get elem by ID

		function readImage() {
		    if ( this.files && this.files[0] ) {
		        var FR= new FileReader();
		        FR.onload = function(e) {
		             el("img").src = e.target.result;
		             el("base").innerHTML = e.target.result;
		             b64String = e.target.result;
		             console.log ("INSIDE:  " + b64String);
		             console.log(typeof(b64String));
		        };       
		        FR.readAsDataURL( this.files[0] );
		    }
		}
		readImage();
		el("asd").addEventListener("change", readImage, false);
		console.log(window.b64String);
		var temp = window.b64String;
		var b64 = temp.replace("data:image/png;base64,","");		// make sure to acct for all file formats!!!!
		console.log(b64);											// make sure to acct for all possible ways in which image could be input (shouldnt be added without UUID)
		return b64;
	};

	/*$scope.getBase64Image= function () {
		var p;
		var canvas = document.createElement("canvas");
		var img1=document.createElement("img");  
	    p=document.getElementById("fileUpload").value;
	    console.log(p);
	    img1.setAttribute('src', p); 
	    canvas.width = img1.width; 
	    canvas.height = img1.height; 
	    var ctx = canvas.getContext("2d"); 
	    ctx.drawImage(img1, 0, 0); 
	    var dataURL = canvas.toDataURL("image/png");    
	    $scope.formData.picURL = dataURL;
	}; */

	$scope.b64toBlob = function(b64Data, contentType, sliceSize) {
		    contentType = contentType || '';
		    sliceSize = sliceSize || 512;

		    var byteCharacters = atob(b64Data);
		    var byteArrays = [];

		    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
		        var slice = byteCharacters.slice(offset, offset + sliceSize);

		        var byteNumbers = new Array(slice.length);
		        for (var i = 0; i < slice.length; i++) {
		            byteNumbers[i] = slice.charCodeAt(i);
		        }

		        var byteArray = new Uint8Array(byteNumbers);

		        byteArrays.push(byteArray);
		    }

		    var blob = new Blob(byteArrays, {type: contentType});
		    return blob;
	};

	$scope.convertImgToStore = function() {
		var b64String = $scope.getBase64Image();
		var contentType = "image/png";
		var blob = $scope.b64toBlob(b64String, contentType);
		var temp = blob.toString();
		$scope.image.blob = temp;
		var blobUrl = URL.createObjectURL(blob);
		console.log(blobUrl);
		$http({method: "POST", url: "/postImage", data: $scope.image})
			.success(function(response) {
				console.log("WOOT POSTED, check CouchDB");
			})
			.error(function(response) {
				console.log("shit");
			});
	};

	$scope.generateUUID = function () {
		var temp = uuid.v4();
		$scope.formData.uuid=temp;
		$scope.image.uuid=temp;
	};

	/* $scope.checkSearch =function(searchString) {
		// to split as 1 text field, or make it multiple things you could populate
		var elementSplit = new searchString.split("&");
		var numTypes;
		for (i=0; i<elementSplit.length; i++) {
			var ("searchType" + i) = elementSplit[i].split(":");
		}
	}; */
	
});

//var cropModule = angular.module('MyApp', ['ngImgCrop']);
