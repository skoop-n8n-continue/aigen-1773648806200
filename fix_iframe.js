const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/        function loadIframe\(url\) \{\n            const iframe = document\.getElementById\('previewIframe'\);\n            iframe\.removeAttribute\('srcdoc'\);\n            const iframe = document\.getElementById\('previewIframe'\);/, `        function loadIframe(url) {
            const iframe = document.getElementById('previewIframe');
            iframe.removeAttribute('srcdoc');`);

fs.writeFileSync('index.html', html);
