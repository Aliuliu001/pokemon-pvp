        // Format Text
        window.getParsedCardText = function(text, val1, val2) {
            if (!text) return "";
            let res = text.replace(/{val}/g, val1);
            if (val2 !== undefined) res = res.replace(/{val2}/g, val2);
            return res;
        };

        window.addGridRow = function(i, rowData = {}) {
            var gridBody = document.getElementById('data-grid-body');
            if (!gridBody) return;
            var fId = window.escapeHTML(rowData.fId);
            var fWord = window.escapeHTML(rowData.fWord);
            var bImgId = window.escapeHTML(rowData.bImgId);
            var bText = window.escapeHTML(rowData.bText);
            var fTime = window.escapeHTML(rowData.fTime || '');
            var bTime = window.escapeHTML(rowData.bTime);

            var getImgTag = (id) => {
                if(!id) return '';
                if (window.imagesPool && window.imagesPool[id]) {
                    return `<img src="${window.imagesPool[id]}" class="w-6 h-6 object-contain pointer-events-none" />`;
                } else if (String(id).startsWith('http') || String(id).startsWith('data:image')) {
                    return `<img src="${id}" class="w-6 h-6 object-contain pointer-events-none" onerror="this.style.display='none'"/>`;
                }
                return '';
            };

            var tr = document.createElement('tr');
            tr.className = "hover:bg-slate-800 transition-colors border-b border-slate-700/50";
            tr.innerHTML = `
                <td class="border-r border-slate-600 p-0 relative">
                    <div class="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center preview-0">${getImgTag(fId)}</div>
                    <input type="text" data-row="${i}" data-col="0" class="w-full h-full bg-transparent pl-8 pr-1 py-2 outline-none focus:bg-slate-700 text-yellow-300 text-center font-bold" value="${fId}">
                </td>
                <td class="border-r border-slate-600 p-0"><input type="text" data-row="${i}" data-col="1" class="w-full h-full bg-transparent px-2 py-2 outline-none focus:bg-slate-700 text-yellow-300 font-bold" value="${fWord}"></td>
                <td class="border-r border-slate-600 p-0 bg-slate-900/50 relative">
                    <div class="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center preview-2">${getImgTag(bImgId)}</div>
                    <input type="text" data-row="${i}" data-col="2" class="w-full h-full bg-transparent pl-8 pr-1 py-2 outline-none focus:bg-slate-700 text-green-300 text-center font-bold" value="${bImgId}">
                </td>
                <td class="border-r border-slate-600 p-0 bg-slate-900/50"><input type="text" data-row="${i}" data-col="3" class="w-full h-full bg-transparent px-2 py-2 outline-none focus:bg-slate-700 text-green-300 font-bold" value="${bText}"></td>
                <td class="border-r border-slate-600 p-0 bg-slate-900/50"><input type="text" data-row="${i}" data-col="4" class="w-full h-full bg-transparent px-1 py-2 outline-none focus:bg-slate-700 text-orange-400 text-center font-bold" value="${fTime}"></td>
                <td class="p-0 bg-slate-900/50"><input type="text" data-row="${i}" data-col="5" class="w-full h-full bg-transparent px-1 py-2 outline-none focus:bg-slate-700 text-red-400 text-center font-bold" value="${bTime}"></td>
            `;
            gridBody.appendChild(tr);
        };

        window.renderGrid = function(dataArray) {
            var gridBody = document.getElementById('data-grid-body');
            if (!gridBody) return;
            gridBody.innerHTML = '';
            var safeData = (dataArray && Array.isArray(dataArray)) ? dataArray : window.DEFAULT_JSON_DATA;
            
            if (safeData && safeData.length > window.MAX_ROWS) {
                window.MAX_ROWS = safeData.length + 20; 
            }

            for (var i = 0; i < window.MAX_ROWS; i++) {
                window.addGridRow(i, safeData[i] || {});
            }
        };

        window.loadData = function() {
            var parsedData;

            if (window.INJECTED_GAME_STATE && !window.hasLoadedInjectedState) {
                parsedData = window.INJECTED_GAME_STATE.data;
                window.DISPLAY_MODE.front = window.INJECTED_GAME_STATE.settings.frontMode;
                window.DISPLAY_MODE.back = window.INJECTED_GAME_STATE.settings.backMode;
                window.GLOBAL_TIMER_ENABLED = window.INJECTED_GAME_STATE.settings.timerEnabled;
                window.GLOBAL_GAME_TIME = window.INJECTED_GAME_STATE.settings.globalTime;
                window.TEAM1_MAX_HP = window.INJECTED_GAME_STATE.settings.hp1 || 7;
                window.TEAM2_MAX_HP = window.INJECTED_GAME_STATE.settings.hp2 || 7;
                window.CARDS_PER_TURN = window.INJECTED_GAME_STATE.settings.cardsPerTurn || 3;
                window.MAX_BONUS_CARDS = window.INJECTED_GAME_STATE.settings.maxBonusCards ?? 1;
                if (window.INJECTED_GAME_STATE.settings.specialCards) {
                    window.dynamicSpecialCards = window.INJECTED_GAME_STATE.settings.specialCards;
                } else {
                    window.dynamicSpecialCards = JSON.parse(JSON.stringify(window.SPECIAL_CARDS_CONFIG));
                }
                if (window.INJECTED_GAME_STATE.settings.specialMode !== undefined) {
                    window.isSpecialModeActive = window.INJECTED_GAME_STATE.settings.specialMode;
                }
                if (window.INJECTED_GAME_STATE.imagesPool) {
                    window.imagesPool = window.INJECTED_GAME_STATE.imagesPool;
                    localStorage.setItem('pokemonClashImagePool', JSON.stringify(window.imagesPool));
                }
                
                localStorage.setItem('pokemonClashDataJSON', JSON.stringify(parsedData));
                localStorage.setItem('pokemonClashDisplayMode', JSON.stringify(window.DISPLAY_MODE));
                localStorage.setItem('pokemonClashGlobalTime', window.GLOBAL_GAME_TIME);
                localStorage.setItem('pokemonClashTimerEnabled', window.GLOBAL_TIMER_ENABLED);
                localStorage.setItem('pokemonClashHp1', window.TEAM1_MAX_HP);
                localStorage.setItem('pokemonClashHp2', window.TEAM2_MAX_HP);
                localStorage.setItem('pokemonClashSpecialCards', JSON.stringify(window.dynamicSpecialCards));
                localStorage.setItem('pokemonClashSpecialMode', window.isSpecialModeActive);
                
                window.hasLoadedInjectedState = true; 
            } else {
                var rawData = localStorage.getItem('pokemonClashDataJSON');
                try {
                    parsedData = rawData ? JSON.parse(rawData) : window.DEFAULT_JSON_DATA;
                } catch(e) {
                    parsedData = window.DEFAULT_JSON_DATA;
                }
                
                var savedDisplayMode = localStorage.getItem('pokemonClashDisplayMode');
                if (savedDisplayMode) {
                    try { window.DISPLAY_MODE = JSON.parse(savedDisplayMode); } catch(e) {}
                }

                var savedGameTime = localStorage.getItem('pokemonClashGlobalTime');
                if (savedGameTime) window.GLOBAL_GAME_TIME = parseInt(savedGameTime);

                var savedTimerEnabled = localStorage.getItem('pokemonClashTimerEnabled');
                if (savedTimerEnabled !== null) window.GLOBAL_TIMER_ENABLED = savedTimerEnabled === 'true';
                
                var savedHp1 = localStorage.getItem('pokemonClashHp1');
                if (savedHp1) window.TEAM1_MAX_HP = parseInt(savedHp1);
                
                var savedHp2 = localStorage.getItem('pokemonClashHp2');
                if (savedHp2) window.TEAM2_MAX_HP = parseInt(savedHp2);

                var savedSpecialCards = localStorage.getItem('pokemonClashSpecialCards');
                if (savedSpecialCards) {
                    try { window.dynamicSpecialCards = JSON.parse(savedSpecialCards); } catch(e) { window.dynamicSpecialCards = JSON.parse(JSON.stringify(window.SPECIAL_CARDS_CONFIG)); }
                } else {
                    window.dynamicSpecialCards = JSON.parse(JSON.stringify(window.SPECIAL_CARDS_CONFIG));
                }

                var savedSpecialMode = localStorage.getItem('pokemonClashSpecialMode');
                if (savedSpecialMode === 'true') window.isSpecialModeActive = true;
            }

            if(document.getElementById('setting-front-mode')) document.getElementById('setting-front-mode').value = window.DISPLAY_MODE.front;
            if(document.getElementById('setting-back-mode')) document.getElementById('setting-back-mode').value = window.DISPLAY_MODE.back;
            if(document.getElementById('setting-timer-enabled')) document.getElementById('setting-timer-enabled').value = window.GLOBAL_TIMER_ENABLED ? 'on' : 'off';
            if(document.getElementById('setting-global-time')) document.getElementById('setting-global-time').value = Math.floor(window.GLOBAL_GAME_TIME / 60);
            if(document.getElementById('setting-hp-t1')) document.getElementById('setting-hp-t1').value = window.TEAM1_MAX_HP;
            if(document.getElementById('setting-hp-t2')) document.getElementById('setting-hp-t2').value = window.TEAM2_MAX_HP;
            if(document.getElementById('setting-bg-image')) document.getElementById('setting-bg-image').value = localStorage.getItem('pokemonClashBgImage') || '';
            if(document.getElementById('setting-bg-music')) document.getElementById('setting-bg-music').value = localStorage.getItem('pokemonClashBgmUrl') || '';
            if(document.getElementById('setting-cards-per-turn')) document.getElementById('setting-cards-per-turn').value = window.CARDS_PER_TURN || 3;
            if(document.getElementById('setting-max-bonus')) document.getElementById('setting-max-bonus').value = window.MAX_BONUS_CARDS || 1;
            
            window.renderGrid(parsedData);
            window.buildDeck();
        };

        window.renderImages = function(idStr, folder) {
            if (!idStr || String(idStr).trim() === "") return '';
            var ids = String(idStr).split(',').map(s => s.trim()).filter(s => s);
            if (ids.length === 0) return '';
            var opacity = folder === 'Back-side' ? 'opacity-95 drop-shadow-sm' : 'drop-shadow-md';
            
            return ids.map(id => {
                var isPool = window.imagesPool && window.imagesPool[id];
                var imgSrc = isPool ? window.imagesPool[id] : `./${folder}/${id}.png`;
                var onErrorStr = isPool 
                    ? `this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';` 
                    : `if(this.src.endsWith('.png')){this.src='./${folder}/${id}.jpg';}else if(this.src.endsWith('.jpg')){this.src='./${folder}/${id}.jpeg';}else{this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';}`;
                
                return `
                <div class="relative w-full h-full flex items-center justify-center">
                    <img src="${imgSrc}" class="w-full h-full object-contain z-10 ${opacity}" alt="img" 
                         onerror="${onErrorStr}">
                    <div class="hidden flex-col items-center justify-center w-full h-full absolute inset-0 text-slate-400 bg-slate-50 rounded z-0"><span class="text-xs font-bold text-center">Missing<br>${id}</span></div>
                </div>
                `;
            }).join('');
        };

        window.getResponsiveText = function(word, isPill) {
            var wordStr = String(word || '');
            var hasSpace = wordStr.trim().includes(' ');
            var colorClass = 'text-slate-800 drop-shadow-sm'; 
            if (hasSpace) {
                return `<span class="font-black uppercase text-center w-full leading-tight px-0.5 ${colorClass}" style="font-size: min(${isPill?14:20}cqi, ${isPill?14:28}px); white-space: pre-wrap; word-break: keep-all;">${wordStr}</span>`;
            } else {
                var len = Math.max(wordStr.trim().length, 1);
                var dynamicCqi = Math.min(isPill?22:30, 150 / len);
                return `<span class="font-black uppercase text-center w-full leading-none px-0.5 ${colorClass}" style="font-size: min(${dynamicCqi}cqi, ${isPill?16:36}px); white-space: nowrap;">${wordStr}</span>`;
            }
        };

        window.renderSpecialCardsModal = function() {
            var tbody = document.getElementById('special-cards-tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            window.dynamicSpecialCards.forEach((card, index) => {
                var tr = document.createElement('tr');
                tr.className = "hover:bg-slate-800 border-b border-slate-700/50 align-top";
                
                var moveButtons = `
                    <div class="flex flex-col items-center justify-center gap-1 mt-1">
                        <button onclick="window.moveSpecialCard(${index}, -1)" class="w-6 h-6 flex items-center justify-center text-slate-400 bg-slate-700 hover:text-white hover:bg-slate-500 rounded font-bold shadow text-xs ${index === 0 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === 0 ? 'disabled' : ''}>▲</button>
                        <button onclick="window.moveSpecialCard(${index}, 1)" class="w-6 h-6 flex items-center justify-center text-slate-400 bg-slate-700 hover:text-white hover:bg-slate-500 rounded font-bold shadow text-xs ${index === window.dynamicSpecialCards.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}" ${index === window.dynamicSpecialCards.length - 1 ? 'disabled' : ''}>▼</button>
                    </div>
                `;

                var valInput = "";
                if (card.hasValue) {
                    valInput += `<div class="flex items-center justify-center gap-1 mb-1">
                        <span class="text-[9px] text-yellow-400 font-bold w-4 text-right">V1:</span>
                        <button onclick="window.updateSpecialValueInput(${index}, 1, 1)" class="w-4 h-4 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-500 rounded font-bold shadow text-xs">+</button>
                        <span id="sc-val1-${index}" class="text-white font-black text-xs w-4 text-center">${card.val}</span>
                        <button onclick="window.updateSpecialValueInput(${index}, 1, -1)" class="w-4 h-4 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-500 rounded font-bold shadow text-xs">-</button>
                    </div>`;
                }
                if (card.hasValue2) {
                    valInput += `<div class="flex items-center justify-center gap-1">
                        <span class="text-[9px] text-pink-400 font-bold w-4 text-right">V2:</span>
                        <button onclick="window.updateSpecialValueInput(${index}, 2, 1)" class="w-4 h-4 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-500 rounded font-bold shadow text-xs">+</button>
                        <span id="sc-val2-${index}" class="text-white font-black text-xs w-4 text-center">${card.val2}</span>
                        <button onclick="window.updateSpecialValueInput(${index}, 2, -1)" class="w-4 h-4 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-500 rounded font-bold shadow text-xs">-</button>
                    </div>`;
                }
                if (!card.hasValue && !card.hasValue2) {
                    valInput = `<span class="text-slate-500 block text-center mt-1">-</span>`;
                }

                var qtyInput = `<div class="flex items-center justify-center gap-1 mt-1">
                    <button onclick="window.updateSpecialQtyInput(${index}, 1)" class="w-5 h-5 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-500 rounded font-bold shadow text-xs">+</button>
                    <span id="sc-count-${index}" class="text-white font-black text-sm w-4 text-center">${card.count}</span>
                    <button onclick="window.updateSpecialQtyInput(${index}, -1)" class="w-5 h-5 flex items-center justify-center text-white bg-slate-600 hover:bg-slate-500 rounded font-bold shadow text-xs">-</button>
                </div>`;

                var effectVal1 = `<span id="sc-ef-val1-${index}" class="text-yellow-400 font-bold">${card.val}</span>`;
                var effectVal2 = card.hasValue2 ? `<span id="sc-ef-val2-${index}" class="text-pink-400 font-bold">${card.val2}</span>` : '';
                var effectDesc = window.getParsedCardText(card.shortDesc, effectVal1, effectVal2);

                tr.innerHTML = `
                    <td class="px-1 py-2 border-r border-slate-600 align-middle">${moveButtons}</td>
                    <td class="px-2 py-2 border-r border-slate-600 align-middle">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl filter drop-shadow-md">${card.icon}</span>
                            <span class="font-black text-[10px] md:text-sm tarot-font text-white uppercase">${card.name}</span>
                        </div>
                    </td>
                    <td class="px-2 py-2 border-r border-slate-600 text-[10px] md:text-[11px] text-slate-300 font-bold leading-snug align-middle">${effectDesc}</td>
                    <td class="px-2 py-2 border-r border-slate-600 text-[10px] md:text-xs text-slate-400 italic leading-snug align-middle">${card.note}</td>
                    <td class="px-2 py-2 border-r border-slate-600 bg-slate-800/30 align-middle">${valInput}</td>
                    <td class="px-2 py-2 bg-slate-800/30 align-middle">${qtyInput}</td>
                `;
                tbody.appendChild(tr);
            });
        };

        window.moveSpecialCard = function(index, dir) {
            var newIndex = index + dir;
            if (newIndex < 0 || newIndex >= window.dynamicSpecialCards.length) return;
            
            var temp = window.dynamicSpecialCards[index];
            window.dynamicSpecialCards[index] = window.dynamicSpecialCards[newIndex];
            window.dynamicSpecialCards[newIndex] = temp;
            
            window.renderSpecialCardsModal();
        };

        window.updateSpecialValueInput = function(index, valKey, delta) {
            var card = window.dynamicSpecialCards[index];
            if (valKey === 1) {
                var min = card.min || 1; var max = card.max || 20;
                card.val = Math.max(min, Math.min(max, card.val + delta));
                document.getElementById(`sc-val1-${index}`).innerText = card.val;
            } else {
                var min2 = card.min2 || 1; var max2 = card.max2 || 20;
                card.val2 = Math.max(min2, Math.min(max2, card.val2 + delta));
                document.getElementById(`sc-val2-${index}`).innerText = card.val2;
            }
            window.renderSpecialCardsModal(); 
        };

        window.updateSpecialQtyInput = function(index, delta) {
            var card = window.dynamicSpecialCards[index];
            card.count = Math.max(0, Math.min(20, card.count + delta));
            document.getElementById(`sc-count-${index}`).innerText = card.count;
        };

        window.bulkSetVal = function() {
            var val = parseInt(document.getElementById('bulk-val-input')?.value);
            if(isNaN(val)) return;
            window.dynamicSpecialCards.forEach((c, idx) => {
                if(c.hasValue) {
                    var min = c.min || 1; var max = c.max || 20;
                    c.val = Math.max(min, Math.min(max, val));
                }
                if(c.hasValue2) {
                    var min2 = c.min2 || 1; var max2 = c.max2 || 20;
                    c.val2 = Math.max(min2, Math.min(max2, val));
                }
            });
            window.renderSpecialCardsModal();
        };

        window.bulkSetQty = function() {
            var qty = parseInt(document.getElementById('bulk-qty-input')?.value);
            if(isNaN(qty)) return;
            var safeQty = Math.max(0, Math.min(20, qty));
            window.dynamicSpecialCards.forEach((c) => { c.count = safeQty; });
            window.renderSpecialCardsModal();
        };

        window.bulkClearQty = function() {
            window.dynamicSpecialCards.forEach((c) => { c.count = 0; });
            window.renderSpecialCardsModal();
        };

        // --- AUDIO SYSTEM HTML5 ---        window.BGM_URL = localStorage.getItem("pokemonClashBgmUrl") || "assets/music/bgm.mp3"; 

        window.bgMusic = new Audio(window.BGM_URL);
        window.bgMusic.loop = true;
        window.bgMusic.volume = 0.4;

        window.audioCtx = null; window.soundEnabled = false; window.isMusicPlaying = false; 

        window.initAudio = function() { 
            if (!window.audioCtx) window.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); 
            if (window.audioCtx.state === 'suspended') window.audioCtx.resume(); 
        };
        
        window.startMusic = function() { 
            if (!window.audioCtx) window.initAudio(); 
            if (window.isMusicPlaying) return; 
            window.isMusicPlaying = true; 
            window.bgMusic.play().catch(e => console.log("Audio autoplay prevented"));
        };
        
        window.stopMusic = function() { 
            window.isMusicPlaying = false; 
            window.bgMusic.pause();
        };
        
        window.playSound = function(type) {
            if (!window.soundEnabled || !window.audioCtx) return;
            var osc = window.audioCtx.createOscillator(); var gain = window.audioCtx.createGain();
            osc.connect(gain); gain.connect(window.audioCtx.destination);
            var time = window.audioCtx.currentTime;
            
            if (type === 'flip') { osc.type = 'sine'; osc.frequency.setValueAtTime(600, time); osc.frequency.exponentialRampToValueAtTime(1200, time + 0.05); gain.gain.setValueAtTime(0.1, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05); osc.start(time); osc.stop(time + 0.05); }
            else if (type === 'attack' || type === 'heal') {
                var notes = type === 'heal' ? [440, 554.37, 659.25] : [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((f, i) => { var o = window.audioCtx.createOscillator(); var g = window.audioCtx.createGain(); o.connect(g); g.connect(window.audioCtx.destination); o.type = 'square'; o.frequency.value = f; g.gain.setValueAtTime(0, time + i*0.1); g.gain.linearRampToValueAtTime(0.1, time + i*0.1 + 0.02); g.gain.exponentialRampToValueAtTime(0.01, time + i*0.1 + 0.1); o.start(time + i*0.1); o.stop(time + i*0.1 + 0.1); });
            }
            else if (type === 'boom') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(40, time + 0.6); gain.gain.setValueAtTime(0.5, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6); osc.start(time); osc.stop(time + 0.6); }
            else if (type === 'miss') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, time); osc.frequency.exponentialRampToValueAtTime(40, time + 0.6); gain.gain.setValueAtTime(0.5, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6); osc.start(time); osc.stop(time + 0.6); }
            else if (type === 'tick') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, time); gain.gain.setValueAtTime(0.1, time); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05); osc.start(time); osc.stop(time + 0.05); }
            else if (type === 'defuse') { osc.type = 'triangle'; osc.frequency.setValueAtTime(800, time); osc.frequency.exponentialRampToValueAtTime(2000, time + 0.3); gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(0.2, time + 0.05); gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5); osc.start(time); osc.stop(time + 0.5); }
            else if (type === 'win') { window.stopMusic(); var chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; chord.forEach((f, i) => { var o = window.audioCtx.createOscillator(); var g = window.audioCtx.createGain(); o.connect(g); g.connect(window.audioCtx.destination); o.type = 'triangle'; o.frequency.value = f; g.gain.setValueAtTime(0, time + i*0.08); g.gain.linearRampToValueAtTime(0.2, time + i*0.08 + 0.02); g.gain.exponentialRampToValueAtTime(0.001, time + i*0.08 + 0.8); o.start(time + i*0.08); o.stop(time + i*0.08 + 0.8); }); }
            else if (type === 'shoot') { osc.type = 'square'; osc.frequency.setValueAtTime(300, time); osc.frequency.linearRampToValueAtTime(800, time + 0.2); gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(0.1, time + 0.05); gain.gain.linearRampToValueAtTime(0, time + 0.2); osc.start(time); osc.stop(time + 0.2); }
        };

        window.formatTime = function(s) { var m = Math.floor(s/60).toString().padStart(2,'0'); var sec = (s%60).toString().padStart(2,'0'); return `${m}:${sec}`; };
        
        window.updateTimerUI = function() {
            document.getElementById('game-timer-text').innerText = window.formatTime(window.currentGameTime);
            var pct = window.currentGameTime / window.GLOBAL_GAME_TIME;
            var bar = document.getElementById('game-timer-progress');
            if(bar) bar.style.strokeDashoffset = 283 - (pct * 283);
            var cont = document.getElementById('game-timer-container');
            if(!cont) return;

            if (pct > 0.1) {
                bar.style.stroke = pct > 0.4 ? '#22c55e' : (pct > 0.2 ? '#eab308' : '#ef4444');
                cont.classList.toggle('timer-urgent', pct <= 0.1);
                window.bgMusic.playbackRate = 1.0;
            } else {
                bar.style.stroke = '#ef4444';
                cont.classList.add('timer-urgent');
                window.bgMusic.playbackRate = 1.25; 
                if (window.soundEnabled && window.currentGameTime > 0 && window.currentGameTime % 2 === 0) window.playSound('tick');
            }
        };
        
        window.startTotalTimer = function() {
            if(window.isGameStarted) return; 
            window.isGameStarted = true; 
            document.getElementById('global-status').classList.add('hidden'); 
            
            if (window.GLOBAL_TIMER_ENABLED) {
                document.getElementById('game-timer-container').classList.remove('hidden'); 
                window.currentGameTime = window.GLOBAL_GAME_TIME; 
                window.updateTimerUI(); 
                clearInterval(window.gameTimerInterval); 
                window.gameTimerInterval = setInterval(() => { 
                    window.currentGameTime--; 
                    window.updateTimerUI(); 
                    if(window.currentGameTime <= 0) {
                        clearInterval(window.gameTimerInterval);
                        window.triggerWin(true); 
                    }
                }, 1000); 
            }
        };

        window.startTimer = window.startTotalTimer;
        window.stopGameGlobalTimer = function() { clearInterval(window.gameTimerInterval); window.isGameStarted = false; };
        
        window.updateGlobalTimerUI = window.updateTimerUI;

        window.turnTimerInterval = null;
        window._readTimerRemaining = 0;
        window._readTimerTotal = 0;
        window._readTimerRunning = false;

        window.updateReadTimerUI = function() {
            var container = document.getElementById('read-timer-container');
            var bar = document.getElementById('read-timer-bar');
            var text = document.getElementById('read-timer-text');
            if (!container || !bar || !text) return;
            
            var timeLeft = Math.max(0, window._readTimerRemaining);
            var totalSecs = window._readTimerTotal || 1;
            text.innerText = 'FRONT TIME: ' + timeLeft + 's';
            
            var pct = Math.max(0, (timeLeft / totalSecs) * 100);
            bar.style.width = pct + '%';
            
            if (pct <= 25) {
                bar.classList.remove('from-green-400', 'to-emerald-500', 'from-yellow-400', 'to-amber-500');
                bar.classList.add('from-red-500', 'to-rose-600');
            } else if (pct <= 50) {
                bar.classList.remove('from-green-400', 'to-emerald-500', 'from-red-500', 'to-rose-600');
                bar.classList.add('from-yellow-400', 'to-amber-500');
            } else {
                bar.classList.remove('from-yellow-400', 'to-amber-500', 'from-red-500', 'to-rose-600');
                bar.classList.add('from-green-400', 'to-emerald-500');
            }
        };

        window.onReadTimerExpired = function() {
            window.stopTurnTimer();
            window.playSound('boom');
            window.triggerMegaExplosion(window.currentTurn);
            window.applyHPChange(window.currentTurn, -1, true, false);
            var statusElNode = document.getElementById('global-status');
            if (statusElNode) {
                statusElNode.innerHTML = `<span class="bg-red-600/90 px-8 py-4 rounded-3xl border-4 border-red-300 text-white drop-shadow-[0_0_20px_rgba(220,38,38,1)]">TIME UP! BOOM!</span>`;
                statusElNode.classList.remove('hidden');
                setTimeout(() => statusElNode.classList.add('hidden'), 2500);
            }
            setTimeout(() => { if (!window.isGameOver) { if(window.processNextTurn) window.processNextTurn(); } }, 3000);
        };

        window.startTurnTimer = function() {
            window.stopTurnTimer();
            if (!window.currentHand || window.currentHand.length === 0) return;
            
            var totalSecs = 0;
            window.currentHand.forEach(c => {
                var s = parseInt(c.fTime);
                if (!isNaN(s) && s > 0) totalSecs += s;
            });
            
            if (totalSecs <= 0) return;

            var container = document.getElementById('read-timer-container');
            var bar = document.getElementById('read-timer-bar');
            var text = document.getElementById('read-timer-text');
            if(!container || !bar || !text) return;
            
            container.classList.remove('hidden');
            bar.style.width = '100%';
            bar.className = 'absolute left-0 top-0 h-full w-full transition-all duration-1000 ease-linear bg-gradient-to-r from-green-400 to-emerald-500';
            
            window._readTimerTotal = totalSecs;
            window._readTimerRemaining = totalSecs;
            window._readTimerRunning = true;
            window.updateReadTimerUI();
            
            window.turnTimerInterval = setInterval(() => {
                if (window.isGamePaused) return;
                window._readTimerRemaining--;
                window.updateReadTimerUI();

                if (window._readTimerRemaining <= 0) {
                    window.onReadTimerExpired();
                }
            }, 1000);
        };
        
        window.stopTurnTimer = function() {
            clearInterval(window.turnTimerInterval);
            window.turnTimerInterval = null;
            window._readTimerRunning = false;
            window._readTimerRemaining = 0;
            var container = document.getElementById('read-timer-container');
            if(container) container.classList.add('hidden');
        };
        
        window.startReadTimer = window.startTurnTimer;
        window.stopReadTimer = window.stopTurnTimer;

        window.updateSpecialModeUI = function() {
            var ind = document.getElementById('special-mode-indicator');
            var glow = document.getElementById('pokeball-glow');
            if (window.isSpecialModeActive) {
                if(ind) ind.className = "absolute -bottom-0 -right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-green-500 animate-pulse z-50"; 
                if(glow) glow.style.opacity = "1"; 
            } else {
                if(ind) ind.className = "absolute -bottom-0 -right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-800 bg-red-500 z-50"; 
                if(glow) glow.style.opacity = "0"; 
            }
        };

        // HP AND STATUS HELPERS
        window.updateStatusIcons = function(teamId) {
            var team = window.teams[teamId];
            
            var sleep = document.getElementById(teamId + '-icon-sleep');
            if(sleep) { 
                if(team.sleepTurns > 0) { sleep.classList.remove('hidden'); sleep.querySelector('span').innerText = team.sleepTurns; }
                else sleep.classList.add('hidden'); 
            }
            var poison = document.getElementById(teamId + '-icon-poison');
            if(poison) { if(team.isPoisoned) poison.classList.remove('hidden'); else poison.classList.add('hidden'); }
            var blind = document.getElementById(teamId + '-icon-blind');
            if(blind) { if(team.hasBlind) blind.classList.remove('hidden'); else blind.classList.add('hidden'); }
            var sabotage = document.getElementById(teamId + '-icon-sabotage');
            if(sabotage) { 
                if(team.sabotageBombs > 0) { sabotage.classList.remove('hidden'); sabotage.querySelector('span').innerText = team.sabotageBombs > 1 ? team.sabotageBombs : ''; }
                else sabotage.classList.add('hidden'); 
            }
            var mimic = document.getElementById(teamId + '-icon-mimic');
            if(mimic) { 
                if(window.gameState.mimic.active && window.gameState.mimic.caster === teamId) { 
                    mimic.classList.remove('hidden'); mimic.querySelector('span').innerText = window.gameState.mimic.turnsLeft; 
                }
                else mimic.classList.add('hidden'); 
            }
        };

        window.updateHPUI = function() {
            ['team1', 'team2'].forEach(t => {
                var team = window.teams[t];
                var container = document.getElementById(`${t}-hp-blocks`);
                if(!container) return;
                var activeBlocks = Array.from(container.children).filter(c => !c.classList.contains('hp-shatter'));
                var currentBlocks = activeBlocks.length;
                var targetBlocks = team.hp;
                var icon = '❤️'; 
                
                if (currentBlocks > targetBlocks) {
                    var diff = currentBlocks - targetBlocks;
                    for (var i = 0; i < diff; i++) {
                        var block = activeBlocks[activeBlocks.length - 1 - i];
                        if (block) {
                            block.classList.add('hp-shatter');
                            setTimeout(() => block.remove(), 600);
                        }
                    }
                } else if (currentBlocks < targetBlocks) {
                    var diff = targetBlocks - currentBlocks;
                    for (var i = 0; i < diff; i++) {
                        var block = document.createElement('div');
                        block.className = 'heart-token animate-pop text-2xl md:text-3xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]';
                        block.innerText = icon;
                        container.appendChild(block);
                    }
                }
                window.updateStatusIcons(t);
            });
        };
