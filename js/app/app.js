var myApp = angular.module('AngularChromeEx', ['ngRoute'])
.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/login.html', 
      controller: 'LoginController'
    })
    .when('/home', {
      templateUrl: 'templates/home.html', 
      controller: 'PageController'
    })
		.when('/settings', {
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })
    .otherwise({redirectTo: '/'});
});