function getImages() {
    const images = [];
    const imageLoadPromises = [];
    document.querySelectorAll('img').forEach((img) => {
        images.push({
            src: img.src,
            extension: img.src.split('.').pop().split('?')[0], 
            width: img.naturalWidth, 
            height: img.naturalHeight 
        });
    });
    document.querySelectorAll('*').forEach((element) => {
        const bg = window.getComputedStyle(element).backgroundImage;
        if (bg && bg !== 'none') {
            const urlMatch = bg.match(/url\(["']?([^"']+)["']?\)/);
            if (urlMatch && urlMatch[1]) {
                const img = new Image();
                img.src = urlMatch[1];
                const loadPromise = new Promise((resolve) => {
                    img.onload = () => {
                        images.push({
                            src: urlMatch[1],
                            extension: urlMatch[1].split('.').pop().split('?')[0],
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        });
                        resolve();
                    };
                    img.onerror = () => {
                        resolve(); 
                    };
                });
                imageLoadPromises.push(loadPromise);
            }
        }
    });
    return Promise.all(imageLoadPromises).then(() => images);
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getImages') {
        getImages().then(images => {
            sendResponse({ images: images });
        }).catch(error => {
            console.error('Error getting images:', error);
            sendResponse({ images: [] });
        });
        return true;
    }
});
