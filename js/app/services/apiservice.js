// sevice for contacting the linkfire api
myApp.service('apiService', function($http, $q) {

  this.getLinkfireLink = function(postData, data) {

    var d = $q.defer();

    console.log(data)
    $http({
      method: 'POST',
      url     :   'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/Create',
      headers :   {'Content-type': 'application/json'},
      data    :   {
        "token"      :    postData.token,
        "user_id"    :    postData.user_id,
        "url"        :    data.url,
        "description":    data.description,
        "title"      :    data.title,
        "thumbnail" :     data.thumbnails[0]
      }

    }).success(function (data, status, headers) {
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

  /*Get all links created by user*/
  this.getAllLinkfireLinks = function(postData){

    var d = $q.defer();
    // queries /api/1.0/links/create for new link when no previous link has been created from the current url during this user login session
    $http({
      method	: 'GET',
      url		  : 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/get-created-by-user',
      headers : {'Content-Type' : 'application/json'},
      params    : {
        "token":  postData.token,
        "user_id":postData.user_id
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

  //  Get latest linkfire links
  this.getLatestLinkfireLinks = function(userData, link){

    var d = $q.defer();
    // queries /api/1.0/links/create for new link when no previous link has been created from the current url during this user login session
    $http({
      method	: 'GET',
      url		  : 'http://linkfire.test.dev.rocketlabs.dk/api/1.0/links/get',
      headers : {'Content-Type' : 'application/json'},
      params  : {
        "token"   :  userData.token,
        "user_id" :  userData.user_id,
        "id"      :  link.id,
        'image'   :  link.image
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