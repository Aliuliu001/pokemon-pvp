(function() {
    if (typeof window !== 'undefined') {
        window.imagesPool = {};
        try {
            var storedPool = localStorage.getItem('pokemonClashImagePool');
            if (storedPool) window.imagesPool = JSON.parse(storedPool);
        } catch(e) { console.warn("Failed to parse imagesPool", e); }
        
        window.applyBackground = function() {
            var savedBg = localStorage.getItem("pokemonClashBgImage");
            if (savedBg && savedBg.trim() !== "") {
                document.body.style.backgroundImage = "url(" + savedBg + ")";
                return;
            }
            var bgExtensions = ["jpg", "png", "jpeg", "gif", "webp"];
            var bgFound = false;
            for (var i = 0; i < bgExtensions.length; i++) {
                var ext = bgExtensions[i];
                var img = new Image();
                img.onload = (function(e) {
                    return function() {
                        if (!bgFound) {
                            document.body.style.backgroundImage = "url(background." + e + ")";
                            bgFound = true;
                        }
                    };
                })(ext);
                img.src = "background." + ext;
            }
        };
        window.applyBackground();

    

        var escapeHTML = function(str) {
            return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        };

        window.MAX_ROWS = 100;       
        window.TEAM1_MAX_HP = 7;
        window.CARDS_PER_TURN = parseInt(localStorage.getItem("pokemonClashCardsPerTurn")) || 3;
        window.MAX_BONUS_CARDS = parseInt(localStorage.getItem("pokemonClashMaxBonus"));
        if(isNaN(window.MAX_BONUS_CARDS)) window.MAX_BONUS_CARDS = 1;
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
