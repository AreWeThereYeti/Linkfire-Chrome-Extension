myApp.controller("SettingsCtrl", function ($scope){


	if(localStorage.getItem('copy')!=null){
		console.log("STORAGE!");
			$scope.copy = localStorage.getItem('copy');
			$scope.url = localStorage.getItem('url');		
			
	}else{
		console.log("setting to true!");
			$scope.copy= true;
			$scope.url= true;
						
	}
	
	$scope.storeChanges = function(){
		//console.log(localStorage.getItem('copy')+"-----"+localStorage.getItem('url'));
		localStorage.setItem('copy', $scope.copy);
		localStorage.setItem('url', $scope.url); 
		}

	
});