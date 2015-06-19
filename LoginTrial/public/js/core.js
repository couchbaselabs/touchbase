var createLogin = angular.module('createLogin', []);

createLogin.controller("mainController", function ($scope, $http) {
	$scope.formData={};
	$scope.loginData={};
	$scope.yes={};

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
	};

	$scope.checkLogin = function() {
		$http({method: "GET", url: "/checkLogin", params: {"email": "hello@couchbase.com", "password": "hi"}})
			.success(function(data) {
				console.log("data from Login request: " + data[0].numEmails);
				if(data[0].numEmails == 0) {
					$scope.yes="This username and password combination does not exist, please try again or register yourself a new account!";
				}
				else if (data[0].numEmails == 1) {
					$scope.yes="SUCCESS WE'RE IN";
				}
			})
			.error (function(data) {
				console.log("no good for Login Request");
			});
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
	}

	$scope.arrayHobbies = function(randyString) {
		var tempArray=randyString.split(",");
		var resultArray=[];
		for (i=0; i<tempArray.length; i++) {
			var str = tempArray[i];
			resultArray[i]= str.trim();
		}
		console.log(resultArray);
		$scope.formData.hobbyArray = resultArray;
	}

	$scope.convertPicToBin = function() {
		var f = document.getElementById('file').files[0],
      	r = new FileReader();
  		r.onloadend = function(e){
    			var data = e.target.result;
    	//send you binary data via $http or $resource or do anything else with it
  		}		
 		 r.readAsBinaryString(f);
	}
	
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
