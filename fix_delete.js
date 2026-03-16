const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the stray code and remove it
html = html.replace(/        async function deleteApp\(\) \{[\s\S]*?\} catch\(e\) \{ showToast\('error', e\.message\); \}\n        \}/, '');

html = html.replace(/            try \{\n                const res = await fetch\(API\.resetRepo, \{ method: 'POST', headers: \{ 'Content-Type': 'application\/json' \}, body: JSON\.stringify\(\{ app_id: selectedApp\.app_id \}\) \}\);\n                if \(!res\.ok\) throw new Error\('Reset failed'\);\n                showToast\('success', 'App cleared successfully\.'\);\n                loadIframe\(getS3Url\(selectedApp\)\);\n                await loadConversation\(selectedApp\.app_id\);\n            \} catch\(e\) \{ showToast\('error', e\.message\); \}\n        \}/, '');

fs.writeFileSync('index.html', html);
