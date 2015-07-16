var picture = angular.module('picture', ['ngCropper']);
	
picture.controller("pictureController", function ($scope, $http, $timeout, Cropper) {

	$scope.photoID = "woopieDoo";
	$scope.searchData = {};
	$scope.formData = {};
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

	$scope.printSessionStorage = function() {
		console.log(sessionStorage);
		$scope.session = sessionStorage;
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