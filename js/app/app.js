var myApp = angular.module('AngularChromeEx', ['ngRoute'])
.config(function($routeProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: 'templates/home.html',
      controller: 'PageController'
    })
    .when('/login', {
      templateUrl: 'templates/login.html',
      controller: 'LoginController'
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


