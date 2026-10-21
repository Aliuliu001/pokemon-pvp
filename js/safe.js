/* ============================================================
   SafeStore — lớp chống mất game khi trình duyệt chặn localStorage
   (mở file:// trong Zalo, chế độ riêng tư, tiết kiệm dữ liệu...)
   Khi bị chặn, game tự chuyển sang bộ nhớ tạm trong RAM thay vì
   văng lỗi và chết trắng. Mọi dòng code khác đọc localStorage
   trực tiếp cũng an toàn nhờ "che" lại đối tượng localStorage.
   ============================================================ */
(function () {
    var real = null;
    var blocked = false;
    var mem = {};

    // Thử nắm localStorage thật (đọc thử 1 lần để biết có bị chặn không)
    try {
        real = window.localStorage;
        real.getItem('__probe__');
    } catch (e) {
        real = null;
        blocked = true;
    }

    function store() {
        if (real) {
            try {
                real.getItem('__probe__');
                return real;
            } catch (e) {
                blocked = true;
                real = null;
            }
        }
        return null;
    }

    var api = {
        getItem: function (k) {
            var s = store();
            if (s) {
                try {
                    var v = s.getItem(k);
                    if (v !== null) return v;
                } catch (e) { blocked = true; real = null; }
            }
            return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null;
        },
        setItem: function (k, v) {
            v = String(v);
            var s = store();
            if (s) {
                try {
                    s.setItem(k, v);
                    delete mem[k];
                    return;
                } catch (e) { blocked = true; real = null; }
            }
            mem[k] = v; // bị chặn / hết chỗ → giữ tạm trong RAM
        },
        removeItem: function (k) {
            delete mem[k];
            var s = store();
            if (s) { try { s.removeItem(k); } catch (e) { } }
        },
        clear: function () {
            mem = {};
            var s = store();
            if (s) { try { s.clear(); } catch (e) { } }
        },
        key: function (i) {
            var s = store();
            if (s) { try { return s.key(i); } catch (e) { } }
            return Object.keys(mem)[i] || null;
        },
        get length() {
            var s = store();
            if (s) { try { return s.length; } catch (e) { } }
            return Object.keys(mem).length;
        }
    };

    // Che lại localStorage trên window: các câu lệnh `localStorage.xxx`
    // trong game sẽ gọi vào bản an toàn này thay vì bản có thể ném lỗi.
    try {
        Object.defineProperty(window, 'localStorage', {
            value: api,
            configurable: true,
            writable: true,
            enumerable: true
        });
    } catch (e) { /* trình duyệt không cho che → vẫn còn window.SafeStore để dùng */ }

    window.SafeStore = api;
    window.storageIsBlocked = function () { return store() === null; };
})();
