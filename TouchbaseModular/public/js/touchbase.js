var touchbase = angular.module('touchbase', ['ngMaterial','ui.router', 'tc.chartjs']);

var stringAttributes    = ["skype", "name", "jobTitle"];
var arrayAttributes     = ["hobbies", "expertise"];
var dropdownAttributes  = ["baseOffice", "division"];

var $stateProviderRef = null;
var $urlRouterProviderRef = null;

touchbase.config(function ($locationProvider, $httpProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider) {
    
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

        .state('posts', {
            url: '/posts/{pubType}/{imagePath}',
            templateUrl: 'html/all-posts-partial.html'
        })

        .state('statistics', {
            url: '/statistics',
            templateUrl: 'html/statistics-partial.html'
            // could have nested views here for each stat?
            // OR could have just one html page
        })

    $urlRouterProvider.otherwise('/myProfile');

    // MAKE SURE TO ENTER COLORS LOWERCASE ex. 'teal' NOT 'Teal' OR 'TEAL'.
    $mdThemingProvider.theme('new')
        .primaryPalette('red', {
        'default': '800' }) // by default use shade 900 from the grey palette for primary intentions
        .accentPalette('amber',  {
        'default': '600' })
        .warnPalette('red');

    $mdThemingProvider.setDefaultTheme('new');

});

touchbase.run(function ($q, $rootScope, $http, $urlRouter) {
    
    $http({method: "GET", url: "/api/getConfig"})
        .success(function(result) {
            $rootScope.dataModel = result;
        })
        .error(function(result) {
            console.log(error);
        });
});

touchbase.controller('AppCtrl', function ($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
});

touchbase.controller('profileupdateController', function ($scope, $http, $window, $state) {

    $scope.myData = {};
    $scope.publishData={};
    $scope.update = false;

    $scope.getMyProfile = function() {
        $scope.loading = true;
        $http({method: "GET", url: "/api/advancedSearch", params: {'myProfile': true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success(function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                console.log(result[0]);
                $scope.myData= result[0];
                Object.keys($scope.myData.arrayAttributes).forEach(function (key) {
                    $scope.myData.arrayAttributes[key] = arrayToString($scope.myData.arrayAttributes[key]);
                    // use val
                });
                $scope.loading = false;
            })
            .error(function(result) {
                console.log("ERROR IN PROFILE GET: " + result);
            });
    };

    $scope.changeUpdate = function(something) {
        if (something === true) {
            $scope.update = true;
        }
        if (something === false) {
            $scope.update = false;
        }
        if (something === 'cancelled') {
            $scope.update = false;
            $state.reload();
        }
    };

    $scope.updateMyProfile = function(myData) {
        myData.picSRC = "";
        $http({method: "POST", url: "/api/updateUser", data: myData , headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success(function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                console.log(result);
                console.log('profile updated!');
                $state.reload();
            })
            .error(function(result) {
                console.log('error in update '+result);
            });
    };

    $scope.getMyPosts = function(type) {
        $scope.postLoading = true;
        $http({method: "GET", url: "/api/postSearch", params: {'myProfile': true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success(function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                console.log(result);
                for (i=0; i<result.length; i++) {
                    if (result) {
                        result[i].timeDisp = moment(result[i].time).fromNow();
                    }
                }
                $scope.publishData.output=result;
                $scope.postLoading = false;
            })
            .error(function(result) {
                console.log("ERROR : " + result);
            });
    };

    $scope.deletePost = function(publishID) {
        var r = confirm("Are you sure you want to delete this post?");
        if (r == true) {
            $http({method: "DELETE", url: "/api/deletePost", params: {'publishID': publishID}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
                .success(function(result) {
                    if (result.currentSession===false) {
                        $window.location.href="index.html";
                    }
                    console.log('success post deleted: '+result);
                    $state.reload();
                })
                .error(function(result) {
                    console.log(result);
                });
        } else {
            console.log("user cancelled post delete");
        }
    };

    $scope.checkExpertise = function (someString) {
        if (!someString) {
            $scope.errors.expertiseError = "";
        }
        else if (stringToArray(someString).length > 5) {
            $scope.errors.expertiseError = "Please do not enter more than 5 areas of expertise.";
        }
        else {
            $scope.errors.expertiseError = "";
        }
    };

    $scope.checkHobbies = function (someString) {
        if (!someString) {
            $scope.errors.hobbiesError = "";
        }
        else if (stringToArray(someString).length > 5) {
            $scope.errors.hobbieseError = "Please do not enter more than 5 hobbies.";
        }
        else {
            $scope.errors.expertiseError = "";
        }
    };

    var stringToArray = function(anyString) {
            var tempArray= anyString.split(",");
            var resultArray=[];
            for (i=0; i<tempArray.length; i++) {
                var str = tempArray[i];
                resultArray[i]= str.trim();
                if (resultArray[i]=="") {
                    resultArray.splice(i, 1);
                }
            }
            return resultArray;
    };

    var arrayToString = function (someArray) {
        var someString = "";
        for (i=0; i<someArray.length; i++) {
            if (i === (someArray.length-1)) {
                someString += (someArray[i]);
            }
            else {
                someString += (someArray[i]+", ");
            }
        }
        return someString;
    };

});

touchbase.controller('publishController', function ($scope, $http, $window, $mdDialog, $stateParams) {

    $scope.publishData={};

    $scope.getAllPosts = function() {
        $scope.loading = true;
        console.log($stateParams.pubType);
        $http({method: "GET", url: "/api/postSearch", params: {pubType: $stateParams.pubType}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success(function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                console.log(result);
                for (i=0; i<result.length; i++) {
                    console.log(result[i]);
                    if (result[i]) {
                        result[i].timeDisp = moment(result[i].time).fromNow();
                    }
                }
                $scope.loading = false;
                $scope.publishData.output=result;
            })
            .error(function(result) {
                console.log("ERROR : " + result);
            });
    };

    $scope.alert = '';
    $scope.makePost = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'html/makePost.html',
            parent: angular.element(document.body),
            targetEvent: ev
        })
    };

});

function DialogController($scope, $http, $mdDialog, $stateParams, $state) {
    $scope.hide = function() {
        $mdDialog.hide();
        $state.reload();
    };
    var hide = function() {
        $mdDialog.hide();
        $state.reload();
    };
    $scope.cancel = function() {
        $mdDialog.cancel();
        $state.reload();
    };
    $scope.answer = function(answer) {
        $mdDialog.hide(answer);
    };
    $scope.publishTry = function(someObject) {
        /*console.log($scope.dataModel.pubTypes);
        var findImage = function (pubType) {
            Object.keys($scope.dataModel.pubTypes).forEach(function (obj) {
                if (obj.type === pubType) {
                    return obj.imagePath;
                }
                // use val
            });
        };*/
        var tempTitle = someObject.title;
        if (!tempTitle) {
            $scope.titleError = "Required & < 15";
        }
        else {
           $scope.titleError = ""; 
        }
        var tempBlurb = someObject.blurb;
        if (!tempBlurb) {
            $scope.blurbError = "Required & < 400";
        }
        else {
            $scope.blurbError = "";
        }
        if ($scope.titleError || $scope.blurbError) {
            console.log('USER POST ERROR: field lengths, try again.');
            return;
        }
        var postTry = someObject;
        console.log($stateParams.pubType);
        postTry.pubType = $stateParams.pubType;
        postTry.imagePath = $stateParams.imagePath;
        // postTry.imagePath = findImage($stateParams.pubType);
        if (!postTry.imagePath) {
            postTry.imagePath = 'Touchbase_red.png';
        }
        $http({method: "POST", url: "/api/publishPost", data: postTry, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success(function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                // $mdDialog.hide();
            })
            .error(function(result) {
                console.log("ERROR : " + result);
            });
        $scope.hide();
    };
};

touchbase.controller('searchController', function ($scope, $http, $window, $q, $mdDialog) {

    $scope.searchData = {};
    $scope.intelliCount={};

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
                        if (result.currentSession===false) {
                            $window.location.href="index.html";
                        }
                        $scope.intelliCount.output=result;
                        console.log(result);
                        return result;
                    })
                    .error (function(result) {
                        console.log(result);
                    });
        }

    };

    $scope.advancedSearch = function(string, someField) {
        var tempObj={};
        tempObj[someField] = string;
        console.log(tempObj);
        $http({method: "GET", url: "/api/advancedSearch", params: tempObj, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success(function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                console.log(JSON.stringify(result));
                $scope.searchData.peopleResults = (result);
                $scope.searchHide = true;
            })
            .error(function(result) {
                $scope.searchData.peopleResults = ("ERROR : " + JSON.stringify(result));
            });
    };

    var arrayToString = function (someArray) {
        var someString = "";
        for (i=0; i<someArray.length; i++) {
            if (i === (someArray.length - 1)) {
                someString += (someArray[i]);
            }
            else {
                someString += (someArray[i]+", ");
            }
        }
        console.log(someString);
        return someString;
    };

    $scope.getAllUsers = function() {
        $scope.loading=true;
        $http({method: "GET", url: "/api/advancedSearch", params: {allUsers: true}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success(function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                console.log(result);
                /*console.log(result.length);
                console.log(result[0].users);
                for (i=0; i<result.length; i++) {
                    console.log(i);
                    console.log(result[i].users.arrayAttributes);
                    if (result[i].users.arrayAttributes) {
                        Object.keys(result[i].users.arrayAttributes).forEach(function (key) {
                                result[i].users.arrayAttributes[key] = arrayToString(result[i].users.arrayAttributes[key]);
                                console.log(key);
                                // use val
                                if (i === result.length -1) {
                                    $scope.searchData.peopleResults = (result);
                                }
                        });
                    }
                }*/
                $scope.searchData.peopleResults = (result);
                /*Object.keys($scope.myData.arrayAttributes).forEach(function (key) {
                    $scope.myData.arrayAttributes[key] = arrayToString($scope.myData.arrayAttributes[key]);
                    // use val
                });*/
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

    $scope.mail = function(email) {
        console.log(email);
        $window.location.href = ('mailto:'+email);
    };



});

touchbase.controller('signOutController', function ($scope, $http, $window) {

    $scope.signOut = function () {
        var r = confirm("Are you sure you want to logout of "+$scope.dataModel.projectName+"?");
        if (r == true) {
            localStorage.clear();
            $window.location.href = 'index.html';
            console.log('logged out');
        } else {
            console.log("user cancelled logout");
        }
    };

});

touchbase.controller('statisticsController', function ($scope, $http, $window) {

    $scope.graphData={};

    $scope.loading = true;
    $scope.getGraphData = function(timeUnit) {
        $http({method: "GET", url: "/api/graphData", params:{'timeUnit': timeUnit}, headers:{'Authorization':'Bearer '+localStorage.sessionID}})
            .success (function(result) {
                if (result.currentSession===false) {
                    $window.location.href="index.html";
                }
                console.log(result);
                /*$scope.graphData = result;
                $scope.viewData('day');
                $scope.activeX= $scope.graphData.xDay;
            $scope.activeTotal= $scope.graphData.dayTotal;
            for (i=0; i<$scope.activeTotal.length; i++) {
                if (!$scope.activeTotal[i]) {
                    $scope.activeTotal[i] = 0;
                }
            }
            $scope.activeDistinct= $scope.graphData.dayDistinct;
            for (i=0; i<$scope.activeDistinct.length; i++) {
                if (!$scope.activeDistinct[i]) {
                    $scope.activeDistinct[i] = 0;
                }
            }*/
                if (timeUnit==='week') {
                    $scope.type= 'Weekly';
                }
                else if (timeUnit === 'day') {
                    $scope.type = 'Daily';
                }
                $scope.viewData(result);
                $scope.loading = false;
                })
                .error (function(result) {
                    console.log(error);
                });
    };

    $scope.viewData = function(obj) {
        /*if (type === 'week') {
            $scope.activeX=$scope.graphData.xWeek;
            $scope.activeTotal=$scope.graphData.weekTotal;
            $scope.activeDistinct=$scope.graphData.weekDistinct;
            $scope.type = 'Weekly';
        }
        else if (type === 'day') {
            $scope.activeX= $scope.graphData.xDay;
            $scope.activeTotal= $scope.graphData.dayTotal;
            $scope.activeDistinct= $scope.graphData.dayDistinct;
            $scope.type = 'Daily';
            console.log($scope.activeX);
        }*/

    $scope.data = {
      labels: obj.x,
      datasets: [
        /*{
          label: 'Total Logins',
          fillColor: 'rgba(220,220,220,0.2)',
          strokeColor: 'rgba(220,220,220,1)',
          pointColor: 'rgba(220,220,220,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: $scope.activeTotal
        },*/
        {
          //label: 'Total User Logins',
          fillColor: 'rgba(151,187,205,0.2)',
          strokeColor: 'rgba(151,187,205,1)',
          pointColor: 'rgba(151,187,205,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(151,187,205,1)',
          data: obj.logins
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

      scaleBeginAtZero: true,

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
};

});

