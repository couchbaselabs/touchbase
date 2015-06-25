var createLogin = angular.module('createLogin', []);

createLogin.controller("mainController", function ($scope, $http) {
	$scope.formData={};
	$scope.loginData={};
	$scope.yes={};
	$scope.hobbiesPull={};

	$scope.makeLogin = function(userInfo) {
		console.log($scope);
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
		    return re.test($scope.formData.password);
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
		if ($scope.formData.password != $scope.formData.confPassword) {
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
		    return re.test($scope.formData.password);
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
		if ($scope.formData.password != $scope.formData.confPassword) {
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

	$scope.passSecure = function () {
		$scope.formData.securePassword=forge.md.sha1.create().update($scope.formData.password).digest().toHex();
	}

	$scope.checkLogin = function() {
		$http({method: "GET", url: "/checkLogin", params: $scope.loginData})
			.success(function(data) {
				$scope.loginData={};
				console.log("data from Login request: " + data[0].numEmails);
				if(data[0].numEmails == 0) {
					$scope.yes="This username and password combination does not exist, please try again or register yourself a new account!";
					// in the future this would ask for another login and not enable the user to enter the site with a button
				}
				else if (data[0].numEmails == 1) {
					$scope.yes="SUCCESS WE'RE IN";
					// in the future this would allow user to click button that allows them into the site
				}
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
		        };       
		        FR.readAsDataURL( this.files[0] );
		    }
		}

		readImage();
		el("asd").addEventListener("change", readImage, false);
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

	$scope.encryptPass = function() {
		$scope.formData.securePass = forge.md.sha1.create().update($scope.formData.password).digest().toHex();
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
