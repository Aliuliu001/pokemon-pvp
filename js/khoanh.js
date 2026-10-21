/* ============================================================
   KOẢNH — Kho ảnh + Sao lưu/Khôi phục cho Pokemon Castle Battle
   (theo skill game-image-upload)
   - Nút 🖼️ Kho ảnh: thumbnail, đếm số ảnh + dung lượng, chọn nhiều, xóa
   - Làm sạch ID khi gõ (" 5 " -> 5, "12.PNG" -> 12)
   - Ô ID thiếu ảnh viền đỏ nhấp nháy
   - Nén ảnh thông minh: WebP + kiểm tra trong suốt, fallback PNG/JPEG,
     không bao giờ lưu bản to hơn file gốc
   - 💾 Sao lưu / 📂 Khôi phục JSON: bảng + cài đặt + TOÀN BỘ kho ảnh
   - Kéo thả ảnh vào khung cài đặt
   ============================================================ */
(function () {
    'use strict';

    var APP_MARK = 'pokemon-pvp';
    var POOL_KEY = 'pokemonClashImagePool'; // bản cũ trong localStorage (đã dời sang IndexedDB)

    function $(id) { return document.getElementById(id); }
    function esc(s) {
        return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function pool() { return window.imagesPool || (window.imagesPool = {}); }
    function status(msg, keep) {
        var el = $('upload-status');
        if (!el) return;
        el.classList.remove('hidden');
        el.innerText = msg;
        if (!keep) setTimeout(function () { el.classList.add('hidden'); }, 4000);
    }

    /* ---------------- 1. LÀM SẠCH ID ---------------- */
    function cleanId(v) {
        v = String(v == null ? '' : v).trim();
        v = v.replace(/\.(png|jpe?g|gif|webp|bmp|svg|avif|tiff?)$/i, '');
        v = v.replace(/\s+/g, ' ').trim();
        return v;
    }

    /* ---------------- 2. NÉN ẢNH THÔNG MINH ---------------- */
    function safeToDataURL(canvas, type, quality) {
        try {
            var url = canvas.toDataURL(type, quality);
            return (url && url.indexOf('data:image/') === 0) ? url : null;
        } catch (e) { return null; }
    }

    // Giải mã lại bản vừa nén: vùng trong suốt mà bị đục là hỏng -> bỏ WebP
    function verifyAlphaPreserved(dataUrl, srcAlpha, width, height) {
        return new Promise(function (resolve) {
            var img = new Image();
            img.onload = function () {
                try {
                    var c = document.createElement('canvas');
                    c.width = width; c.height = height;
                    var cx = c.getContext('2d');
                    cx.drawImage(img, 0, 0, width, height);
                    var out = cx.getImageData(0, 0, width, height).data;
                    var step = Math.max(4, Math.floor((srcAlpha.length / 4) / 3000) * 4);
                    for (var i = 3; i < srcAlpha.length; i += step) {
                        if (srcAlpha[i] < 10 && out[i] > 200) return resolve(false);
                    }
                    resolve(true);
                } catch (e) { resolve(false); }
            };
            img.onerror = function () { resolve(false); };
            img.src = dataUrl;
        });
    }

    function compress(file, maxSize, quality) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onerror = function () { resolve(null); };
            reader.onload = function (event) {
                var originalDataUrl = event.target.result;
                var img = new Image();
                img.onerror = function () { resolve(null); };
                img.onload = function () { resolve(compressDecoded(img, originalDataUrl, maxSize, quality)); };
                img.src = originalDataUrl;
            };
            reader.readAsDataURL(file);
        });
    }

    function compressDecoded(img, originalDataUrl, maxSize, quality) {
        return new Promise(function (resolve) {
            try {
                var width = img.width, height = img.height;
                if (!width || !height) return resolve(originalDataUrl);

                if (width > maxSize || height > maxSize) {
                    if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
                    else { width = Math.round(width * maxSize / height); height = maxSize; }
                }

                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Đọc kênh alpha THẬT trên từng pixel (không đoán theo tên file)
                var hasAlpha = false, srcAlpha = null;
                try {
                    srcAlpha = ctx.getImageData(0, 0, width, height).data;
                    for (var i = 3; i < srcAlpha.length; i += 4) {
                        if (srcAlpha[i] < 250) { hasAlpha = true; break; }
                    }
                } catch (e) { hasAlpha = true; }

                function pick(result) {
                    var out = result;
                    if (!out) {
                        out = hasAlpha
                            ? (safeToDataURL(canvas, 'image/png') || originalDataUrl)
                            : (safeToDataURL(canvas, 'image/jpeg', quality) || safeToDataURL(canvas, 'image/png') || originalDataUrl);
                    }
                    // Nén ra to hơn file gốc -> giữ file gốc, không bao giờ mất ảnh
                    if (out !== originalDataUrl && out.length > originalDataUrl.length) out = originalDataUrl;
                    resolve(out);
                }

                var webpUrl = safeToDataURL(canvas, 'image/webp', quality);
                if (webpUrl && webpUrl.indexOf('data:image/webp') === 0) {
                    if (!hasAlpha) return pick(webpUrl);                 // không có kênh trong suốt -> WebP an toàn
                    if (!srcAlpha) return pick(null);                    // không đọc được pixel -> về PNG
                    verifyAlphaPreserved(webpUrl, srcAlpha, width, height).then(function (pass) {
                        pick(pass ? webpUrl : null);                     // mất nền -> bỏ WebP, dùng PNG
                    });
                    return;
                }
                pick(null); // trình duyệt không nén WebP được -> PNG/JPEG
            } catch (e) {
                resolve(originalDataUrl);
            }
        });
    }

    /* ---------------- 3. GIAO DIỆN KHO ẢNH ---------------- */
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1073741824).toFixed(2) + ' GB';
    }

    function poolStats() {
        var p = pool(), ids = Object.keys(p), bytes = 0;
        for (var i = 0; i < ids.length; i++) bytes += String(p[ids[i]]).length;
        return { count: ids.length, bytes: bytes };
    }

    function sortedIds() {
        return Object.keys(pool()).sort(function (a, b) {
            var na = parseFloat(a), nb = parseFloat(b);
            var aNum = /^-?\d+(\.\d+)?$/.test(String(a).trim());
            var bNum = /^-?\d+(\.\d+)?$/.test(String(b).trim());
            if (aNum && bNum) return na - nb;
            if (aNum) return -1;
            if (bNum) return 1;
            return String(a).localeCompare(String(b));
        });
    }

    function updatePoolUI() {
        var s = poolStats();
        var c = $('image-pool-count'), z = $('image-pool-size');
        if (c) c.textContent = s.count + ' ảnh';
        if (z) z.textContent = '📦 ' + formatSize(s.bytes);
    }

    function renderGallery() {
        var grid = $('image-pool-gallery');
        if (!grid) return;
        var p = pool(), ids = sortedIds();
        if (!ids.length) {
            grid.innerHTML = '<p class="text-slate-400 text-xs col-span-full py-3 text-center">Chưa có ảnh nào. Dùng nút ' +
                '<b>Upload Files</b> / <b>Upload Folder</b> ở trên để thêm ảnh.</p>';
            return;
        }
        grid.innerHTML = ids.map(function (id) {
            return '<div class="pool-thumb" data-img-id="' + esc(id) + '" title="' + esc(id) + '">' +
                '<img src="' + p[id] + '" alt="' + esc(id) + '" loading="lazy">' +
                '<span class="pool-thumb-id">' + esc(id) + '</span>' +
                '<button type="button" class="pool-thumb-del" data-del="' + esc(id) + '" title="Xóa ảnh này">×</button>' +
                '</div>';
        }).join('');
    }

    // Đánh dấu ô ID chưa có ảnh (viền đỏ nhấp nháy)
    function checkMissingIds() {
        var p = pool(), missing = {};
        var inputs = document.querySelectorAll('#data-grid-body input[data-col="0"], #data-grid-body input[data-col="2"]');
        Array.prototype.forEach.call(inputs, function (inp) {
            var v = inp.value.trim();
            inp.classList.remove('img-id-missing');
            inp.removeAttribute('title');
            if (!v) return;
            if (/^(https?:|data:)/i.test(v)) return; // URL trực tiếp thì không cần kho
            if (!p[v]) {
                inp.classList.add('img-id-missing');
                inp.title = 'ID "' + v + '" chưa có ảnh trong kho';
                missing[v] = 1;
            }
        });
        var n = Object.keys(missing).length;
        var warn = $('missing-ids-warning');
        if (warn) {
            if (n > 0) { warn.classList.remove('hidden'); warn.textContent = '⚠️ ' + n + ' ô ID chưa có ảnh'; }
            else warn.classList.add('hidden');
        }
        return n;
    }

    // Vẽ lại ảnh xem trước ở 2 cột ID (không phải render lại bảng)
    function previewTag(id) {
        id = String(id || '').trim();
        if (!id) return '';
        var p = pool();
        if (p[id]) return '<img src="' + p[id] + '" class="w-6 h-6 object-contain pointer-events-none" alt="">';
        if (/^(https?:|data:)/i.test(id)) {
            return '<img src="' + esc(id) + '" class="w-6 h-6 object-contain pointer-events-none" onerror="this.style.display=\'none\'" alt="">';
        }
        return '';
    }

    function refreshPreviews() {
        var rows = Math.max(window.MAX_ROWS || 0, 0);
        for (var i = 0; i < rows; i++) {
            var in0 = document.querySelector('input[data-row="' + i + '"][data-col="0"]');
            var in2 = document.querySelector('input[data-row="' + i + '"][data-col="2"]');
            if (!in0) break;
            var cell0 = in0.parentNode ? in0.parentNode.querySelector('.preview-0') : null;
            if (cell0) cell0.innerHTML = previewTag(in0.value);
            var cell2 = in2 && in2.parentNode ? in2.parentNode.querySelector('.preview-2') : null;
            if (cell2) cell2.innerHTML = previewTag(in2.value);
        }
    }

    // Gọi sau MỌI thay đổi kho ảnh
    function onPoolChanged() {
        updatePoolUI();
        refreshPreviews();
        checkMissingIds();
        var gal = $('image-pool-panel');
        if (gal && !gal.classList.contains('hidden')) renderGallery();
        // Chỉ vẽ lại bộ bài khi ván CHƯA bắt đầu (đang chơi mà buildDeck sẽ xáo trộn ván)
        if (!window.isGameStarted && typeof window.buildDeck === 'function') window.buildDeck();
    }

    /* ---------------- 4. NHẬP ẢNH (kéo thả + nút chọn file) ---------------- */
    function ingestFiles(fileList, statusEl) {
        var files = Array.from(fileList || []);
        var bad = [], images = [];
        files.forEach(function (f) {
            if (f.type && f.type.indexOf('image/') === 0) images.push(f);
            else bad.push(f.name);
        });

        function say(msg, keep) {
            if (statusEl) {
                statusEl.classList.remove('hidden');
                statusEl.innerText = msg;
                if (!keep) setTimeout(function () { statusEl.classList.add('hidden'); }, 4000);
            } else status(msg, keep);
        }

        if (!images.length) {
            say('❌ Không tìm thấy ảnh nào. ' + (bad.length ? 'File không phải ảnh: ' + bad.slice(0, 5).join(', ') : ''), false);
            return Promise.resolve(0);
        }
        say('Đang xử lý 0 / ' + images.length + ' ảnh...', true);

        var idx = 0, failed = [];
        return (function step() {
            if (idx >= images.length) {
                var msg = '✅ Đã lưu ' + (images.length - failed.length) + ' / ' + images.length + ' ảnh.';
                if (bad.length) msg += ' Bỏ qua file không phải ảnh: ' + bad.slice(0, 5).join(', ') + (bad.length > 5 ? '…' : '');
                if (failed.length) msg += ' Lỗi: ' + failed.slice(0, 5).join(', ');
                say(msg, false);
                var saved = window.saveImagesToIndexedDB ? window.saveImagesToIndexedDB(pool()) : Promise.resolve();
                return saved.then(function () { onPoolChanged(); return images.length; }, function () { onPoolChanged(); return images.length; });
            }
            var file = images[idx];
            if (idx % 5 === 0) say('Đang xử lý ' + idx + ' / ' + images.length + ' ảnh...', true);
            idx++;
            var key = cleanId(file.name.replace(/\.[^.]+$/, '')) || cleanId(file.name);
            return compress(file, 1500, 0.9).then(function (dataUrl) {
                if (dataUrl) pool()[key] = dataUrl;
                else failed.push(file.name);
            }).catch(function () { failed.push(file.name); }).then(step);
        })();
    }

    /* ---------------- 5. SAO LƯU / KHÔI PHỤC JSON ---------------- */
    function readRows() {
        var rows = [], i;
        for (i = 0; i < (window.MAX_ROWS || 0); i++) {
            var g = function (c) {
                var n = document.querySelector('input[data-row="' + i + '"][data-col="' + c + '"]');
                return n ? n.value : '';
            };
            if (!document.querySelector('input[data-row="' + i + '"][data-col="0"]')) break;
            rows.push({ fId: g(0), fWord: g(1), bImgId: g(2), bText: g(3), fTime: g(4), bTime: g(5) });
        }
        return rows;
    }

    function val(id, dflt) {
        var el = $(id);
        var v = el ? el.value : null;
        return (v === null || v === '' || isNaN(v) && typeof dflt === 'number') ? dflt : v;
    }

    function backup() {
        var rows = readRows();
        var payload = {
            app: APP_MARK,
            version: 1,
            exportedAt: new Date().toISOString(),
            dataJSON: rows,
            settings: {
                frontMode: ($('setting-front-mode') || {}).value || 'both',
                backMode: ($('setting-back-mode') || {}).value || 'full',
                timerEnabled: ($('setting-timer-enabled') || {}).value === 'on',
                globalTime: (parseInt(($('setting-global-time') || {}).value, 10) || 15) * 60,
                hp1: parseInt(($('setting-hp-t1') || {}).value, 10) || 7,
                hp2: parseInt(($('setting-hp-t2') || {}).value, 10) || 7,
                cardsPerTurn: parseInt(($('setting-cards-per-turn') || {}).value, 10) || 3,
                maxBonus: parseInt(($('setting-max-bonus') || {}).value, 10),
                specialCards: window.dynamicSpecialCards,
                specialMode: !!window.isSpecialModeActive,
                skillMysticOnly: !!window.SKILL_ON_MYSTIC_ONLY,
                maxSkillsPerTurn: window.MAX_SKILLS_PER_TURN,
                customTeams: window.SafeStore.getItem('pokemonClashCustomTeams'),
                team1: window.SafeStore.getItem('pokemonClashTeam1'),
                team2: window.SafeStore.getItem('pokemonClashTeam2'),
                bgImage: window.SafeStore.getItem('pokemonClashBgImage'),
                bgmUrl: window.SafeStore.getItem('pokemonClashBgmUrl')
            },
            imagesPool: pool()
        };
        var json = JSON.stringify(payload);
        var sizeMB = (new Blob([json]).size / 1048576).toFixed(1);
        var blob = new Blob([json], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        var d = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
        a.download = 'pokemon-pvp-sao-luu-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '.json';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);

        var filled = rows.filter(function (r) { return r.fId || r.fWord || r.bImgId || r.bText; }).length;
        var st = poolStats();
        alert('✅ Đã tải bản sao lưu!\n\n• ' + filled + ' dòng bài học\n• ' + st.count + ' ảnh kho (' + formatSize(st.bytes) + ')\n• File: ' + sizeMB + 'MB\n\nAnh giữ file này ở chỗ an toàn (USB, Google Drive…). ' +
            'Máy bị dọn hay sang máy khác, bấm "📂 Khôi phục từ file" và chọn file này là mọi thứ trở lại.');
    }

    function applyRestored(payload) {
        // 1) Bảng + cài đặt -> localStorage
        window.SafeStore.setItem('pokemonClashDataJSON', JSON.stringify(payload.dataJSON || []));
        var s = payload.settings || {};
        window.SafeStore.setItem('pokemonClashDisplayMode', JSON.stringify({ front: s.frontMode || 'both', back: s.backMode || 'full' }));
        window.SafeStore.setItem('pokemonClashGlobalTime', String(s.globalTime || 180));
        window.SafeStore.setItem('pokemonClashTimerEnabled', String(!!s.timerEnabled));
        window.SafeStore.setItem('pokemonClashHp1', String(s.hp1 || 7));
        window.SafeStore.setItem('pokemonClashHp2', String(s.hp2 || 7));
        window.SafeStore.setItem('pokemonClashCardsPerTurn', String(s.cardsPerTurn || 3));
        if (!isNaN(s.maxBonus)) window.SafeStore.setItem('pokemonClashMaxBonus', String(s.maxBonus));
        if (s.specialCards) window.SafeStore.setItem('pokemonClashSpecialCards', JSON.stringify(s.specialCards));
        window.SafeStore.setItem('pokemonClashSpecialMode', String(!!s.specialMode));
        window.SafeStore.setItem('pokemonClashSkillMysticOnly', String(!!s.skillMysticOnly));
        if (!isNaN(s.maxSkillsPerTurn)) window.SafeStore.setItem('pokemonClashMaxSkillsPerTurn', String(s.maxSkillsPerTurn));
        ['customTeams', 'team1', 'team2', 'bgImage', 'bgmUrl'].forEach(function (k) {
            if (s[k] !== undefined && s[k] !== null) {
                window.SafeStore.setItem({ customTeams: 'pokemonClashCustomTeams', team1: 'pokemonClashTeam1', team2: 'pokemonClashTeam2', bgImage: 'pokemonClashBgImage', bgmUrl: 'pokemonClashBgmUrl' }[k], String(s[k]));
            }
        });

        // 2) Kho ảnh -> IndexedDB (xóa bản cũ trước để không sót ảnh lạ)
        window.imagesPool = payload.imagesPool || {};
        window.SafeStore.removeItem(POOL_KEY);
        var ready = window.clearIndexedDB ? window.clearIndexedDB() : Promise.resolve();
        return ready.then(function () {
            return window.saveImagesToIndexedDB ? window.saveImagesToIndexedDB(window.imagesPool) : Promise.resolve();
        });
    }

    function restore(file) {
        return Promise.resolve(file.text()).then(function (txt) {
            var payload;
            try { payload = JSON.parse(txt); } catch (e) {
                alert('❌ File này không đọc được.\n\nAnh chọn đúng file sao lưu ".json" do game tải về chưa ạ?');
                return;
            }
            if (!payload || payload.app !== APP_MARK || !Array.isArray(payload.dataJSON)) {
                alert('❌ Đây KHÔNG phải file sao lưu của game này.\n\nAnh chọn lại file ".json" do nút "💾 Tải bản sao lưu" tải về nhé.');
                return;
            }
            var rows = payload.dataJSON.filter(function (r) { return r && (r.fId || r.fWord || r.bImgId || r.bText); });
            var imgs = payload.imagesPool ? Object.keys(payload.imagesPool).length : 0;
            if (!confirm('📂 Khôi phục bản sao lưu ' + (payload.exportedAt ? String(payload.exportedAt).slice(0, 10) : '') + '?\n\n• ' + rows.length + ' dòng bài học\n• ' + imgs + ' ảnh kho\n\nMọi thứ HIỆN TẠI sẽ bị thay bằng nội dung trong file.')) return;

            status('Đang khôi phục...', true);
            applyRestored(payload).then(function () {
                status('✅ Khôi phục xong!', false);
                // Vẽ lại toàn bộ theo bản vừa khôi phục
                if (typeof window.loadData === 'function') window.loadData();
                else window.location.reload();
                setTimeout(function () { onPoolChanged(); }, 100);
                setTimeout(function () {
                    alert('✅ Khôi phục thành công!\n\n' + rows.length + ' dòng bài học + ' + imgs + ' ảnh đã trở lại.\nBảng và bộ bài đã được vẽ lại theo bản sao lưu.');
                }, 200);
            }).catch(function () {
                status('⚠️ Khôi phục bảng xong nhưng kho ảnh không lưu được (bộ nhớ trình duyệt có thể đã đầy).', false);
            });
        });
    }

    /* ---------------- 6. GẮN SỰ KIỆN ---------------- */
    function init() {
        var panel = $('image-pool-panel');
        var grid = $('image-pool-gallery');
        var btnToggle = $('btn-toggle-gallery');
        var btnClose = $('btn-close-gallery');
        var btnDelSel = $('btn-delete-selected');
        var selAll = $('gallery-select-all');
        var btnBackup = $('btn-backup');
        var btnRestore = $('btn-restore');
        var restoreInput = $('restore-file-input');

        if (btnToggle && panel) {
            btnToggle.addEventListener('click', function () {
                var opening = panel.classList.contains('hidden');
                panel.classList.toggle('hidden');
                if (opening) { renderGallery(); checkMissingIds(); updatePoolUI(); }
            });
        }
        if (btnClose && panel) btnClose.addEventListener('click', function () { panel.classList.add('hidden'); });

        if (grid) {
            grid.addEventListener('click', function (e) {
                var del = e.target.closest('.pool-thumb-del');
                if (del) {
                    var id = del.getAttribute('data-del');
                    if (confirm('Xóa ảnh ID "' + id + '" khỏi kho?')) {
                        delete pool()[id];
                        var save = window.saveImagesToIndexedDB ? window.saveImagesToIndexedDB(pool()) : Promise.resolve();
                        save.then(function () { onPoolChanged(); renderGallery(); });
                    }
                    return;
                }
                var thumb = e.target.closest('.pool-thumb');
                if (thumb) thumb.classList.toggle('selected');
            });
        }
        if (selAll && grid) {
            selAll.addEventListener('change', function () {
                Array.prototype.forEach.call(grid.querySelectorAll('.pool-thumb'), function (t) {
                    t.classList.toggle('selected', selAll.checked);
                });
            });
        }
        if (btnDelSel && grid) {
            btnDelSel.addEventListener('click', function () {
                var ids = Array.prototype.map.call(grid.querySelectorAll('.pool-thumb.selected'), function (t) {
                    return t.getAttribute('data-img-id');
                });
                if (!ids.length) { alert('Anh bấm chọn các ảnh muốn xóa trước (viền cam), rồi bấm lại nút này.'); return; }
                if (!confirm('Xóa ' + ids.length + ' ảnh đã chọn khỏi kho?')) return;
                ids.forEach(function (id) { delete pool()[id]; });
                var save = window.saveImagesToIndexedDB ? window.saveImagesToIndexedDB(pool()) : Promise.resolve();
                save.then(function () {
                    if (selAll) selAll.checked = false;
                    onPoolChanged(); renderGallery();
                });
            });
        }

        if (btnBackup) btnBackup.addEventListener('click', function () { try { backup(); } catch (e) { alert('❌ Không tạo được bản sao lưu: ' + e.message); } });
        if (btnRestore && restoreInput) {
            btnRestore.addEventListener('click', function () { restoreInput.click(); });
            restoreInput.addEventListener('change', function (e) {
                var f = e.target.files && e.target.files[0];
                e.target.value = '';
                if (f) restore(f);
            });
        }

        // Kéo thả ảnh vào khung cài đặt
        var dropZone = $('settings-dropzone') || $('settings-modal');
        if (dropZone) {
            ['dragenter', 'dragover'].forEach(function (ev) {
                dropZone.addEventListener(ev, function (e) {
                    if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') < 0) return;
                    e.preventDefault();
                    dropZone.classList.add('drop-active');
                });
            });
            ['dragleave', 'drop'].forEach(function (ev) {
                dropZone.addEventListener(ev, function (e) {
                    dropZone.classList.remove('drop-active');
                    if (ev === 'drop') {
                        e.preventDefault();
                        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                            ingestFiles(e.dataTransfer.files, $('upload-status'));
                        }
                    }
                });
            });
        }

        // Làm sạch ID ở 2 cột ID khi rời khỏi ô
        ['0', '2'].forEach(function (col) {
            document.addEventListener('change', function (e) {
                var t = e.target;
                if (!t || !t.matches || !t.matches('#data-grid-body input[data-col="' + col + '"]')) return;
                var cleaned = cleanId(t.value);
                if (cleaned !== t.value) {
                    t.value = cleaned;
                    t.dispatchEvent(new Event('input', { bubbles: true }));
                    if (window.autoSaveTableData) window.autoSaveTableData();
                }
                refreshPreviews();
                checkMissingIds();
            });
        });

        updatePoolUI();
        checkMissingIds();
        // Kho ảnh đọc xong IndexedDB (bất đồng bộ) -> cập nhật lại UI
        setTimeout(function () { onPoolChanged(); }, 400);
        setTimeout(function () { onPoolChanged(); }, 1500);
    }

    window.KhoAnh = {
        cleanId: cleanId,
        compress: compress,
        ingestFiles: ingestFiles,
        updatePoolUI: updatePoolUI,
        renderGallery: renderGallery,
        checkMissingIds: checkMissingIds,
        refreshPreviews: refreshPreviews,
        onPoolChanged: onPoolChanged,
        backup: backup,
        poolStats: poolStats,
        formatSize: formatSize
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
