
        // ── CONFIG ──
        const API = {
            createRepo: 'https://n8n.skoopsignage.dev/webhook/create_repo_99dj348',
            getApps: 'https://n8n.skoopsignage.dev/webhook/get_apps_99dj348',
            getConvo: 'https://n8n.skoopsignage.dev/webhook/get_convo_99dj348',
            runAgent: 'https://n8n.skoopsignage.dev/webhook/run_agent_99dj349',
            getEvents: 'https://n8n.skoopsignage.dev/webhook/get_events_99dj348',
            republishRepo:'https://n8n.skoopsignage.dev/webhook/republish_repo_99dj348',
            resetRepo: 'https://n8n.skoopsignage.dev/webhook/reset_repo_99dj348',
        };

        const APP_TYPES = {
            'html': { id: 'html', name: 'HTML App Builder', icon: 'fa-code', mode: 'html' },
            'gsap': { id: 'gsap', name: 'Product Animation Video', icon: 'fa-film', mode: 'gsap animation v1' }
        };

        const DUMMY_APPS = [
            { app_id: 'dummy-html-1', name: 'Promo Banner (Demo)', app_mode: 'html', createdAt: new Date().toISOString(), isDummy: true },
            { app_id: 'dummy-gsap-1', name: '3D Product Spin (Demo)', app_mode: 'gsap animation v1', createdAt: new Date().toISOString(), isDummy: true }
        ];

        // ── STATE ──
        let allApps = [];
        let currentAppType = 'html'; // 'html' or 'gsap'
        let selectedApp = null;
        let isSending = false;
        let eventPollInterval = null;
        let seenEventIds = new Set();
        let currentTurn = 1;

        // ── INIT ──
        document.addEventListener('DOMContentLoaded', () => {
            loadApps();
        });

        function handleEnter(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        }

        // ── LOAD APPS ──
        async function loadApps() {
            const container = document.getElementById('sidebarApps');
            container.innerHTML = '<div style="padding:20px; color:#6b7280; font-size:14px;">Loading apps...</div>';

            try {
                const res = await fetch(API.getApps, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
                if (!res.ok) throw new Error('Failed to load apps');
                const data = await res.json();
                allApps = Array.isArray(data) ? data : [];
                renderAppsList();
            } catch (err) {
                showToast('error', 'Failed to load apps: ' + err.message);
                container.innerHTML = '<div style="padding:20px; color:#ef4444; font-size:14px;">Failed to load</div>';
            }
        }

        // ── APP TYPES UI ──
        
        function selectAppType(typeId) {
            if (!APP_TYPES[typeId]) {
                showToast('info', 'This app type is not available in the demo.');
                return;
            }

            currentAppType = typeId;
            
            document.getElementById('sidebarAppTypes').style.display = 'none';
            document.getElementById('sidebarAppInstances').style.display = 'flex';
            document.getElementById('instanceSidebarTitle').innerText = APP_TYPES[typeId].name;

            renderAppsList();
        }

        function showAppTypes() {
            document.getElementById('sidebarAppInstances').style.display = 'none';
            document.getElementById('sidebarAppTypes').style.display = 'flex';
        }

        function toggleMenu(menuId) {
            document.querySelectorAll('.instance-menu').forEach(m => {
                if (m.id !== menuId) m.classList.remove('active');
            });
            const menu = document.getElementById(menuId);
            if (menu) menu.classList.toggle('active');
        }

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.instance-menu') && !e.target.closest('.instance-menu-btn')) {
                document.querySelectorAll('.instance-menu').forEach(m => m.classList.remove('active'));
            }
        });

        function renderAppsList() {
            const container = document.getElementById('sidebarApps');
            container.innerHTML = '';

            const targetMode = APP_TYPES[currentAppType].mode;

            // 1. Show DUMMY apps for this mode first
            const typeDummyApps = DUMMY_APPS.filter(a => a.app_mode === targetMode || a.app_mode.startsWith(targetMode.split(' ')[0]));

            // 2. Show REAL apps for this mode
            // We use simple matching, allowing 'gsap animation v1' to show in 'gsap' view
            const typeRealApps = allApps.filter(a => {
                if(!a.app_mode) return targetMode === 'html'; // default unknown to html
                if(targetMode === 'html') return a.app_mode === 'html';
                return a.app_mode.includes('gsap');
            }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

            const combined = [...typeDummyApps, ...typeRealApps];

            if (combined.length === 0) {
                container.innerHTML = '<div style="padding:20px; color:#6b7280; font-size:14px;">No apps yet. Create one!</div>';
                return;
            }

            
            let html = '';
            combined.forEach(app => {
                const icon = currentAppType === 'html' ? 'fa-code' : 'fa-film';

                html += `
                    <div class="app-card-grid">
                        <div style="height:80px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:24px; position:relative;" onclick="selectApp('${app.app_id}', ${app.isDummy ? 'true' : 'false'})">
                            <i class="fa-solid ${icon}"></i>
                            
                            <!-- Menu Button -->
                            <div class="instance-menu-btn" style="position:absolute; top:5px; right:5px; background:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.1); font-size:14px; color:#374151;" onclick="event.stopPropagation(); toggleMenu('menu-${app.app_id}')">
                                <i class="fa-solid fa-ellipsis"></i>
                            </div>
                            
                            <!-- Dropdown Menu -->
                            <div id="menu-${app.app_id}" class="instance-menu" onclick="event.stopPropagation();">
                                <div class="menu-item"><i class="fa-solid fa-plus" style="width:14px;"></i> Add to Playlist</div>
                                <div class="menu-item"><i class="fa-regular fa-eye" style="width:14px;"></i> Preview</div>
                                <div class="menu-item" onclick="selectApp('${app.app_id}', ${app.isDummy ? 'true' : 'false'})"><i class="fa-regular fa-pen-to-square" style="width:14px;"></i> Edit</div>
                                <div class="menu-item"><i class="fa-regular fa-copy" style="width:14px;"></i> Duplicate</div>
                                <div class="menu-item" style="color:#ef4444; border-top:1px solid #e5e7eb;"><i class="fa-regular fa-trash-can" style="width:14px;"></i> Delete</div>
                            </div>
                        </div>
                        <div style="padding:10px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:8px; background:white;" onclick="selectApp('${app.app_id}', ${app.isDummy ? 'true' : 'false'})">
                            <i class="fa-solid ${icon}" style="color:var(--accent);"></i>
                            <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(app.name)}">${escapeHtml(app.name)}</div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }


        // ── APP SELECTION & EDITOR ──
        async function selectApp(appId, isDummy) {
            let app;
            if (isDummy) {
                app = DUMMY_APPS.find(a => a.app_id === appId);
            } else {
                app = allApps.find(a => a.app_id === appId);
            }
            if (!app) return;
            selectedApp = app;

            document.getElementById('viewPlaylist').style.display = 'none';
            document.getElementById('viewEditor').style.display = 'flex';
            document.getElementById('editorAppName').innerText = APP_TYPES[currentAppType].name + ' - ' + app.name;

            const iframe = document.getElementById('previewIframe');

            // Clear chat
            document.getElementById('chatHistory').innerHTML = '';
            currentTurn = 1;

            if (isDummy) {
                // Dummy Load
                iframe.srcdoc = `<html><body style='display:flex; align-items:center; justify-content:center; height:100vh; margin:0; font-family:sans-serif; background:#0f172a; color:white;'><h1 style='color:#00b7af;'>Demo Output: ${app.name}</h1></body></html>`;

                // Add dummy initial message
                const msgHtml = `
                    <div class="message-pair" data-turn="${currentTurn++}">
                        <button class="revert-btn" onclick="revertTo(${currentTurn-1})"><i class="fa-solid fa-clock-rotate-left"></i> Revert to here</button>
                        <div class="msg-bubble msg-user">Initial setup request for ${app.name}</div>
                        <div class="msg-bubble msg-ai">I've created the initial structure for your app based on the selected mode.</div>
                    </div>
                `;
                document.getElementById('chatHistory').innerHTML = msgHtml;

            } else {
                // Real Load
                iframe.srcdoc = ''; // clear
                const s3Url = getS3Url(app);
                loadIframe(s3Url);
                await loadConversation(app.app_id);
            }
        }

        function closeEditor() {
            document.getElementById('viewEditor').style.display = 'none';
            document.getElementById('viewPlaylist').style.display = 'flex';
            selectedApp = null;
        }

        // ── NEW APP MODAL ──
        function openNewAppModal() {
            document.getElementById('modalOverlay').style.display = 'flex';
            document.getElementById('inputAppName').value = '';
            setTimeout(() => document.getElementById('inputAppName').focus(), 100);
        }

        function closeNewAppModal() {
            document.getElementById('modalOverlay').style.display = 'none';
        }

        async function createApp() {
            const name = document.getElementById('inputAppName').value.trim();
            if (!name) { showToast('error', 'Please enter an app name.'); return; }

            const btn = document.getElementById('btnCreateApp');
            btn.disabled = true; btn.textContent = 'Creating...';

            try {
                const body = {
                    name,
                    mode: APP_TYPES[currentAppType].mode,
                    width: '1920',
                    height: '1080'
                };

                const res = await fetch(API.createRepo, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                if (!res.ok) throw new Error('Failed to create app (HTTP ' + res.status + ')');

                const data = await res.json();
                let newApp = null;
                if (Array.isArray(data) && data.length > 0) { newApp = data[0]; }
                else if (data && data.app_id) { newApp = data; }

                showToast('success', 'App "' + name + '" created!');
                closeNewAppModal();
                await loadApps();

                if (newApp && newApp.app_id) { await selectApp(newApp.app_id, false); }
            } catch (err) {
                showToast('error', 'Failed to create app: ' + err.message);
            } finally {
                btn.disabled = false; btn.textContent = 'Create App';
            }
        }

        // ── PREVIEW CONTROLS ──
        function refreshPreview() {
            if (!selectedApp) return;
            if (selectedApp.isDummy) return; // ignore for dummy
            loadIframe(getS3Url(selectedApp));
        }

        function openPreviewExternal() {
            if (!selectedApp) return;
            if (selectedApp.isDummy) return;
            window.open(getS3Url(selectedApp), '_blank');
        }


        // ── S3 & IFRAME ──
        function getS3Url(app) {
            return 'https://skoop-dev-code-agent.s3.us-east-1.amazonaws.com/n8n_continue/' + app.app_id + '/index.html?refresh=true';
        }

        function loadIframe(url) {
            const iframe = document.getElementById('previewIframe');
            iframe.removeAttribute('srcdoc');
            iframe.src = 'about:blank';
            setTimeout(() => {
                const bust = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
                const sep = url.includes('?') ? '&' : '?';
                iframe.src = url + sep + '_cb=' + bust;
            }, 50);
        }

        // ── CHAT ──
        async function loadConversation(appId) {
            const container = document.getElementById('chatHistory');
            container.innerHTML = `<div style="padding:20px; font-size:14px; color:#6b7280; text-align:center;">Loading conversation...</div>`;

            try {
                const res = await fetch(API.getConvo, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ app_id: appId }) });
                if (!res.ok) throw new Error('Failed to load conversation');
                const data = await res.json();

                container.innerHTML = '';
                currentTurn = 1;
                let messages = [];

                if (Array.isArray(data) && data.length > 0 && data[0].messages) {
                    messages = data[0].messages;
                }

                if (messages.length === 0) {
                    container.innerHTML = `<div style="padding:20px; font-size:14px; color:#6b7280; text-align:center;">Start building! Send a message.</div>`;
                    return;
                }

                messages.forEach(m => {
                    const humanText = extractUserRequest(m.human);
                    const aiText = m.ai;

                    const pairHtml = `
                        <div class="message-pair" data-turn="${currentTurn++}">
                            <button class="revert-btn" onclick="revertTo(${currentTurn-1})"><i class="fa-solid fa-clock-rotate-left"></i> Revert to here</button>
                            <div class="msg-bubble msg-user">${marked.parse(humanText, { breaks: true })}</div>
                            <div class="msg-bubble msg-ai">${marked.parse(aiText, { breaks: true })}</div>
                        </div>
                    `;
                    container.insertAdjacentHTML('beforeend', pairHtml);
                });

                scrollChatBottom();
            } catch (err) {
                showToast('error', 'Failed to load conversation: ' + err.message);
                container.innerHTML = `<div style="padding:20px; font-size:14px; color:#ef4444; text-align:center;">Failed to load messages</div>`;
            }
        }

        function extractUserRequest(raw) {
            if (!raw) return '';
            const match = raw.match(/User Request:\n([\s\S]*?)(\n\nCanvas Size:|\n\n---)/);
            return match ? match[1].trim() : raw;
        }

        function scrollChatBottom() {
            const container = document.getElementById('chatHistory');
            container.scrollTop = container.scrollHeight;
        }

        // ── EVENT POLLING ──
        function startEventPolling(runId) {
            seenEventIds = new Set();
            eventPollInterval = setInterval(async () => {
                try {
                    const res = await fetch(API.getEvents, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ run_id: runId }) });
                    if (!res.ok) return;
                    const events = await res.json();
                    if (!Array.isArray(events)) return;

                    events.sort((a, b) => a.id - b.id);
                    events.forEach(evt => {
                        if (!evt.tool || seenEventIds.has(evt.id)) return;
                        seenEventIds.add(evt.id);
                        appendEventBubble(evt);
                        scrollChatBottom();
                    });
                } catch (_) {}
            }, 2000);
        }

        function stopEventPolling() {
            if (eventPollInterval) {
                clearInterval(eventPollInterval);
                eventPollInterval = null;
            }
        }

        function appendEventBubble(evt) {
            const container = document.getElementById('chatHistory');
            const thinkEl = document.getElementById('thinkingIndicator');

            const summary = escapeHtml(evt.input_summary || '');
            const shortSummary = summary.length > 60 ? '…' + summary.split('/').slice(-2).join('/') : summary;

            const html = `
                <div class="event-row" data-event-id="${evt.id}" style="margin-top: -5px; margin-bottom: 5px; margin-left:10px;">
                    <span style="font-size:11px; font-weight:600; color:#6b7280; background:#f3f4f6; padding:2px 6px; border-radius:4px; border:1px solid #e5e7eb;">⚙️ ${escapeHtml(evt.tool)}</span>
                    <span style="font-size:11px; color:#9ca3af; margin-left:5px;">${shortSummary}</span>
                </div>`;

            if (thinkEl) {
                thinkEl.insertAdjacentHTML('beforebegin', html);
            } else {
                container.insertAdjacentHTML('beforeend', html);
            }
        }

        function usePrompt(text) {
            document.getElementById('chatInput').value = text;
            sendMessage();
        }

        // ── SEND MESSAGE ──
        async function sendMessage() {
            if (isSending || !selectedApp) return;
            const input = document.getElementById('chatInput');
            const text = input.value.trim();
            if (!text) return;

            isSending = true;
            input.disabled = true;
            input.value = '';

            const chatHistory = document.getElementById('chatHistory');

            // Remove empty state message if it exists
            const emptyMsg = chatHistory.querySelector('div[style*="Start building"]');
            if(emptyMsg) emptyMsg.remove();

            const turnId = currentTurn++;

            // For both dummy and real, render the user message and a thinking bubble
            const userHtml = `
                <div class="message-pair" data-turn="${turnId}" id="pair-${turnId}">
                    <button class="revert-btn" onclick="revertTo(${turnId})"><i class="fa-solid fa-clock-rotate-left"></i> Revert to here</button>
                    <div class="msg-bubble msg-user">${marked.parse(text, { breaks: true })}</div>
                </div>
            `;
            chatHistory.insertAdjacentHTML('beforeend', userHtml);

            const pairContainer = document.getElementById(`pair-${turnId}`);

            const thinkingHtml = `
                <div class="msg-bubble msg-ai" id="thinkingIndicator">
                    <i class="fa-solid fa-circle-notch fa-spin" style="margin-right:5px; color:var(--accent);"></i> Generating updates...
                </div>
            `;
            pairContainer.insertAdjacentHTML('beforeend', thinkingHtml);
            scrollChatBottom();

            if (selectedApp.isDummy) {
                // Dummy flow
                setTimeout(() => {
                    const thinkEl = document.getElementById('thinkingIndicator');
                    if(thinkEl) thinkEl.outerHTML = `<div class="msg-bubble msg-ai">${marked.parse("I have updated the app based on your request (Demo response). The changes are visible in the preview.", { breaks: true })}</div>`;

                    const iframe = document.getElementById('previewIframe');
                    iframe.srcdoc = `<html><body style='display:flex; align-items:center; justify-content:center; height:100vh; margin:0; font-family:sans-serif; background:#0f172a; color:white;'><h1 style='color:#00b7af;'>Demo Update</h1><p>${escapeHtml(text)}</p></body></html>`;

                    isSending = false;
                    input.disabled = false;
                    input.focus();
                    scrollChatBottom();
                }, 1500);
                return;
            }

            // Real flow
            const runId = `${selectedApp.app_id}-${Date.now()}`;
            startEventPolling(runId);

            try {
                const payload = {
                    input: text,
                    app_id: selectedApp.app_id,
                    run_id: runId,
                    runner: 'lambda',
                    planning: 'false',
                    mode: selectedApp.app_mode || 'html',
                    model: 'gemini-3-flash-preview',
                    agent_framework: 'claude-code',
                    environment: 'dev'
                };

                const res = await fetch(API.runAgent, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error('Agent call failed');
                const data = await res.json();

                stopEventPolling();
                const thinkEl = document.getElementById('thinkingIndicator');

                let response = '';
                if (Array.isArray(data) && data.length > 0) response = data[0].response || '';
                else if (data && data.response) response = data.response;

                if (thinkEl) {
                    thinkEl.outerHTML = `<div class="msg-bubble msg-ai">${marked.parse(response || 'Done.', { breaks: true })}</div>`;
                }

                scrollChatBottom();
                refreshPreview();

            } catch (err) {
                stopEventPolling();
                const thinkEl = document.getElementById('thinkingIndicator');
                if (thinkEl) thinkEl.outerHTML = `<div class="msg-bubble msg-ai" style="color:red;">Error: ${escapeHtml(err.message)}</div>`;
                showToast('error', 'Agent error: ' + err.message);
            } finally {
                isSending = false;
                input.disabled = false;
                input.focus();
            }
        }

        // ── REVERSION ──
        function revertTo(targetTurn) {
            const pairs = document.querySelectorAll('.message-pair');
            let removedCount = 0;

            pairs.forEach(pair => {
                const turn = parseInt(pair.getAttribute('data-turn'));
                if (turn > targetTurn) {
                    pair.remove();
                    removedCount++;
                }
            });

            if(removedCount > 0) {
                const chatHistory = document.getElementById('chatHistory');
                const notice = document.createElement('div');
                notice.style.cssText = "text-align:center; font-size:12px; color:#ef4444; padding:10px;";
                notice.innerText = `Reverted app state back to step ${targetTurn}. Subsequent messages cleared.`;
                chatHistory.appendChild(notice);
                chatHistory.scrollTop = chatHistory.scrollHeight;
                setTimeout(() => notice.remove(), 3000);
            }
        }

        // ── UTILS ──
        function escapeHtml(str) {
            const d = document.createElement('div');
            d.textContent = str || '';
            return d.innerHTML;
        }

        function showToast(type, msg) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = 'toast ' + type;
            toast.innerHTML = `<span></span> ${escapeHtml(msg)}`;
            container.appendChild(toast);
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // --- Tab Switching Logic ---
        function switchTab(tabId, element) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            element.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(c => c.classList.remove('active'));
            document.getElementById('tab-' + tabId).classList.add('active');
        }

        // Accordion mock logic
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('i');
                if(content && content.classList.contains('accordion-content')) {
                    if(content.style.display === 'none') {
                        content.style.display = 'flex';
                        icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                    } else {
                        content.style.display = 'none';
                        icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
                    }
                }
            });
        });
    