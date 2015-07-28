var touchbase = angular.module('touchbase', ['ui.router', 'ngCropper']);

var stringAttributes 	= ["skype", "name", "jobTitle"];
var arrayAttributes		= ["hobbies", "expertise"];
var dropdownAttributes	= ["baseOffice", "division"];

touchbase.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/login');
	
	$stateProvider

		.state('login', {
			url: '/login', 
			templateUrl: 'html/login.html'
		})

		.state('register', {
			url: '/registerUser',
			templateUrl: 'html/register.html'
		})

		.state('myProfile', {
			
		})

		.state('allUsers', {
			url: '/allUsers',
			templateUrl: 'html/all-users-partial.html'
		})

		.state('statistics', {
			url: '/statistics'
			// could have nested views here for each stat?
			// OR could have just one html page
		})

});

touchbase.controller('loginController', function ($scope, $http, $window) {

	$scope.loginData={};

	$scope.loginAuth = function (someObject) {
		// this will require a name and password in the object to check login
		$http({method: "GET", url: "/api/loginAuth", params: someObject})
			.success(function(result) {
				console.log(result);
				localStorage.sessionID = result.sessionID;
				localStorage.expiry = result.expiry;
				$window.location.href = 'nav.html';
				console.log('localStorage: '+ JSON.stringify(localStorage));
			})
			.error(function(result) {
				console.log("ERROR IN LOGIN: " + result);
			});
	};

});

touchbase.controller('registerController', function ($scope, $http, $window) {

	$scope.formData = {};
	
	$scope.registerUser = function (someObject) {
		// this will require a formData type object which contains all entries needed for the form to create an account
		$http({method: "POST", url: "/api/registerUser", data: someObject})
			.success(function(result) {
				localStorage.sessionID = result.sessionID;
				localStorage.expiry = result.expiry;
				console.log('localStorage: '+ JSON.stringify(localStorage));
				$scope.formData = {};
				$window.location.href = '/pictureUpload.html';
			})
			.error(function(result) {
				console.log("ERROR IN REGISTER: " + JSON.stringify(result[0]));
			});
	};	

});

touchbase.controller('pictureController', function ($scope, $http, $timeout, Cropper) {

	$scope.cropDim ={};
	/**
	* Method is called every time file input's value changes.
	* Because of Angular has not ng-change for file inputs a hack is needed -
	* call `angular.element(this).scope().onFile(this.files[0])`
	* when input's event is fired.
	*/

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
		console.log($scope.cropDim);
	}
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

touchbase.controller('profileupdateController', function ($scope, $http, $window) {

	$scope.myData = {};

	$scope.getMyProfile = function() {
		$http({method: "GET", url: "/api/advancedSearch", params: {'myProfile': true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(result[0]);
				$scope.myData.changed = result[0];
				$scope.myData.unchanged = result[0];
			})
			.error(function(result) {
				console.log("ERROR IN PROFILE GET: " + result);
			});
	};

	$scope.updateMyProfile = function() {
		$http({method: "POST", url: "/api/updateUser", data: $scope.myData , headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(result);
				console.log('profile updated!');
			})
			.error(function(result) {
				console.log('error in update '+result);
			});
	};

});

touchbase.controller('publishController', function ($scope, $http, $window) {

	$scope.publishData={};

	$scope.publishTry = function() {
		var postTry = {"pubType": "github", "title":"Couch411", "webpage": "https://github.com/pranavmayuram/Couch411/tree/master/Couch411Structure", "blurb": "Couch411 is dank"};
		$http({method: "POST", url: "/api/publishPost", data: postTry, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(result);
			})
			.error(function(result) {
				console.log("ERROR : " + result);
			});
	};

});

touchbase.controller('searchController', function ($scope, $http, $window) {

	$scope.searchData = {};

	$scope.nameSearch = function(someString) {
		// this sends an advanced search using just the name
		// requires a name or part of one to send the request
		$scope.searchData = {};
		$scope.searchData.name = someString;
		console.log($scope.searchData);
		$http({method: "GET", url: "/api/nameSearch", params: $scope.searchData, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(result);
				$scope.searchData.output = (result);
			})
			.error(function(result) {
				$scope.searchData.output = ("ERROR : " + result);
			});
	};

	$scope.intelligentCount = function(someString) {
		$scope.searchData= {};
		$scope.searchData.searchTerm = someString;
		console.log($scope.searchData);
		$http({method: "GET", url: "/api/intelligentCount", params: $scope.searchData, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(result);
				$scope.searchData.output = (result);
			})
			.error(function(result) {
				$scope.searchData.output = ("ERROR : " + JSON.stringify(result));
			});
	};

	$scope.advancedSearch = function(someField) {
		eval("$scope.searchData." + someField + "= $scope.searchData.searchTerm;");
		$http({method: "GET", url: "/api/advancedSearch", params: $scope.searchData, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(JSON.stringify(result));
				$scope.searchData.peopleResults = (result);
			})
			.error(function(result) {
				$scope.searchData.peopleResults = ("ERROR : " + JSON.stringify(result));
			});
	};

	$scope.getAllUsers = function() {
		$http({method: "GET", url: "/api/advancedSearch", params: {allUsers: true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				$scope.searchData.peopleResults = (result);
			})
			.error(function(result) {
				$scope.searchData.peopleResults = ("ERROR : " + JSON.stringify(result));
			});
	};

});

touchbase.controller('signOutController', function ($scope, $http, $window) {

	$scope.signOut = function () {
		var r = confirm("Are you sure you want to logout of Touchbase?");
		if (r == true) {
			localStorage.clear();
			$window.location.href = 'index.html';
			console.log('logged out');
		} else {
		    console.log("user cancelled logout");
		}
	};

});

