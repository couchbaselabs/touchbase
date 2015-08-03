var touchbase = angular.module('touchbase', ['ngMaterial','ui.router', 'tc.chartjs']);

var stringAttributes 	= ["skype", "name", "jobTitle"];
var arrayAttributes		= ["hobbies", "expertise"];
var dropdownAttributes	= ["baseOffice", "division"];

touchbase.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {

	$urlRouterProvider.otherwise('/myProfile');
	
	$stateProvider
	
		.state('register', {
			url: '/registerUser',
			templateUrl: 'html/register.html'
		})

		.state('myProfile', {
			url: '/myProfile',
			templateUrl: 'html/my-profile-partial.html'
		})

		.state('allUsers', {
			url: '/allUsers',
			templateUrl: 'html/all-users-partial.html'
		})

		.state('allGit', {
			url: '/allGit',
			templateUrl: 'html/all-git-partial.html'
		})

		.state('allNews', {
			url: '/allNews',
			templateUrl: 'html/all-couchNews-partial.html'
		})

		.state('statistics', {
			url: '/statistics',
			templateUrl: 'html/statistics-partial.html'
			// could have nested views here for each stat?
			// OR could have just one html page
		})

		$mdThemingProvider.theme('red')
        	.primaryPalette('red', {
            'default': '800' }) // by default use shade 900 from the grey palette for primary intentions
        	.accentPalette('blue')
        	.warnPalette('red')
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
				if (result.currentSession==false) {
					console.log('failed');
				}
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
	$scope.publishData={};

	$scope.getMyProfile = function() {
		$scope.loading = true;
		$http({method: "GET", url: "/api/advancedSearch", params: {'myProfile': true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				console.log(result[0]);
				$scope.myData= result[0];
				$scope.loading = false;
			})
			.error(function(result) {
				console.log("ERROR IN PROFILE GET: " + result);
			});
	};

	$scope.updateMyProfile = function() {
		$http({method: "POST", url: "/api/updateUser", data: $scope.myData , headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				console.log(result);
				console.log('profile updated!');
			})
			.error(function(result) {
				console.log('error in update '+result);
			});
	};

	$scope.getMyPosts = function(type) {
		$scope.postLoading = true;
		$http({method: "GET", url: "/api/postSearch", params: {'myProfile': true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				console.log(result);
				for (i=0; i<result.length; i++) {
					result[i].users_publishments.timeDisp = moment(result[i].users_publishments.time).fromNow();
				}
				$scope.publishData.output=result;
				$scope.postLoading = false;
			})
			.error(function(result) {
				console.log("ERROR : " + result);
			});
	};

});

touchbase.controller('publishController', function ($scope, $http, $window, $mdDialog) {

	$scope.publishData={};

	$scope.publishTry = function(someObject, pubType) {
		var postTry = someObject;
		console.log(someObject);
		postTry.pubType = pubType;
		$http({method: "POST", url: "/api/publishPost", data: postTry, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				console.log(result);
			})
			.error(function(result) {
				console.log("ERROR : " + result);
			});
	};

	$scope.getAllPosts = function(type) {
		$scope.loading = true;
		$http({method: "GET", url: "/api/postSearch", params: {pubType: type}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				console.log(result);
				for (i=0; i<result.length; i++) {
					result[i].users_publishments.timeDisp = moment(result[i].users_publishments.time).fromNow();
				}
				$scope.loading = false;
				$scope.publishData.output=result;
			})
			.error(function(result) {
				console.log("ERROR : " + result);
			});
	};

    $scope.alert = '';
  	$scope.postGit = function(ev) {
    	$mdDialog.show({
	      	controller: DialogController,
	      	templateUrl: 'html/postGit.html',
	      	parent: angular.element(document.body),
	      	targetEvent: ev
    	})
	};

	$scope.postNews = function(ev) {
    	$mdDialog.show({
	      	controller: DialogController,
	      	templateUrl: 'html/postNews.html',
	      	parent: angular.element(document.body),
	      	targetEvent: ev
    	})
	};

});

function DialogController($scope, $http, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
  $scope.publishTry = function(someObject, pubType) {
		var postTry = someObject;
		console.log(someObject);
		postTry.pubType = pubType;
		$http({method: "POST", url: "/api/publishPost", data: postTry, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				console.log(result);
			})
			.error(function(result) {
				console.log("ERROR : " + result);
			});
	};
}

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
		$scope.searchHide = false;
		if (!someString) {
			$scope.intelliCount.output = [];
			return ({"field": "Sorry there are no results for your search."});
		}
		else {
			$scope.intelliCount.searchTerm = someString;
			console.log($scope.intelliCount.searchTerm);
			$http({method: "GET", url: "/api/intelligentCount", params: $scope.intelliCount, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
					.success(function (result) {
						if (result.currentSession==false) {
							console.log('failed');
						}
						$scope.intelliCount.output=result;
						console.log(result);
	    				return result;
	  				})
	  				.error (function(result) {
	  					console.log(result);
	  				});
				/*
				.then(function(result) {
					console.log(result.data);
					return (result.data);
				});*/
		}
	};

	$scope.advancedSearch = function(string, someField) {
		var tempObj={};
		eval("tempObj." + someField + "= \"" + string + "\";");
		$http({method: "GET", url: "/api/advancedSearch", params: tempObj, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				console.log(JSON.stringify(result));
				$scope.searchData.peopleResults = (result);
				$scope.searchHide = true;
			})
			.error(function(result) {
				$scope.searchData.peopleResults = ("ERROR : " + JSON.stringify(result));
			});
	};

	$scope.getAllUsers = function() {
		$scope.loading=true;
		$http({method: "GET", url: "/api/advancedSearch", params: {allUsers: true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				if (result.currentSession==false) {
					console.log('failed');
				}
				$scope.searchData.peopleResults = (result);
				$scope.loading=false;
			})
			.error(function(result) {
				$scope.searchData.peopleResults = ("ERROR : " + JSON.stringify(result));
			});
	};

	$scope.alert = '';
  	$scope.showAdvanced = function(ev) {
    	$mdDialog.show({
	      	controller: SearchDialogController,
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

function SearchDialogController($scope, $http, $mdDialog) {
	$scope.searchData={};
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
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
						$scope.intelliCount.output=result.data;
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
		$scope.searchTermObj = {};
		eval("$scope.searchTermObj." + someField + "= $scope.searchText;");
		$http({method: "GET", url: "/api/advancedSearch", params: $scope.searchTermObj, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
			.success(function(result) {
				console.log(JSON.stringify(result));
				$scope.searchData.peopleResults = (result);
			})
			.error(function(result) {
				$scope.searchData.peopleResults = ("ERROR : " + JSON.stringify(result));
			});
	};
}

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

touchbase.controller('statisticsController', function ($scope) {

    // Chart.js Data
    $scope.data = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [
        {
          label: 'My First dataset',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
          label: 'My Second dataset',
          fillColor: 'rgba(151,187,205,0.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(151,187,205,1)',
          data: [28, 48, 40, 19, 86, 27, 90]
        }
      ]
    };

    // Chart.js Options
    $scope.options =  {

      // Sets the chart to be responsive
      responsive: true,

      ///Boolean - Whether grid lines are shown across the chart
      scaleShowGridLines : true,

      //String - Colour of the grid lines
      scaleGridLineColor : "rgba(0,0,0,.05)",

      //Number - Width of the grid lines
      scaleGridLineWidth : 1,

      //Boolean - Whether the line is curved between points
      bezierCurve : true,

      //Number - Tension of the bezier curve between points
      bezierCurveTension : 0.4,

      //Boolean - Whether to show a dot for each point
      pointDot : true,

      //Number - Radius of each point dot in pixels
      pointDotRadius : 4,

      //Number - Pixel width of point dot stroke
      pointDotStrokeWidth : 1,

      //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius : 20,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke : true,

      //Number - Pixel width of dataset stroke
      datasetStrokeWidth : 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill : true,

      // Function - on animation progress
      onAnimationProgress: function(){},

      // Function - on animation complete
      onAnimationComplete: function(){},

      //String - A legend template
      legendTemplate : '<ul class="tc-chart-js-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
    };

});

