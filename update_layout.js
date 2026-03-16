const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Update App Card Name Fallbacks
content = content.replace(
    /<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="\$\{escapeHtml\(app\.name\)\}">\$\{escapeHtml\(app\.name\)\}<\/div>/g,
    `<div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;" title="\${escapeHtml(app.name || app.appName || 'Untitled App')}">\${escapeHtml(app.name || app.appName || 'Untitled App')}</div>`
);

// Update Aspect Ratio Logic
content = content.replace(
    /                \/\/ Fixed Aspect Ratio\s*wrapper\.style\.aspectRatio = `\$\{app\.width\} \/ \$\{app\.height\}`;\s*wrapper\.style\.width = '100%';\s*wrapper\.style\.height = 'auto';\s*wrapper\.style\.maxHeight = '100%';\s*wrapper\.style\.margin = 'auto';/,
    `                // Fixed Aspect Ratio
                wrapper.style.aspectRatio = \`\${app.width} / \${app.height}\`;
                wrapper.style.width = 'auto';
                wrapper.style.height = 'auto';
                wrapper.style.maxWidth = '100%';
                wrapper.style.maxHeight = '100%';
                wrapper.style.margin = 'auto';`
);

content = content.replace(
    /                \/\/ Responsive\s*wrapper\.style\.aspectRatio = 'auto';\s*wrapper\.style\.width = '100%';\s*wrapper\.style\.height = '100%';\s*wrapper\.style\.maxHeight = 'none';\s*wrapper\.style\.margin = '0';/,
    `                // Responsive
                wrapper.style.aspectRatio = 'auto';
                wrapper.style.width = '100%';
                wrapper.style.height = '100%';
                wrapper.style.maxWidth = '800px';
                wrapper.style.maxHeight = 'none';
                wrapper.style.margin = '0 auto';`
);

fs.writeFileSync('index.html', content);
