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
				$scope.create=data;
				console.log(data);
				console.log("SUCCESS!");
			})
			.error(function(data) {
				console.log('PROBLEM!');
				console.log('Error: ' + data);
			});
	};

	$scope.checkRegister =function() {
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
		if ($scope.formData.password != $scope.formData.confPassword) {
			return true;
		}
		/*
		else {
			var patt = /couchbase.com/g;
			var result = patt.test($scope.formData.email);
			if(result) {
				$http({method: "GET", url: "/emailAvailable", params: $scope.formData})
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
		*/
	};

	$scope.checkLogin = function() {
		$http({method: "GET", url: "/checkLogin", params: $scope.loginData})
			.success(function(data) {
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
				console.log("shits");
				console.log(response);
				$scope.hobbiesPull = response[0].loginData.hobbyArray;
			})
			.error(function(data) {
				console.log("error with hobbyPull");
			});
	};
	
});

//var cropModule = angular.module('MyApp', ['ngImgCrop']);

//var flow = angular.module('app', ['flow']);

/*
				$http({method: "GET", url: "/checkLogin"})
					.success (function(result) {
						console.log("Result: " + result);
						if(result.numEmails>0) {
							$scope.yes = "Your email and password combination is correct, you may now enter.";
						}
						else {
							$scope.yes = "You may not enter, you email/password combination was incorrect.";
						}
					})
					.error (function(woot) {
						console.log('Error: '+ result);
					});
*/
