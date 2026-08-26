        window.saveTableData = function() {
            var newData = [];
            for(var i = 0; i < window.MAX_ROWS; i++) {
                var fIdNode = document.querySelector(`input[data-row="${i}"][data-col="0"]`);
                if (!fIdNode) break;
                var fId = fIdNode.value.trim();
                var fWord = document.querySelector(`input[data-row="${i}"][data-col="1"]`)?.value.trim() || '';
                var bImgId = document.querySelector(`input[data-row="${i}"][data-col="2"]`)?.value.trim() || '';
                var bText = document.querySelector(`input[data-row="${i}"][data-col="3"]`)?.value.trim() || '';
                var fTime = document.querySelector(`input[data-row="${i}"][data-col="4"]`)?.value.trim() || '';
                var bTime = document.querySelector(`input[data-row="${i}"][data-col="5"]`)?.value.trim() || '';

                if (fId || fWord || bImgId || bText) {
                    newData.push({ fId, fWord, bImgId, bText, fTime, bTime });
                }
            }
            try {
                localStorage.setItem('pokemonClashDataJSON', JSON.stringify(newData));
            } catch(e) {
                console.error("Failed to save table data:", e);
                alert("Lỗi lưu dữ liệu: Bộ nhớ đầy! Hãy ấn 'Clear Images' để dọn dẹp hoặc upload lại ít hình hơn.");
            }
        };
        
        window._autoSaveTimer = null;
        window.autoSaveTableData = function() {
            clearTimeout(window._autoSaveTimer);
            window._autoSaveTimer = setTimeout(window.saveTableData, 500);
        };
        
        window.isGamePaused = false;
        window._pausedTimers = { global: null, read: null, fuse: null };

        window.pauseGame = function() {
            if (window.isGameOver || window.isGamePaused) return;
            window.isGamePaused = true;
            
            // Save and stop Global Timer
            if (window.gameTimerInterval) {
                clearInterval(window.gameTimerInterval);
                window.gameTimerInterval = null;
            }
            
            // Save and stop Read Timer (Front card)
            if (window.turnTimerInterval) {
                clearInterval(window.turnTimerInterval);
                window.turnTimerInterval = null;
            }
            
            // Save and stop Fuse Timer (Back card)
            if (window.bombInterval) {
                clearInterval(window.bombInterval);
                window.bombInterval = null;
            }
            
            // Show pause overlay
            var overlay = document.getElementById('pause-overlay');
            if (overlay) { 
                overlay.classList.remove('hidden'); 
                overlay.classList.add('flex'); 
            }
            
            // Pause background music
            if (window.bgMusic && !window.bgMusic.paused) {
                window.bgMusic.pause();
            }
        };

        window.resumeGame = function() {
            if (!window.isGamePaused) return;
            window.isGamePaused = false;
            
            // Resume Global Timer
            if (window.GLOBAL_TIMER_ENABLED && window.isGameStarted && !window.isGameOver && window.currentGameTime > 0) {
                clearInterval(window.gameTimerInterval);
                window.gameTimerInterval = setInterval(function() {
                    if (window.isGamePaused) return;
                    window.currentGameTime--;
                    window.updateTimerUI();
                    if (window.currentGameTime <= 0) {
                        clearInterval(window.gameTimerInterval);
                        window.gameTimerInterval = null;
                        window.triggerWin(true);
                    }
                }, 1000);
            }
            
            // Resume Read Timer
            if (window._readTimerRemaining > 0 && window._readTimerRunning && !window.isGameOver) {
                clearInterval(window.turnTimerInterval);
                window.turnTimerInterval = setInterval(function() {
                    if (window.isGamePaused) return;
                    window._readTimerRemaining--;
                    window.updateReadTimerUI();
                    if (window._readTimerRemaining <= 0) {
                        if (window.onReadTimerExpired) window.onReadTimerExpired();
                    }
                }, 1000);
            }
            
            // Resume Fuse Timer
            if (window._fuseRemaining > 0 && window._fuseRunning && !window.isGameOver) {
                clearInterval(window.bombInterval);
                window.bombInterval = setInterval(function() {
                    if (window.isGamePaused) return;
                    window._fuseRemaining -= 0.1;
                    if (window._fuseRemaining <= 0) {
                        window._fuseRemaining = 0;
                        clearInterval(window.bombInterval);
                        window.bombInterval = null;
                        window._fuseRunning = false;
                        window.handleAction('miss');
                        return;
                    }
                    window.updateFuseUI();
                }, 100);
            }
            
            // Hide pause overlay
            var overlay = document.getElementById('pause-overlay');
            if (overlay) { 
                overlay.classList.add('hidden'); 
                overlay.classList.remove('flex'); 
            }
            
            // Resume background music
            if (window.bgMusic && window.soundEnabled) {
                window.bgMusic.play().catch(function(){});
            }
        };

        window.initGame = function() {
            if (window.isGamePaused) {
                window.isGamePaused = false;
                var overlay = document.getElementById('pause-overlay');
                if (overlay) { overlay.classList.add('hidden'); overlay.classList.remove('flex'); }
            }
            window.isGameOver = false; 
            window.isProcessingModal = false; 
            window.stopGameGlobalTimer(); 
            window.tempoMultiplier = 1.0; 
            clearInterval(window.confettiInterval);
            document.querySelectorAll('.confetti-piece').forEach(e => e.remove());
            window.playSound('flip'); if (window.soundEnabled) window.startMusic();
            
            window.teams.team1.hp = window.TEAM1_MAX_HP; window.teams.team1.maxHp = window.TEAM1_MAX_HP; window.teams.team1.shieldCount = 0; window.teams.team1.hasBlind = false; window.teams.team1.isFrozen = false; window.teams.team1.sleepTurns = 0; window.teams.team1.isPoisoned = false; window.teams.team1.sabotageBombs = 0;
            window.teams.team2.hp = window.TEAM2_MAX_HP; window.teams.team2.maxHp = window.TEAM2_MAX_HP; window.teams.team2.shieldCount = 0; window.teams.team2.hasBlind = false; window.teams.team2.isFrozen = false; window.teams.team2.sleepTurns = 0; window.teams.team2.isPoisoned = false; window.teams.team2.sabotageBombs = 0;
            
            window.gameState.bloodPact = { active: false, turnsLeft: 0, caster: null, justCasted: false };
            window.gameState.mimic.active = false;

            window.teams.team1.baseEl = document.getElementById('team1-base');
            window.teams.team2.baseEl = document.getElementById('team2-base');

            ['team1', 'team2'].forEach(t => {
                var hpBlocks = document.getElementById(`${t}-hp-blocks`);
                if(hpBlocks) hpBlocks.innerHTML = '';
                window.updateShieldUI(t);
                window.updateStatusIcons(t);
                
                var avatar = document.getElementById(`${t}-avatar`);
                if(avatar) {
                    avatar.classList.remove('avatar-bounce', 'avatar-shake');
                    avatar.style.filter = '';
                }
                var fireworks = document.getElementById(`${t}-fireworks`);
                if(fireworks) fireworks.classList.add('hidden', 'fireworks-active');
            });
            
            window.updateHPUI();

            var statusElNode = document.getElementById('global-status');
            if(statusElNode) statusElNode.classList.add('hidden'); 
            var gameTimerCont = document.getElementById('game-timer-container');
            if(gameTimerCont) gameTimerCont.classList.add('hidden');
            var handPanelNode = document.getElementById('hand-panel');
            if(handPanelNode) handPanelNode.classList.remove('hidden');
            
            var chain1 = document.getElementById('blood-pact-chain-1');
            if(chain1) { chain1.classList.add('hidden', 'opacity-0'); chain1.classList.remove('chain-shatter', 'opacity-100'); }
            var chain2 = document.getElementById('blood-pact-chain-2');
            if(chain2) { chain2.classList.add('hidden', 'opacity-0'); chain2.classList.remove('chain-shatter', 'opacity-100'); }

            window.currentTurn = 'team1'; window.updateTurnUI();
            window.loadData();
            window.updateSpecialModeUI();
            
            window.currentHand = [];
            window.drawCards();
            window.populateSelects(); window.applyTheme('team1'); window.applyTheme('team2');
        };

        window.setupGameEvents = function() {
            var attachBtn = function(id, event, handler) {
                var btn = document.getElementById(id);
                if (btn) {
                    btn.removeEventListener(event, handler);
                    btn.addEventListener(event, handler);
                }
            };

            var gridBody = document.getElementById('data-grid-body');
            if (gridBody) {
                gridBody.addEventListener('paste', function(e) {
                    e.preventDefault();
                    var pasteData = (e.clipboardData || window.clipboardData).getData('text');
                    var rows = pasteData.split(/\r?\n/);
                    var target = e.target;
                    var startRow = 0, startCol = 0;
                    if (target && target.tagName === 'INPUT') {
                        startRow = parseInt(target.getAttribute('data-row'));
                        startCol = parseInt(target.getAttribute('data-col'));
                    }
                    rows.forEach((rowStr, rIdx) => {
                        if (!rowStr.trim() && rIdx === rows.length - 1) return;
                        var cols = rowStr.split('\t');
                        cols.forEach((colStr, cIdx) => {
                            var trgRow = startRow + rIdx;
                            var trgCol = startCol + cIdx;
                            
                            while (trgRow >= window.MAX_ROWS) {
                                window.addGridRow(window.MAX_ROWS);
                                window.MAX_ROWS++;
                            }
                            
                            if (trgCol < 6) {
                                var input = document.querySelector(`input[data-row="${trgRow}"][data-col="${trgCol}"]`);
                                if (input) {
                                    input.value = colStr.trim();
                                    input.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            }
                        });
                    });
                });
                
                gridBody.addEventListener('input', (e) => {
                    var target = e.target;
                    if (target.tagName === 'INPUT') {
                        var col = target.getAttribute('data-col');
                        if (col === '0' || col === '2') {
                            var val = target.value.trim();
                            var previewDiv = target.parentElement.querySelector('.preview-' + col);
                            if (previewDiv) {
                                if (!val) {
                                    previewDiv.innerHTML = '';
                                } else {
                                    if (window.imagesPool && window.imagesPool[val]) {
                                        previewDiv.innerHTML = `<img src="${window.imagesPool[val]}" class="w-6 h-6 object-contain pointer-events-none" />`;
                                    } else if (String(val).startsWith('http') || String(val).startsWith('data:image')) {
                                        previewDiv.innerHTML = `<img src="${val}" class="w-6 h-6 object-contain pointer-events-none" onerror="this.style.display='none'"/>`;
                                    } else {
                                        previewDiv.innerHTML = '';
                                    }
                                }
                            }
                        }
                    }
                    window.autoSaveTableData();
                });
            }

            var btnAddRows = document.getElementById('btn-add-rows');
            if (btnAddRows) {
                btnAddRows.addEventListener('click', function(e) {
                    e.preventDefault();
                    var limit = window.MAX_ROWS + 50;
                    while (window.MAX_ROWS < limit) {
                        window.addGridRow(window.MAX_ROWS);
                        window.MAX_ROWS++;
                    }
                });
            }

            
            var clearImgBtn = document.getElementById('btn-clear-images');
            if (clearImgBtn) {
                clearImgBtn.addEventListener('click', async function(e) {
                    if (confirm("Are you sure you want to delete all uploaded images?")) {
                        window.imagesPool = {};
                        if (window.clearIndexedDB) await window.clearIndexedDB();
                        localStorage.removeItem('pokemonClashImagePool');
                        var target = e.currentTarget;
                        var orig = target.innerText;
                        target.innerText = "Cleared!";
                        window.buildDeck();
                        setTimeout(() => target.innerText = orig, 1500);
                    }
                });
            }

            var handleImageUpload = async function(e) {
                var files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
                if (!files || files.length === 0) {
                    var status = document.getElementById('upload-status');
                    if (status) {
                        status.classList.remove('hidden');
                        status.innerText = 'No valid images found in selection.';
                        setTimeout(() => status.classList.add('hidden'), 3000);
                    }
                    return;
                }

                var status = document.getElementById('upload-status');
                if(status) { status.classList.remove('hidden'); status.innerText = 'Processing 0 / ' + files.length + ' image(s)...'; }
                
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (status && i % 5 === 0) {
                        status.innerText = 'Processing ' + i + ' / ' + files.length + ' image(s)...';
                    }
                    await new Promise((resolve) => {
                        var reader = new FileReader();
                        reader.onload = function(event) {
                            var img = new Image();
                            img.onload = function() {
                                var canvas = document.createElement('canvas');
                                var maxDim = 1500;
                                var width = img.width;
                                var height = img.height;
                                
                                if (width > height) {
                                    if (width > maxDim) { height *= maxDim / width; width = maxDim; }
                                } else {
                                    if (height > maxDim) { width *= maxDim / height; height = maxDim; }
                                }
                                
                                canvas.width = width;
                                canvas.height = height;
                                var ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0, width, height);
                                
                                var base64Str = canvas.toDataURL('image/webp', 0.95);
                                
                                var fileNameNoExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                                window.imagesPool[fileNameNoExt] = base64Str;
                                
                                resolve();
                            };
                            img.onerror = function() {
                                console.error('Failed to load image:', file.name);
                                resolve();
                            };
                            img.src = event.target.result;
                        };
                        reader.onerror = function() {
                            console.error('Failed to read file:', file.name);
                            resolve();
                        };
                        reader.readAsDataURL(file);
                    });
                }

                try {
                    if (status) status.innerText = 'Saving to database...';
                    await window.saveImagesToIndexedDB(window.imagesPool);
                    if (status) {
                        status.innerText = 'Saved ' + files.length + ' images to memory!';
                        setTimeout(() => status.classList.add('hidden'), 3000);
                    }
                    window.buildDeck();
                } catch (error) {
                    if (status) {
                        status.innerText = 'Error: Failed to save images!';
                        status.classList.replace('text-yellow-400', 'text-red-400');
                    }
                }
            };

            var uploadBtn = document.getElementById('btn-upload-images');
            if (uploadBtn) uploadBtn.addEventListener('change', handleImageUpload);
            
            var uploadFilesBtn = document.getElementById('btn-upload-files');
            if (uploadFilesBtn) uploadFilesBtn.addEventListener('change', handleImageUpload);

            attachBtn('btn-export-html', 'click', () => {
                var exportData = [];
                for(var i = 0; i < window.MAX_ROWS; i++) {
                    var fIdNode = document.querySelector(`input[data-row="${i}"][data-col="0"]`);
                    if (!fIdNode) break;
                    exportData.push({
                        fId: fIdNode.value.trim(),
                        fWord: document.querySelector(`input[data-row="${i}"][data-col="1"]`)?.value.trim() || '',
                        bImgId: document.querySelector(`input[data-row="${i}"][data-col="2"]`)?.value.trim() || '',
                        bText: document.querySelector(`input[data-row="${i}"][data-col="3"]`)?.value.trim() || '',
                        fTime: document.querySelector(`input[data-row="${i}"][data-col="4"]`)?.value.trim() || '',
                        bTime: document.querySelector(`input[data-row="${i}"][data-col="5"]`)?.value.trim() || ''
                    });
                }
                var exportSettings = {
                    frontMode: document.getElementById('setting-front-mode')?.value || 'both',
                    backMode: document.getElementById('setting-back-mode')?.value || 'full',
                    timerEnabled: document.getElementById('setting-timer-enabled')?.value === 'on',
                    globalTime: (parseInt(document.getElementById('setting-global-time')?.value) || 15) * 60,
                    readTime: parseInt(document.getElementById('setting-read-time')?.value) || 0,
                    hp1: parseInt(document.getElementById('setting-hp-t1')?.value) || 7,
                    hp2: parseInt(document.getElementById('setting-hp-t2')?.value) || 7,
                    cardsPerTurn: parseInt(document.getElementById('setting-cards-per-turn')?.value) || 3,
                    maxBonusCards: parseInt(document.getElementById('setting-max-bonus')?.value) ?? 1,
                    specialCards: window.dynamicSpecialCards,
                    specialMode: window.isSpecialModeActive
                };

                var clone = document.documentElement.cloneNode(true);
                var activeHandClone = clone.querySelector('#active-hand');
                if(activeHandClone) activeHandClone.innerHTML = '';
                var gridBodyClone = clone.querySelector('#data-grid-body');
                if(gridBodyClone) gridBodyClone.innerHTML = '';
                
                var oldState = clone.querySelector('#injected-state');
                if (oldState) oldState.remove();

                var scriptEl = document.createElement('script');
                scriptEl.id = 'injected-state';
                scriptEl.textContent = `window.INJECTED_GAME_STATE = ${JSON.stringify({ data: exportData, settings: exportSettings, imagesPool: window.imagesPool || {} })};`;
                clone.querySelector('head').appendChild(scriptEl);

                var htmlContent = "<!DOCTYPE html>\n" + clone.outerHTML;
                var blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                
                var fileName = prompt("Nhập tên Bài học (File HTML) bạn muốn lưu:", "Pokemon_Castle_Battle");
                if (!fileName) return; 
                
                a.download = fileName.endsWith('.html') ? fileName : fileName + '.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });

            attachBtn('btn-settings', 'click', () => { 
                var modal = document.getElementById('settings-modal');
                if(modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
            });
            attachBtn('btn-close-settings', 'click', () => { 
                var modal = document.getElementById('settings-modal');
                if(modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
            });
            
            attachBtn('btn-clear-table', 'click', function(e) {
                var colToClear = document.getElementById('clear-column-select')?.value;
                var inputs = colToClear === 'all' ? document.querySelectorAll('#data-grid-body input') : document.querySelectorAll(`#data-grid-body input[data-col="${colToClear}"]`);
                inputs.forEach(input => {
                    input.value = '';
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
                var target = e.currentTarget;
                var orig = target.innerText; 
                target.innerText = 'Cleared ✓'; 
                target.classList.replace('bg-red-600', 'bg-green-600');
                setTimeout(() => { target.innerText = orig; target.classList.replace('bg-green-600', 'bg-red-600'); }, 1500);
            });

            attachBtn('btn-auto-fill', 'click', function(e) {
                var col = parseInt(document.getElementById('auto-col-select')?.value || 0);
                var start = parseInt(document.getElementById('auto-start')?.value);
                var end = parseInt(document.getElementById('auto-end')?.value);
                if (isNaN(start) || isNaN(end)) return alert("Nhập số hợp lệ!");
                var rIdx = 0; var step = start <= end ? 1 : -1;
                for (var num = start; (step === 1 ? num <= end : num >= end); num += step) {
                    if (rIdx >= window.MAX_ROWS) break;
                    var input = document.querySelector(`input[data-row="${rIdx}"][data-col="${col}"]`);
                    if (input) {
                        input.value = num;
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    rIdx++;
                }
                if (window.saveTableData) window.saveTableData();
                var target = e.currentTarget;
                var orig = target.innerText; 
                target.innerText = 'Done ✓'; 
                target.classList.replace('bg-blue-600', 'bg-green-600');
                setTimeout(() => { target.innerText = orig; target.classList.replace('bg-green-600', 'bg-blue-600'); }, 1500);
            });

            window.addEventListener('beforeunload', function (e) {
                if (window.saveTableData) window.saveTableData();
            });

            attachBtn('btn-download-config', 'click', () => {
                window.downloadConfigJSON();
                var target = document.getElementById('btn-download-config');
                var orig = target.innerText;
                target.innerText = "Downloaded!"; target.classList.replace('bg-blue-600', 'bg-green-600');
                setTimeout(() => { target.innerText = orig; target.classList.replace('bg-green-600', 'bg-blue-600'); }, 1500);
            });
            
            var customPokeInput = document.getElementById('setting-custom-pokemon');
            if (customPokeInput) {
                customPokeInput.addEventListener('input', (e) => {
                    var val = e.target.value;
                    var preview = document.getElementById('custom-pokemon-preview');
                    if(!preview) return;
                    preview.innerHTML = '';
                    if(!val) return;
                    var ids = val.split(',').map(id => id.trim()).filter(id => id);
                    ids.forEach(id => {
                        var img = document.createElement('img');
                        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id.toLowerCase()}.png`;
                        img.className = "w-8 h-8 md:w-10 md:h-10 object-contain bg-slate-800 rounded p-1 border border-slate-600";
                        img.title = id;
                        img.onerror = function() { this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id.toLowerCase()}.png`; };
                        preview.appendChild(img);
                    });
                });
            }

            attachBtn('btn-fetch-pokemon', 'click', async () => {
                var input = document.getElementById('setting-custom-pokemon').value;
                if (!input) return;
                var ids = input.split(',').map(id => id.trim()).filter(id => id);
                if (ids.length === 0) return;
                
                var statusEl = document.getElementById('fetch-pokemon-status');
                statusEl.innerText = `Fetching ${ids.length} Pokémon...`;
                statusEl.classList.remove('hidden');
                statusEl.classList.replace('text-red-400', 'text-yellow-400');
                statusEl.classList.replace('text-green-400', 'text-yellow-400');
                
                var newPokes = [];
                for (var id of ids) {
                    try {
                        var res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id.toLowerCase()}`);
                        if (!res.ok) throw new Error();
                        var data = await res.json();
                        var type = data.types[0].type.name;
                        var pokeName = data.name.toUpperCase();
                        
                        var typeMap = {
                            'electric': { tone: 'yellow', rgb: '234, 179, 8', main: '#eab308', light: '#fef08a', dark: '#a16207', text: '#fde047' },
                            'fire': { tone: 'red', rgb: '239, 68, 68', main: '#ef4444', light: '#fecaca', dark: '#b91c1c', text: '#fca5a5' },
                            'water': { tone: 'blue', rgb: '56, 189, 248', main: '#38bdf8', light: '#bae6fd', dark: '#0369a1', text: '#7dd3fc' },
                            'grass': { tone: 'green', rgb: '34, 197, 94', main: '#22c55e', light: '#bbf7d0', dark: '#15803d', text: '#86efac' },
                            'psychic': { tone: 'purple', rgb: '168, 85, 247', main: '#a855f7', light: '#e9d5ff', dark: '#7e22ce', text: '#d8b4fe' },
                            'dark': { tone: 'slate', rgb: '71, 85, 105', main: '#475569', light: '#cbd5e1', dark: '#1e293b', text: '#94a3b8' },
                            'fairy': { tone: 'pink', rgb: '236, 72, 153', main: '#ec4899', light: '#fbcfe8', dark: '#be185d', text: '#f9a8d4' },
                            'normal': { tone: 'orange', rgb: '249, 115, 22', main: '#f97316', light: '#fed7aa', dark: '#c2410c', text: '#fdba74' },
                            'fighting': { tone: 'red', rgb: '220, 38, 38', main: '#dc2626', light: '#fecaca', dark: '#991b1b', text: '#f87171' },
                            'dragon': { tone: 'indigo', rgb: '99, 102, 241', main: '#6366f1', light: '#c7d2fe', dark: '#4338ca', text: '#a5b4fc' },
                            'ghost': { tone: 'purple', rgb: '147, 51, 234', main: '#9333ea', light: '#e9d5ff', dark: '#6b21a8', text: '#d8b4fe' },
                            'rock': { tone: 'brown', rgb: '146, 64, 14', main: '#92400e', light: '#fcd34d', dark: '#451a03', text: '#fde68a' },
                            'ground': { tone: 'orange', rgb: '217, 119, 6', main: '#d97706', light: '#fde68a', dark: '#78350f', text: '#fbbf24' },
                            'ice': { tone: 'cyan', rgb: '6, 182, 212', main: '#06b6d4', light: '#cffafe', dark: '#0891b2', text: '#67e8f9' },
                            'poison': { tone: 'purple', rgb: '147, 51, 234', main: '#9333ea', light: '#e9d5ff', dark: '#581c87', text: '#c084fc' },
                            'flying': { tone: 'blue', rgb: '96, 165, 250', main: '#60a5fa', light: '#dbeafe', dark: '#1e3a8a', text: '#93c5fd' },
                            'bug': { tone: 'green', rgb: '132, 204, 22', main: '#84cc16', light: '#d9f99d', dark: '#3f6212', text: '#bef264' },
                            'steel': { tone: 'gray', rgb: '156, 163, 175', main: '#9ca3af', light: '#f3f4f6', dark: '#374151', text: '#d1d5db' }
                        };
                        
                        var theme = typeMap[type] || typeMap['normal'];
                        
                        newPokes.push({
                            id: data.id.toString(),
                            name: pokeName,
                            tone: theme.tone,
                            pType: type,
                            rgb: theme.rgb,
                            main: theme.main,
                            light: theme.light,
                            dark: theme.dark,
                            text: theme.text
                        });
                    } catch (e) {
                        console.error("Failed to fetch", id);
                    }
                }
                
                if (newPokes.length > 0) {
                    var existingCustom = [];
                    try {
                        var stored = localStorage.getItem('pokemonClashCustomTeams');
                        if (stored) existingCustom = JSON.parse(stored);
                    } catch(e){}
                    
                    var allCustom = existingCustom.concat(newPokes);
                    if (allCustom.length > 12) allCustom = allCustom.slice(-12);
                    localStorage.setItem('pokemonClashCustomTeams', JSON.stringify(allCustom));
                    
                    statusEl.innerText = `Successfully added ${newPokes.length} Pokémon! Refresh to see them.`;
                    statusEl.classList.replace('text-yellow-400', 'text-green-400');
                    setTimeout(() => { location.reload(); }, 2000);
                } else {
                    statusEl.innerText = "Failed to fetch. Check IDs/Names and internet.";
                    statusEl.classList.replace('text-yellow-400', 'text-red-400');
                }
            });

            attachBtn('btn-fill-time-select', 'change', function(e) {
                var col = e.currentTarget.value;
                if (!col) return;
                var time = document.getElementById('quick-time-input')?.value;
                if (!time) {
                    e.currentTarget.value = "";
                    return alert("Nhập số giây!");
                }
                for (var i = 0; i < window.MAX_ROWS; i++) {
                    var rowHasData = Array.from({length:4}).some((_,c) => {
                        var inp = document.querySelector(`input[data-row="${i}"][data-col="${c}"]`);
                        return inp && inp.value.trim();
                    });
                    if (rowHasData) {
                        var input = document.querySelector(`input[data-row="${i}"][data-col="${col}"]`);
                        if(input) {
                            input.value = time;
                            input.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }
                }
                var target = e.currentTarget;
                var orig = target.options[0].innerText;
                target.options[0].innerText = 'Done ✓';
                target.classList.replace('bg-amber-600', 'bg-green-600');
                target.value = "";
                setTimeout(() => {
                    target.options[0].innerText = orig;
                    target.classList.replace('bg-green-600', 'bg-amber-600');
                }, 1500);
            });

            attachBtn('btn-save-settings', 'click', () => {
                window.saveTableData();
                window.DISPLAY_MODE.front = document.getElementById('setting-front-mode')?.value || 'both';
                window.DISPLAY_MODE.back = document.getElementById('setting-back-mode')?.value || 'full';
                localStorage.setItem('pokemonClashDisplayMode', JSON.stringify(window.DISPLAY_MODE));
                var gt = parseInt(document.getElementById('setting-global-time')?.value) || 15;
                window.GLOBAL_GAME_TIME = gt * 60;
                localStorage.setItem('pokemonClashGlobalTime', window.GLOBAL_GAME_TIME);
                window.GLOBAL_TIMER_ENABLED = document.getElementById('setting-timer-enabled')?.value === 'on';
                localStorage.setItem('pokemonClashTimerEnabled', window.GLOBAL_TIMER_ENABLED);
                
                window.TEAM1_MAX_HP = parseInt(document.getElementById('setting-hp-t1')?.value) || 7;
                window.TEAM2_MAX_HP = parseInt(document.getElementById('setting-hp-t2')?.value) || 7;
                window.CARDS_PER_TURN = parseInt(document.getElementById('setting-cards-per-turn')?.value) || 3;
                window.MAX_BONUS_CARDS = parseInt(document.getElementById('setting-max-bonus')?.value) ?? 1;

                localStorage.setItem('pokemonClashHp1', window.TEAM1_MAX_HP);
                localStorage.setItem('pokemonClashHp2', window.TEAM2_MAX_HP);
                localStorage.setItem('pokemonClashCardsPerTurn', window.CARDS_PER_TURN);
                localStorage.setItem('pokemonClashMaxBonus', window.MAX_BONUS_CARDS);

                var bgImageUrl = document.getElementById('setting-bg-image')?.value.trim();
                if (bgImageUrl) {
                    localStorage.setItem('pokemonClashBgImage', bgImageUrl);
                    window.applyBackground && window.applyBackground();
                } else {
                    localStorage.removeItem('pokemonClashBgImage');
                    window.applyBackground && window.applyBackground();
                }

                var bgmUrl = document.getElementById('setting-bg-music')?.value.trim();
                if (bgmUrl) {
                    localStorage.setItem('pokemonClashBgmUrl', bgmUrl);
                    window.BGM_URL = bgmUrl;
                } else {
                    localStorage.removeItem('pokemonClashBgmUrl');
                    window.BGM_URL = 'assets/music/bgm.mp3';
                }
                if (window.bgMusic) {
                    var wasPlaying = window.isMusicPlaying;
                    window.bgMusic.src = window.BGM_URL;
                    if (wasPlaying) window.bgMusic.play().catch(e => console.log(e));
                }

                var modal = document.getElementById('settings-modal');
                if(modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
                window.loadData(); window.initGame();
            });

            attachBtn('btn-special-mode', 'click', () => { 
                window.renderSpecialCardsModal(); 
                var cb = document.getElementById('setting-skill-mystic-only');
                if (cb) cb.checked = window.SKILL_ON_MYSTIC_ONLY;
                var maxSk = document.getElementById('setting-max-skills-per-turn');
                if (maxSk) maxSk.value = window.MAX_SKILLS_PER_TURN;
                var m = document.getElementById('special-cards-modal');
                if(m) { m.classList.replace('hidden','flex'); }
            });
            
            attachBtn('btn-close-special', 'click', () => { 
                window.isSpecialModeActive = false; 
                localStorage.setItem('pokemonClashSpecialMode', window.isSpecialModeActive);
                
                var m = document.getElementById('special-cards-modal');
                if(m) { m.classList.replace('flex','hidden'); }
                window.initGame(); 
            });
            
            attachBtn('btn-save-special', 'click', () => { 
                window.isSpecialModeActive = true; 
                var cb = document.getElementById('setting-skill-mystic-only');
                if (cb) window.SKILL_ON_MYSTIC_ONLY = cb.checked;
                var maxSk = document.getElementById('setting-max-skills-per-turn');
                if (maxSk) window.MAX_SKILLS_PER_TURN = parseInt(maxSk.value) || 2;
                
                localStorage.setItem('pokemonClashSpecialCards', JSON.stringify(window.dynamicSpecialCards));
                localStorage.setItem('pokemonClashSpecialMode', window.isSpecialModeActive);
                localStorage.setItem('pokemonClashSkillMysticOnly', window.SKILL_ON_MYSTIC_ONLY);
                localStorage.setItem('pokemonClashMaxSkillsPerTurn', window.MAX_SKILLS_PER_TURN);
                
                var m = document.getElementById('special-cards-modal');
                if(m) { m.classList.replace('flex','hidden'); }
                window.initGame(); 
            });

            attachBtn('btn-sound', 'click', (e) => { 
                window.soundEnabled = !window.soundEnabled; 
                if (window.soundEnabled) { 
                    e.currentTarget.innerText = '🔊'; 
                    window.initAudio(); 
                    window.startMusic(); 
                } else { 
                    e.currentTarget.innerText = '🔇'; 
                    window.stopMusic(); 
                } 
            });

            attachBtn('btn-pause', 'click', function() {
                if (window.isGamePaused) window.resumeGame();
                else window.pauseGame();
            });

            attachBtn('btn-resume', 'click', window.resumeGame);

            attachBtn('btn-reset', 'click', window.initGame);
            
            // Gắn event In-game Actions
            attachBtn('btn-action-attack', 'click', () => window.handleAction('attack'));
            attachBtn('btn-action-repair', 'click', () => window.handleAction('repair'));
            attachBtn('btn-bomb', 'click', () => window.handleAction('miss'));

            // Gắn event Coin Flip
            attachBtn('btn-coin-heads', 'click', () => window.flipCoin('heads'));
            attachBtn('btn-coin-tails', 'click', () => window.flipCoin('tails'));
        };

        // Khởi động
        window.setupGameEvents();
        
        if (window.loadImagesFromIndexedDB) {
            window.loadImagesFromIndexedDB().then(pool => {
                if (Object.keys(pool).length > 0) window.imagesPool = pool;
                window.initGame();
            });
        } else {
            window.initGame(); 
        }
    
            document.addEventListener('keydown', (e) => {
                if (e.key === 'p' || e.key === 'P') {
                    if (window.isGameOver) return;
                    if (window.isGamePaused) window.resumeGame();
                    else window.pauseGame();
                    return;
                }

                if (window.isGamePaused) return;
                if (window.isGameOver || window.isProcessingModal) return;
                
                var zoomModal = document.getElementById('zoom-modal');
                var settingsModal = document.getElementById('settings-modal');
                var specialModal = document.getElementById('special-cards-modal');
                var avatarModal = document.getElementById('avatar-modal');
                var coinModal = document.getElementById('coin-modal');
                var wheelModal = document.getElementById('wheel-modal');
                var metronomeModal = document.getElementById('metronome-modal');
                var pauseOverlay = document.getElementById('pause-overlay');

                if (zoomModal && !zoomModal.classList.contains('hidden')) return;
                if (settingsModal && !settingsModal.classList.contains('hidden')) return;
                if (specialModal && !specialModal.classList.contains('hidden')) return;
                if (avatarModal && !avatarModal.classList.contains('hidden')) return;
                if (coinModal && !coinModal.classList.contains('hidden')) return;
                if (wheelModal && !wheelModal.classList.contains('hidden')) return;
                if (metronomeModal && !metronomeModal.classList.contains('hidden')) return;
                if (pauseOverlay && !pauseOverlay.classList.contains('hidden')) return;
                
                var keyMapCorrect = { '1':0, '2':1, '3':2, '4':3, '5':4, '6':5, '7':6 };
                var keyMapIncorrect = { 'q':0, 'w':1, 'e':2, 'r':3, 't':4, 'y':5, 'u':6 };
                var key = e.key.toLowerCase();
                
                var targetIdx = -1;
                var isCorrect = true;
                
                if (keyMapCorrect[key] !== undefined) {
                    targetIdx = keyMapCorrect[key];
                    isCorrect = true;
                } else if (keyMapIncorrect[key] !== undefined) {
                    targetIdx = keyMapIncorrect[key];
                    isCorrect = false;
                }
                
                if (targetIdx !== -1 && targetIdx < window.currentHand.length) {
                    var cards = document.querySelectorAll('#active-hand .card');
                    if (cards && cards[targetIdx]) {
                        var cardNode = cards[targetIdx];
                        // Simulate click/right-click depending on isCorrect
                        if (isCorrect) {
                            if (!window.judgedCards.has(targetIdx) || window.judgedCards.get(targetIdx) === false) {
                                cardNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                            }
                        } else {
                            if (window.judgedCards.get(targetIdx) !== false) {
                                cardNode.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
                            }
                        }
                    }
                }
            });