// Saves options to chrome.storage
function save_options() {

  var urlSetting = document.getElementById('autoUrlSetting').checked;
  var copySetting = document.getElementById('autoCopySetting').checked;

  chrome.storage.sync.set({
    autoUrlSetting: urlSetting,
    autoCopySetting: copySetting
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    autoUrlSetting: true,
    autoCopySetting: true
  }, function(items) {
    document.getElementById('autoUrlSetting').checked = items.urlSetting;
    document.getElementById('autoCopySetting').checked = items.copySetting;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);