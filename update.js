const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Fix 1: App Card Grid Overflow and Dropdown
content = content.replace(
    /        .app-card-grid \{\s*border: 1px solid #e5e7eb;\s*border-radius: 6px;\s*overflow: hidden;\s*position: relative;\s*display: flex;\s*flex-direction: column;\s*cursor: pointer;\s*transition: box-shadow 0.2s;\s*\}/,
    `        .app-card-grid {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            position: relative;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: box-shadow 0.2s;
            background: white;
        }
        .app-card-grid > div:first-child {
            border-radius: 6px 6px 0 0;
        }
        .app-card-grid > div:last-child {
            border-radius: 0 0 6px 6px;
        }`
);

// Fix 2: Add Duplicate Modal HTML
content = content.replace(
    /    <!-- Toast Container -->/,
    `    <!-- Clone App Modal -->
    <div id="cloneModalOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center;">
        <div style="background:white; padding:30px; border-radius:8px; width:400px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
            <h2 style="font-size:20px; font-weight:600; margin-bottom:10px;">Clone App</h2>
            <p id="cloneSourceLabel" style="font-size:13px; color:var(--text-secondary); margin-bottom:20px;"></p>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:20px;">
                <label style="font-size:14px; font-weight:500;">New App Name</label>
                <input type="text" id="inputCloneName" style="padding:10px; border:1px solid #e5e7eb; border-radius:6px; font-family:inherit; outline:none;" placeholder="My cloned app">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:10px;">
                <button onclick="closeCloneModal()" style="padding:8px 16px; border:1px solid #e5e7eb; background:white; border-radius:6px; cursor:pointer;">Cancel</button>
                <button id="btnCloneSubmit" onclick="submitClone()" class="btn-primary">Clone App</button>
            </div>
        </div>
    </div>

    <!-- Toast Container -->`
);

// Fix 3: Add cloneApp to API config
content = content.replace(
    /            republishRepo:'https:\/\/n8n\.skoopsignage\.dev\/webhook\/republish_repo_99dj348',/,
    `            republishRepo:'https://n8n.skoopsignage.dev/webhook/republish_repo_99dj348',\n            cloneApp: 'https://n8n.skoopsignage.dev/webhook/clone_app_99dj348',`
);

// Fix 4: Add Dropdown menu functions and dummy logic
const menuFunctions = `
        // ── DROPDOWN ACTIONS ──
        function dummyDeleteApp(appId) {
            document.querySelectorAll('.instance-menu').forEach(m => m.classList.remove('active'));
            showToast('info', 'Delete function is a mockup for demo purposes.');
        }

        function dummyAddPlaylist(appId) {
            document.querySelectorAll('.instance-menu').forEach(m => m.classList.remove('active'));
            showToast('info', 'Added app to playlist! (Demo)');
        }

        // ── CLONE ──
        let appToClone = null;
        function openCloneModal(appId, isDummy) {
            document.querySelectorAll('.instance-menu').forEach(m => m.classList.remove('active'));
            
            let sourceApp = isDummy ? DUMMY_APPS.find(a => a.app_id === appId) : allApps.find(a => a.app_id === appId);
            if (!sourceApp) return;
            
            appToClone = sourceApp;
            document.getElementById('inputCloneName').value = '';
            document.getElementById('cloneSourceLabel').textContent = 'Cloning from: ' + sourceApp.name;
            document.getElementById('cloneModalOverlay').style.display = 'flex';
            setTimeout(() => document.getElementById('inputCloneName').focus(), 100);
        }

        function closeCloneModal() {
            document.getElementById('cloneModalOverlay').style.display = 'none';
            appToClone = null;
        }

        async function submitClone() {
            if (!appToClone) return;
            const name = document.getElementById('inputCloneName').value.trim();
            if (!name) { showToast('error', 'Please enter a name for the cloned app.'); return; }

            const btn = document.getElementById('btnCloneSubmit');
            btn.disabled = true; btn.textContent = 'Cloning...';

            try {
                const res = await fetch(API.cloneApp, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, 'source_app-id': appToClone.app_id })
                });
                
                if (!res.ok) throw new Error('Clone failed (HTTP ' + res.status + ')');
                
                showToast('success', 'App "' + name + '" cloned successfully!');
                closeCloneModal();
                await loadApps();
            } catch (err) {
                showToast('error', 'Clone failed: ' + err.message);
            } finally {
                btn.disabled = false; btn.textContent = 'Clone App';
            }
        }
`;
content = content.replace(/        \/\/ ── PREVIEW CONTROLS ──/, menuFunctions + '\n        // ── PREVIEW CONTROLS ──');

// Fix 5: Replace dropdown HTML in renderAppsList
content = content.replace(
    /<div class="menu-item"><i class="fa-solid fa-plus" style="width:14px;"><\/i> Add to Playlist<\/div>\s*<div class="menu-item"><i class="fa-regular fa-eye" style="width:14px;"><\/i> Preview<\/div>\s*<div class="menu-item" onclick="selectApp\('\$\{app\.app_id\}', \$\{app\.isDummy \? 'true' : 'false'\}\)"><i class="fa-regular fa-pen-to-square" style="width:14px;"><\/i> Edit<\/div>\s*<div class="menu-item"><i class="fa-regular fa-copy" style="width:14px;"><\/i> Duplicate<\/div>\s*<div class="menu-item" style="color:#ef4444; border-top:1px solid #e5e7eb;"><i class="fa-regular fa-trash-can" style="width:14px;"><\/i> Delete<\/div>/,
    `<div class="menu-item" onclick="dummyAddPlaylist('\${app.app_id}')"><i class="fa-solid fa-plus" style="width:14px;"></i> Add to Playlist</div>
                                <div class="menu-item" onclick="selectApp('\${app.app_id}', \${app.isDummy ? 'true' : 'false'})"><i class="fa-regular fa-eye" style="width:14px;"></i> Preview</div>
                                <div class="menu-item" onclick="selectApp('\${app.app_id}', \${app.isDummy ? 'true' : 'false'})"><i class="fa-regular fa-pen-to-square" style="width:14px;"></i> Edit</div>
                                <div class="menu-item" onclick="openCloneModal('\${app.app_id}', \${app.isDummy ? 'true' : 'false'})"><i class="fa-regular fa-copy" style="width:14px;"></i> Duplicate</div>
                                <div class="menu-item" style="color:#ef4444; border-top:1px solid #e5e7eb;" onclick="dummyDeleteApp('\${app.app_id}')"><i class="fa-regular fa-trash-can" style="width:14px;"></i> Delete</div>`
);


// Fix 6: Set Aspect Ratio in selectApp
content = content.replace(
    /            const iframe = document\.getElementById\('previewIframe'\);/,
    `            const iframe = document.getElementById('previewIframe');
            const wrapper = document.querySelector('.preview-frame-wrapper');
            
            if (app.width && app.height) {
                // Fixed Aspect Ratio
                wrapper.style.aspectRatio = \`\${app.width} / \${app.height}\`;
                wrapper.style.width = '100%';
                wrapper.style.height = 'auto';
                wrapper.style.maxHeight = '100%';
                wrapper.style.margin = 'auto';
            } else {
                // Responsive
                wrapper.style.aspectRatio = 'auto';
                wrapper.style.width = '100%';
                wrapper.style.height = '100%';
                wrapper.style.maxHeight = 'none';
                wrapper.style.margin = '0';
            }`
);

// Fix 7: Scrolling chat history bug
// Ensure min-height: 0 is on the tab-pane. It is already there from the previous replace.
// Let's add min-height: 0 to chat-messages just in case, and verify the display.
content = content.replace(
    /        .chat-messages \{\s*flex: 1;\s*overflow-y: auto;\s*padding: 20px;\s*display: flex;\s*flex-direction: column;\s*gap: 15px;\s*\}/,
    `        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 15px;
            min-height: 0;
        }`
);

fs.writeFileSync('index.html', content);
