chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    const tabUrl = tabs[0].url;
    if (!tabUrl.startsWith('http://') && !tabUrl.startsWith('https://')) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = `Cannot inject script into this type of page: ${tabUrl}`;
        errorMessage.style.display = 'block';
        return;
    }
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['contentScript.js']
    }, () => {
        getImages(tabId);
    });
});
function getImages(tabId) {
    chrome.tabs.sendMessage(tabId, { action: 'getImages' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error retrieving images:', chrome.runtime.lastError.message);
            return;
        }
        if (response && response.images) {
            const images = response.images;
            const list = document.getElementById('image-list');
            list.innerHTML = '';
            images.forEach((image) => {
                if (image.src.startsWith('data:image/gif;base64,' )) {
                    return; 
                }
if (image.src.startsWith('data:image/svg+xml;base64,' )) {
                    return; 
                }
                const row = document.createElement('tr');
                const imgCell = document.createElement('td');
                const img = document.createElement('img');
                img.src = image.src;
                imgCell.appendChild(img);
                row.appendChild(imgCell);
                const detailsCell = document.createElement('td');
                const urlLink = document.createElement('a');
                urlLink.href = image.src;
                urlLink.target = '_blank';
                urlLink.textContent = image.src;
                if (image.src.length > 50) {
                    urlLink.textContent = image.src.slice(0, 47) + '...'; // Show first 47 characters and append ellipsis
                }
                detailsCell.innerHTML = `
                    <strong>URL:</strong> 
                `;
                detailsCell.appendChild(urlLink);
                detailsCell.innerHTML += `<br><strong>Extension:</strong> ${image.extension}<br><strong>Dimensions:</strong> Width:${image.width}px * Height:${image.height}px`;
                row.appendChild(detailsCell);
            
                // Action cell with download button
                const actionCell = document.createElement('td');
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = "Download";
                downloadBtn.classList.add('download-btn');
                downloadBtn.onclick = () => downloadImage(image.src);
                actionCell.appendChild(downloadBtn);
                row.appendChild(actionCell);
            
                // Append the row to the table body
                const list = document.getElementById('image-list');
                list.appendChild(row);
            });
            
            
            
            
        } else {
            console.error('No images retrieved.');
        }
    });
}

// Download function
function downloadImage(url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}