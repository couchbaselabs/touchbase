var createLogin = angular.module('createLogin', []);

createLogin.controller("mainController", function ($scope, $http) {
	$scope.formData={};

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
		}
	};

	$scope.checkRegisterBool =function() {
		if ($scope.formData.password != $scope.formData.confPassword) {
			return true;
		}
	};
});