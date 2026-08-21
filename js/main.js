        window.initGame = function() {
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
                            if (trgRow < window.MAX_ROWS && trgCol < 5) {
                                var input = document.querySelector(`input[data-row="${trgRow}"][data-col="${trgCol}"]`);
                                if (input) input.value = colStr.trim();
                            }
                        });
                    });
                });
            }

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
                        bTime: document.querySelector(`input[data-row="${i}"][data-col="4"]`)?.value.trim() || ''
                    });
                }
                var exportSettings = {
                    frontMode: document.getElementById('setting-front-mode')?.value || 'both',
                    backMode: document.getElementById('setting-back-mode')?.value || 'full',
                    timerEnabled: document.getElementById('setting-timer-enabled')?.value === 'on',
                    globalTime: parseInt(document.getElementById('setting-global-time')?.value) || 180,
                    hp1: parseInt(document.getElementById('setting-hp-t1')?.value) || 7,
                    hp2: parseInt(document.getElementById('setting-hp-t2')?.value) || 7,
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
                scriptEl.textContent = `window.INJECTED_GAME_STATE = ${JSON.stringify({ data: exportData, settings: exportSettings })};`;
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
                inputs.forEach(input => input.value = '');
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
                    if (input) input.value = num; rIdx++;
                }
                var target = e.currentTarget;
                var orig = target.innerText; 
                target.innerText = 'Done ✓'; 
                target.classList.replace('bg-blue-600', 'bg-green-600');
                setTimeout(() => { target.innerText = orig; target.classList.replace('bg-green-600', 'bg-blue-600'); }, 1500);
            });

            attachBtn('btn-fill-time', 'click', function(e) {
                var time = document.getElementById('quick-time-input')?.value.trim();
                if (!time) return alert("Nhập số giây!");
                for (var i = 0; i < window.MAX_ROWS; i++) {
                    var rowHasData = Array.from({length:4}).some((_,c) => document.querySelector(`input[data-row="${i}"][data-col="${c}"]`)?.value.trim());
                    if (rowHasData) {
                        var input = document.querySelector(`input[data-row="${i}"][data-col="4"]`);
                        if(input) input.value = time;
                    }
                }
                var target = e.currentTarget;
                var orig = target.innerText; 
                target.innerText = 'Done ✓'; 
                target.classList.replace('bg-amber-600', 'bg-green-600');
                setTimeout(() => { target.innerText = orig; target.classList.replace('bg-green-600', 'bg-amber-600'); }, 1500);
            });

            attachBtn('btn-save-settings', 'click', () => {
                var newData = [];
                for(var i = 0; i < window.MAX_ROWS; i++) {
                    var fIdNode = document.querySelector(`input[data-row="${i}"][data-col="0"]`);
                    if (!fIdNode) break;
                    var fId = fIdNode.value.trim();
                    var fWord = document.querySelector(`input[data-row="${i}"][data-col="1"]`)?.value.trim() || '';
                    var bImgId = document.querySelector(`input[data-row="${i}"][data-col="2"]`)?.value.trim() || '';
                    var bText = document.querySelector(`input[data-row="${i}"][data-col="3"]`)?.value.trim() || '';
                    var bTime = document.querySelector(`input[data-row="${i}"][data-col="4"]`)?.value.trim() || '';

                    if (fId || fWord || bImgId || bText) {
                        newData.push({ fId, fWord, bImgId, bText, bTime });
                    }
                }
                localStorage.setItem('pokemonClashDataJSON', JSON.stringify(newData));
                window.DISPLAY_MODE.front = document.getElementById('setting-front-mode')?.value || 'both';
                window.DISPLAY_MODE.back = document.getElementById('setting-back-mode')?.value || 'full';
                localStorage.setItem('pokemonClashDisplayMode', JSON.stringify(window.DISPLAY_MODE));
                var gt = parseInt(document.getElementById('setting-global-time')?.value);
                if (gt && gt > 0) { window.GLOBAL_GAME_TIME = gt; localStorage.setItem('pokemonClashGlobalTime', window.GLOBAL_GAME_TIME); }
                window.GLOBAL_TIMER_ENABLED = document.getElementById('setting-timer-enabled')?.value === 'on';
                localStorage.setItem('pokemonClashTimerEnabled', window.GLOBAL_TIMER_ENABLED);
                
                window.TEAM1_MAX_HP = parseInt(document.getElementById('setting-hp-t1')?.value) || 7;
                window.TEAM2_MAX_HP = parseInt(document.getElementById('setting-hp-t2')?.value) || 7;
                localStorage.setItem('pokemonClashHp1', window.TEAM1_MAX_HP);
                localStorage.setItem('pokemonClashHp2', window.TEAM2_MAX_HP);

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
                
                localStorage.setItem('pokemonClashSpecialCards', JSON.stringify(window.dynamicSpecialCards));
                localStorage.setItem('pokemonClashSpecialMode', window.isSpecialModeActive);
                
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
        window.initGame(); 
    