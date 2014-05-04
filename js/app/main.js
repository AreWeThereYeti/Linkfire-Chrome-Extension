myApp.controller("PageController", function ($scope, pageInfoService, apiService, storageCheckService, $q) {
  $scope.fetching = true;
  $scope.linkCreated = false;
  $scope.imgThumb = 'img/linkfire_logo.png'

    // checking storage for UI settings
    storageCheckService.getSettings(function(settings){

      if(JSON.stringify(settings).length > 2){
        $scope.autoCopy = settings.copy;
      }else{
        $scope.autoCopy =true;
      }

      // initiates extension behavior for default state autoUrl=true
			// gets browser tab info
      pageInfoService.getInfo(function (info) {
          $scope.newLink = "Fetching shortlink";
          // prepares data for api post in callback
          $scope.getScrapeData(info.url)
            .then(function(postData) {
              // queries api with callback postData
              apiService.getLinkfireData(postData)
                .then(function(data) {
                  $scope.fetching = false;

                  if(data.title == ''){
                    $scope.title = 'We did not get a title';
                  }

                  else{
                    $scope.title = data.title;
                  }

                  if (data.description == ''){
                    $scope.description = 'We did not get a description';
                  }

                  else{
                    $scope.description = data.description;
                  }

/*                  for (i = data.thumbnailsPending.length - 1; i >= 0; i++) {
                    if(data.thumbnailsPending[i].height > 10){
                      var img = data.thumbnailsPending[i];

                      alert('Billedet er mindre end 10 i højden');
                      $scope.imgThumb = data.thumbnailsPending[i];
                      break;
                    }
                  }

                  $scope.imgThumb = data.thumbnailsPending[0];

 */

                  apiService.getLinkfireLink(postData, data)
                    .then(function(data){
                      $scope.newLink = data.link.url;
                      $scope.copyToClipboard($scope.newLink);
                    }, function(error){
                      console.log(error);
                      $scope.newLink = "Error handling your request!";
                    })
                },function(error){
                    console.log(error);
                    $scope.newLink = "Error handling your request!";
                });
            });
      });
  });
  
   // function for creating/retrieving link for setting state: autoUrl = false
    $scope.createLink = function(input){
   	  // prepares data for api post in callback. !!!does not consider the thumbnail of the requested links original url!!!
    	$scope.getPostData(input.url, input.title, input.description)
   	  .then(function(postData) {
   		  // queries api with callback postData
	      apiService.getLinkfireLink(postData)
	    	  .then(function(data) {
            $scope.linkCreated = true;
            $scope.newLink = data.link.url;
            if($scope.autoCopy){
              // copies generates link to clipboard in default state: autoCopy=true
              $scope.copyToClipboard($scope.newLink);
            }
          }, function(error){
            $scope.newLink = "Error handling your request!";
            $scope.linkCreated = true;
        });
			});
    }

    // function for preparing data for api post in callback. uses storage checks and is therefore async
    $scope.getScrapeData = function(newUrl){
      var d = $q.defer();
      var postData = {};
      // storage check to get user data
      storageCheckService.getAuth(function(user){
        postData =
        {
          'token' : user.token,
          "user_id" : user.id,
          "url" : newUrl,
        }
        d.resolve(postData);
      });
      return d.promise;
    };

    // function for copying to the clipboard
    $scope.copyToClipboard = function(text){
	    var copyDiv = document.createElement('div');
	    copyDiv.contentEditable = true;
	    document.body.appendChild(copyDiv);
	    copyDiv.innerHTML = text;
	    copyDiv.unselectable = "off";
	    copyDiv.focus();
	    document.execCommand('SelectAll');
	    document.execCommand("Copy", false, null);
	    document.body.removeChild(copyDiv);
	}
});



