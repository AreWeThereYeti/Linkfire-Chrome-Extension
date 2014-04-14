// Content script is loaded in the active browser tab. When the extension sends a message with the action 'PageInfo' the content scripts responds by requesting meta data information. 
chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {
		
	    if (request.action == 'PageInfo') {
					var pageInfo = {};
	        // loops through all meta tags
					$('meta').each(function() {
	            
	            var name = $(this).attr('name');
	            var property = $(this).attr('property');
	
	            if (name == 'description'|| property == 'og:description'){
	                // if tag is a description tag, content is stored
	                pageInfo.description = $(this).attr('content');
	            }
	            if (property == 'og:image'){
	                // if tag is a thumbnail tag, content is stored
	                pageInfo.thumb = $(this).attr('content');
	            }
	        });
	        // if meta data is available it is sent as a message to the popup script, else an empty object is sent.
	        sendResponse(pageInfo);

	    }
	}
);