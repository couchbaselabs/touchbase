var search = angular.module('search', ['ngCropper']);

search.controller("searchController",function ($scope, $http, $timeout, Cropper) {

	$scope.photoID = "woopieDoo";
	$scope.searchData = {};
	$scope.formData = {};
	//$cookies.put('myFavorite', 'oatmeal');

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
				console.log(result);
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
				//$cookies.put('sessionID', result.sessionID);

			})
			.error(function(result) {
				console.log("ERROR IN LOGIN: " + result);
			});
	};

	  var file, data;

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
	      $scope.formData.pictureSpec = data;
	    }
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

