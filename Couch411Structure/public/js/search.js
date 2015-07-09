var search = angular.module('search', []);

search.controller("searchController", function ($scope, $http) {
	
	$scope.searchData = {};

	$scope.nameSearch = function(someString) {
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

	$scope.createBase64Image = function() {
		function getByID(id){return document.getElementById(id);} // Get elem by ID
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
		getByID("imageElement").addEventListener("change", readImage, false);
		console.log(window.b64String);
		var temp = window.b64String;
		var b64 = temp;
		console.log(b64);
		$scope.formData.picture = b64;
	};

	$scope.registerUser = function (someObject) {
		$http({method: "POST", url: "/api/registerUser", params: someObject})
			.success(function(result) {
				console.log(result);
			})
			.error(function(result) {
				console.log("ERROR IN REGISTER: " + result);
			});
	};

	$scope.loginAuth = function (someObject) {
		$http({method: "POST", url: "/api/registerUser", params: someObject})
			.success(function(result) {
				console.log(result);
			})
			.error(function(result) {
				console.log("ERROR IN LOGIN: " + result);
			});
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

