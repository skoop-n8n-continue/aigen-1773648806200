const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix iframe.srcdoc vs iframe.src in loadIframe
html = html.replace(/function loadIframe\(url\) {/, `function loadIframe(url) {
            const iframe = document.getElementById('previewIframe');
            iframe.removeAttribute('srcdoc');`);

// 2. Remove delete button from editor toolbar
html = html.replace(/<button class="btn-icon" title="Delete\/Clear App" onclick="deleteApp\(\)"><i class="fa-regular fa-trash-can"><\/i><\/button>/g, '');

// And remove deleteApp function entirely
html = html.replace(/async function deleteApp\(\) \{[\s\S]*?\}\n/g, '');

// 3. Fix scroll on chat
html = html.replace(/\.tab-pane \{\n\s+display: none;\n\s+flex: 1;\n\s+flex-direction: column;\n\s+\}/, `.tab-pane {
            display: none;
            flex: 1;
            flex-direction: column;
            min-height: 0;
        }`);

fs.writeFileSync('index.html', html);
