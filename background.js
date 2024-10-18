chrome.runtime.onInstalled.addListener(() => {
    checkApiKey();
});

chrome.runtime.onStartup.addListener(() => {
    checkApiKey();
});

function checkApiKey() {
    chrome.storage.local.get('openaiApiKey', (result) => {
        if (result.openaiApiKey) {
            chrome.action.setPopup({ popup: 'popup.html' });
        } else {
            chrome.action.setPopup({ popup: 'setup.html' });
        }
    });
}