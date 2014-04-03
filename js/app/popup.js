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

          	console.log("checking: "+storage.user);
            if (JSON.stringify(storage.user)){

                user.user = storage.user;
                user.token = storage.token;
                user.id = storage.id;
                
								callback(user);
						}            
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
								callback(model);
            }
        });
    };
});

// sevice for contacting the linkfire api
myApp.service('apiService', function($http, $q) {
    
		this.getLinkfireLink = function(postData){

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
			
					// queries /api/1.0/links/get for exsisting link data when link has been created from the same url during this user login session  		
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
							console.log("Retrieved existing link");
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
				// queries /api/1.0/links/create for new link when no previous link has been created from the current url during this user login session  		
						$http({
								method	: 'POST',
								url		  : 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/create',
			          headers : {'Content-type' : 'application/json'},
			          data    : JSON.stringify(postData)
						}).success(function(data, status, headers){
							console.log("Created new link");

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

// checking storage for UI settings	
	storageCheckService.getSettings(function(settings){
		
		if(JSON.stringify(settings).length > 2){
			$scope.autoUrl = settings.url;
			$scope.autoCopy = settings.copy;
		}else{
			$scope.autoUrl = true;
			$scope.autoCopy =true;
		}
		
		// initiates extension behavior for default state autoUrl=true
		if($scope.autoUrl){
			// gets browser tab info
      pageInfoService.getInfo(function (info) {
		        $scope.title = info.title;
		        $scope.url = info.url;
		        $scope.newLink = "Fetching shortlink from Linkfire.com...";
		        // prepares data for api post in callback 
		        $scope.getPostData(info.url, info.title) 
		        	.then(function(postData) {
		        		// queries api with callback postData
				        apiService.getLinkfireLink(postData)  
				        	.then(function(data) {
			              $scope.fetching = false;
									  $scope.newLink = data.link.url;
											if($scope.autoCopy){
												// copies generates link to clipboard in default state: autoCopy=true
												$scope.copyToClipboard($scope.newLink);
											}
									},function(error){
											console.log(error);
											$scope.newLink = "Error handling your request!";
									});
							});		
				});
		}
  });
  
   // function for creating/retrieving link for setting state: autoUrl = false  
   $scope.createLink = function(input){
   	// prepares data for api post in callback 
   	$scope.getPostData(input.url, input.title)
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
  $scope.getPostData = function(newUrl, newTitle){
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
		      "description" : "This link was created with the Linkfire Chrome extension"
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



