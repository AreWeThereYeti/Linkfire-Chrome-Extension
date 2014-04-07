myApp.controller("LoadController", function ($location, storageCheckService, $scope){
  
  // checking auth status. will redirect to /home if user is logged in
	storageCheckService.getAuth(function(status){
		console.log("storageCheckService");
		if(status.user){
		console.log("status.user: "+JSON.stringify(status.user));

			storageCheckService.getSettings(function(settings){
				if(settings.url == false){
					console.log("getSettings url: "+settings.url);

					$location.path("/custom");
					$scope.$apply();	

				} else{
									console.log("getSettings url: "+settings.url);

					$location.path("/home");
					$scope.$apply();	
				}
				
			});
		} else {
			console.log("Else");

			$location.path("/login");	
			$scope.$apply();

		}
	});

			

});


