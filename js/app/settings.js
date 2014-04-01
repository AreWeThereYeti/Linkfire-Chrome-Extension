myApp.controller("SettingsCtrl", function ($scope){

	
	// checks chrome local storage for settings and sets variables accordingly
	chrome.storage.local.get(['copy', 'url'], function(result) {
        console.log("results: "+JSON.stringify(result));    

        if(JSON.stringify(result).length){
	      $scope.copy = result.copy;
		  $scope.url = result.url;
		  console.log("getting: "+$scope.copy+" and "+$scope.url);  
	        
        }else{
	      console.log("first run!");  
 	      $scope.copy = true;
		  $scope.url = true;
        }
        $scope.$apply();
     }); //hvad hvis der retuneres en fejl?


    // checks chrome local storage for settings and sets variables accordingly
	$scope.storeChanges = function(){
		console.log("setting: "+$scope.copy+" and "+$scope.url);	
		chrome.storage.local.set({
	        'copy': $scope.copy,
	        'url': $scope.url
			});
	}
			
});