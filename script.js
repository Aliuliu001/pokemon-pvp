
        (function() {
            var bgExtensions = ['jpg', 'png', 'jpeg', 'gif', 'webp'];
            var bgFound = false;
            for (var i = 0; i < bgExtensions.length; i++) {
                var ext = bgExtensions[i];
                var img = new Image();
                img.onload = (function(e) {
                    return function() {
                        if (!bgFound) {
                            document.body.style.backgroundImage = "url('background." + e + "')";
                            bgFound = true;
                        }
                    };
                })(ext);
                img.src = "background." + ext;
            }
        })();
    

        var escapeHTML = function(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };

        window.MAX_ROWS = 100;       
        window.TEAM1_MAX_HP = 7;
        window.TEAM2_MAX_HP = 7;
        window.hasLoadedInjectedState = false;

        window.POKEMON_TEAMS = [
            { id: '25', name: 'PIKACHU', tone: 'yellow', pType: 'electric', rgb: '234, 179, 8', main: '#eab308', light: '#fef08a', dark: '#a16207', text: '#fde047' }, 
            { id: '6', name: 'CHARIZARD', tone: 'red', pType: 'fire', rgb: '239, 68, 68', main: '#ef4444', light: '#fca5a5', dark: '#b91c1c', text: '#fca5a5' },
            { id: '150', name: 'MEWTWO', tone: 'gray', pType: 'psychic', rgb: '156, 163, 175', main: '#9ca3af', light: '#e5e7eb', dark: '#4b5563', text: '#f3f4f6' },
            { id: '10104', name: 'A. NINETALES', tone: 'ivory', pType: 'ice', rgb: '255, 250, 240', main: '#d1d5db', light: '#ffffff', dark: '#f3f4f6', text: '#ffffff' }, 
            { id: '492', name: 'SHAYMIN', tone: 'green', pType: 'grass', rgb: '34, 197, 94', main: '#22c55e', light: '#bbf7d0', dark: '#15803d', text: '#86efac' }, 
            { id: '134', name: 'VAPOREON', tone: 'blue', pType: 'water', rgb: '59, 130, 246', main: '#3b82f6', light: '#bfdbfe', dark: '#1d4ed8', text: '#93c5fd' }, 
            { id: '94', name: 'GENGAR', tone: 'purple', pType: 'ghost', rgb: '168, 85, 247', main: '#a855f7', light: '#e9d5ff', dark: '#7e22ce', text: '#f3e8ff' },
            { id: '417', name: 'PACHIRISU', tone: 'cyan', pType: 'electric', rgb: '6, 182, 212', main: '#06b6d4', light: '#cffafe', dark: '#0891b2', text: '#cffafe' },
            { id: '494', name: 'VICTINI', tone: 'orange', pType: 'fire', rgb: '249, 115, 22', main: '#f97316', light: '#fdba74', dark: '#c2410c', text: '#fdba74' },
            { id: '282', name: 'GARDEVOIR', tone: 'pink', pType: 'psychic', rgb: '236, 72, 153', main: '#ec4899', light: '#fbcfe8', dark: '#be185d', text: '#f9a8d4' },
            { id: '697', name: 'TYRANTRUM', tone: 'brown', pType: 'rock', rgb: '146, 64, 14', main: '#92400e', light: '#fcd34d', dark: '#451a03', text: '#fde68a' }
        ];

        window.TYPE_ICONS = {
            'electric': '⚡', 'fire': '🔥', 'psychic': '🔮', 'ice': '❄️',
            'grass': '🍃', 'water': '💧', 'ghost': '👻', 'rock': '🪨', 'normal': '🌟'
        };

        window.SPECIAL_CARDS_CONFIG = [
            { id: 'DOUBLE',   type: 'attack', name: 'GIGANTIC CANNON', icon: '🚀', shortDesc: '[-{val} HP ĐỊCH]', note: 'Bắn thẳng sát thương mạnh vào HP của đối thủ.', count: 2, hasValue: true, val: 2, min: 1, max: 10, hasValue2: false },
            { id: 'SHIELD',   type: 'buff',   name: 'ENERGY SHIELD',icon: '🛡️', shortDesc: '[+1 KHIÊN]', note: 'Chặn 1 lần sát thương. Tích đủ 2 khiên (Black Shield) để phản đòn mọi sát thương về phía địch.', count: 2, hasValue: false, hasValue2: false },
            { id: 'HALVE',    type: 'nerf',   name: 'BASE SABOTAGE',icon: '💥', shortDesc: '[-{val} HP BẢN THÂN]', note: 'Sự cố phòng tuyến: Tự trừ thẳng HP của bản thân. (Thẻ xui xẻo)', count: 1, hasValue: true, val: 2, min: 1, max: 10, hasValue2: false },
            { id: 'SWAP',     type: 'attack', name: 'HP SWAP', icon: '🔄', shortDesc: '[HOÁN ĐỔI HP ĐỊCH]', note: 'Đổi máu của mình cho đối thủ. Cực kỳ hiệu quả khi đang sắp chết.', count: 1, hasValue: false, hasValue2: false },
            { id: 'STEAL_10', type: 'attack', name: 'VAMPIRE BITE', icon: '🦇', shortDesc: '[-{val} ĐỊCH] [+{val} TA]', note: 'Vừa gây sát thương địch, vừa hồi máu cho phe mình.', count: 2, hasValue: true, val: 1, min: 1, max: 5, hasValue2: false },
            { id: 'MEDIKIT',  type: 'buff',   name: 'SUPER MEDIKIT',icon:'💉', shortDesc: '[+{val} HP BẢN THÂN]', note: 'Hồi phục HP khẩn cấp cho phe nhà.', count: 2, hasValue: true, val: 2, min: 1, max: 10, hasValue2: false },
            { id: 'ANGEL',    type: 'buff',   name: 'ANGEL BLESSING', icon: '👼', shortDesc: '[+{val} HP] [NGỦ 2 LƯỢT]', note: 'Hồi lượng lớn HP nhưng phe bạn sẽ bị NGỦ và MẤT 2 LƯỢT chơi liên tiếp kế tiếp.', count: 1, hasValue: true, val: 5, min: 1, max: 20, hasValue2: false },
            { id: 'KAMIKAZE', type: 'attack', name: 'NUCLEAR STRIKE', icon: '☢️', shortDesc: '[-{val} ĐỊCH] [-{val2} TA]', note: 'Gây chấn động mạnh. Trừ HP địch nhưng bạn cũng chịu thiệt hại nổ lây.', count: 1, hasValue: true, val: 3, min: 1, max: 10, hasValue2: true, val2: 2, min2: 1, max2: 10 },
            { id: 'FREEZE',   type: 'attack', name: 'TIME FREEZE', icon: '🧊', shortDesc: '[ĐỊCH MẤT LƯỢT]', note: 'Đóng băng làm địch mất lượt, bạn được chơi THÊM 1 lần liên tiếp. (Cẩn thận bị Black Shield phản đòn).', count: 1, hasValue: false, hasValue2: false },
            { id: 'SACRIFICE',type: 'attack', name: 'SACRIFICE', icon: '🩸', shortDesc: '[-{val} TA] [-{val2} ĐỊCH]', note: 'Hiến tế máu của mình để đổi lấy sát thương giáng xuống đối phương.', count: 1, hasValue: true, val: 1, min: 1, max: 10, hasValue2: true, val2: 2, min2: 1, max2: 10 },
            { id: 'BLIND',    type: 'buff',   name: 'DODGE', icon: '👁️‍🗨️', shortDesc: '[TRẠNG THÁI NÉ ĐÒN]', note: 'Nhận trạng thái Né. Lần tới bị tấn công, chọn mặt xu tung 3 đồng. Trúng (>=2) -> Vô hiệu đòn. Trượt -> Phạt -1 HP.', count: 2, hasValue: false, hasValue2: false },
            { id: 'METRONOME',type: 'attack', name: 'METRONOME', icon: '🎲', shortDesc: '[KỸ NĂNG NGẪU NHIÊN]', note: 'Hệ thống tự động sử dụng 1 trong toàn bộ các kỹ năng trong game. Hoàn toàn hên xui.', count: 1, hasValue: false, hasValue2: false },
            { id: 'PAIN_SPLIT',type: 'attack', name: 'PAIN SPLIT', icon: '⚖️', shortDesc: '[CHIA ĐỀU TỔNG HP]', note: 'Cộng tổng HP 2 bên lại và chia đều. Tuyệt vời nếu bạn sắp chết và địch đầy máu.', count: 1, hasValue: false, hasValue2: false },
            { id: 'THIEF',    type: 'attack', name: 'THIEF', icon: '🦹‍♂️', shortDesc: '[CƯỚP 1 KHIÊN]', note: 'Lấy cắp 1 Khiên chắn của đối thủ (nếu có) và đeo cho mình.', count: 1, hasValue: false, hasValue2: false },
            { id: 'VOLT_TACKLE',type: 'attack', name: 'VOLT TACKLE', icon: '⚡', shortDesc: '[XU: ĐÚNG -{val} ĐỊCH | SAI -{val2} TA]', note: 'Chọn 1 mặt xu. Tung 3 xu: Trúng (>=2) -> Địch -{val} HP. Trượt -> Tự mất -{val2} HP.', count: 1, hasValue: true, val: 4, min: 1, max: 10, hasValue2: true, val2: 3, min2: 1, max2: 10 },
            { id: 'EARTHQUAKE',type: 'attack', name: 'EARTHQUAKE', icon: '🌍', shortDesc: '[RANDOM TỪ -{val} TỚI -{val2} CHO CẢ 2 BÊN]', note: 'Trừ HP ngẫu nhiên (từ min tới max) cho cả 2 đội bằng Vòng Xoay. Rất dễ gây tỷ số HÒA chết chùm.', count: 1, hasValue: true, val: 1, min: 1, max: 10, hasValue2: true, val2: 7, min2: 1, max2: 10 },
            { id: 'SNIPER',   type: 'attack', name: 'SNIPER', icon: '🏹', shortDesc: '[-{val} HP XUYÊN GIÁP]', note: 'Sát thương thẳng vào HP, xuyên thủng mọi loại Khiên và Né đòn.', count: 1, hasValue: true, val: 1, min: 1, max: 10, hasValue2: false },
            { id: 'POISON',   type: 'attack', name: 'POISON', icon: '☠️', shortDesc: '[-{val} HP] [+HIỆU ỨNG ĐỘC]', note: 'Gây sát thương và hạ độc. Ở trạng thái Độc: Địch bấm Attack sẽ bị mất 1 HP. Bấm Heal mới giải được độc.', count: 1, hasValue: true, val: 1, min: 1, max: 5, hasValue2: false },
            { id: 'PURIFY',   type: 'buff',   name: 'PURIFY', icon: '🧹', shortDesc: '[XÓA MỌI HIỆU ỨNG TRÊN SÂN]', note: 'Thanh tẩy toàn bộ bàn cờ. Mất hết mọi loại Khiên, Độc, Băng, Ngủ, Né, Bom... của cả 2 phe.', count: 1, hasValue: false, hasValue2: false },
            { id: 'GAMBLE',   type: 'buff',   name: 'GAMBLE', icon: '🎰', shortDesc: '[XU: ĐÚNG +{val} HP | SAI -{val2} HP]', note: 'Cá cược sinh tử: Chọn mặt xu tung 3 đồng. Trúng -> +{val} HP. Trượt -> Bị sét đánh -{val2} HP.', count: 1, hasValue: true, val: 3, min: 1, max: 10, hasValue2: true, val2: 3, min2: 1, max2: 10 },
            { id: 'BLOOD_PACT',type: 'buff',   name: 'BLOOD PACT', icon: '🔗', shortDesc: '[ĐỒNG BỘ HP 2 LƯỢT]', note: 'Liên kết sinh mệnh: Mọi thay đổi HP của bạn (hồi/mất) đều áp dụng lên địch trong 2 lượt.', count: 1, hasValue: false, hasValue2: false },
            { id: 'MIMIC',    type: 'buff',   name: 'MIMIC', icon: '🎭', shortDesc: '[COPY KỸ NĂNG: {val} LƯỢT]', note: 'Sao chép và tự động sử dụng lại y hệt kỹ năng đặc biệt tiếp theo được tung ra.', count: 1, hasValue: true, val: 2, min: 1, max: 5, hasValue2: false },
            { id: 'SABOTAGE', type: 'attack', name: 'SABOTAGE', icon: '💣', shortDesc: '[GÀI BOM ĐỊCH]', note: 'Gài bom ẩn. Quả bom sẽ nổ bồi thêm -1 HP vào lần tiếp theo địch bị mất máu.', count: 1, hasValue: false, hasValue2: false }
        ];

        window.EFFECT_SETTINGS = { explosionDelayMs: 1500, freezeDelayMs: 1500 };
        window.AVATAR_SETTINGS = { happyEffectEnabled: true, sadEffectEnabled: true };

        window.DEFAULT_JSON_DATA = [
            {fId: '1', fWord: 'Snail', bImgId: '1', bText: 'Stand up', bTime: '10'}, 
            {fId: '2', fWord: 'Seahorse', bImgId: '', bText: 'Open the book', bTime: '15'}, 
            {fId: '3', fWord: 'Jellyfish', bImgId: '3', bText: 'Close the book', bTime: ''}, 
            {fId: '4', fWord: 'Eel', bImgId: '', bText: 'What is it?', bTime: ''}, 
            {fId: '5', fWord: 'Starfish', bImgId: '5', bText: "It's a book.", bTime: '5'},
            {fId: '6', fWord: 'Parrot', bImgId: '6', bText: 'Look, a butterfly!', bTime: '20'},
            {fId: '7', fWord: 'Snake', bImgId: '7', bText: 'Wow!', bTime: '8'},
            {fId: '8', fWord: 'Shark', bImgId: '8', bText: 'Sit down Misty.', bTime: ''},
            {fId: '9', fWord: 'Dolphin', bImgId: '9', bText: 'Close your eyes.', bTime: '12'},
            {fId: '10', fWord: 'Hamster', bImgId: '10', bText: 'Sit here please, butterfly', bTime: ''}
        ];

        window.globalDeck = []; 
        window.currentHand = []; 
        window.currentTurn = 'team1';
        window.isSpecialModeActive = false; 
        window.isProcessingModal = false; 
        window.DISPLAY_MODE = { front: 'both', back: 'full' };
        window.GLOBAL_GAME_TIME = 180; 
        window.GLOBAL_TIMER_ENABLED = true; 
        window.currentGameTime = 180;
        window.gameTimerInterval = null;
        window.bombInterval = null;
        window.confettiInterval = null;
        window.isGameStarted = false;
        window.isGameOver = false;
        window.tempoMultiplier = 1.0; 
        window.dynamicSpecialCards = [];
        window.currentActiveCardObj = null;
        
        window.gameState = {
            bloodPact: { active: false, turnsLeft: 0, caster: null, justCasted: false },
            mimic: { active: false, turnsLeft: 0, caster: null }
        };

        window.teams = {
            team1: { hp: window.TEAM1_MAX_HP, maxHp: window.TEAM1_MAX_HP, config: window.POKEMON_TEAMS[0], shieldCount: 0, hasBlind: false, isFrozen: false, sleepTurns: 0, isPoisoned: false, sabotageBombs: 0, baseEl: null },
            team2: { hp: window.TEAM2_MAX_HP, maxHp: window.TEAM2_MAX_HP, config: window.POKEMON_TEAMS[1], shieldCount: 0, hasBlind: false, isFrozen: false, sleepTurns: 0, isPoisoned: false, sabotageBombs: 0, baseEl: null }
        };

        // Format Text
        window.getParsedCardText = function(text, val1, val2) {
            if (!text) return "";
            let res = text.replace(/{val}/g, val1);
            if (val2 !== undefined) res = res.replace(/{val2}/g, val2);
            return res;
        };

        window.renderGrid = function(dataArray) {
            var gridBody = document.getElementById('data-grid-body');
            if (!gridBody) return;
            gridBody.innerHTML = '';
            var safeData = (dataArray && Array.isArray(dataArray)) ? dataArray : window.DEFAULT_JSON_DATA;
            for (var i = 0; i < window.MAX_ROWS; i++) {
                var row = safeData[i] || {};
                var fId = escapeHTML(row.fId);
                var fWord = escapeHTML(row.fWord);
                var bImgId = escapeHTML(row.bImgId);
                var bText = escapeHTML(row.bText);
                var bTime = escapeHTML(row.bTime);

                var tr = document.createElement('tr');
                tr.className = "hover:bg-slate-800 transition-colors border-b border-slate-700/50";
                tr.innerHTML = `
                    <td class="border-r border-slate-600 p-0"><input type="text" data-row="${i}" data-col="0" class="w-full h-full bg-transparent px-1 py-2 outline-none focus:bg-slate-700 text-yellow-300 text-center font-bold" value="${fId}"></td>
                    <td class="border-r border-slate-600 p-0"><input type="text" data-row="${i}" data-col="1" class="w-full h-full bg-transparent px-2 py-2 outline-none focus:bg-slate-700 text-yellow-300 font-bold" value="${fWord}"></td>
                    <td class="border-r border-slate-600 p-0 bg-slate-900/50"><input type="text" data-row="${i}" data-col="2" class="w-full h-full bg-transparent px-1 py-2 outline-none focus:bg-slate-700 text-green-300 text-center font-bold" value="${bImgId}"></td>
                    <td class="border-r border-slate-600 p-0 bg-slate-900/50"><input type="text" data-row="${i}" data-col="3" class="w-full h-full bg-transparent px-2 py-2 outline-none focus:bg-slate-700 text-green-300 font-bold" value="${bText}"></td>
                    <td class="p-0 bg-slate-900/50"><input type="text" data-row="${i}" data-col="4" class="w-full h-full bg-transparent px-1 py-2 outline-none focus:bg-slate-700 text-red-400 text-center font-bold" value="${bTime}"></td>
                `;
                gridBody.appendChild(tr);
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
                if (window.INJECTED_GAME_STATE.settings.specialCards) {
                    window.dynamicSpecialCards = window.INJECTED_GAME_STATE.settings.specialCards;
                } else {
                    window.dynamicSpecialCards = JSON.parse(JSON.stringify(window.SPECIAL_CARDS_CONFIG));
                }
                if (window.INJECTED_GAME_STATE.settings.specialMode !== undefined) {
                    window.isSpecialModeActive = window.INJECTED_GAME_STATE.settings.specialMode;
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
            if(document.getElementById('setting-global-time')) document.getElementById('setting-global-time').value = window.GLOBAL_GAME_TIME;
            if(document.getElementById('setting-hp-t1')) document.getElementById('setting-hp-t1').value = window.TEAM1_MAX_HP;
            if(document.getElementById('setting-hp-t2')) document.getElementById('setting-hp-t2').value = window.TEAM2_MAX_HP;
            
            window.renderGrid(parsedData);
            window.buildDeck();
        };

        window.renderImages = function(idStr, folder) {
            if (!idStr || String(idStr).trim() === "") return '';
            var ids = String(idStr).split(',').map(s => s.trim()).filter(s => s);
            if (ids.length === 0) return '';
            var opacity = folder === 'Back-side' ? 'opacity-95 drop-shadow-sm' : 'drop-shadow-md';
            
            return ids.map(id => `
                <div class="relative w-full h-full flex items-center justify-center p-1">
                    <img src="./${folder}/${id}.png" class="max-w-full max-h-full object-contain z-10 ${opacity}" alt="img" 
                         onerror="if(this.src.endsWith('.png')){this.src='./${folder}/${id}.jpg';}else if(this.src.endsWith('.jpg')){this.src='./${folder}/${id}.jpeg';}else{this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';}">
                    <div class="hidden flex-col items-center justify-center w-full h-full absolute inset-0 text-slate-400 bg-slate-50 rounded z-0"><span class="text-xs font-bold text-center">Missing<br>${id}</span></div>
                </div>
            `).join('');
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

        // --- AUDIO SYSTEM HTML5 ---
        window.BGM_URL = "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=piano-moment-9835.mp3"; 

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
        
        window.startTimer = function() { if(window.isGameStarted) return; window.isGameStarted = true; document.getElementById('global-status').classList.add('hidden'); document.getElementById('game-timer-container').classList.remove('hidden'); window.currentGameTime = window.GLOBAL_GAME_TIME; window.updateTimerUI(); clearInterval(window.gameTimerInterval); window.gameTimerInterval = setInterval(() => { window.currentGameTime--; window.updateTimerUI(); if(window.currentGameTime <= 0) window.triggerWin(true); }, 1000); };
        window.stopGameGlobalTimer = function() { clearInterval(window.gameTimerInterval); window.isGameStarted = false; };

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

        window.applyHPChange = function(targetId, delta, isDamage, triggerPact = true) {
            var team = window.teams[targetId];
            var oldHp = team.hp;
            team.hp = Math.max(0, Math.min(team.maxHp, team.hp + delta));
            var actualDelta = team.hp - oldHp;

            if (actualDelta === 0) { window.updateHPUI(); return; }

            if (isDamage && team.sabotageBombs > 0 && actualDelta < 0) {
                team.sabotageBombs--;
                window.updateStatusIcons(targetId);
                setTimeout(() => {
                    window.playSound('boom');
                    window.triggerMegaExplosion(targetId);
                    window.applyHPChange(targetId, -1, true, false); 
                }, 800);
            }

            if (triggerPact && window.gameState.bloodPact.active) {
                var otherId = targetId === 'team1' ? 'team2' : 'team1';
                setTimeout(() => {
                    window.applyHPChange(otherId, actualDelta, isDamage, false);
                    if(isDamage) window.triggerExplosion(otherId);
                    else window.triggerHeal(otherId);
                }, 400);
            }
            
            window.updateHPUI();
        };

        window.updateShieldUI = function(teamId) {
            var container = document.getElementById(`${teamId}-shield-container`);
            var icon = document.getElementById(`${teamId}-shield-icon`);
            if(!container || !icon) return;
            var count = window.teams[teamId].shieldCount;
            
            if (count === 0) {
                container.classList.remove('opacity-100', 'scale-100');
                container.classList.add('opacity-0', 'scale-150');
                icon.style.filter = '';
            } else {
                container.classList.remove('opacity-0', 'scale-150');
                container.classList.add('opacity-100', 'scale-100');
                if (count === 1) {
                    icon.style.filter = '';
                } else if (count >= 2) {
                    icon.style.filter = 'grayscale(1) brightness(0.3) drop-shadow(0 0 20px rgba(239,68,68,1))';
                }
            }
        };

        window.updateTurnUI = function() {
            var ind = document.getElementById('turn-indicator');
            var color = window.teams[window.currentTurn].config.main;
            var rgb = window.teams[window.currentTurn].config.rgb;
            var name = window.teams[window.currentTurn].config.name;
            
            if(ind) {
                ind.innerText = `${name}'S TURN`;
                ind.style.color = color;
                ind.classList.remove('animate-pop');
                void ind.offsetWidth;
                ind.classList.add('animate-pop');
            }

            document.getElementById('team1-base')?.classList.remove('active-turn');
            document.getElementById('team2-base')?.classList.remove('active-turn');
            document.getElementById(`${window.currentTurn}-base`)?.classList.add('active-turn');
            
            var handPanel = document.getElementById('hand-panel');
            if(handPanel) {
                handPanel.style.setProperty('--turn-color', color);
                handPanel.style.setProperty('--turn-rgb', rgb);
            }
            
            document.getElementById('team1-base')?.style.setProperty('--t-rgb', window.teams.team1.config.rgb);
            document.getElementById('team2-base')?.style.setProperty('--t-rgb', window.teams.team2.config.rgb);
            
            document.getElementById('pb-turn-team1')?.classList.replace('opacity-100', 'opacity-0');
            document.getElementById('pb-turn-team1')?.classList.replace('scale-100', 'scale-50');
            document.getElementById('pb-turn-team2')?.classList.replace('opacity-100', 'opacity-0');
            document.getElementById('pb-turn-team2')?.classList.replace('scale-100', 'scale-50');

            document.getElementById(`pb-turn-${window.currentTurn}`)?.classList.replace('opacity-0', 'opacity-100');
            document.getElementById(`pb-turn-${window.currentTurn}`)?.classList.replace('scale-50', 'scale-100');
        };

        window.populateSelects = function() {
            var s1 = document.getElementById('team1-select'); 
            var s2 = document.getElementById('team2-select');
            if(!s1 || !s2) return;
            s1.innerHTML = ''; s2.innerHTML = '';
            window.POKEMON_TEAMS.forEach(p => { 
                s1.add(new Option(p.name, p.id)); s2.add(new Option(p.name, p.id)); 
                s1.options[s1.options.length-1].className = "bg-slate-800 text-white font-sans text-base"; 
                s2.options[s2.options.length-1].className = "bg-slate-800 text-white font-sans text-base";
            });
            s1.value = window.teams.team1.config.id; s2.value = window.teams.team2.config.id;
            
            if (!s1.dataset.listenerAttached) {
                s1.addEventListener('change', (e) => { window.teams.team1.config = window.POKEMON_TEAMS.find(p => p.id === e.target.value); window.applyTheme('team1'); window.updateTurnUI(); window.updateHPUI(); });
                s1.dataset.listenerAttached = 'true';
            }
            if (!s2.dataset.listenerAttached) {
                s2.addEventListener('change', (e) => { window.teams.team2.config = window.POKEMON_TEAMS.find(p => p.id === e.target.value); window.applyTheme('team2'); window.updateTurnUI(); window.updateHPUI(); });
                s2.dataset.listenerAttached = 'true';
            }
        };
        
        window.applyTheme = function(teamKey) {
            var team = window.teams[teamKey];
            var base = document.getElementById(`${teamKey}-base`);
            if(base) {
                base.style.setProperty('--t-main', team.config.main); 
                base.style.setProperty('--t-rgb', team.config.rgb); 
            }
            
            var avatar = document.getElementById(`${teamKey}-avatar`);
            if(avatar) avatar.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${team.config.id}.png`;

            var selContainer = document.getElementById(`${teamKey}-select-container`);
            var selInput = document.getElementById(`${teamKey}-select`);
            
            if (team.config.tone === 'ivory' || team.config.tone === 'gray') {
                if(selContainer) { selContainer.style.backgroundColor = '#1e293b'; selContainer.style.borderColor = '#475569'; }
                if(selInput) selInput.style.color = '#ffffff'; 
            } else {
                if(selContainer) { selContainer.style.backgroundColor = '#ffffff'; selContainer.style.borderColor = '#e2e8f0'; }
                if(selInput) selInput.style.color = team.config.main;
            }
        };

        window.buildDeck = function() {
            window.globalDeck = [];
            var baseData = [];
            for (var i=0; i<window.MAX_ROWS; i++) {
                var node0 = document.querySelector(`input[data-row="${i}"][data-col="0"]`);
                var node1 = document.querySelector(`input[data-row="${i}"][data-col="1"]`);
                var node2 = document.querySelector(`input[data-row="${i}"][data-col="2"]`);
                var node3 = document.querySelector(`input[data-row="${i}"][data-col="3"]`);
                var node4 = document.querySelector(`input[data-row="${i}"][data-col="4"]`);

                if (!node0) break;

                var fId = node0.value.trim();
                var fWord = node1 ? node1.value.trim() : '';
                var bImgId = node2 ? node2.value.trim() : '';
                var bText = node3 ? node3.value.trim() : '';
                var bTime = node4 ? node4.value.trim() : '';

                // Chỉ đưa vào bộ bài nếu có dữ liệu mặt trước (fId hoặc fWord)
                if (fId || fWord) {
                    baseData.push({ type: 'normal', fId, fWord, bImgId, bText, bTime });
                }
            }

            if (baseData.length === 0) {
                baseData = window.DEFAULT_JSON_DATA.map(function(item) {
                    return Object.assign({}, item, { type: 'normal' });
                });
            }

            if (baseData.length > 0) {
                window.globalDeck = [...baseData].sort(() => Math.random() - 0.5);
            }

            if (window.isSpecialModeActive && window.globalDeck.length > 0) {
                var specialConfigs = [];
                window.dynamicSpecialCards.forEach(c => {
                    for(var i=0; i<c.count; i++) specialConfigs.push(c);
                });
                specialConfigs.sort(() => Math.random() - 0.5);
                
                for (var i = 0; i < specialConfigs.length; i++) {
                    if (i < window.globalDeck.length) {
                        window.globalDeck[i].isSpecial = true;
                        window.globalDeck[i].specialConfig = specialConfigs[i];
                    }
                }
                window.globalDeck.sort(() => Math.random() - 0.5);
            }
        };

        window.drawCards = function() {
            if (window.isGameOver) return;
            var handPanel = document.getElementById('active-hand');
            if(!handPanel) return;
            handPanel.innerHTML = '';
            
            window.currentHand.forEach(c => {
                if (!c.used) window.globalDeck.push(c);
            });
            window.currentHand = [];
            
            var loopGuard = 0; 
            
            while (window.currentHand.length < 3 && loopGuard < 10) {
                loopGuard++;
                
                if (window.globalDeck.length === 0) {
                    window.buildDeck(); 
                }
                if (window.globalDeck.length === 0) break; 
                
                window.globalDeck.sort(() => Math.random() - 0.5);
                
                var tempDeck = [];
                var specialCount = window.currentHand.filter(c => c.isSpecial).length;

                while (window.currentHand.length < 3 && window.globalDeck.length > 0) {
                    var card = window.globalDeck.pop();
                    
                    if (card.isSpecial) {
                        if (specialCount < 2 || loopGuard > 2) {
                            specialCount++;
                            window.currentHand.push({ ...card, used: false, uniqueId: Math.random().toString(36).substr(2, 9) });
                        } else {
                            tempDeck.push(card);
                        }
                    } else {
                        window.currentHand.push({ ...card, used: false, uniqueId: Math.random().toString(36).substr(2, 9) });
                    }
                }
                window.globalDeck.push(...tempDeck);
            }

            if (window.currentHand.length === 0) return;

            window.currentHand.forEach((cardObj, idx) => {
                var card = document.createElement('div'); card.className = 'card h-full aspect-[4/5] perspective cursor-pointer';
                var inner = document.createElement('div'); inner.className = 'card-inner w-full h-full relative transform-style-3d shadow-xl transition-transform duration-500';
                
                var extraClass = cardObj.isSpecial ? 'special-aura' : '';
                
                var content = '';
                if (window.DISPLAY_MODE.front === 'image') content = window.renderImages(cardObj.fId, 'Front-side');
                else if (window.DISPLAY_MODE.front === 'text') content = `<div class="w-full h-full flex items-center justify-center overflow-hidden" style="container-type: inline-size;">${window.getResponsiveText(cardObj.fWord, false)}</div>`;
                else {
                    content = `
                        <div class="h-[70%] w-full flex items-center justify-center p-1">${window.renderImages(cardObj.fId, 'Front-side')}</div>
                        <div class="h-[30%] w-full flex items-center justify-center rounded overflow-hidden mt-1" style="container-type: inline-size;">${window.getResponsiveText(cardObj.fWord, true)}</div>
                    `;
                }
                
                var starBadge = cardObj.isSpecial ? `<div class="absolute -top-3 -right-3 text-3xl drop-shadow-md z-[70]">⭐</div>` : '';
                var numberBadge = `<div class="absolute -top-3 -left-3 w-8 h-8 md:w-10 md:h-10 bg-slate-800 border-2 border-white rounded-full flex items-center justify-center text-white font-black text-sm md:text-xl shadow-lg z-[70] tarot-font">${idx + 1}</div>`;

                inner.innerHTML = `
                    ${numberBadge}
                    ${starBadge}
                    <div class="absolute inset-0 backface-hidden rounded-xl card-cover flex flex-col justify-center items-center p-2 border-[4px] md:border-[6px] bg-slate-800 transition-all duration-300 ${extraClass}">
                        <div class="w-[100%] h-[100%] bg-white rounded-lg shadow-inner flex flex-col items-center justify-center p-1 border-2 border-slate-200 relative overflow-hidden">
                            ${content}
                        </div>
                    </div>
                    <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl card-revealed bg-slate-200">
                    </div>
                `;

                card.appendChild(inner);
                
                card.addEventListener('click', () => {
                    if (window.isGameOver) return;
                    if (!window.isGameStarted) { if (window.GLOBAL_TIMER_ENABLED) window.startTimer(); else { window.isGameStarted = true; document.getElementById('global-status').classList.add('hidden'); } }
                    window.playSound('flip');
                    window.openModal(cardObj, idx);
                });
                
                handPanel.appendChild(card);
            });
        };

        window.openModal = function(cardObj, handIndex) {
            if (window.isProcessingModal) return;
            window.isProcessingModal = true;
            window.currentActiveCardObj = { cardObj, handIndex };
            
            var team = window.teams[window.currentTurn];
            var mTitle = document.getElementById('modal-team-title');
            if(mTitle) {
                mTitle.innerText = `${team.config.name} IS CHOOSING...`; 
                mTitle.style.color = team.config.main;
            }
            
            var mCard = document.getElementById('modal-card-content');
            if(mCard) {
                mCard.style.borderColor = team.config.main; 
                mCard.style.boxShadow = `0 0 50px rgba(${team.config.rgb}, 0.6)`;
            }
            
            var contentArea = document.getElementById('modal-content-area');
            
            document.getElementById('judge-buttons-normal')?.classList.replace('flex', 'hidden');
            document.getElementById('judge-buttons-special')?.classList.replace('flex', 'hidden');
            
            var innerHTMLStr = '';
            if (window.DISPLAY_MODE.back === 'points') {
                innerHTMLStr = `<div class="w-full h-full flex items-center justify-center p-8 bg-slate-100 rounded-2xl border border-slate-300"><p class="text-3xl font-black text-slate-400 uppercase">HIDDEN MODE</p></div>`;
            } else if (window.DISPLAY_MODE.back === 'image_only') {
                innerHTMLStr = `<div class="w-full h-full rounded-2xl overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300">${window.renderImages(cardObj.bImgId, 'Back-side')}</div>`;
            } else if (window.DISPLAY_MODE.back === 'text_only') {
                innerHTMLStr = `<div class="w-full h-full flex items-center justify-center p-8 bg-slate-100 rounded-2xl border border-slate-300"><p class="text-4xl md:text-6xl font-black text-slate-800 text-center leading-tight">${cardObj.bText}</p></div>`;
            } else { 
                innerHTMLStr = `
                    ${cardObj.bImgId ? `<div class="w-full h-[70%] rounded-t-2xl overflow-hidden bg-slate-200 flex items-center justify-center">${window.renderImages(cardObj.bImgId, 'Back-side')}</div>
                    <div class="h-[30%] flex items-center justify-center px-4 bg-slate-100 rounded-b-2xl border-t border-slate-300"><p class="text-2xl md:text-4xl font-black text-slate-800 text-center leading-tight">${cardObj.bText}</p></div>` 
                    : `<div class="w-full h-full flex items-center justify-center p-8 bg-slate-100 rounded-2xl border border-slate-300"><p class="text-4xl md:text-6xl font-black text-slate-800 text-center leading-tight">${cardObj.bText}</p></div>`}
                `;
            }

            if (cardObj.isSpecial) {
                var spec = cardObj.specialConfig;
                var btnClass = spec.type === 'nerf' 
                    ? "bg-red-600 hover:bg-red-500 shadow-[0_10px_20px_rgba(220,38,38,0.5)] animate-pulse"
                    : "bg-yellow-500 hover:bg-yellow-400 shadow-[0_10px_20px_rgba(234,179,8,0.5)] text-slate-900 border-yellow-200";

                var shortDescParsed = window.getParsedCardText(spec.shortDesc, spec.val, spec.val2);

                document.getElementById('judge-buttons-special').innerHTML = `
                    <button id="btn-action-special" class="flex-1 max-w-[300px] py-4 ${btnClass} rounded-2xl font-black text-xl md:text-2xl border-4 transition-transform hover:scale-105 flex flex-col items-center leading-none px-2 text-center">
                        <span class="text-4xl mb-1 animate-bounce">${spec.icon}</span> ${spec.name}<br><span class="text-sm mt-1 uppercase opacity-90 drop-shadow-sm">${shortDescParsed}</span>
                    </button>
                    <button id="btn-action-skip" class="flex-1 max-w-[250px] py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-black text-xl md:text-2xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-white transition-transform hover:scale-105 flex flex-col items-center leading-none">
                        <span class="text-4xl mb-1">⏭️</span> SKIP<br><span class="text-sm text-slate-300 mt-1 uppercase">Bỏ qua</span>
                    </button>
                `;
                document.getElementById('btn-action-special')?.addEventListener('click', () => window.handleAction('special_correct'));
                document.getElementById('btn-action-skip')?.addEventListener('click', () => window.handleAction('skip'));
            }

            if(contentArea) {
                contentArea.innerHTML = `
                    <div id="actual-content" class="w-full h-full flex flex-col relative">
                        ${innerHTMLStr}
                    </div>
                `;
            }

            document.getElementById('btn-bomb')?.classList.remove('hidden');
            if (cardObj.isSpecial) {
                document.getElementById('judge-buttons-special')?.classList.replace('hidden', 'flex');
            } else {
                document.getElementById('judge-buttons-normal')?.classList.replace('hidden', 'flex');
            }

            clearInterval(window.bombInterval);
            var fuseContainer = document.getElementById('fuse-container'); 
            var fuseBar = document.getElementById('fuse-bar'); 
            var fuseText = document.getElementById('fuse-text');
            var timeLimit = parseFloat(cardObj.bTime) || 0;

            if (timeLimit > 0) {
                fuseContainer?.classList.remove('hidden'); 
                let timeLeft = timeLimit; let totalTime = timeLimit;
                if(fuseBar) { fuseBar.style.width = '100%'; fuseBar.className = "h-full bg-green-500 transition-all duration-100 ease-linear ml-auto"; }
                if(fuseText) fuseText.innerText = `${timeLeft.toFixed(1)}s`;
                
                window.bombInterval = setInterval(() => {
                    timeLeft -= 0.1;
                    if (timeLeft <= 0) { timeLeft = 0; clearInterval(window.bombInterval); window.handleAction('miss'); } 
                    const pct = (timeLeft / totalTime) * 100; 
                    if(fuseBar) fuseBar.style.width = `${pct}%`; 
                    if(fuseText) fuseText.innerText = `${timeLeft.toFixed(1)}s`;
                    if (pct < 30) { fuseBar?.classList.replace('bg-yellow-400', 'bg-red-500'); if (Math.floor(timeLeft*10)%2===0) window.playSound('tick'); } 
                    else if (pct < 60) { fuseBar?.classList.replace('bg-green-500', 'bg-yellow-400'); }
                }, 100);
            } else { fuseContainer?.classList.add('hidden'); }
            
            var m = document.getElementById('zoom-modal');
            if (m) {
                m.classList.remove('hidden'); m.classList.add('flex');
            }
        };

        window.coinCallback = null;
        window.showCoinFlip = function(callback, title, subtitle) {
            window.coinCallback = callback;
            var cm = document.getElementById('coin-modal');
            document.getElementById('coin-status').innerText = subtitle || "Chọn 1 mặt đồng xu. Sẽ tung 3 đồng xu ngẫu nhiên!";
            document.getElementById('coin-buttons').style.display = 'flex';
            
            document.getElementById('coin-inner-1').style.transform = 'rotateY(0deg)';
            document.getElementById('coin-inner-2').style.transform = 'rotateY(0deg)';
            document.getElementById('coin-inner-3').style.transform = 'rotateY(0deg)';
            
            var defenderName = window.teams[window.currentTurn === 'team1' ? 'team2' : 'team1'].config.name; 
            document.getElementById('coin-modal-title').innerText = title || "MINI GAME!";
            
            if(cm) {
                cm.classList.remove('hidden');
                cm.classList.add('flex');
            }
        };

        window.flipCoin = function(choice) {
            document.getElementById('coin-buttons').style.display = 'none';
            document.getElementById('coin-status').innerText = "Đang tung 3 đồng xu...";
            window.playSound('shoot'); 
            
            var results = [
                Math.random() < 0.5 ? 'heads' : 'tails',
                Math.random() < 0.5 ? 'heads' : 'tails',
                Math.random() < 0.5 ? 'heads' : 'tails'
            ];
            
            var matchCount = results.filter(r => r === choice).length;
            var isWin = matchCount >= 2;

            results.forEach((r, i) => {
                var spins = 5 + i; 
                var extraDeg = r === 'heads' ? 0 : 180;
                var totalDeg = spins * 360 + extraDeg;
                var coinInner = document.getElementById(`coin-inner-${i+1}`);
                if(coinInner) coinInner.style.transform = `rotateY(${totalDeg}deg)`;
            });
            
            setTimeout(() => {
                var textHeads = results.filter(r => r==='heads').length;
                var textTails = 3 - textHeads;
                if (isWin) {
                    document.getElementById('coin-status').innerHTML = `Kết quả: ${textHeads} SẤP - ${textTails} NGỬA.<br><span class="text-green-400 drop-shadow-md">TRÚNG LỚN! THÀNH CÔNG!</span>`;
                    window.playSound('heal');
                } else {
                    document.getElementById('coin-status').innerHTML = `Kết quả: ${textHeads} SẤP - ${textTails} NGỬA.<br><span class="text-red-400 drop-shadow-md">TRƯỢT RỒI! THẤT BẠI!</span>`;
                    window.playSound('miss');
                }
                
                setTimeout(() => {
                    var cm = document.getElementById('coin-modal');
                    if(cm) {
                        cm.classList.add('hidden');
                        cm.classList.remove('flex');
                    }
                    if (window.coinCallback) window.coinCallback(isWin);
                }, 2500);
            }, 2200); 
        };

        window.showWheelSpin = function(min, max, callback, title, subtitle) {
            var wm = document.getElementById('wheel-modal');
            document.getElementById('wheel-modal-title').innerText = title || "VÒNG QUAY ĐỊNH MỆNH!";
            document.getElementById('wheel-status').innerText = subtitle || "Đang quay số...";
            
            var container = document.getElementById('wheel-numbers-container');
            if(container) container.innerHTML = '';
            
            var count = max - min + 1;
            if (count <= 0) count = 1;
            var angleStep = 360 / count;
            var radius = 85; 
            
            var elements = [];
            for(var i = 0; i < count; i++) {
                var num = min + i;
                var angle = i * angleStep;
                var rad = (angle - 90) * (Math.PI / 180);
                var x = radius * Math.cos(rad);
                var y = radius * Math.sin(rad);
                
                var el = document.createElement('div');
                el.className = 'wheel-number';
                el.style.transform = `translate(${x}px, ${y}px)`;
                
                var inner = document.createElement('div');
                inner.className = 'wheel-num-inner';
                inner.innerText = num;
                el.appendChild(inner);
                
                if(container) container.appendChild(el);
                elements.push({ num: num, angle: angle, inner: inner });
            }

            if(wm) {
                wm.classList.remove('hidden');
                wm.classList.add('flex');
            }
            
            var pointer = document.getElementById('wheel-pointer');
            if(pointer) {
                pointer.style.transition = 'none';
                pointer.style.transform = 'rotate(0deg)';
                void pointer.offsetWidth;
                
                var finalIndex = Math.floor(Math.random() * count);
                var finalNum = elements[finalIndex].num;
                var targetAngle = elements[finalIndex].angle;
                
                var spins = 5; 
                var totalDeg = spins * 360 + targetAngle;
                
                pointer.style.transition = 'transform 3s cubic-bezier(0.2, 0.8, 0.3, 1)';
                pointer.style.transform = `rotate(${totalDeg}deg)`;
                
                window.playSound('shoot');

                var tickInterval = setInterval(() => window.playSound('tick'), 150);
                setTimeout(() => clearInterval(tickInterval), 2500);

                setTimeout(() => {
                    document.getElementById('wheel-status').innerText = `ĐỘNG ĐẤT -${finalNum} HP!`;
                    window.playSound('boom');
                    
                    elements[finalIndex].inner.classList.add('shatter-effect');
                    
                    setTimeout(() => {
                        if(wm) {
                            wm.classList.add('hidden');
                            wm.classList.remove('flex');
                        }
                        if(callback) callback(finalNum);
                    }, 1500);
                }, 3000);
            }
        };

        window.processAttackTarget = function(targetId, damageVal, onReflect, onHit, onBlock, ignoreShield = false) {
            var targetTeam = window.teams[targetId];
            
            if (!ignoreShield && targetTeam.hasBlind) {
                window.showCoinFlip(function(isDodged) {
                    targetTeam.hasBlind = false;
                    var blindIcon = document.getElementById(targetId + '-blind-icon');
                    if(blindIcon) blindIcon.classList.add('hidden');
                    
                    if (isDodged) {
                        window.playSound('defuse');
                        onBlock();
                    } else {
                        window.applyHPChange(targetId, -1, true, false); 
                        onBlock(); 
                    }
                }, `${targetTeam.config.name} NÉ ĐÒN!`, "Chọn đúng mặt. Xuất hiện >=2 đồng xu khớp mặt đã chọn để vô hiệu hóa đòn đánh, chọn sai mất 1 HP!");
                return;
            }

            if (!ignoreShield && targetTeam.shieldCount >= 2) {
                targetTeam.shieldCount = 0; window.triggerShieldBreak(targetId); window.playSound('defuse');
                setTimeout(onReflect, 400);
            } else if (!ignoreShield && targetTeam.shieldCount === 1) {
                targetTeam.shieldCount = 0; window.triggerShieldBreak(targetId); window.playSound('defuse');
                onBlock();
            } else {
                window.applyHPChange(targetId, -damageVal, true, true);
                onHit();
            }
        };

        window.shootProjectile = function(fromTeamId, toTeamId, type, callback, isRocket = false) {
            window.playSound('shoot');
            var fromEl = document.getElementById(`${fromTeamId}-avatar`);
            var toEl = document.getElementById(`${toTeamId}-avatar`);
            if(!fromEl || !toEl) { if(callback) callback(); return; }

            var fromRect = fromEl.getBoundingClientRect();
            var toRect = toEl.getBoundingClientRect();

            var proj = document.createElement('div');
            proj.className = `projectile`;
            
            proj.innerText = isRocket ? '🚀' : (window.TYPE_ICONS[type] || '☄️');

            var startX = fromRect.left + fromRect.width / 2 - 30;
            var startY = fromRect.top + fromRect.height / 2 - 30;
            var endX = toRect.left + toRect.width / 2 - 30;
            var endY = toRect.top + toRect.height / 2 - 30;

            proj.style.left = startX + 'px';
            proj.style.top = startY + 'px';
            proj.style.setProperty('--dx', (endX - startX) + 'px');
            proj.style.setProperty('--dy', (endY - startY) + 'px');
            proj.style.setProperty('--dx-half', ((endX - startX)/2) + 'px');
            
            var duration = isRocket ? 1200 : 600;
            
            if (isRocket) {
                var isLeftToRight = (endX - startX) > 0;
                proj.style.animation = isLeftToRight 
                    ? `flyRocketRight ${duration}ms cubic-bezier(0.5, 0, 0.5, 1) forwards`
                    : `flyRocketLeft ${duration}ms cubic-bezier(0.5, 0, 0.5, 1) forwards`;
            } else {
                proj.style.animation = `flyAttack ${duration}ms cubic-bezier(0.2, 0.8, 0.4, 1) forwards`;
            }
            
            document.body.appendChild(proj);

            setTimeout(() => { proj.remove(); if (callback) callback(); }, duration);
        };

        window.triggerShieldBreak = function(teamId) {
            var sc = document.getElementById(`${teamId}-shield-container`);
            if(!sc) return;
            sc.classList.add('shield-breaking');
            setTimeout(() => { 
                sc.classList.remove('shield-breaking'); 
                window.updateShieldUI(teamId); 
            }, 500);
        };

        window.triggerAvatarFX = function(teamId, isHappy) {
            var av = document.getElementById(`${teamId}-avatar`);
            if(!av) return;
            if (isHappy && window.AVATAR_SETTINGS.happyEffectEnabled) {
                av.classList.add('avatar-bounce');
                var glow = document.createElement('div'); glow.className = 'celebration-glow'; av.parentElement.appendChild(glow);
                setTimeout(() => { av.classList.remove('avatar-bounce'); glow.remove(); }, 1500);
            } else if (!isHappy && window.AVATAR_SETTINGS.sadEffectEnabled) {
                av.classList.add('avatar-shake');
                var bub = document.getElementById(`${teamId}-sad-bubbles`); 
                if(bub) {
                    bub.innerHTML = '';
                    for (var i = 0; i < 8; i++) {
                        var b = document.createElement('div'); 
                        b.className = 'tear-drop';
                        b.style.left = `${30 + Math.random() * 40}%`; 
                        b.style.top = `${40 + Math.random() * 20}%`;
                        b.style.setProperty('--drift', `${(Math.random() - 0.5) * 50}px`);
                        b.style.animation = `floatTear ${1 + Math.random() * 1}s ease-in forwards`;
                        b.style.animationDelay = `${Math.random() * 0.4}s`;
                        bub.appendChild(b);
                    }
                }
                setTimeout(() => { av.classList.remove('avatar-shake'); if(bub) bub.innerHTML=''; }, 2000);
            }
        };

        window.triggerExplosion = function(teamId) {
            window.playSound('boom');
            var base = document.getElementById(`${teamId}-base`);
            if(!base) return;
            base.classList.add('shake-screen');
            var c = document.createElement('div'); c.className = 'explosion-core'; c.style.top='30%';
            var r = document.createElement('div'); r.className = 'explosion-ring'; r.style.top='30%';
            base.appendChild(c); base.appendChild(r);
            window.triggerAvatarFX(teamId, false);
            setTimeout(() => { base.classList.remove('shake-screen'); c.remove(); r.remove(); }, window.EFFECT_SETTINGS.explosionDelayMs);
        };

        window.triggerMegaExplosion = function(teamId) {
            window.playSound('boom');
            setTimeout(() => window.playSound('boom'), 200); 
            var base = document.getElementById(`${teamId}-base`);
            if(!base) return;
            base.classList.add('shake-screen');
            
            var c = document.createElement('div'); c.className = 'explosion-core'; c.style.top='30%'; c.style.transform = 'translate(-50%, -50%) scale(1.5)';
            var r = document.createElement('div'); r.className = 'explosion-ring'; r.style.top='30%'; r.style.borderWidth = '20px';
            base.appendChild(c); base.appendChild(r);
            
            for(var i=0; i<10; i++) {
                var shrap = document.createElement('div');
                shrap.innerText = ['💥', '🔥', '💨', '💢'][Math.floor(Math.random()*4)];
                shrap.className = 'absolute z-50 text-3xl md:text-5xl';
                shrap.style.top = '30%';
                shrap.style.left = '50%';
                var angle = Math.random() * Math.PI * 2;
                var dist = 100 + Math.random() * 200;
                var tx = Math.cos(angle) * dist;
                var ty = Math.sin(angle) * dist;
                shrap.animate([
                    { transform: `translate(-50%, -50%) scale(0.5)`, opacity: 1 },
                    { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.5) rotate(${Math.random()*360}deg)`, opacity: 0 }
                ], { duration: 800, easing: 'ease-out', fill: 'forwards' });
                base.appendChild(shrap);
                setTimeout(() => shrap.remove(), 800);
            }

            window.triggerAvatarFX(teamId, false);
            setTimeout(() => { base.classList.remove('shake-screen'); c.remove(); r.remove(); }, 1500);
        };

        window.triggerHeal = function(teamId) {
            window.playSound('heal');
            var base = document.getElementById(`${teamId}-base`);
            if(!base) return;
            var h = document.createElement('div'); h.className = 'heal-effect'; h.innerText = '💚'; h.style.top='20%';
            base.appendChild(h);
            window.triggerAvatarFX(teamId, true);
            setTimeout(() => h.remove(), 1000);
        };

        window.executeSpecialSkill = function(cId, tId, sObj, finishCb) {
            var cTeam = window.teams[cId];
            var tTeam = window.teams[tId];
            var pType = cTeam.config.pType;

            if (sObj.id === 'DOUBLE') {
                var av = document.getElementById(`${cId}-avatar`);
                if(av) av.classList.add('power-up-anim');
                window.playSound('heal');
                
                setTimeout(() => {
                    if(av) av.classList.remove('power-up-anim');
                    window.shootProjectile(cId, tId, pType, () => {
                        window.processAttackTarget(tId, sObj.val,
                            () => { 
                                window.shootProjectile(tId, cId, pType, () => {
                                    window.applyHPChange(cId, -sObj.val, true, false); window.triggerMegaExplosion(cId); finishCb();
                                }, true);
                            },
                            () => { window.triggerMegaExplosion(tId); finishCb(); },
                            () => { finishCb(); }
                        );
                    }, true); 
                }, 800);

            } else if (sObj.id === 'SHIELD') {
                cTeam.shieldCount = Math.min(2, cTeam.shieldCount + 1);
                window.updateShieldUI(cId);
                window.playSound('heal'); window.triggerAvatarFX(cId, true);
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'HALVE') {
                if (cTeam.shieldCount > 0) { cTeam.shieldCount = 0; window.triggerShieldBreak(cId); window.playSound('defuse'); }
                else { window.applyHPChange(cId, -sObj.val, true, false); window.triggerExplosion(cId); }
                setTimeout(finishCb, window.EFFECT_SETTINGS.explosionDelayMs);
            } else if (sObj.id === 'SWAP') {
                window.shootProjectile(cId, tId, 'ghost', () => {
                    window.processAttackTarget(tId, 0,
                        () => { 
                            window.shootProjectile(tId, cId, 'ghost', () => {
                                window.applyHPChange(cId, -1, true, false); window.triggerExplosion(cId); finishCb();
                            });
                        },
                        () => { 
                            var temp = cTeam.hp; 
                            window.applyHPChange(cId, tTeam.hp - cTeam.hp, false, false); 
                            window.applyHPChange(tId, temp - tTeam.hp, false, false);
                            window.playSound('heal'); window.triggerAvatarFX(cId, true); window.triggerAvatarFX(tId, false);
                            setTimeout(finishCb, 1000);
                        },
                        () => { finishCb(); }
                    );
                });
            } else if (sObj.id.startsWith('STEAL_')) {
                window.shootProjectile(cId, tId, 'ghost', () => {
                    window.processAttackTarget(tId, sObj.val,
                        () => { 
                            window.shootProjectile(tId, cId, 'ghost', () => {
                                window.applyHPChange(cId, -sObj.val, true, false); 
                                window.applyHPChange(tId, sObj.val, false, false); 
                                window.triggerExplosion(cId); setTimeout(() => window.triggerHeal(tId), 500); finishCb();
                            });
                        },
                        () => { 
                            window.applyHPChange(cId, sObj.val, false, false); 
                            window.triggerExplosion(tId); setTimeout(() => window.triggerHeal(cId), 500); finishCb(); 
                        },
                        () => { finishCb(); }
                    );
                });
            } else if (sObj.id.startsWith('LOSE_')) {
                if (cTeam.shieldCount > 0) { cTeam.shieldCount = 0; window.triggerShieldBreak(cId); window.playSound('defuse'); }
                else { window.applyHPChange(cId, -1, true, false); window.triggerExplosion(cId); }
                setTimeout(finishCb, window.EFFECT_SETTINGS.explosionDelayMs);
            } else if (sObj.id === 'MEDIKIT') {
                window.triggerHeal(cId); window.applyHPChange(cId, sObj.val, false, false);
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'FULL_HEAL' || sObj.id === 'ANGEL') {
                window.triggerHeal(cId); 
                window.applyHPChange(cId, sObj.val, false, false);
                cTeam.sleepTurns = 2; 
                window.updateStatusIcons(cId);
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'KAMIKAZE') {
                var avK = document.getElementById(`${cId}-avatar`);
                if(avK) avK.classList.add('power-up-anim');
                window.playSound('boom');
                
                setTimeout(() => {
                    if(avK) avK.classList.remove('power-up-anim');
                    if (cTeam.shieldCount > 0) {
                        cTeam.shieldCount = 0; window.triggerShieldBreak(cId); window.playSound('defuse');
                    } else {
                        window.applyHPChange(cId, -sObj.val2, true, false); window.triggerExplosion(cId);
                    }
                    
                    setTimeout(() => {
                        if (cTeam.hp <= 0) { finishCb(); return; }
                        window.shootProjectile(cId, tId, pType, () => {
                            window.processAttackTarget(tId, sObj.val,
                                () => { 
                                    window.shootProjectile(tId, cId, pType, () => {
                                        window.applyHPChange(cId, -sObj.val, true, false); window.triggerMegaExplosion(cId); finishCb();
                                    }, true);
                                },
                                () => { window.triggerMegaExplosion(tId); finishCb(); },
                                () => { finishCb(); }
                            );
                        }, true); 
                    }, 600);
                }, 800);
            } else if (sObj.id === 'FREEZE') {
                window.playSound('defuse');
                window.shootProjectile(cId, tId, 'ice', () => {
                    window.processAttackTarget(tId, 0,
                        () => { 
                            window.shootProjectile(tId, cId, 'ice', () => {
                                var avF1 = document.getElementById(`${cId}-avatar`);
                                if(avF1) { avF1.style.filter = 'hue-rotate(180deg) brightness(1.5) drop-shadow(0 0 15px #60a5fa)'; setTimeout(() => avF1.style.filter = '', 2000); }
                                window.playSound('defuse');
                                cTeam.isFrozen = true; 
                                finishCb();
                            });
                        },
                        () => { 
                            var avF2 = document.getElementById(`${tId}-avatar`);
                            if(avF2) { avF2.style.filter = 'hue-rotate(180deg) brightness(1.5) drop-shadow(0 0 15px #60a5fa)'; setTimeout(() => avF2.style.filter = '', 2000); }
                            window.playSound('defuse');
                            tTeam.isFrozen = true; // Extra turn effectively
                            finishCb();
                        },
                        () => { finishCb(); }
                    );
                });
            } else if (sObj.id === 'SACRIFICE') {
                window.applyHPChange(cId, -sObj.val, true, false); window.triggerExplosion(cId);
                setTimeout(() => {
                    if (cTeam.hp <= 0) { finishCb(); return; }
                    window.shootProjectile(cId, tId, pType, () => {
                        window.processAttackTarget(tId, sObj.val2, 
                            () => { 
                                window.shootProjectile(tId, cId, pType, () => {
                                    window.applyHPChange(cId, -sObj.val2, true, false); window.triggerMegaExplosion(cId); finishCb();
                                });
                            },
                            () => { window.triggerMegaExplosion(tId); finishCb(); },
                            () => { finishCb(); } 
                        );
                    });
                }, window.EFFECT_SETTINGS.explosionDelayMs);
            } else if (sObj.id === 'BLIND') {
                cTeam.hasBlind = true;
                window.updateStatusIcons(cId);
                window.playSound('heal');
                window.triggerAvatarFX(cId, true);
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'PAIN_SPLIT') {
                var total = cTeam.hp + tTeam.hp;
                var half = Math.ceil(total / 2);
                var d1 = half - cTeam.hp;
                var d2 = half - tTeam.hp;
                window.applyHPChange(cId, d1, false, false);
                window.applyHPChange(tId, d2, false, false);
                window.playSound('heal'); window.triggerAvatarFX(cId, true); window.triggerAvatarFX(tId, true);
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'THIEF') {
                if (tTeam.shieldCount > 0) {
                    tTeam.shieldCount--;
                    cTeam.shieldCount = Math.min(2, cTeam.shieldCount + 1);
                    window.playSound('heal');
                    window.updateShieldUI(cId); window.updateShieldUI(tId);
                } else {
                    window.playSound('miss');
                }
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'VOLT_TACKLE') {
                window.showCoinFlip(function(isWin) {
                    if(isWin) {
                        window.shootProjectile(cId, tId, pType, () => {
                            window.processAttackTarget(tId, sObj.val,
                                () => { 
                                    window.shootProjectile(tId, cId, pType, () => {
                                        window.applyHPChange(cId, -sObj.val, true, false); window.triggerMegaExplosion(cId); finishCb();
                                    }, true);
                                },
                                () => { window.triggerMegaExplosion(tId); finishCb(); },
                                () => { finishCb(); }
                            );
                        }, true);
                    } else {
                        window.applyHPChange(cId, -sObj.val2, true, false); window.triggerMegaExplosion(cId); finishCb();
                    }
                }, `${cTeam.config.name} DÙNG ĐÒN CẢM TỬ!`, `Chọn 1 mặt xu. Tung 3 xu: Trúng (>=2) địch -${sObj.val} HP. Trượt ta mất -${sObj.val2} HP.`);
            } else if (sObj.id === 'EARTHQUAKE') {
                window.showWheelSpin(sObj.val, sObj.val2, function(damage) {
                    window.applyHPChange(cId, -damage, true, false);
                    window.applyHPChange(tId, -damage, true, false);
                    window.triggerExplosion(cId);
                    setTimeout(() => window.triggerExplosion(tId), 200);
                    setTimeout(finishCb, window.EFFECT_SETTINGS.explosionDelayMs);
                }, "EARTHQUAKE!", `Cường độ từ ${sObj.val} đến ${sObj.val2}...`);
            } else if (sObj.id === 'SNIPER') {
                window.shootProjectile(cId, tId, 'ghost', () => {
                    window.processAttackTarget(tId, sObj.val, 
                        () => { 
                            window.applyHPChange(tId, -sObj.val, true, true); window.triggerExplosion(tId); finishCb();
                        }, 
                        () => { window.triggerExplosion(tId); finishCb(); },
                        () => { finishCb(); },
                        true // Bỏ qua khiên
                    );
                }, false);
            } else if (sObj.id === 'POISON') {
                window.shootProjectile(cId, tId, 'grass', () => {
                    window.processAttackTarget(tId, sObj.val,
                        () => { 
                            window.shootProjectile(tId, cId, 'grass', () => {
                                window.applyHPChange(cId, -sObj.val, true, false); cTeam.isPoisoned = true; 
                                window.updateStatusIcons(cId); window.triggerExplosion(cId); finishCb();
                            });
                        },
                        () => { 
                            tTeam.isPoisoned = true; 
                            window.updateStatusIcons(tId); window.triggerExplosion(tId); finishCb(); 
                        },
                        () => { finishCb(); } 
                    );
                });
            } else if (sObj.id === 'PURIFY') {
                ['team1', 'team2'].forEach(t => {
                    window.teams[t].shieldCount = 0; 
                    window.teams[t].hasBlind = false; 
                    window.teams[t].isFrozen = false; 
                    window.teams[t].sleepTurns = 0; 
                    window.teams[t].isPoisoned = false;
                    window.teams[t].sabotageBombs = 0;
                    window.updateShieldUI(t); 
                    window.updateStatusIcons(t);
                });

                window.gameState.bloodPact.active = false;
                window.gameState.bloodPact.turnsLeft = 0;
                var chain1 = document.getElementById('blood-pact-chain-1');
                if(chain1 && !chain1.classList.contains('hidden')) { chain1.classList.add('chain-shatter'); setTimeout(()=> {chain1.classList.add('hidden', 'opacity-0'); chain1.classList.remove('chain-shatter', 'opacity-100');}, 800); }
                var chain2 = document.getElementById('blood-pact-chain-2');
                if(chain2 && !chain2.classList.contains('hidden')) { chain2.classList.add('chain-shatter'); setTimeout(()=> {chain2.classList.add('hidden', 'opacity-0'); chain2.classList.remove('chain-shatter', 'opacity-100');}, 800); }
                
                window.gameState.mimic.active = false;
                window.gameState.mimic.turnsLeft = 0;
                window.updateStatusIcons('team1'); window.updateStatusIcons('team2');

                window.playSound('heal');
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'GAMBLE') {
                window.showCoinFlip(function(isWin) {
                    if(isWin) {
                        window.applyHPChange(cId, sObj.val, false, false); window.triggerHeal(cId); finishCb();
                    } else {
                        window.applyHPChange(cId, -sObj.val2, true, false); window.triggerMegaExplosion(cId); finishCb();
                    }
                }, `CÁ CƯỢC SINH TỬ!`, `Chọn đúng: +${sObj.val} HP. Chọn sai: Bị sét đánh -${sObj.val2} HP.`);
            } else if (sObj.id === 'BLOOD_PACT') {
                window.gameState.bloodPact.active = true;
                window.gameState.bloodPact.turnsLeft = 2;
                window.gameState.bloodPact.caster = cId;
                window.gameState.bloodPact.justCasted = true;
                
                var chain1 = document.getElementById('blood-pact-chain-1');
                var chain2 = document.getElementById('blood-pact-chain-2');
                if(chain1) { chain1.classList.remove('hidden', 'opacity-0', 'chain-shatter'); chain1.classList.add('opacity-100'); }
                if(chain2) { chain2.classList.remove('hidden', 'opacity-0', 'chain-shatter'); chain2.classList.add('opacity-100'); }
                
                window.updateStatusIcons(cId);
                window.playSound('heal');
                window.triggerAvatarFX(cId, true);
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'MIMIC') {
                window.gameState.mimic.active = true;
                window.gameState.mimic.turnsLeft = sObj.val; // Sử dụng Value
                window.gameState.mimic.caster = cId;
                window.updateStatusIcons(cId);
                window.playSound('heal');
                window.triggerAvatarFX(cId, true);
                setTimeout(finishCb, 1000);
            } else if (sObj.id === 'SABOTAGE') {
                var casterAv = document.getElementById(`${cId}-avatar`);
                var targetAv = document.getElementById(`${tId}-avatar`);
                var arena = document.getElementById('battle-arena');

                if(!casterAv || !targetAv || !arena) { 
                    tTeam.sabotageBombs++;
                    window.updateStatusIcons(tId);
                    window.playSound('tick');
                    finishCb(); 
                    return; 
                }

                var mini = document.createElement('img');
                mini.src = casterAv.src;
                mini.className = 'absolute z-[60] filter drop-shadow-md';
                mini.style.width = (casterAv.offsetWidth * 0.25) + 'px';
                mini.style.height = (casterAv.offsetHeight * 0.25) + 'px';

                var cRect = casterAv.getBoundingClientRect();
                var tRect = targetAv.getBoundingClientRect();
                var aRect = arena.getBoundingClientRect();
                
                var startX = cRect.left - aRect.left + cRect.width/2 - (casterAv.offsetWidth * 0.125);
                var startY = cRect.top - aRect.top + cRect.height - (casterAv.offsetHeight * 0.25);
                
                var endX = tRect.left - aRect.left + tRect.width/2 - (casterAv.offsetWidth * 0.125);
                var endY = tRect.top - aRect.top + tRect.height - (casterAv.offsetHeight * 0.25);

                mini.style.left = startX + 'px';
                mini.style.top = startY + 'px';
                arena.appendChild(mini);

                var isLeftToRight = endX > startX;
                if (!isLeftToRight) mini.style.transform = 'scaleX(-1)';

                mini.animate([
                    { transform: `translate(0px, 0px) ${!isLeftToRight?'scaleX(-1)':''} rotate(0deg)` },
                    { transform: `translate(${(endX-startX)/2}px, -50px) ${!isLeftToRight?'scaleX(-1)':''} rotate(${isLeftToRight?10:-10}deg)` },
                    { transform: `translate(${endX-startX}px, 0px) ${!isLeftToRight?'scaleX(-1)':''} rotate(0deg)` }
                ], { duration: 1000, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', fill: 'forwards' });

                setTimeout(() => {
                    tTeam.sabotageBombs++;
                    window.updateStatusIcons(tId);
                    window.playSound('tick');
                    
                    if (isLeftToRight) mini.style.transform = 'scaleX(-1)';
                    else mini.style.transform = 'none';

                    mini.animate([
                        { transform: `translate(${endX-startX}px, 0px) ${isLeftToRight?'scaleX(-1)':'none'} rotate(0deg)` },
                        { transform: `translate(${(endX-startX)/2}px, -50px) ${isLeftToRight?'scaleX(-1)':'none'} rotate(${isLeftToRight?-10:10}deg)` },
                        { transform: `translate(0px, 0px) ${isLeftToRight?'scaleX(-1)':'none'} rotate(0deg)` }
                    ], { duration: 1000, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)', fill: 'forwards' });

                    setTimeout(() => {
                        mini.remove();
                        finishCb();
                    }, 1000);
                }, 1000);
            } else {
                finishCb();
            }
        };

        window.handleAction = function(actionType) {
            if (!window.isProcessingModal) return; // Khoá an toàn
            clearInterval(window.bombInterval);
            var m = document.getElementById('zoom-modal');
            if (m) {
                m.classList.add('hidden'); m.classList.remove('flex');
            }

            var cardObj = window.currentActiveCardObj.cardObj;
            var handIndex = window.currentActiveCardObj.handIndex;
            window.currentHand[handIndex].used = true;
            
            var currentTeam = window.teams[window.currentTurn];
            var otherTurn = window.currentTurn === 'team1' ? 'team2' : 'team1';
            var otherTeam = window.teams[otherTurn];
            var pType = currentTeam.config.pType;

            var pendingMimicAction = null;

            var checkPoisonAndExecute = function(executionCallback) {
                var isHealingMove = (actionType === 'repair' || (actionType === 'special_correct' && cardObj.specialConfig.type === 'buff' && ['MEDIKIT', 'FULL_HEAL', 'ANGEL', 'PURIFY'].includes(cardObj.specialConfig.id)));
                
                if (currentTeam.isPoisoned) {
                    if (isHealingMove) {
                        currentTeam.isPoisoned = false;
                        window.updateStatusIcons(window.currentTurn);
                        window.playSound('heal');
                        executionCallback();
                    } else {
                        window.applyHPChange(window.currentTurn, -1, true, true);
                        var av = document.getElementById(`${window.currentTurn}-avatar`);
                        if(av) {
                            av.style.filter = 'hue-rotate(270deg) brightness(0.8) drop-shadow(0 0 15px #a855f7)';
                            setTimeout(() => av.style.filter = '', 1000);
                        }
                        
                        if (currentTeam.hp <= 0) {
                            window.triggerExplosion(window.currentTurn);
                            setTimeout(finalize, 1500);
                        } else {
                            executionCallback();
                        }
                    }
                } else {
                    executionCallback();
                }
            };

            var finalize = function() {
                if (window.teams.team1.hp <= 0 || window.teams.team2.hp <= 0) { 
                    window.isProcessingModal = false;
                    window.triggerWin(); 
                    return; 
                }

                // Thực thi Mimic nếu có
                if (pendingMimicAction) {
                    var mCaster = pendingMimicAction.caster;
                    var mTarget = mCaster === 'team1' ? 'team2' : 'team1';
                    var mSpec = pendingMimicAction.spec;
                    pendingMimicAction = null; 

                    var statusElNode = document.getElementById('global-status');
                    if(statusElNode) {
                        statusElNode.innerHTML = `<span class="bg-blue-600/90 px-8 py-4 rounded-3xl border-4 border-blue-300 text-white drop-shadow-[0_0_20px_rgba(59,130,246,1)]">${window.teams[mCaster].config.name} KÍCH HOẠT MIMIC: ${mSpec.name}!</span>`;
                        statusElNode.classList.remove('hidden');
                        setTimeout(() => statusElNode.classList.add('hidden'), 2500);
                    }

                    // Magic Book Animation
                    var casterEl = document.getElementById(mCaster + '-avatar');
                    if (casterEl && casterEl.parentElement) {
                        var book = document.createElement('div');
                        book.innerText = '📖';
                        book.className = 'absolute z-50 text-6xl drop-shadow-[0_0_15px_rgba(168,85,247,1)] pointer-events-none';
                        book.style.top = '0';
                        book.style.left = '50%';
                        book.style.transform = 'translate(-50%, -100%)';
                        casterEl.parentElement.appendChild(book);

                        book.animate([
                            { transform: 'translate(-50%, -50%) scale(0) rotate(-10deg)', opacity: 0 },
                            { transform: 'translate(-50%, -120%) scale(1.5) rotate(5deg)', opacity: 1, offset: 0.2 },
                            { transform: 'translate(-50%, -100%) scale(1.2) rotate(0deg)', opacity: 1, offset: 0.8 },
                            { transform: 'translate(-50%, -150%) scale(0) rotate(10deg)', opacity: 0 }
                        ], { duration: 2000, easing: 'ease-in-out' });
                        
                        window.playSound('heal');

                        setTimeout(() => {
                            book.remove();
                            // Tránh infinite loop mimic lồng mimic
                            if(mSpec.id === 'MIMIC') mSpec = window.SPECIAL_CARDS_CONFIG.find(c => c.id === 'MEDIKIT');
                            
                            // Execute directly
                            window.executeSpecialSkill(mCaster, mTarget, mSpec, processNextTurn);
                        }, 2000);
                    } else {
                        window.executeSpecialSkill(mCaster, mTarget, mSpec, processNextTurn);
                    }
                } else {
                    processNextTurn();
                }
            };

            var processNextTurn = function() {
                if (window.teams.team1.hp <= 0 || window.teams.team2.hp <= 0) { 
                    window.isProcessingModal = false;
                    window.triggerWin(); 
                    return; 
                }

                // Chuyển lượt trước
                var nextTurn = window.currentTurn === 'team1' ? 'team2' : 'team1';

                // Trừ thời gian hiệu ứng của NGƯỜI VỪA ĐÁNH XONG
                if (window.gameState.mimic.active && window.currentTurn === window.gameState.mimic.caster) {
                    window.gameState.mimic.turnsLeft--;
                    if(window.gameState.mimic.turnsLeft <= 0) window.gameState.mimic.active = false;
                }
                
                if (window.gameState.bloodPact.active) {
                    if (window.gameState.bloodPact.justCasted) {
                        window.gameState.bloodPact.justCasted = false;
                    } else {
                        window.gameState.bloodPact.turnsLeft--;
                        if(window.gameState.bloodPact.turnsLeft === 1) {
                            var chain1 = document.getElementById('blood-pact-chain-1');
                            if(chain1) {
                                chain1.classList.add('chain-shatter');
                                setTimeout(() => {
                                    chain1.classList.remove('chain-shatter', 'opacity-100');
                                    chain1.classList.add('hidden', 'opacity-0');
                                }, 800);
                            }
                        } else if(window.gameState.bloodPact.turnsLeft === 0) {
                            window.gameState.bloodPact.active = false;
                            var chain2 = document.getElementById('blood-pact-chain-2');
                            if(chain2) {
                                chain2.classList.add('chain-shatter');
                                setTimeout(() => {
                                    chain2.classList.remove('chain-shatter', 'opacity-100');
                                    chain2.classList.add('hidden', 'opacity-0');
                                }, 800);
                            }
                        }
                    }
                }
                
                window.updateStatusIcons('team1'); window.updateStatusIcons('team2');

                window.currentTurn = nextTurn;

                checkStatusLoop();
            }

            function checkStatusLoop() {
                var team = window.teams[window.currentTurn];
                
                if (team.isFrozen) {
                    team.isFrozen = false; 
                    var statusElNode = document.getElementById('global-status');
                    if(statusElNode) {
                        statusElNode.innerHTML = `<span class="bg-blue-600/90 px-8 py-4 rounded-3xl border-4 border-blue-300 text-white drop-shadow-[0_0_20px_rgba(59,130,246,1)]">${team.config.name} BỊ ĐÓNG BĂNG! MẤT LƯỢT!</span>`;
                        statusElNode.classList.remove('hidden');
                        setTimeout(() => statusElNode.classList.add('hidden'), 2000);
                    }
                    window.playSound('defuse');
                    window.currentTurn = window.currentTurn === 'team1' ? 'team2' : 'team1';
                    setTimeout(checkStatusLoop, 2000);
                    return;
                }

                if (team.sleepTurns > 0) {
                    team.sleepTurns--;
                    window.updateStatusIcons(window.currentTurn);
                    var statusElNode = document.getElementById('global-status');
                    if(statusElNode) {
                        statusElNode.innerHTML = `<span class="bg-purple-600/90 px-8 py-4 rounded-3xl border-4 border-purple-300 text-white drop-shadow-[0_0_20px_rgba(147,51,234,1)]">${team.config.name} ĐANG NGỦ... (CÒN ${team.sleepTurns} LƯỢT)</span>`;
                        statusElNode.classList.remove('hidden');
                        setTimeout(() => statusElNode.classList.add('hidden'), 2000);
                    }
                    window.playSound('defuse');
                    window.currentTurn = window.currentTurn === 'team1' ? 'team2' : 'team1';
                    setTimeout(checkStatusLoop, 2000);
                    return;
                }

                window.updateTurnUI();
                window.currentHand.forEach(c => { if (!c.used) window.globalDeck.push(c); });
                window.currentHand = []; 
                window.globalDeck.sort(() => Math.random() - 0.5); 
                setTimeout(() => { window.isProcessingModal = false; window.drawCards(); }, 1000);
            }

            var doAction = function() {
                if (actionType === 'attack') {
                    window.shootProjectile(window.currentTurn, otherTurn, pType, () => {
                        window.processAttackTarget(otherTurn, 1,
                            () => { 
                                window.shootProjectile(otherTurn, window.currentTurn, pType, () => {
                                    window.applyHPChange(window.currentTurn, -1, true, true); window.triggerExplosion(window.currentTurn); finalize();
                                });
                            },
                            () => { window.triggerExplosion(otherTurn); finalize(); },
                            () => { finalize(); }
                        );
                    });
                } 
                else if (actionType === 'repair') {
                    window.triggerHeal(window.currentTurn);
                    window.applyHPChange(window.currentTurn, 1, false, true);
                    setTimeout(finalize, 1000);
                }
                else if (actionType === 'miss') {
                    if (currentTeam.shieldCount > 0) {
                        currentTeam.shieldCount = 0; window.triggerShieldBreak(window.currentTurn); window.playSound('defuse');
                    } else {
                        window.applyHPChange(window.currentTurn, -1, true, true); window.triggerExplosion(window.currentTurn);
                    }
                    setTimeout(finalize, window.EFFECT_SETTINGS.explosionDelayMs);
                }
                else if (actionType === 'skip') {
                    window.playSound('tick');
                    finalize();
                }
                else if (actionType === 'special_correct') {
                    var spec = cardObj.specialConfig;

                    if (spec.id === 'METRONOME') {
                        var availableSpecs = window.SPECIAL_CARDS_CONFIG.filter(c => c.id !== 'METRONOME' && c.id !== 'MIMIC');
                        spec = availableSpecs[Math.floor(Math.random() * availableSpecs.length)];
                        
                        var mm = document.getElementById('metronome-modal');
                        var mCardContainer = document.getElementById('metronome-card-container');
                        
                        var shortDescParsed = window.getParsedCardText(spec.shortDesc, spec.val, spec.val2);
                        
                        var cardHTML = `
                            <div class="w-full h-full relative transform-style-3d shadow-xl rounded-xl card-cover flex flex-col justify-center items-center p-2 border-[6px] bg-slate-800 special-aura" style="border-color: #fde047;">
                                <div class="w-[100%] h-[100%] bg-slate-100 rounded-lg shadow-inner flex flex-col items-center justify-center p-2 border-2 border-slate-300 relative overflow-hidden">
                                    <div class="text-6xl mb-2 filter drop-shadow-md">${spec.icon}</div>
                                    <h3 class="font-black text-xl tarot-font text-slate-800 uppercase text-center">${spec.name}</h3>
                                    <p class="text-sm font-bold text-rose-600 mt-2 text-center">${shortDescParsed}</p>
                                </div>
                            </div>
                        `;
                        mCardContainer.innerHTML = cardHTML;
                        
                        var lightning = document.createElement('div');
                        lightning.className = 'absolute inset-0 z-50 hidden items-center justify-center text-9xl pointer-events-none';
                        lightning.innerText = '⚡';
                        mCardContainer.appendChild(lightning);

                        if(mm) { mm.classList.remove('hidden'); mm.classList.add('flex'); }
                        window.playSound('tick');

                        setTimeout(() => {
                            window.playSound('boom');
                            lightning.classList.add('lightning-strike');
                            
                            setTimeout(() => {
                                if(mm) { mm.classList.add('hidden'); mm.classList.remove('flex'); }
                                
                                if (window.gameState.mimic.active && spec.id !== 'MIMIC') {
                                    window.gameState.mimic.active = false;
                                    pendingMimicAction = { spec: spec, caster: window.gameState.mimic.caster };
                                    window.updateStatusIcons('team1'); window.updateStatusIcons('team2');
                                }
                                window.executeSpecialSkill(window.currentTurn, otherTurn, spec, finalize);
                            }, 1000); 
                        }, 3000); 
                        return; // Prevent immediate execution
                    }

                    if (window.gameState.mimic.active && spec.id !== 'MIMIC') {
                        window.gameState.mimic.active = false;
                        pendingMimicAction = { spec: spec, caster: window.gameState.mimic.caster };
                        window.updateStatusIcons('team1'); window.updateStatusIcons('team2');
                    }

                    window.executeSpecialSkill(window.currentTurn, otherTurn, spec, finalize);
                }
            };

            // Thực thi
            checkPoisonAndExecute(doAction);
        };

        window.triggerWin = function(isTimeout = false) {
            if (window.isGameOver) return;
            window.isGameOver = true; 
            window.isProcessingModal = false;
            window.stopGameGlobalTimer(); 
            window.tempoMultiplier = 1.0; 
            window.playSound('win');
            
            var hp = document.getElementById('hand-panel');
            if(hp) hp.classList.add('hidden');
            
            var winText = ""; var winner = null;
            if (window.teams.team1.hp > window.teams.team2.hp) { winText = `${window.teams.team1.config.name} WINS! 🏆`; winner = 'team1'; }
            else if (window.teams.team2.hp > window.teams.team1.hp) { winText = `${window.teams.team2.config.name} WINS! 🏆`; winner = 'team2'; }
            else { winText = "IT'S A DRAW! 🤝"; }

            var statusElNode = document.getElementById('global-status');
            if(statusElNode) {
                statusElNode.innerHTML = `<span class="bg-slate-900/90 px-8 py-4 rounded-3xl border-4 border-yellow-500 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)]">${isTimeout?"TIME'S UP! ":""}${winText}</span>`;
                statusElNode.classList.remove('hidden');
            }

            if (winner) {
                var av = document.getElementById(`${winner}-avatar`); if(av) av.classList.add('avatar-bounce');
                var fw = document.getElementById(`${winner}-fireworks`); if(fw) { fw.classList.remove('hidden'); fw.classList.add('fireworks-active'); }
            } else {
                ['team1', 'team2'].forEach(t => { 
                    var fwNode = document.getElementById(`${t}-fireworks`);
                    if(fwNode) { fwNode.classList.remove('hidden'); fwNode.classList.add('fireworks-active'); }
                });
            }

            window.shootConfetti(); clearInterval(window.confettiInterval); window.confettiInterval = setInterval(window.shootConfetti, 2500);
        };

        window.shootConfetti = function() {
            var colors = ['#fde047', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'];
            for (var i = 0; i < 150; i++) {
                let conf = document.createElement('div'); 
                conf.className = 'absolute z-50 pointer-events-none';
                conf.style.position = 'fixed';
                conf.style.width = (Math.random() * 8 + 6) + 'px'; conf.style.height = (Math.random() * 12 + 6) + 'px'; conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                conf.style.left = Math.random() * 100 + 'vw'; conf.style.top = '-20px'; document.body.appendChild(conf);
                let dur = Math.random() * 3 + 2; let dly = Math.random() * 1.5;
                conf.animate([ { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 }, { transform: `translate3d(${Math.random()*300-150}px, calc(100vh + 50px), 0) rotate(${Math.random()*1080}deg)`, opacity: 0 } ], { duration: dur*1000, delay: dly*1000, fill: 'forwards' });
                setTimeout(() => conf.remove(), (dur + dly) * 1000);
            }
        };

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
    