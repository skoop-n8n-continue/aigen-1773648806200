const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/                    if\(!confirm\("Are you sure you want to clear\/reset this app\?"\)\) return;\n\n\n/, '');

fs.writeFileSync('index.html', html);
