// service for performing chrome.storage checks. chrome.storage checks are asynchronous
myApp.service('storageCheckService', function($q) {
  //  Set user data
  this.setId = function(args) {
    console.log('args is ' + args)
    chrome.storage.local.set({
      'user': args.user.email,
      'token': args.token,
      'id': args.user.id,
      'image' : args.user.image
    });
  };

//  Get user data
  this.getAuth = function(callback) {
    var user = {};
    chrome.storage.local.get(['user','token','id', 'image'],
      function (storage) {
        if (storage.user){
          user.user = storage.user;
          user.token = storage.token;
          user.id = storage.id;
          user.image = storage.image;
        }
        callback(user);
      }
    );
  };

//  Set original link and shortened link in chrome local storage
  this.setLink = function(original_link, shortlink) {
    chrome.storage.local.set({
      'original_url': original_link,
      'shortlink' : shortlink
    });
  };

//  Get original link and shortened link from chrome local storage
  this.getLink = function(callback) {
    var linkdata = {};
    chrome.storage.local.get(['original_url', 'shortlink'], function (storage) {
      if (JSON.stringify(storage).length > 0){
        linkdata.original_url = storage.original_url;
        linkdata.shortlink = storage.shortlink;
        callback(linkdata);
      }
    });
  };

//  Get settingss
  this.getSettings = function(callback) {
    var settings = {};
    chrome.storage.local.get(['copy', 'url'], function (storage) {
        settings.copy = storage.copy;
        settings.url = storage.url;
        callback(settings);
    });
  };

  //  Set original link and shortened link in chrome local storage
  this.setSettings = function(copy) {
    chrome.storage.local.set({
      'copy': copy
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
            if(response){
              if(response.description){
                console.log("meta data description added!");
                model.description = response.description;
              }

              else{
                model.description = "This link was created with the Linkfire Chrome extension";
              }
              if(response.thumb){
                console.log("meta data thumb added!");
                model.thumb = response.thumb;
              }else{
                model.thumb = null;
              }
            }
            callback(model);
          });
        }
      });
  };
});