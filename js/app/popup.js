//myApp.config(['$httpProvider', function ($httpProvider) {
//  // ...
//
//  // delete header from client:
//  // http://stackoverflow.com/questions/17289195/angularjs-post-data-to-external-rest-api
//  $httpProvider.defaults.useXDomain = true;
//  delete $httpProvider.defaults.headers.common['X-Requested-With'];
//}]);

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
			var d = $q.defer();
			$http({
					method	: 'POST', 
					url		  : 'http://linkfire.com/api/1.0/links/create',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data    :  postData
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

myApp.controller("PageController", function ($scope, pageInfoService, apiService, $window) {
    $scope.show = true;
    pageInfoService.getInfo(function (info) {
        $scope.title = info.title;
        $scope.url = info.url;
        $scope.newLink = "Fetching shortlink fron Linkfire.com...";
        $scope.pageInfos = $scope.getPostData(info.url, info.title);
        apiService.getLinkfireLink($scope.pageInfos)
        	.then(function(data) {
			    // this callback will be called asynchronously
			    // when the response is available
				$scope.newLink = data;
				
			}, function(error){
				console.log(error);
				$scope.newLink = "Error handling your request!";
			});		
    });
    
    $scope.getPostData = function(newUrl, newTitle){
	    return postData =
	    	{
				'token' : "8f967fc1880401be9eb992998d1ac70fd0297ffd",
				"user_id" : 1065,
				"url" : newUrl,
				"title" : newTitle,
				"description": "some stuff"
			}
/*      var postData = new Array();
      postData.token = "8f967fc1880401be9eb992998d1ac70fd0297ffd";
      postData['user_id'] = 1065;
      postData['url'] = newUrl;
      postData['title'] = newTitle;
      postData['description'] = 'some stuff';
      console.log(postData);
      return postData*/

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


