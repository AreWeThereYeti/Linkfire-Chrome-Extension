var myApp = angular.module('AngularChromeEx', ['ngRoute'])
.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'templates/load.html',
      controller: 'LoadController'
    })
    .when('/home', {
      templateUrl: 'templates/home.html',
      controller: 'PageController'
    })
    .when('/login', {
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
    })
		.when('/settings', {
      templateUrl: 'templates/settings.html',
      controller: 'SettingsCtrl'
    })
    .otherwise({redirectTo: '/login'});
});

myApp.config( [
  '$compileProvider',
  function( $compileProvider ) {
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|chrome-extension):|data:image\//);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|chrome-extension):/);
  }
]);