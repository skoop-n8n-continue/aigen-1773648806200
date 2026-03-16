const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update selectAppType
const newSelectAppType = `
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
`;
html = html.replace(/function selectAppType\(typeId\) \{[\s\S]*?function renderAppsList\(\) \{/, newSelectAppType + '\n        function renderAppsList() {');


// Update renderAppsList mapping
const newRenderLoop = `
            let html = '';
            combined.forEach(app => {
                const icon = currentAppType === 'html' ? 'fa-code' : 'fa-film';

                html += \`
                    <div class="app-card-grid">
                        <div style="height:80px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:24px; position:relative;" onclick="selectApp('\${app.app_id}', \${app.isDummy ? 'true' : 'false'})">
                            <i class="fa-solid \${icon}"></i>
                            
                            <!-- Menu Button -->
                            <div class="instance-menu-btn" style="position:absolute; top:5px; right:5px; background:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.1); font-size:14px; color:#374151;" onclick="event.stopPropagation(); toggleMenu('menu-\${app.app_id}')">
                                <i class="fa-solid fa-ellipsis"></i>
                            </div>
                            
                            <!-- Dropdown Menu -->
                            <div id="menu-\${app.app_id}" class="instance-menu" onclick="event.stopPropagation();">
                                <div class="menu-item"><i class="fa-solid fa-plus" style="width:14px;"></i> Add to Playlist</div>
                                <div class="menu-item"><i class="fa-regular fa-eye" style="width:14px;"></i> Preview</div>
                                <div class="menu-item" onclick="selectApp('\${app.app_id}', \${app.isDummy ? 'true' : 'false'})"><i class="fa-regular fa-pen-to-square" style="width:14px;"></i> Edit</div>
                                <div class="menu-item"><i class="fa-regular fa-copy" style="width:14px;"></i> Duplicate</div>
                                <div class="menu-item" style="color:#ef4444; border-top:1px solid #e5e7eb;"><i class="fa-regular fa-trash-can" style="width:14px;"></i> Delete</div>
                            </div>
                        </div>
                        <div style="padding:10px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:8px; background:white;" onclick="selectApp('\${app.app_id}', \${app.isDummy ? 'true' : 'false'})">
                            <i class="fa-solid \${icon}" style="color:var(--accent);"></i>
                            <div style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="\${escapeHtml(app.name)}">\${escapeHtml(app.name)}</div>
                        </div>
                    </div>
                \`;
            });

            container.innerHTML = html;
        }
`;
html = html.replace(/let html = '';\s*combined\.forEach\([\s\S]*?container\.innerHTML = html;\s*\}/, newRenderLoop);

fs.writeFileSync('index.html', html);
