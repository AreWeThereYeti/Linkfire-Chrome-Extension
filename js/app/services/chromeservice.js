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