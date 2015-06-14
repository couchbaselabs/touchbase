var createLogin = angular.module('createLogin', []);
console.log('INSIDE ANGULAR');

function mainController($scope. $http) {
	console.log('INSIDE ANGULAR controller');
	$scope.formData={};

	$scope.makeLogin = function() {
		console.log('INSIDE ANGULAR function');
		$http.post('/login/create', $scope.formData)
			.success(function(data) {
				$scope.formData={};
				$scope.create=data;
				console.log(data);
				console.log("SUCCESS!");
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};
}