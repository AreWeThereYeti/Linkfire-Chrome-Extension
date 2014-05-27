myApp.controller("PageController", function ($scope, pageInfoService, apiService, storageCheckService, $q, $timeout) {

  /*Start settings*/
  $scope.imgThumb = 'img/linkfire_logo.png';

//  Getting latest links on startup
  storageCheckService.getAuth(function(user){
    userData =
    {
      'token' : user.token,
      "user_id" : user.id
    };

//    Set username and user image to current user
    $scope.user = user.user;
    $scope.userImage = 'http://linkfire.test.dev.rocketlabs.dk' + user.image;
  });

//  Start loader and set default check values
  $scope.fetching = true;
  $scope.linkCreated = false;

    // checking storage for UI settings
    storageCheckService.getSettings(function(settings){
      // initiates extension behavior for default state autoCopy=true
      if(JSON.stringify(settings.copy) !== undefined){
        $scope.autoCopy = settings.copy;
      }else if(JSON.stringify(settings.copy) === undefined){
        $scope.autoCopy = false;
        storageCheckService.setSettings($scope.autoCopy)
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

//                  Done fetching data
                  $scope.fetching = false;

//                  Check for title and description
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

//                  Set thumbnail to first thumbnail in array
                  if (data.thumbnails !== undefined) {
                      if($scope.doesFileExist(data.thumbnails[0])){
                          $scope.imgThumb = data.thumbnails[0];
                      }
                    else{
//                        data.thumbnails[0]) is not defined. Set image to default and data.thumbnails[0] to ''
                        $scope.imgThumb = 'img/linkfire_logo.png'
                        data.thumbnails[0] = '';
                      }
                  }
                  else{
                    $scope.imgThumb = 'img/linkfire_logo.png'
                  }

//                  getlink services. Fetching shortened and original link from db
                  storageCheckService.getLink(function(previous){
                    $scope.copied = false;

//                    Check if link is duplicate
                    if(previous.original_url === data.url){

//                      Set link to previous link if original url is duplicate
                      $scope.newLink = previous.shortlink;

//                      Check for autocopy true.
                      if($scope.autoCopy == true){
                        $scope.copyToClipboard($scope.newLink);
                      }
//                      Fetches previous links in db
                      $scope.getHistory(userData,2,3);
                    }
                    else{

//                      If link is not duplicate, use fetchdata to create a new shortlink and fetch it from linkfire
                      apiService.createLinkfireLink(postData, data)
                        .then(function(data){

                          //  Get latest links
                          $scope.getHistory(userData, 2, 3);

//                          Set link in db. Used for checking previous links
                          storageCheckService.setLink(data.link.original_url, data.link.url);
                          $scope.newLink = data.link.url;
                          if($scope.autoCopy == true){
                            $scope.copyToClipboard($scope.newLink);
                          }
                        }, function(error){
                          console.log(error);
                          $scope.newLink = "Error handling your request!";
                        })
                    }
                  });
                },function(error){
                    console.log(error);
                    $scope.newLink = "Error handling your request!";
                });
            });
      });
  });

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

    $scope.openSettings = function(){
      $scope.showPage = 'settings';
      //note: I have made a service that gets copy+url settings 'storageCheckService.getSettings(function(settings))'
      // checks chrome local storage for settings and sets variables accordingly
      chrome.storage.local.get(['copy'], function(result) {
        $scope.copy = result.copy;
        $scope.$apply();
      });
    };

    /*listener for close settings*/
    $scope.$on('closemodal', function(event) {
      $scope.showPage = '';
    });

    /*listener for close settings*/
    $scope.$on('toggleAutoCopy', function(event, copy) {
      $scope.autoCopy = copy;
    });

  // function for copying to the clipboard. Also resets
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
	};

  $scope.showCopied = function(elm){
    $scope.showCopy = elm;
    if($scope.showCopy !== ''){
      var timer = $timeout(
        function() {
          $scope.showCopy = '';
        },
        4000
      );
    }
  };

//  Get recent links. Selector1 and Selector2 specifies the link you want to fetch. Selector1 is the latest
  $scope.getHistory = function (userdata, selector1, selector2) {
    //  Get latest links
    apiService.getAllLinkfireLinks(userData)
      .then(function(data){
//      Get 2 latest links
        apiService.getLatestLinkfireLinks(userData,data.links[data.links.length - selector1])
          .then(function(data){
            // Set link title, description and image to data
            if(data.link.title === ''){
              $scope.firstLinkTitle ='No title available';
            }else{
              $scope.firstLinkTitle = data.link.title;
            }
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

        apiService.getLatestLinkfireLinks(userData,data.links[data.links.length - selector2])
          .then(function(data){
            if(data.link.title === ''){
              $scope.secondLinkTitle ='No title available';
            }else{
              $scope.secondLinkTitle = data.link.title;
            }
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
  };

//  Checks existence of file/url
  $scope.doesFileExist = function(fileToCheck)
  {

    var http = new XMLHttpRequest();
    http.open('HEAD', fileToCheck, false);
    http.send();
    return http.status!=404;
  }
});



