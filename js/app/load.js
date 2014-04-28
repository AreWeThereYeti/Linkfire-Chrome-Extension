myApp.controller("LoadController", function ($location, storageCheckService, $scope){
  
  // checking auth status. will redirect to /home if user is logged in
	storageCheckService.getAuth(function(status){
		console.log("storageCheckService");
		if(status.user){
		console.log("status.user: "+JSON.stringify(status.user));

			storageCheckService.getSettings(function(settings){
        $location.path("/home");
        $scope.$apply();
			});
		} else {
        $location.path("/login");
        $scope.$apply();

		}
	});

			

});


