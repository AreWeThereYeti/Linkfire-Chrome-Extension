myApp.controller("PageController", function ($scope, pageInfoService, apiService, storageCheckService, $q) {

  /*Start settings*/
  $scope.imgThumb = 'img/linkfire_logo.png';
  $scope.showSettings = false;
  $scope.blur = false;


//  Getting latest links on startup
  storageCheckService.getAuth(function(user){
    userData =
    {
      'token' : user.token,
      "user_id" : user.id
    }

    $scope.user = user.user;
    $scope.userImage = 'http://linkfire.test.dev.rocketlabs.dk' + user.image;


    //  Get latest links
    apiService.getAllLinkfireLinks(userData)
      .then(function(data){

//      Get 2 latest links
        apiService.getLatestLinkfireLinks(userData,data.links[data.links.length - 1])
          .then(function(data){
            $scope.firstLink = data.link.url;
            $scope.firstLinkClick = data.link.stats.clicks;
            $scope.firstLinkShares = data.link.stats.shares;
            if(data.link.image.default){
              $scope.firstLinkImage = 'http://linkfire.test.dev.rocketlabs.dk' + data.link.image.default;
            }
            else{
              $scope.firstLinkImage = 'img/default_link.png'
            }

          }, function(error){
            $scope.firstLink = "Error handling your request!";
          });

        apiService.getLatestLinkfireLinks(userData,data.links[data.links.length - 2])
          .then(function(data){
            $scope.secondLink = data.link.url;
            $scope.secondLinkClick = data.link.stats.clicks;
            $scope.secondLinkShares = data.link.stats.shares;
            if(data.link.image.default){
            $scope.secondLinkImage = 'http://linkfire.test.dev.rocketlabs.dk' + data.link.image.default;
            }
            else{
              $scope.secondLinkImage = 'img/default_link.png'
            }
          }, function(error){
            $scope.secondLink = "Error handling your request!";
          });
      }, function(error){
        console.log = "Error handling your request!";
      });
  });

  $scope.fetching = true;
  $scope.linkCreated = false;


    // checking storage for UI settings
    storageCheckService.getSettings(function(settings){

      // initiates extension behavior for default state autoCopy=true
      if(JSON.stringify(settings).length > 2){
        $scope.autoCopy = settings.copy;
      }else{
        $scope.autoCopy =true;
      }

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
                    $scope.title = 'No title available';
                  }

                  else{
                    $scope.title = data.title;
                  }

                  if (data.description == ''){
                    $scope.description = 'No description available';
                  }

                  else{
                    $scope.description = data.description;
                  }

  /*                for (i = data.thumbnailsPending.length - 1; i >= 0; i++) {
                    console.log('Her')
                    var imgPlaceholder = new Image();
                    imgPlaceholder.src = data.thumbnailsPending[i];
                    console.log(imgPlaceholder.height)
                    if(imgPlaceholder.height > 150){
                      var img = data.thumbnailsPending[i];
                      $scope.imgThumb = imgPlaceholder.src;
                      break;
                    }
                  }*/

                  if (data.thumbnails) {
                    $scope.imgThumb = data.thumbnails[0];
                  }
                  else{
                    $scope.imgThumb = 'img/linkfire_logo.png'
                  }

                  console.log(data)

                  apiService.getLinkfireLink(postData, data)
                    .then(function(data){
                      $scope.newLink = data.link.url;
                      if($scope.autoCopy == true){
                        $scope.copyToClipboard($scope.newLink);
                      }
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
          "url" : newUrl
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



