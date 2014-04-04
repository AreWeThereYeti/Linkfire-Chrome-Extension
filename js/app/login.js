myApp.controller("LoginController", function ($location, loginService, storageCheckService, $scope){
  
  // checking auth status. will redirect to /home if user is logged in
	storageCheckService.getAuth(function(status){

		if(JSON.stringify(status.user).length>0){
			$location.path("/home");
			$scope.$apply();
		}
	});

	
	$scope.login = function(user){
		
		var post = {
			email: user.email,
			password: user.pass
		}

		loginService.login(post)
			.then(function(data){
				//sets userdata in storage
				storageCheckService.setId(data);
				$location.path("/home");
			},function(error){
        $scope.login_in = false;
        //handle Error
				if(error==400){
					console.log("Error: "+error+". Missing or invalid parameters.");
				} else if(error==401){
					console.log("Error: "+error+". Incorrect e-mail or password.");
				} else if(error==500){
					console.log("Error: "+error+". Internal error. Contact support@linkfire.com.");
				} else{
					console.log("Error: "+error);
				}
		});
	}
	
	$scope.goToLinkfire = function(){
	  var newURL = "http://linkfire.com/";
		chrome.tabs.create({ url: newURL });	
	}
	
});

myApp.service('loginService', function LoginService($rootScope, $http, $q, $window) {
    
    // defines the api url could be moved to config for consistency
    var API_ENDPOINT =  'http://linkfire.test.dev.rocketlabs.dk'
    var urlAuth = API_ENDPOINT + '/api/1.0/auth/login';

    this.login = function (params) {
    	
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

