myApp.controller("SettingsCtrl", function ($scope){

	
/*
	chrome.storage.local.get(['copy', 'url'], function(result) {
        if(result.length){
	      $scope.copy = result.copy;
		  $scope.url = result.url;
		  console.log("getting: "+$scope.copy+" and "+$scope.url);  
	        
        }
     } //hvad hvis der retuneres en fejl?
     );

     
	$scope.storeChanges = function(){	
		chrome.storage.local.set({
	        'copy': $scope.copy,
	        'url': $scope.url
			});
	}*/
		
	/*
if(localStorage.getItem('copy')!=null){
		console.log("STORAGE!");
			$scope.copy = localStorage.getItem('copy');
			$scope.url = localStorage.getItem('url');		
			
	}else{
		console.log("setting to true!");
			$scope.copy= true;
			$scope.url= true;
						
	}
*/
	

		//console.log(localStorage.getItem('copy')+"-----"+localStorage.getItem('url'));
/*
		localStorage.setItem('copy', $scope.copy);
		localStorage.setItem('url', $scope.url); 
		}
*/

	
});