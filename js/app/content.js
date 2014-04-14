//alert('content script loaded');

chrome.extension.onMessage.addListener(
	function (request, sender, sendResponse) {
	
	    //debugger;   // adds a breakpoint.
	
	
	    if (request.action == 'PageInfo') {
					var pageInfo = {};
	        // loops through all meta tags
					$('meta').each(function() {
	            
	            var name = $(this).attr('name');
	            var property = $(this).attr('property');
	
	            if (name == 'description'|| property == 'og:description'){
	                //only add urls that start with http
	                pageInfo.description = $(this).attr('content');
	            }
	            if (property == 'og:image'){
	                //only add urls that start with http
	                pageInfo.thumb = $(this).attr('content');
	            }
	        });
	        sendResponse(pageInfo);

	    }
	}
);