console.log("extension init.");
chrome.tabs.onCreated.addListener(function(tab) {
  console.log('tabs.onCreated --'
              + ' window: ' + tab.windowId
              + ' tab: '    + tab.id
              + ' index: '  + tab.index
              + ' url: '    + tab.url);
});

chrome.extension.onMessage.addListener(function(data,sender,sendResponse){
	switch(data['type']) {
	case 'zhaopin':
		sendResponse(ZhaoPin.parser(data['page']))
		break;
	case '51job':
		sendResponse(FOjob.parser(data['page']))
		break;
	case 'LinkedIn':
		sendResponse(LinkedIn.parser(data['page']))
		break;
	default:
		sendResponse('Error! No Expected Sender!')
		}
})
		
	}