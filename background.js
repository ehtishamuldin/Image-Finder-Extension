chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.images) {
        console.log("Images and extensions received: ", message.images);
    }
});
