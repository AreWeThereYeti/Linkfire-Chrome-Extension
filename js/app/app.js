var myApp = angular.module('AngularChromeEx', ['ngRoute'])
.config(function($routeProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: 'templates/home.html',
      controller: 'PageController'
    })
    .when('/', {
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
    })
		.when('/settings', {
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })
    .otherwise({redirectTo: '/'});
});