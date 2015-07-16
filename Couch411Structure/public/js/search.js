var search = angular.module('search', []);
	
search.controller("searchController", function ($scope, $http, $window) {

	$scope.photoID = "woopieDoo";
	$scope.searchData = {};
	$scope.formData = {};

	$scope.nameSearch = function(someString) {
		// this sends an advanced search using just the name
		// requires a name or part of one to send the request
		$scope.searchData = {};
		$scope.searchData.name = someString;
		console.log($scope.searchData);
		$http({method: "GET", url: "/api/nameSearch", params: $scope.searchData})
			.success(function(result) {
				console.log(result);
				$scope.searchData.output = (result);
			})
			.error(function(result) {
				$scope.searchData.output = ("ERROR : " + result);
			});
	};

	$scope.createBase64Image = function(imageElementID) {
		// this will create a base64 encoded image, which is then added to the formData
		// the picture encoded here will be uploaded only when the "registerUser" function is called
		function getByID(id){return document.getElementById(id);} // Get elem by ID
		function readImage() {
		    if ( this.files && this.files[0] ) {
		        var FR= new FileReader();
		        FR.onload = function(e) {
		             getByID("img").src = e.target.result;
		             getByID("base").innerHTML = e.target.result;
		             b64String = e.target.result;
		             console.log ("INSIDE:  " + b64String);
		             console.log(typeof(b64String));
		        };       
		        FR.readAsDataURL( this.files[0] );
		    }
		}
		readImage();
		getByID(imageElementID).addEventListener("change", readImage, false);
		console.log(window.b64String);
		var temp = window.b64String;
		var b64 = temp;
		console.log(b64);
		$scope.formData.picture = b64;
	};

	$scope.registerUser = function (someObject) {
		// this will require a formData type object which contains all entries needed for the form to create an account
		$http({method: "POST", url: "/api/registerUser", data: someObject})
			.success(function(result) {
				console.log(result[0]);
				$scope.formData = {};
			})
			.error(function(result) {
				console.log("ERROR IN REGISTER: " + JSON.stringify(result[0]));
			});
	};

	$scope.loginAuth = function (someObject) {
		// this will require a name and password in the object to check login
		$http({method: "GET", url: "/api/loginAuth", params: someObject})
			.success(function(result) {
				console.log(result);
				sessionStorage.sessionID = result.sessionID;
				sessionStorage.expiry = result.expiry;
				console.log('sessionStorage: '+ JSON.stringify(sessionStorage));
				$window.location.href = '/pictureUpload.html';
			})
			.error(function(result) {
				console.log("ERROR IN LOGIN: " + result);
			});
	};

	$scope.printLocalStorage = function() {
		console.log(sessionStorage);
	};

	/*$scope.convertImgToStore = function() {
		var b64String = $scope.getBase64Image();
		var contentType = "image/png";
		$scope.image.base64 = b64String
		//var blob = $scope.b64toBlob(b64String, contentType);
		//var temp = blob.toString();
		//$scope.image.blob = temp;
		//var blobUrl = URL.createObjectURL(blob);
		//console.log(blobUrl);
		$http({method: "POST", url: "/postImage", data: $scope.image})
			.success(function(response) {
				console.log("WOOT POSTED, check Couchbase");
			})
			.error(function(response) {
				console.log("shit");
			});
	}; */
});

