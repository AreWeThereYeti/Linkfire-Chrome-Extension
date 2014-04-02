myApp.controller("LoginController", function ($location, loginService, storageCheckService, $scope){


  $scope.view = 'loginview';

  $scope.$on('loggedIn', function() {
    $scope.view = 'loginview';
  });

  // checking auth status
	storageCheckService.dummyGetAuth(function(status){
		if(JSON.stringify(status.user).length>0){
			console.log("length: "+JSON.stringify(status.user).length);
			$location.path("/home");
			$scope.$apply();
		}
	});

	$scope.send = function(user){
		console.log("posting: "+JSON.stringify(user));
		// implements login request
		/*
loginService.login(user)
			.then(function(data){
				//set userdata
				storageCheckService.set(data);
				$location.path("/home");
			},function(error){
				//handle Error
		});
*/

		storageCheckService.dummySetId(user);
    $scope.view = '';
    $location.path("/home");
		
	}
	
	$scope.goToLinkfire = function(){
	  var newURL = "http://linkfire.com/";
		chrome.tabs.create({ url: newURL });	
	}
	
});

myApp.service('loginService', function LoginService($rootScope, $http, $q, $window) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    /*Api. Should be moved to CONFIG*/
    var API_ENDPOINT =  'http://linkfire.test.dev.rocketlabs.dk'

    // urls   ------ OBS!!! Setup for specific use. Move to config when ready
    var urlAuth = API_ENDPOINT + '/api/1.0/auth/login';

    this.login = function (params) {
      console.log("loginfunction")
      var d = $q.defer();
      $http.post(urlAuth, params)
        .success(function (data, status, headers, config) {
        	d.resolve(data);
          //$window.sessionStorage.token = data.token;
        })
        .error(function (data, status, headers, config) {
         
         	d.reject(status);
/*
          // Erase the token if the user fails to log in
          delete $window.sessionStorage.token;

          // Handle login errors here
          var message = 'Error: Invalid user or password';
*/
        });
        return d.promise;
    };
  });

