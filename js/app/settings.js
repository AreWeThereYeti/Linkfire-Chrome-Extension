myApp.controller("SettingsCtrl", function ($scope, $location){


  //note: I have made a service that gets copy+url settings 'storageCheckService.getSettings(function(settings))'
	// checks chrome local storage for settings and sets variables accordingly
	chrome.storage.local.get(['copy', 'url', 'user'], function(result) {

    if(JSON.stringify(result.copy)){
	      $scope.copy = result.copy;
				$scope.url = result.url;
				$scope.userEmail = result.user;
	        
        }else{
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
	  }, function(){
		  $location.path("/home");
      $scope.$apply();
	  });
  };

  // sign out user and clear all data in chrome local storage
	$scope.signOut = function(){
		chrome.storage.local.clear();
		$location.path("/login");	
		}
});