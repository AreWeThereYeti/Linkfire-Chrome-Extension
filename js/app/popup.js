
myApp.service('storageCheckService', function($q) {
    
    this.dummySetId = function(args) {
	    chrome.storage.local.set({
	        'user': args.email
			});
			console.log("setting user: "+args.email);
    };
    
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

          	console.log("checking: "+storage.user);
            if (JSON.stringify(storage.user)){

                user.user = storage.user;
                user.token = storage.token;
                user.id = storage.id;
                
								callback(user);
				}            
		  }
    )};
    
    this.getSettings = function(callback) {
        var settings = {};

        chrome.storage.local.get(['copy', 'url'],
          function (storage) {
            if (JSON.stringify(storage).length > 0){
                settings.copy = storage.copy;
                settings.url = storage.url;
				callback(settings);
				}            
		  }
    )};
});

myApp.service('pageInfoService', function() {
    this.getInfo = function(callback) {
        var model = {};

        chrome.tabs.query({'active': true},
        function (tabs) {
            if (tabs.length > 0)
            {
                model.title = tabs[0].title;
                model.url = tabs[0].url;
				
				// Sends message to content.js which grabs info from the current active tab (not really necessary for this...)
                chrome.tabs.sendMessage(tabs[0].id, { 'action': 'PageInfo' }, function (response) {
                    model.pageInfos = response;
                    // returns callback function
                    callback(model);
                });
            }
        });
    };
});

myApp.service('apiService', function($http, $q) {
    
		this.getLinkfireLink = function(postData){
      console.log(JSON.stringify(postData));
			var d = $q.defer();
			$http({
					method	: 'POST',
					url		  : 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/create',
          headers : {'Content-type' : 'application/json'},
          data    : JSON.stringify(postData)
			}).success(function(data, status, headers){
				console.log("DEBUGGING: success");
        d.resolve(data);
			}).error(function(data, status, headers){
        console.log("DEBUGGING: error");
				d.reject(status);
			});
			return d.promise;
		};
    
});

myApp.controller("PageController", function ($scope, pageInfoService, apiService, storageCheckService) {
  $scope.fetching = true;
	$scope.linkCreated = false;
	
	storageCheckService.getSettings(function(settings){
		
		if(JSON.stringify(settings).length > 2){
			$scope.autoUrl = settings.url;
			$scope.autoCopy = settings.copy;
		}else{
			$scope.autoUrl = true;
			$scope.autoCopy =true;
		}
		


		if($scope.autoUrl){
      pageInfoService.getInfo(function (info) {
		        $scope.title = info.title;
		        $scope.url = info.url;
		        $scope.newLink = "Fetching shortlink from Linkfire.com...";
		        $scope.pageInfos = $scope.getPostData(info.url, info.title); //the getPostData() is async <----- issue
		        console.log("pageInfos: "+JSON.stringify($scope.pageInfos));
		        apiService.getLinkfireLink($scope.pageInfos)  
		        	.then(function(data) {
					    // this callback will be called asynchronously
					    // when the response is available
              $scope.fetching = false;
						  $scope.newLink = data.link.url;
						if($scope.autoCopy){
							$scope.copyToClipboard($scope.newLink);
						}
					}, function(error){
						console.log(error);
						$scope.newLink = "Error handling your request!";
						if($scope.autoCopy){
							$scope.copyToClipboard($scope.newLink);
						}
					});		
		    });
		}
   });
   $scope.createLink = function(input){
   	console.log("createLink med: "+input.url+" og "+input.title);
   	$scope.pageInfos = $scope.getPostData(input.url, input.title);
	    apiService.getLinkfireLink($scope.pageInfos)
	    	.then(function(data) {
			    // this callback will be called asynchronously
			    // when the response is available
			    $scope.linkCreated = true;
					$scope.newLink = data.link.url;
					if($scope.autoCopy){
						$scope.copyToClipboard($scope.newLink);
					}
					
				}, function(error){
						$scope.newLink = "Error handling your request!";
						if($scope.autoCopy){
							$scope.copyToClipboard($scope.newLink);
							}
						$scope.linkCreated = true;
				});
   }
   
   /// THIS FUNCTION NEEDS TO GET DONE
  $scope.getPostData = function(newUrl, newTitle){
  	var postData = {};
  	storageCheckService.getAuth(function(user){
  			console.log("request from : "+JSON.stringify(user));
				postData =
		    {
		      'token' : user.token,
		      "user_id" : user.id,
		      "url" : newUrl,
		      "title" : newTitle,
		      "description" : "This link was created with the Linkfire Chrome extension"
		    }
  	});
  	return postData;

  };
    
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



