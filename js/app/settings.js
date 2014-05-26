myApp.controller("SettingsCtrl", function ($scope, $location){

//  Toggles autoCopy on click on parent
  $scope.toggleAutoCopy = function(){
    if($scope.autoCopy == true){
      $scope.autoCopy = false;
    }
    else{
      $scope.autoCopy = true;
    }
    $scope.$emit('toggleAutoCopy', $scope.autoCopy);
    chrome.storage.local.set({
      'copy': $scope.autoCopy
    }, function(){
      $scope.$apply();
    });
  };

  // checks chrome local storage for settings and sets variables accordingly
	$scope.storeChanges = function(){
    chrome.storage.local.set({
      'copy': $scope.autoCopy
    }, function(){
      $scope.$apply();
    });
    $scope.$emit('closemodal');
  };

  // sign out user and clear all data in chrome local storage
	$scope.signOut = function(){
		chrome.storage.local.clear();
		$location.path("/login");	
		}
});