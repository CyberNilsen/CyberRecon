console.log('CyberRecon background script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'fetchData') {
    console.log('Fetching data from:', request.url);
    
    fetch(request.url)
      .then(response => {
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Fetch success:', data);
        sendResponse({success: true, data: data});
      })
      .catch(error => {
        console.error('Fetch error:', error);
        sendResponse({success: false, error: error.message});
      });
    
    return true;
  }
  
  if (request.action === 'getCurrentTab') {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          console.log('Current tab hostname:', url.hostname);
          sendResponse({success: true, hostname: url.hostname, fullUrl: tabs[0].url});
        } catch (error) {
          console.error('URL parsing error:', error);
          sendResponse({success: false, error: 'Invalid URL'});
        }
      } else {
        sendResponse({success: false, error: 'No active tab'});
      }
    });
    return true;
  }
});