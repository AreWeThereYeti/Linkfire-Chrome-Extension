myApp.controller("SettingsCtrl", function ($scope, $location){

	//note: I have made a service that gets copy+url settings 'storageCheckService.getSettings(function(settings))'
	
	// checks chrome local storage for settings and sets variables accordingly
	chrome.storage.local.get(['copy', 'url', 'user'], function(result) {
        console.log("results: "+JSON.stringify(result.copy));    
        console.log("results: "+JSON.stringify(result.user));    
       if(JSON.stringify(result.copy)){
	      $scope.copy = result.copy;
				$scope.url = result.url;
				$scope.userEmail = result.user;
		  console.log("getting: "+$scope.copy+" and "+$scope.url);  
	        
        }else{
	      console.log("first run!");  
 	      $scope.copy = true;
 				$scope.url = true;
        $scope.userEmail = result.user;
       }
        $scope.$apply();
     });


    // checks chrome local storage for settings and sets variables accordingly
	$scope.storeChanges = function(){
		chrome.storage.local.set({
	        'copy': $scope.copy,
	        'url': $scope.url
			});
    $location.path("/home");

  };
	$scope.signOut = function(){
		console.log("signing out: "+$scope.userEmail);
		chrome.storage.local.clear();
		$location.path("/");	
		}
});