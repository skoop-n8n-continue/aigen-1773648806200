const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The new CSS for the instances grid and playlist items
const newStyles = `
        /* --- VIEW 1: Playlist / App Type Selector --- */
        .view-playlist {
            display: flex;
            flex: 1;
            width: 100%;
            height: 100%;
        }

        .playlist-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            background: var(--bg-main);
            border-right: 1px solid var(--border-color);
        }

        .playlist-top-nav {
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            border-bottom: 1px solid var(--border-color);
        }

        .playlist-info {
            padding: 20px 30px;
            border-bottom: 1px solid var(--border-color);
        }

        .playlist-items-container {
            padding: 30px;
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: #fafafa;
        }

        .playlist-sidebar {
            width: 320px;
            background: var(--bg-sidebar);
            display: flex;
            flex-direction: column;
        }

        .sidebar-title {
            padding: 20px;
            font-size: 18px;
            font-weight: 600;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .content-types {
            list-style: none;
            overflow-y: auto;
        }

        .content-type-item {
            padding: 15px 20px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            color: var(--text-secondary);
        }

        .content-type-item:hover {
            background-color: #f9fafb;
        }

        .app-instances-grid {
            padding: 0 20px 20px;
            overflow-y: auto;
            flex: 1;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            align-content: start;
        }

        .app-card-grid {
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            cursor: pointer;
            transition: box-shadow 0.2s;
        }

        .app-card-grid:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        
        .instance-menu {
            display: none;
            position: absolute;
            top: 35px;
            right: 5px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            flex-direction: column;
            width: 150px;
            z-index: 10;
        }
        
        .instance-menu.active {
            display: flex;
        }
        
        .menu-item {
            padding: 8px 12px;
            font-size: 13px;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .menu-item:hover {
            background: #f3f4f6;
        }
`;

html = html.replace(/\/\* --- VIEW 1: Playlist \/ App Type Selector ---\s*\*\/[\s\S]*?\/\* --- VIEW 2: Editor Interface ---\s*\*\//, newStyles + '\n        /* --- VIEW 2: Editor Interface --- */');


const newHtml = `
        <!-- ========================================== -->
        <!-- VIEW 1: Playlist / App Type Selector       -->
        <!-- ========================================== -->
        <div class="view-playlist" id="viewPlaylist">

            <!-- Playlist Main Pane -->
            <div class="playlist-main">
                <div class="playlist-top-nav">
                    <div style="display:flex; align-items:center; gap:10px; cursor:pointer; color:var(--text-secondary);">
                        <i class="fa-solid fa-chevron-left"></i>
                        <div style="display:flex; align-items:center; gap:8px; font-weight:600; font-size:18px; color:var(--text-primary);">
                            <div style="background:#e0f2fe; color:var(--accent); width:32px; height:32px; border-radius:6px; display:flex; align-items:center; justify-content:center;">
                                <i class="fa-solid fa-list-ul"></i>
                            </div>
                            Playlist
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <span style="font-weight:600; font-size:14px; cursor:pointer;">Preview</span>
                        <div style="width:1px; height:16px; background:var(--border-color);"></div>
                        <button class="btn-primary" style="background-color:#e5e7eb; color:#9ca3af; cursor:not-allowed;">Published</button>
                    </div>
                </div>
                
                <!-- Playlist Info -->
                <div class="playlist-info">
                    <h1 style="font-size:24px; font-weight:600; margin-bottom:10px; display:flex; align-items:center; gap:5px;">Images & Clock <i class="fa-solid fa-caret-down" style="font-size:14px; color:var(--text-secondary);"></i></h1>
                    
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <div style="display:flex; align-items:center; gap:15px; font-size:14px; color:var(--text-secondary);">
                            <span class="badge-published" style="background:#ccfbf1; color:#0f766e; padding:2px 8px; border-radius:12px; font-weight:500;">Published</span>
                            <span><strong style="color:var(--text-primary);">2</strong> Content items</span>
                            <span>-</span>
                            <span><strong style="color:var(--text-primary);">1</strong> Screen using this playlist</span>
                        </div>
                        
                        <div style="display:flex; gap:20px; font-size:12px;">
                            <div>
                                <div style="color:var(--text-secondary); margin-bottom:4px;">Aspect Ratio</div>
                                <select style="padding:6px; border:1px solid var(--border-color); border-radius:4px; outline:none; background:white;"><option>Select Value</option></select>
                            </div>
                            <div>
                                <div style="color:var(--text-secondary); margin-bottom:4px;">Default Duration</div>
                                <div style="display:flex; align-items:center; border:1px solid var(--border-color); border-radius:4px; overflow:hidden;">
                                    <input type="number" value="10" style="width:50px; padding:6px; border:none; outline:none; text-align:center;">
                                    <span style="padding:6px 10px; background:#f9fafb; border-left:1px solid var(--border-color); color:var(--text-secondary);">Seconds</span>
                                </div>
                            </div>
                            <div>
                                <div style="color:var(--text-secondary); margin-bottom:4px;">Transition</div>
                                <select style="padding:6px; border:1px solid var(--border-color); border-radius:4px; outline:none; background:white;"><option>None</option></select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Dummy Playlist Items -->
                <div class="playlist-items-container">
                    
                    <div style="display:flex; background:white; border:1px solid var(--border-color); border-radius:8px; overflow:hidden; min-height:100px;">
                        <div style="display:flex; flex-direction:column; justify-content:center; gap:15px; padding:10px; color:var(--text-secondary); border-right:1px solid var(--border-color); cursor:pointer;">
                            <i class="fa-solid fa-chevron-up"></i>
                            <i class="fa-solid fa-bars"></i>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div style="width:180px; background:#10b981; color:white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; text-align:center; padding:10px;">
                            BUILD YOUR OWN
                        </div>
                        <div style="flex:1; padding:15px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div style="display:flex; gap:10px; align-items:flex-start;">
                                <i class="fa-solid fa-camera" style="color:var(--accent); margin-top:3px;"></i>
                                <div style="font-weight:600; font-size:14px; word-break:break-all;">rjep0aBMqC4egHLYwyvxC29viT1a5Yq3p3jpOBJoubk=_skoop_media_ad58f...png</div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; color:var(--text-secondary); margin-top:20px;">
                                <div style="display:flex; gap:15px;">
                                    <i class="fa-regular fa-calendar"></i>
                                    <i class="fa-solid fa-hourglass-start"></i>
                                    <i class="fa-solid fa-scissors"></i>
                                </div>
                                <i class="fa-regular fa-trash-can" style="cursor:pointer;"></i>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; background:white; border:1px solid var(--border-color); border-radius:8px; overflow:hidden; min-height:100px;">
                        <div style="display:flex; flex-direction:column; justify-content:center; gap:15px; padding:10px; color:var(--text-secondary); border-right:1px solid var(--border-color); cursor:pointer;">
                            <i class="fa-solid fa-chevron-up"></i>
                            <i class="fa-solid fa-bars"></i>
                            <i class="fa-solid fa-chevron-down"></i>
                        </div>
                        <div style="width:180px; background:#06b6d4; color:black; display:flex; flex-direction:column; align-items:center; justify-content:center; font-weight:bold;">
                            <div style="font-size:12px; font-weight:normal;">Saturday, July 5</div>
                            <div style="font-size:24px;">12:29 PM</div>
                        </div>
                        <div style="flex:1; padding:15px; display:flex; flex-direction:column; justify-content:space-between;">
                            <div style="display:flex; gap:10px; align-items:center;">
                                <i class="fa-solid fa-clock" style="color:var(--accent);"></i>
                                <div style="font-weight:600; font-size:14px;">ok</div>
                                <i class="fa-solid fa-pen" style="color:var(--text-secondary); font-size:12px; cursor:pointer;"></i>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center; color:var(--text-secondary); margin-top:20px;">
                                <div style="display:flex; gap:15px;">
                                    <i class="fa-regular fa-calendar"></i>
                                    <i class="fa-solid fa-hourglass-start"></i>
                                </div>
                                <i class="fa-regular fa-trash-can" style="cursor:pointer;"></i>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>

            <!-- Right Sidebar -->
            <div class="playlist-sidebar">
                
                <!-- VIEW A: App Types -->
                <div id="sidebarAppTypes" style="display:flex; flex-direction:column; height:100%;">
                    <div class="sidebar-title">Content</div>
                    <div style="padding:15px 20px;">
                        <div style="position:relative;">
                            <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:12px; top:12px; color:var(--text-nav); font-size:14px;"></i>
                            <input type="text" placeholder="Type to search apps" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #e5e7eb; border-radius:6px; outline:none;">
                        </div>
                    </div>
                    <ul class="content-types">
                        <li class="content-type-item"><i class="fa-solid fa-camera" style="color:var(--accent); width:20px;"></i> Media <i class="fa-solid fa-chevron-right" style="margin-left:auto; font-size:12px;"></i></li>
                        <li class="content-type-item"><i class="fa-solid fa-wand-magic-sparkles" style="color:var(--accent); width:20px;"></i> AI Image Generator <i class="fa-solid fa-chevron-right" style="margin-left:auto; font-size:12px;"></i></li>
                        <li class="content-type-item"><i class="fa-solid fa-bell-concierge" style="color:var(--accent); width:20px;"></i> Menu Builder <i class="fa-solid fa-chevron-right" style="margin-left:auto; font-size:12px;"></i></li>

                        <li class="content-type-item" onclick="selectAppType('html')"><i class="fa-solid fa-code" style="color:var(--accent); width:20px;"></i> HTML App Builder <i class="fa-solid fa-chevron-right" style="margin-left:auto; font-size:12px;"></i></li>
                        <li class="content-type-item" onclick="selectAppType('gsap')"><i class="fa-solid fa-film" style="color:var(--accent); width:20px;"></i> Product Animation Video <i class="fa-solid fa-chevron-right" style="margin-left:auto; font-size:12px;"></i></li>

                        <li class="content-type-item"><i class="fa-solid fa-table-cells-large" style="color:var(--accent); width:20px;"></i> Zones <i class="fa-solid fa-chevron-right" style="margin-left:auto; font-size:12px;"></i></li>
                        <li class="content-type-item"><i class="fa-solid fa-clock" style="color:var(--accent); width:20px;"></i> Timer <i class="fa-solid fa-chevron-right" style="margin-left:auto; font-size:12px;"></i></li>
                    </ul>
                </div>

                <!-- VIEW B: App Instances -->
                <div id="sidebarAppInstances" style="display:none; flex-direction:column; height:100%;">
                    <div class="sidebar-title">
                        <div style="cursor:pointer; display:flex; align-items:center; gap:10px;" onclick="showAppTypes()">
                            <i class="fa-solid fa-chevron-left" style="font-size:14px;"></i> 
                            <span id="instanceSidebarTitle" style="font-size:18px;">HTML App Builder</span>
                        </div>
                        <button onclick="openNewAppModal()" style="background:var(--accent); color:white; border:none; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                    <div style="padding:15px 20px;">
                        <div style="position:relative;">
                            <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:12px; top:12px; color:var(--text-nav); font-size:14px;"></i>
                            <input type="text" placeholder="Search Content" style="width:100%; padding:10px 10px 10px 35px; border:1px solid #e5e7eb; border-radius:6px; outline:none;">
                        </div>
                    </div>
                    <div class="app-instances-grid" id="sidebarApps">
                        <!-- dynamic items -->
                    </div>
                </div>
            </div>

        </div>
        <!-- ========================================== -->
        <!-- VIEW 2: Editor Interface                   -->
        <!-- ========================================== -->`;

html = html.replace(/<!-- ========================================== -->\s*<!-- VIEW 1: Playlist \/ App Type Selector       -->\s*<!-- ========================================== -->[\s\S]*?<!-- ========================================== -->\s*<!-- VIEW 2: Editor Interface                   -->\s*<!-- ========================================== -->/, newHtml);

fs.writeFileSync('index.html', html);
