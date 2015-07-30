var touchbase = angular.module('touchbase', ['ngMaterial','ui.router']);

var stringAttributes 	= ["skype", "name", "jobTitle"];
var arrayAttributes		= ["hobbies", "expertise"];
var dropdownAttributes	= ["baseOffice", "division"];

touchbase.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {

	$urlRouterProvider.otherwise('/allUsers');
	
	$stateProvider
	
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

		.state('allPosts', {
			url: '/allPosts',
			templateUrl: 'html/all-posts-partial.html'
		})

		.state('statistics', {
			url: '/statistics'
			// could have nested views here for each stat?
			// OR could have just one html page
		})

		$mdThemingProvider.theme('red')
        	.primaryPalette('red', {
            'default': '800' }) // by default use shade 900 from the grey palette for primary intentions
        	.accentPalette('grey')
		/*$mdThemingProvider.theme('default')
    		.primaryPalette('red')
    		
    		.dark();*/
    	$mdThemingProvider.setDefaultTheme('red');

});

touchbase.controller('AppCtrl', function ($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
});

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}

touchbase.controller('DemoCtrl', function ($timeout, $q, $log, $scope, $http) {
    var self = this;
    self.simulateQuery = false;
    self.isDisabled    = false;
    // list of `state` value/display objects
    self.states        = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;
    // ******************************
    // Internal methods
    // ******************************
    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }
    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
      $scope.intelliCount.searchTerm = text;
      loadAll();
    }
    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }
    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
    	$scope.intelliCount.output=[];
		console.log($scope.intelliCount.searchTerm);
		$http({method: "GET", url: "/api/intelligentCount", params: $scope.intelliCount, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(result);
				$scope.intelliCount.output = result;
			})
			.error(function(result) {
				$scope.intelliCount.output = ("ERROR : " + JSON.stringify(result));
			});
		var x = $scope.intelliCount.output;
		console.log("x : " + $scope.intelliCount.output);
      return x.map( function (thing) {
        return {
          value: thing.field,
          display: thing.field
        };
      });
    }
    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(thing) {
        return (thing.value.indexOf(lowercaseQuery) === 0);
      };
    }
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

touchbase.controller('publishController', function ($scope, $http, $window, $mdDialog) {

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

	$scope.getAllPosts = function(type) {
		$http({method: "GET", url: "/api/postSearch", params: {pubType: type}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(result);
				$scope.publishData.output=result;
			})
			.error(function(result) {
				console.log("ERROR : " + result);
			});
	};

    $scope.alert = '';
  	$scope.showAdvanced = function(ev) {
    	$mdDialog.show({
	      	controller: DialogController,
	      	templateUrl: 'html/searchDialog.html',
	      	parent: angular.element(document.body),
	      	targetEvent: ev,
    	})
		    .then(function(answer) {
		      $scope.alert = 'You said the information was "' + answer + '".';
		    }, function() {
		      $scope.alert = 'You cancelled the dialog.';
		    });
	};

});

touchbase.controller('searchController', function ($scope, $http, $window, $q, $mdDialog) {

	$scope.searchData = {};
	$scope.intelliCount={};

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
		$scope.intelliCount={};
		if (!someString) {
			$scope.intelliCount.output = [];
			return ({"field": "Sorry there are no results for your search."});
		}
		else {
			$scope.intelliCount.searchTerm = someString;
			console.log($scope.intelliCount.searchTerm);
			$http({method: "GET", url: "/api/intelligentCount", params: $scope.intelliCount, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
					.then(function (result) {
	    				return result.data;
	  				});
				/*
				.then(function(result) {
					console.log(result.data);
					return (result.data);
				});*/
		}
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

	$scope.alert = '';
  	$scope.showAdvanced = function(ev) {
    	$mdDialog.show({
	      	controller: DialogController,
	      	templateUrl: 'html/searchDialog.html',
	      	parent: angular.element(document.body),
	      	targetEvent: ev,
    	})
		    .then(function(answer) {
		      $scope.alert = 'You said the information was "' + answer + '".';
		    }, function() {
		      $scope.alert = 'You cancelled the dialog.';
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

