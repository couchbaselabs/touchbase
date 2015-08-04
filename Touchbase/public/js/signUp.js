var signUp = angular.module('signUp', ['ngMaterial','ui.router', 'ngCropper']);

var stringAttributes 	= ["skype", "name", "jobTitle"];
var arrayAttributes		= ["hobbies", "expertise"];
var dropdownAttributes	= ["baseOffice", "division"];

signUp.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {

	$urlRouterProvider.otherwise('/login');
	
	$stateProvider

		.state('login', {
			url: '/login', 
			templateUrl: 'html/login-partial.html'
		})

		.state('register', {
			url: '/registerUser',
			templateUrl: 'html/register-partial.html'
		})

		.state('pictureUpload', {
			url: '/pictureUpload',
			templateUrl: 'html/picture-partial.html'
		})

		.state('verify',  {
			url: '/verify',
			templateUrl: 'html/verify-partial.html'
		})

		$mdThemingProvider.theme('red')
        	.primaryPalette('red', {
            'default': '800' })
             // by default use shade 900 from the grey palette for primary intentions
		/*$mdThemingProvider.theme('default')
    		.primaryPalette('red')
    		
    		.dark();*/
    	$mdThemingProvider.setDefaultTheme('red');

});

signUp.controller('loginController', function ($scope, $http, $window, $timeout) {
	
	$scope.loginData={};
	$scope.errors={};
	$scope.noError = true;

	$scope.loginAuth = function (someObject) {
		// this will require a name and password in the object to check login
		$http({method: "POST", url: "/api/loginAuth", data: someObject})
			.success(function(result) {
				console.log(result);
				localStorage.sessionID = result.sessionID;
				localStorage.expiry = result.expiry;
				$window.location.href = 'nav.html';
				console.log('localStorage: '+ JSON.stringify(localStorage));
			})
			.error(function(result) {
				$scope.errors.emailError = result;
				console.log("ERROR IN LOGIN: " + JSON.stringify(result));
			});
	};

	$scope.checkEmail = function (someString) {
		var endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }
		if (!someString || !(endsWith(someString, 'couchbase.com'))) {
			$scope.errors.emailError = "Please enter a valid couchbase.com email address.";
		}
		else {
			$scope.errors.emailError = "";
		}
	};

});

signUp.controller('registerController', function ($scope, $http, $window, $state) {

	//$scope.formData = {};
	$scope.errors={};
	
	$scope.registerUser = function (someObject) {
		// this will require a formData type object which contains all entries needed for the form to create an account
		$http({method: "POST", url: "/api/registerUser", data: someObject})
			.success(function(result) {
				console.log('localStorage: '+ JSON.stringify(localStorage));
				//$scope.formData = {};
				$state.go('verify');
			})
			.error(function(result) {
				console.log("ERROR IN REGISTER: " + JSON.stringify(result[0]));
			});
	};

	$scope.checkPass = function (string1, string2)	{
		if (string1 !== string2) {
			$scope.errors.confPasswordError = "Your password confirmation does not match your password."
		} else {
			$scope.errors.confPasswordError = "";
		}
	};

	$scope.checkEmail = function (someString) {
		var endsWith = function (str, suffix) {
            return str.indexOf(suffix, str.length - suffix.length) !== -1;
        }
		if (!someString || !(endsWith(someString, 'couchbase.com'))) {
			$scope.errors.emailError = "Please enter a valid couchbase.com email address.";
		}
		else {
			emailSearch(someString, 'email');
		}
	};

	$scope.passStrength = function (someString) {
		var passCheck = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
        if (!passCheck.test(someString)) {
            $scope.errors.passwordError = "Password must contain 1 lower case character, 1 upper case character, 1 number and at least 6 total characters";
        }
        else {
        	$scope.errors.passwordError = "";
        }
	};

	$scope.checkName = function (someString) {
		if (!someString) {
			$scope.errors.nameError = "A name is required!";
		} else {
			$scope.errors.nameError = "";
		}

	};

	var emailSearch = function(string, someField) {
		var tempObj={};
		eval("tempObj." + someField + "= \"" + string+"\";");
		$http({method: "GET", url: "/api/emailSearch", params: tempObj})
			.success(function(result) {
				if (result.length === 1) {
					$scope.errors.emailError = "This email is taken, please try again."
				} else {
					$scope.errors.emailError = "";
				}
				console.log(JSON.stringify(result));
			})
			.error(function(result) {
				console.log('ERROR IN EMAILSEARCH: ' + error);
			});
	};

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
	};

	$scope.checkExpertise = function (someString) {
		if (!someString) {
			$scope.errors.expertiseError = "";
		}
		else if (stringToArray(someString).length > 5) {
			$scope.errors.expertiseError = "Please do not enter more than 5 areas of expertise.";
		}
		else {
			$scope.errors.expertiseError = "";
		}
	};

	$scope.checkHobbies = function (someString) {
		if (!someString) {
			$scope.errors.hobbiesError = "";
		}
		else if (stringToArray(someString).length > 5) {
			$scope.errors.hobbieseError = "Please do not enter more than 5 hobbies.";
		}
		else {
			$scope.errors.expertiseError = "";
		}
	};

});

signUp.controller('pictureController', function ($scope, $http, $timeout, Cropper, $window) {

	$scope.cropDim ={};
	$scope.sessionInfo={};
	/**
	* Method is called every time file input's value changes.
	* Because of Angular has not ng-change for file inputs a hack is needed -
	* call `angular.element(this).scope().onFile(this.files[0])`
	* when input's event is fired.
	*/
	$scope.getSessionInfo = function () {
		$scope.sessionInfo.sessionID = localStorage.sessionID;
		console.log(localStorage.sessionID);
	};

	$scope.onFile = function(blob) {
		Cropper.encode((file = blob)).then(function(dataUrl) {
		  $scope.dataUrl = dataUrl;
		  $timeout(showCropper);  // wait for $digest to set image's src
		});
	};

	/**
	* When there is a cropped image to show encode it to base64 string and
	* use as a source for an image element.
	*/
	$scope.preview = function() {
		if (!file || !data) return;
		Cropper.crop(file, data).then(Cropper.encode).then(function(dataUrl) {
		  ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
		});
	};

	$scope.scale = function(width) {
		Cropper.crop(file, data)
		  .then(function(blob) {
		    return Cropper.scale(blob, {width: width});
		  })
		  .then(Cropper.encode).then(function(dataUrl) {
		    ($scope.preview || ($scope.preview = {})).dataUrl = dataUrl;
		  });
	};

	/**
	* Object is used to pass options to initalize a cropper.
	* More on options - https://github.com/fengyuanchen/cropper#options
	*/
	$scope.options = {
		maximize: true,
		aspectRatio: 1/ 1,
		dragCrop: false,
		zoomable: false,
		crop: function(dataNew) {
		  data = dataNew;
		  $scope.cropDim = data;
		  console.log($scope.cropDim);
		}
	};

	$scope.printlocalStorage = function() {
		console.log(localStorage);
		$scope.session = localStorage;
	};

	$scope.finalCropCheck = function() {
		if ($scope.cropDim.x < 0.001) {
			$scope.cropDim.x = 0;
		}
		if ($scope.cropDim.y < 0.001) {
			$scope.cropDim.y = 0;
		}
		console.log($scope.cropDim);
	};
	/**
	* Showing (initializing) and hiding (destroying) of a cropper are started by
	* events. The scope of the `ng-cropper` directive is derived from the scope of
	* the controller. When initializing the `ng-cropper` directive adds two handlers
	* listening to events passed by `ng-show` & `ng-hide` attributes.
	* To show or hide a cropper `$broadcast` a proper event.
	*/
	$scope.showEvent = 'show';
	$scope.hideEvent = 'hide';

	function showCropper() { $scope.$broadcast($scope.showEvent); }
	function hideCropper() { $scope.$broadcast($scope.hideEvent); }

});

/*
signUp.controller('IndexFormDemoController', function (FormForConfiguration, flashr) {
    FormForConfiguration.enableAutoLabels();

    this.formData = {};

    this.validationAndViewRules = {
      email: {
        inputType: 'text',
        pattern: /\w+@\w+\.\w+/,
        required: true
      },
      password: {
        inputType: 'password',
        pattern: {
          rule: /[0-9]/,
          message: 'Your password must contain at least 1 number'
        },
        required: true
      }
    };

    this.submit = function(data) {
      flashr.now.info('Your form has been submitted');
    };
 });*/