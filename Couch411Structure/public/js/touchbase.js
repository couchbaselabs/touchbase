var touchbase = angular.module('touchbase', ['ui.router', 'ngCropper']);

touchbase.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/login');
	
	$stateProvider

		.state('login', {
			url: '/login', 
			templateUrl: 'html/login.html'
		})

		.state('register', {
			url: '/registerUser',
			templateUrl: 'html/register.html'
		})

		.state('myProfile', {
			
		})

		.state('allUsers', {
			url: '/allUsers',
			templateUrl: 'html/allUsers.html'
		})

		.state('statistics', {
			url: '/statistics'
			// could have nested views here for each stat?
			// OR could have just one html page
		})

});

