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
            if(s1) s1.innerText = window.teams.team1.config.name;
            if(s2) s2.innerText = window.teams.team2.config.name;
        };

        window.openAvatarModal = function(teamId) {
            var modal = document.getElementById('avatar-modal');
            var grid = document.getElementById('avatar-grid');
            if(!modal || !grid) return;
            
            grid.innerHTML = '';
            window.POKEMON_TEAMS.forEach(p => {
                var btn = document.createElement('div');
                btn.className = "flex flex-col items-center justify-center bg-slate-700 hover:bg-slate-600 border-2 rounded-xl p-2 cursor-pointer transition-transform hover:scale-105";
                btn.style.borderColor = p.main;
                btn.innerHTML = `
                    <div class="w-16 h-16 md:w-24 md:h-24 mb-2">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.id}.png" class="w-full h-full object-contain filter drop-shadow-[0_0_8px_${p.main}]" alt="${p.name}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png'">
                    </div>
                    <span class="text-white font-bold text-[10px] md:text-xs text-center">${p.name}</span>
                `;
                btn.onclick = () => {
                    window.teams[teamId].config = p;
                    localStorage.setItem(`pokemonClashTeam${teamId === 'team1' ? '1' : '2'}`, JSON.stringify(p));
                    window.applyTheme(teamId);
                    window.updateTurnUI();
                    window.updateHPUI();
                    window.populateSelects();
                    modal.classList.add('hidden');
                    modal.classList.remove('flex');
                };
                grid.appendChild(btn);
            });
            
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        };

        // Close avatar modal
        document.getElementById('btn-close-avatar-modal')?.addEventListener('click', () => {
            var m = document.getElementById('avatar-modal');
            if(m) { m.classList.add('hidden'); m.classList.remove('flex'); }
        });
        
        window.applyTheme = function(teamKey) {
            var team = window.teams[teamKey];
            var base = document.getElementById(`${teamKey}-base`);
            if(base) {
                base.style.setProperty('--t-main', team.config.main); 
                base.style.setProperty('--t-rgb', team.config.rgb); 
            }
            
            var avatar = document.getElementById(`${teamKey}-avatar`);
            if(avatar) {
                avatar.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${team.config.id}.png`;
            }

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
            var fronts = [];
            var backs = [];
            
            for (var i=0; i<window.MAX_ROWS; i++) {
                var node0 = document.querySelector(`input[data-row="${i}"][data-col="0"]`);
                var node1 = document.querySelector(`input[data-row="${i}"][data-col="1"]`);
                var node2 = document.querySelector(`input[data-row="${i}"][data-col="2"]`);
                var node3 = document.querySelector(`input[data-row="${i}"][data-col="3"]`);
                var node4 = document.querySelector(`input[data-row="${i}"][data-col="4"]`);
                var node5 = document.querySelector(`input[data-row="${i}"][data-col="5"]`);

                if (!node0) break;

                var fId = node0.value.trim();
                var fWord = node1 ? node1.value.trim() : '';
                var bImgId = node2 ? node2.value.trim() : '';
                var bText = node3 ? node3.value.trim() : '';
                var fTime = node4 ? node4.value.trim() : '';
                var bTime = node5 ? node5.value.trim() : '';

                if (fId || fWord) {
                    fronts.push({ fId, fWord, fTime });
                    backs.push({ bImgId, bText, bTime });
                }
            }

            if (fronts.length === 0) {
                fronts = window.DEFAULT_JSON_DATA.map(item => ({ fId: item.fId, fWord: item.fWord, fTime: item.fTime || '' }));
                backs = window.DEFAULT_JSON_DATA.map(item => ({ bImgId: item.bImgId, bText: item.bText, bTime: item.bTime }));
            }

            backs.sort(() => Math.random() - 0.5);

            var baseData = fronts.map((front, index) => ({
                type: 'normal',
                fId: front.fId,
                fWord: front.fWord,
                fTime: front.fTime,
                bImgId: backs[index].bImgId,
                bText: backs[index].bText,
                bTime: backs[index].bTime
            }));

            if (baseData.length > 0) {
                window.globalDeck = [...baseData].sort(() => Math.random() - 0.5);
            }

            if (window.isSpecialModeActive && window.globalDeck.length > 0 && !window.SKILL_ON_MYSTIC_ONLY) {
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
            window.readCards = new Set();
            window.judgedCards = new Map(); // For Teacher Judgement (idx -> boolean)
            window.bonusDrawn = 0;
            
            var loopGuard = 0; 
            
            while (window.currentHand.length < window.CARDS_PER_TURN && loopGuard < 10) {
                loopGuard++;
                
                if (window.globalDeck.length === 0) {
                    window.buildDeck(); 
                }
                if (window.globalDeck.length === 0) break; 
                
                window.globalDeck.sort(() => Math.random() - 0.5);
                
                var tempDeck = [];
                var specialCount = window.currentHand.filter(c => c.isSpecial).length;

                while (window.currentHand.length < window.CARDS_PER_TURN && window.globalDeck.length > 0) {
                    var card = window.globalDeck.pop();
                    
                    if (card.isSpecial) {
                        var maxSkills = window.MAX_SKILLS_PER_TURN !== undefined && !isNaN(window.MAX_SKILLS_PER_TURN) ? window.MAX_SKILLS_PER_TURN : 2;
                        if (specialCount < maxSkills || loopGuard > 2) {
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
                window.renderSingleCard(cardObj, idx);
            });
            window.renderBonusButton();
            if (window.startReadTimer) window.startReadTimer();
        };

        window.renderBonusButton = function() {
            var handPanel = document.getElementById('active-hand');
            if(!handPanel || window.isGameOver || !window.MAX_BONUS_CARDS) return;
            
            var existingBtn = document.getElementById('bonus-card-btn');
            if (existingBtn) existingBtn.remove();
            
            if (!window.isSpecialModeActive) return;
            
            if (window.bonusDrawn >= window.MAX_BONUS_CARDS || window.globalDeck.length === 0) return;
            
            var btn = document.createElement('button');
            btn.id = 'bonus-card-btn';
            btn.className = "galaxy-bg relative h-full aspect-[4/5] rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-white shadow-[0_0_30px_rgba(139,92,246,0.6)] border-4 border-indigo-400/50 hover:scale-105 transition-transform shrink-0 cursor-pointer ml-2 md:ml-4 group";
            
            var frozenHtml = '';
            if (window.isSpecialModeActive && window.SKILL_ON_MYSTIC_ONLY) {
                frozenHtml = `<div id="mystic-frozen-overlay" class="absolute inset-0 bg-blue-400/50 backdrop-blur-[3px] z-20 rounded-xl md:rounded-2xl transition-all duration-700 pointer-events-none flex flex-col items-center justify-center border-2 border-white/40 shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] overflow-hidden">
                    <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/ice-pattern.png')] opacity-70"></div>
                    <span class="text-4xl md:text-5xl drop-shadow-[0_0_10px_rgba(255,255,255,1)] z-30">🧊</span>
                </div>`;
            } else {
                btn.classList.add('animate-bounce');
            }

            btn.innerHTML = `
                ${frozenHtml}
                <span class="text-4xl sm:text-5xl md:text-7xl mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] group-hover:scale-110 transition-transform">🎁</span>
                <span class="text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-widest text-center text-indigo-200 z-10" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8);">MYSTIC<br>BONUS</span>
            `;
            
            btn.addEventListener('click', () => {
                if (window.isGameOver || window.isGamePaused || window.isProcessingModal) return;
                if (!window.isGameStarted) {
                    if (window.GLOBAL_TIMER_ENABLED) window.startTimer();
                    else {
                        window.isGameStarted = true;
                        var gs = document.getElementById('global-status');
                        if (gs) gs.classList.add('hidden');
                    }
                }
                window.playSound('tick');
                window.bonusDrawn++;

                var card = { fId: '', fWord: 'MYSTIC BONUS', bImgId: '', bText: '⭐ MYSTIC BONUS ⭐', isSpecial: false, fTime: 0, bTime: 0 };
                
                if (window.isSpecialModeActive) {
                    card.isSpecial = true;
                    card.bText = '⭐ MYSTIC SKILL ⭐';
                    var pool = [];
                    window.dynamicSpecialCards.forEach(c => {
                        for(var i=0; i<c.count; i++) pool.push(c);
                    });
                    if (pool.length > 0) {
                        card.specialConfig = pool[Math.floor(Math.random() * pool.length)];
                    } else {
                        card.isSpecial = false;
                        card.bText = '⭐ MYSTIC BONUS ⭐';
                    }
                }

                if (card) {
                    var cardToPush = { ...card, used: false, uniqueId: Math.random().toString(36).substr(2, 9) };
                    window.currentHand.push(cardToPush);
                    var newIdx = window.currentHand.length - 1;
                    window.renderSingleCard(cardToPush, newIdx);

                    // Auto-judge and auto-open for pure bonus card
                    window.judgedCards.set(newIdx, true);
                    var rm = document.getElementById(`read-marker-${newIdx}`);
                    if (rm) {
                        rm.classList.replace('hidden', 'flex');
                        rm.classList.remove('bg-red-500');
                        rm.classList.add('bg-green-500');
                        rm.innerHTML = '✅';
                    }
                    var cards = document.querySelectorAll('#active-hand .card');
                    if (cards && cards[newIdx]) {
                        var inner = cards[newIdx].querySelector('.card-inner');
                        if (inner) inner.classList.add('shadow-[0_0_15px_rgba(34,197,94,0.8)]');
                    }

                    setTimeout(() => {
                        if (!window.isGameOver && !window.isGamePaused && !window.isProcessingModal && window.currentHand && window.currentHand[newIdx]) {
                            if (window.stopTurnTimer) window.stopTurnTimer();
                            window.playSound('flip');
                            window.openModal(cardToPush, newIdx);
                        }
                    }, 600);
                }
                window.updateBonusButton();
            });
            
            handPanel.appendChild(btn);
            setTimeout(() => btn.classList.remove('animate-bounce'), 1000);
            window.updateBonusButton();
        };

        window.updateBonusButton = function() {
            if (!window.isSpecialModeActive) return;
            var btn = document.getElementById('bonus-card-btn');
            if (!btn) return;
            
            var canShow = false;
            if (window.bonusDrawn < window.MAX_BONUS_CARDS && window.globalDeck.length > 0) {
                if (window.isSpecialModeActive && window.SKILL_ON_MYSTIC_ONLY) {
                    canShow = true; // Always show in hard mode, but it might be frozen
                    var total = window.currentHand.length;
                    var correct = 0;
                    for (var val of window.judgedCards.values()) {
                        if (val === true) correct++;
                    }
                    var overlay = document.getElementById('mystic-frozen-overlay');
                    if (overlay) {
                        var opacity = total > 0 ? 1 - (correct / total) : 1;
                        overlay.style.opacity = opacity;
                    }
                    if (correct === total && total > 0) {
                        btn.style.pointerEvents = 'auto';
                        btn.classList.add('animate-bounce');
                        if (overlay) overlay.style.display = 'none';
                    } else {
                        btn.style.pointerEvents = 'none';
                        btn.classList.remove('animate-bounce');
                        if (overlay) overlay.style.display = 'flex';
                    }
                } else {
                    canShow = true;
                    btn.style.pointerEvents = 'auto';
                }
            }
            
            if (canShow) {
                btn.classList.remove('hidden');
                btn.classList.add('flex');
            } else {
                btn.classList.add('hidden');
                btn.classList.remove('flex');
            }
        };

        window.renderSingleCard = function(cardObj, idx) {
            var handPanel = document.getElementById('active-hand');
            if(!handPanel) return;
            
            var existingBtn = document.getElementById('bonus-card-btn');
            
            var card = document.createElement('div'); card.className = 'card h-full aspect-[4/5] perspective cursor-pointer animate-bounce';
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
            var readMarker = `<div id="read-marker-${idx}" class="absolute -bottom-3 -right-3 w-8 h-8 md:w-10 md:h-10 bg-green-500 border-2 border-white rounded-full items-center justify-center text-white font-black text-sm md:text-xl shadow-lg z-[80] hidden transition-all duration-300">✅</div>`;

            inner.innerHTML = `
                ${numberBadge}
                ${starBadge}
                ${readMarker}
                <div class="absolute inset-0 backface-hidden rounded-xl card-cover flex flex-col justify-center items-center p-2 border-[4px] md:border-[6px] bg-slate-800 transition-all duration-300 ${extraClass}">
                    <div class="w-[100%] h-[100%] bg-white rounded-lg shadow-inner flex flex-col items-center justify-center p-1 border-2 border-slate-200 relative overflow-hidden">
                        ${content}
                    </div>
                </div>
                <div class="absolute inset-0 backface-hidden rotate-y-180 rounded-xl card-revealed bg-slate-200">
                </div>
            `;

            card.appendChild(inner);
            if (existingBtn) {
                handPanel.insertBefore(card, existingBtn);
            } else {
                handPanel.appendChild(card);
            }
            
            setTimeout(() => card.classList.remove('animate-bounce'), 1000);
            
            const markCard = (isCorrect) => {
                if (window.isGameOver || window.isGamePaused) return;
                if (!window.isGameStarted) { if (window.GLOBAL_TIMER_ENABLED) window.startTimer(); else { window.isGameStarted = true; document.getElementById('global-status').classList.add('hidden'); } }
                
                window.judgedCards.set(idx, isCorrect);
                
                var rm = document.getElementById(`read-marker-${idx}`);
                if (rm) {
                    rm.classList.replace('hidden', 'flex');
                    if (isCorrect) {
                        rm.classList.remove('bg-red-500'); rm.classList.add('bg-green-500');
                        rm.innerHTML = '✅';
                        card.classList.remove('opacity-50', 'grayscale');
                        inner.classList.add('shadow-[0_0_15px_rgba(34,197,94,0.8)]');
                        inner.classList.remove('shadow-[0_0_15px_rgba(239,68,68,0.8)]');
                    } else {
                        rm.classList.remove('bg-green-500'); rm.classList.add('bg-red-500');
                        rm.innerHTML = '❌';
                        card.classList.add('opacity-50', 'grayscale');
                        inner.classList.remove('shadow-[0_0_15px_rgba(34,197,94,0.8)]');
                        inner.classList.add('shadow-[0_0_15px_rgba(239,68,68,0.8)]');
                    }
                }
                
                card.classList.add('animate-pulse');
                setTimeout(() => card.classList.remove('animate-pulse'), 500);
                
                window.updateBonusButton();
                
                if (window.judgedCards.size === window.currentHand.length) {
                    if (window.stopTurnTimer) window.stopTurnTimer();
                    var allWrong = true;
                    for (var val of window.judgedCards.values()) {
                        if (val === true) { allWrong = false; break; }
                    }
                    if (allWrong) {
                        window.playSound('boom');
                        window.triggerMegaExplosion(window.currentTurn);
                        window.applyHPChange(window.currentTurn, -1, true, false);
                        
                        var statusElNode = document.getElementById('global-status');
                        if(statusElNode) {
                            statusElNode.innerHTML = `<span class="bg-red-600/90 px-8 py-4 rounded-3xl border-4 border-red-300 text-white drop-shadow-[0_0_20px_rgba(220,38,38,1)]">TẤT CẢ ĐỀU SAI! BÙM!</span>`;
                            statusElNode.classList.remove('hidden');
                            setTimeout(() => statusElNode.classList.add('hidden'), 2500);
                        }
                        
                        setTimeout(() => {
                            if (!window.isGameOver) { if(window.processNextTurn) window.processNextTurn(); }
                        }, 3000);
                    } else {
                        window.playSound('defuse'); 
                        if (!window.isSpecialModeActive) {
                            var correctIndices = [];
                            window.judgedCards.forEach((val, cIdx) => {
                                if (val === true) correctIndices.push(cIdx);
                            });
                            if (correctIndices.length > 0) {
                                var randomIdx = correctIndices[Math.floor(Math.random() * correctIndices.length)];
                                setTimeout(() => {
                                    if (!window.isGameOver && !window.isGamePaused && !window.isProcessingModal && window.currentHand && window.currentHand[randomIdx]) {
                                        window.openModal(window.currentHand[randomIdx], randomIdx);
                                    }
                                }, 800);
                            }
                        }
                    }
                } else {
                    window.playSound('tick');
                }
                window.updateBonusButton();
            };

            card.addEventListener('click', (e) => {
                if (!window.judgedCards.has(idx) || window.judgedCards.get(idx) === false) {
                    markCard(true);
                } else if (window.judgedCards.size < window.currentHand.length) {
                    card.classList.add('animate-shake');
                    setTimeout(() => card.classList.remove('animate-shake'), 500);
                } else if (window.judgedCards.get(idx) === true) {
                    window.playSound('flip');
                    window.openModal(cardObj, idx);
                }
            });

            card.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (window.judgedCards.get(idx) !== false) {
                    markCard(false);
                }
            });
        };


        window._fuseRemaining = 0;
        window._fuseTotal = 0;
        window._fuseRunning = false;

        window.updateFuseUI = function() {
            var fuseBar = document.getElementById('fuse-bar'); 
            var fuseText = document.getElementById('fuse-text');
            if (!fuseBar || !fuseText) return;
            var totalTime = window._fuseTotal || 1;
            var timeLeft = Math.max(0, window._fuseRemaining);
            const pct = (timeLeft / totalTime) * 100; 
            fuseBar.style.width = `${pct}%`; 
            fuseText.innerText = `${timeLeft.toFixed(1)}s`;
            if (pct < 30) { 
                fuseBar.classList.replace('bg-yellow-400', 'bg-red-500'); 
                if (Math.floor(timeLeft * 10) % 2 === 0) window.playSound('tick'); 
            } else if (pct < 60) { 
                fuseBar.classList.replace('bg-green-500', 'bg-yellow-400'); 
            }
        };

        window.openModal = function(cardObj, handIndex) {
            if (window.isProcessingModal || window.isGamePaused) return;
            if (window.stopTurnTimer) window.stopTurnTimer();
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
            window.bombInterval = null;
            var fuseContainer = document.getElementById('fuse-container'); 
            var fuseBar = document.getElementById('fuse-bar'); 
            var fuseText = document.getElementById('fuse-text');
            var timeLimit = parseFloat(cardObj.bTime) || 0;

            if (timeLimit > 0) {
                fuseContainer?.classList.remove('hidden'); 
                window._fuseTotal = timeLimit;
                window._fuseRemaining = timeLimit;
                window._fuseRunning = true;
                if(fuseBar) { fuseBar.style.width = '100%'; fuseBar.className = "h-full bg-green-500 transition-all duration-100 ease-linear ml-auto"; }
                if(fuseText) fuseText.innerText = `${window._fuseRemaining.toFixed(1)}s`;
                
                window.bombInterval = setInterval(() => {
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
            } else { 
                window._fuseRunning = false;
                window._fuseRemaining = 0;
                fuseContainer?.classList.add('hidden'); 
            }
            
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
                    var blindIcon = document.getElementById(targetId + '-icon-blind');
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
            window.bombInterval = null;
            window._fuseRunning = false;
            window._fuseRemaining = 0;
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
                            window.executeSpecialSkill(mCaster, mTarget, mSpec, window.processNextTurn);
                        }, 2000);
                    } else {
                        window.executeSpecialSkill(mCaster, mTarget, mSpec, window.processNextTurn);
                    }
                } else {
                    window.processNextTurn();
                }
            };

            window.processNextTurn = function() {
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

                window.checkStatusLoop();
            }

            window.checkStatusLoop = function() {
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
                    setTimeout(window.checkStatusLoop, 2000);
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
                    setTimeout(window.checkStatusLoop, 2000);
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
