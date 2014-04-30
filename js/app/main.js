// service for performing chrome.storage checks. chrome.storage checks are asynchronous
myApp.service('storageCheckService', function($q) {
  this.setId = function(args) {
    chrome.storage.local.set({
      'user': args.user.email,
      'token': args.token,
      'id': args.user.id
    });
  };

  this.getAuth = function(callback) {
    var user = {};
    chrome.storage.local.get(['user','token','id'],
      function (storage) {
        if (storage.user){
          user.user = storage.user;
          user.token = storage.token;
          user.id = storage.id;
        }
        callback(user);
      }
    );
  };

  this.getSettings = function(callback) {
    var settings = {};
    chrome.storage.local.get(['copy', 'url'],
      function (storage) {
        if (JSON.stringify(storage).length > 0){
          settings.copy = storage.copy;
          settings.url = storage.url;
          callback(settings);
        }
      });
    };
});

// service for retrieving info from the active browser tab 
myApp.service('pageInfoService', function() {
    this.getInfo = function(callback) {
        var model = {};

        chrome.tabs.query({'active': true},
        function (tabs) {
            if (tabs.length > 0)
            {
                model.title = tabs[0].title;
                model.url = tabs[0].url;


								// Sends 'callback' message to contentscript requesting the Pageinfo action. Response will be object containing meta data(description and thumbnail url) if its available, and nothing if its not. 								
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageInfo' }, function (response) {

                    if(response.description){
                    	console.log("meta data description added!");
											model.description = response.description;
                    }else{
											model.description = "This link was created with the Linkfire Chrome extension";
                    }
                    if(response.thumb){
                    	console.log("meta data thumb added!");
											model.thumb = response.thumb;
                    }else{
											model.thumb = null;
                    }
                  callback(model);
                });
            }
        });
    };
});

// sevice for contacting the linkfire api
myApp.service('apiService', function($http, $q) {

		this.getLinkfireLink = function(postData) {

      var d = $q.defer();

      $http({
        method: 'POST',
        url: 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/Create',
        headers: {'Content-type': 'application/json'},
        data: {
          JSON.stringify(postData)
        }
      }).success(function (data, status, headers) {
        console.log("Retrieved existing link");
        d.resolve(data);
      }).error(function (data, status, headers) {
        if (status == 400) {
          console.log("Error: " + status + ". Missing or invalid parameters.");
        } else if (status == 401) {
          console.log("Error: " + status + ". User doesn’t have access to the link.");
        } else if (status == 403) {
          console.log("Error: " + status + ". Expired or invalid token.");
        } else if (status == 500) {
          console.log("Error: " + status + ". Internal error. Contact support@linkfire.com.");
        } else {
          console.log("Error: " + status);
        }
        d.reject(status);
      });
      return d.promise;
    }

    this.getLinkfireData = function(postData){

      var d = $q.defer();
      // queries /api/1.0/links/create for new link when no previous link has been created from the current url during this user login session
          $http({
              method	: 'GET',
              url		  : 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/scrape',
              headers : {'Content-Type' : 'application/json'},
              params    : {
                          "token":  postData.token,
                          "user_id":postData.user_id,
                          "url":    postData.url
                        }
          }).success(function(data, status, headers){
            console.log('Your short link is served' + data)
            d.resolve(data);

          }).error(function(data, status, headers){
            if(status==400){
              console.log("Error: "+status+". Missing or invalid parameters.");
            } else if(status==403){
              console.log("Error: "+status+". Expired or invalid token .");
            } else if(status==500){
              console.log("Error: "+status+". Internal error. Contact support@linkfire.com.");
            } else{
              console.log("Error: "+status);
            }
            d.reject(status);
          });
      return d.promise;
    }
});

myApp.controller("PageController", function ($scope, pageInfoService, apiService, storageCheckService, $q) {
    $scope.fetching = true;
    $scope.linkCreated = false;

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
          $scope.getPostData(info.url, info.title, info.description)
            .then(function(postData) {
              // queries api with callback postData
              apiService.getLinkfireData(postData)
                .then(function(data) {
                  console.log('data is ' + data)
                  $scope.fetching = false;
                  $scope.title = data.title;
                  $scope.description = data.description;

                  apiService.getLinkfireLink(postData);

                  $scope.copyToClipboard($scope.newLink);

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
    $scope.getPostData = function(newUrl, newTitle, newDesc){
      var d = $q.defer();
      var postData = {};
      // storage check to get user data
      storageCheckService.getAuth(function(user){
        postData =
        {
          'token' : user.token,
          "user_id" : user.id,
          "url" : newUrl,
          "title" : newTitle,
          "description" : newDesc
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



