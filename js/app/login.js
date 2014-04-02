myApp.controller("LoginController", function ($location, loginService, storageCheckService, $scope){
  // checking auth status
	storageCheckService.getAuth(function(status){

		if(JSON.stringify(status.user).length>0){
			console.log("length: "+JSON.stringify(status.user).length);
			$location.path("/home");
			$scope.$apply();
		}
	});

	$scope.login = function(user){
		
		var post = {
			email: user.email,
			password: user.pass//CryptoJS.SHA1(user.pass)
		}
			console.log("post: "+post.email+" - "+post.password);
			console.log(JSON.stringify(post));
		loginService.login(post)
			.then(function(data){
				//set userdata
				console.log("logged in: "+JSON.stringify(data));

				storageCheckService.setId(data);
				$location.path("/home");
			},function(error){
				//handle Error
				console.log("error on login...");
		});

/*  //use this in stead of loginService.login to bypass user login through the test api
		storageCheckService.dummySetId(user);
		$location.path("/home");
*/

		
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
      var pass = CryptoJS.SHA1(params.password);
      var d = $q.defer();
      $http({	
					method	: 'POST',
					url		  : urlAuth,
          headers : {'Content-type' : 'application/json'},
          data    : {email: params.email, password: pass.toString(CryptoJS.enc.Hex)}
			})
        .success(function (data, status, headers, config) {
        	d.resolve(data);
        })
        .error(function (data, status, headers, config) {
         
         	d.reject(status);

        });
        return d.promise;
    };
  });

