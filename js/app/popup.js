
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
      console.log("getLinkfireLink: "+JSON.stringify(postData));
			var d = $q.defer();
			 			 
				
			var duplicate = false;
			var shortlinkId = {};
		// check links[] array in chrome.storage.local for duplicate links and sets duplicate true/false accordingly
			chrome.storage.local.get('links', function (result) {
            	angular.forEach(result.links, function(value, key){
								if(value.original_url==postData.url){
									duplicate = true;
									shortlinkId = value.id;
									console.log("duplicate link!!!");
								}
							});  	
			
			
					if(duplicate==true){
						$http({
								method	: 'POST',
								url		  : 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/get',
			          headers : {'Content-type' : 'application/json'},
			          data    : {
			          						"token":postData.token,
			          						"user_id":postData.user_id, 
														"id":shortlinkId
													}
						}).success(function(data, status, headers){
							console.log("DEBUGGING: Retrieved existing link");
			        d.resolve(data);
						}).error(function(data, status, headers){
			        if(status==400){
								console.log("Error: "+status+". Missing or invalid parameters.");
							} else if(status==401){
								console.log("Error: "+status+". User doesn’t have access to the link.");
							} else if(status==403){
								console.log("Error: "+status+". Expired or invalid token.");
							} else if(status==500){
								console.log("Error: "+status+". Internal error. Contact support@linkfire.com.");
							} else{
								console.log("Error: "+status);
							}
							d.reject(status);
						});
					}else{
						$http({
								method	: 'POST',
								url		  : 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/create',
			          headers : {'Content-type' : 'application/json'},
			          data    : JSON.stringify(postData)
						}).success(function(data, status, headers){
							console.log("DEBUGGING: Created new link");
							
			
							// stores created link's original_url and id in the links array in storage
							chrome.storage.local.get({links: []}, function (result) {
								// the input argument is ALWAYS an object containing the queried keys
								// so we select the key we need
								var links = result.links;
								links.push({original_url: data.link.original_url, id: data.link.id});
								// set the new array value to the same key
								chrome.storage.local.set({links: links}, function () {						
								});
							});
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
					}
			});
			return d.promise;
		};
    
});
myApp.controller("PageController", function ($scope, pageInfoService, apiService, storageCheckService, $q) {
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
		        $scope.getPostData(info.url, info.title) 
		        	.then(function(postData) {
		        apiService.getLinkfireLink(postData)  
		        	.then(function(data) {
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
					});
		}
   });
   
   $scope.createLink = function(input){
   	console.log("createLink med: "+input.url+" og "+input.title);
   	$scope.getPostData(input.url, input.title)
   	.then(function(postData) {
	    apiService.getLinkfireLink(postData)
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
			});
   }
   
  $scope.getPostData = function(newUrl, newTitle){
  	var d = $q.defer();
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
		    console.log("getPostData returning : "+JSON.stringify(postData));
				d.resolve(postData);
  	});
  	return d.promise;

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



