const fs = require('fs');
let content = fs.readFileSync('js/logic.js', 'utf8');

content = content.replace(/card\.isSpecial = true;\s*card\.bText = '⭐ MYSTIC SKILL ⭐';/g, "card.isSpecial = true; card.isPureBonus = true;\n                    card.bText = '⭐ MYSTIC SKILL ⭐';");

content = content.replace(/if \(!bImgId && !bText\) {/g, "if (cardObj.isSpecial || (!bImgId && !bText)) {");

let origRenderSingleCard =             var extraClass = cardObj.isSpecial ? 'special-aura' : '';
            var content = '';
            if (window.DISPLAY_MODE.front === 'image') content = window.renderImages(cardObj.fId, 'Front-side');
            else if (window.DISPLAY_MODE.front === 'text') content = \\\<div class="w-full h-full flex items-center justify-center overflow-hidden" style="container-type: inline-size;">\\\</div>\\\;
            else {
                content = \\\
                    <div class="h-[70%] w-full flex items-center justify-center p-1">\\\</div>
                    <div class="h-[30%] w-full flex items-center justify-center rounded overflow-hidden mt-1" style="container-type: inline-size;">\\\</div>
                \\\;
            };

let newRenderSingleCard =             var extraClass = cardObj.isSpecial ? 'special-aura' : '';
            var content = '';
            if (cardObj.isPureBonus) {
                var team = window.teams[window.currentTurn];
                var pColor = team ? team.config.rgb : '139,92,246';
                var pId = team ? team.config.id : '25';
                var pokeUrl = \\\https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/\\\13796.png\\\;
                content = \\\
                <div class="w-full h-full rounded-lg flex flex-col items-center justify-center relative overflow-hidden galaxy-bg border border-indigo-500/50">
                    <img src="\\\" class="absolute left-[-20%] top-1/2 h-[80%] max-w-[50%] object-contain drop-shadow-[0_0_10px_rgba(\\\,0.8)] z-0 pointer-events-none opacity-80" style="transform: translateY(-50%);">
                    <img src="\\\" class="absolute right-[-20%] top-1/2 h-[80%] max-w-[50%] object-contain drop-shadow-[0_0_10px_rgba(\\\,0.8)] z-0 pointer-events-none opacity-80" style="transform: translateY(-50%) scaleX(-1);">
                    <div class="relative z-10 w-24 h-24 sm:w-32 sm:h-32 bg-white/90 backdrop-blur-sm rounded-full border-[6px] md:border-[10px] shadow-[0_0_30px_rgba(\\\,0.6)] flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-105" style="border-color: rgba(\\\, 0.8);">
                        <img src="assets/joy_logo.png" class="w-[90%] h-[90%] object-contain drop-shadow-lg">
                    </div>
                </div>\\\;
            }
            else if (window.DISPLAY_MODE.front === 'image') content = window.renderImages(cardObj.fId, 'Front-side');
            else if (window.DISPLAY_MODE.front === 'text') content = \\\<div class="w-full h-full flex items-center justify-center overflow-hidden" style="container-type: inline-size;">\\\</div>\\\;
            else {
                content = \\\
                    <div class="h-[70%] w-full flex items-center justify-center p-1">\\\</div>
                    <div class="h-[30%] w-full flex items-center justify-center rounded overflow-hidden mt-1" style="container-type: inline-size;">\\\</div>
                \\\;
            };
            
content = content.replace(origRenderSingleCard, newRenderSingleCard);
fs.writeFileSync('js/logic.js', content, 'utf8');
