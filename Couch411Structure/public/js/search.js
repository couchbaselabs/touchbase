var search = angular.module('search', []);

search.controller("searchController", function ($scope, $http) {
	
	$scope.searchData = {};

	$scope.nameSearch = function(someString) {
		$scope.searchData.name = someString;
		console.log($scope.searchData);
		$http({method: "GET", url: "/api/nameSearch", params: $scope.searchData})
			.success(function(result) {
				console.log(result);
				$scope.searchData.output = result;
			})
			.error(function(result) {
				$scope.searchData.output = ("ERROR : " + result);
			});
	};

	/*$scope.getBase64Image = function() {

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
		var b64 = temp;
		console.log(b64);
		return b64;
	};

	$scope.convertImgToStore = function() {
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

