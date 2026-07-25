const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ================= 📦 البيانات الأساسية (الـ 6 عطور) ================= */
let products = [
    { id: "1", name: "سوفاج (Sauvage)", price: 1200, stock: 8, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400" },
    { id: "2", name: "فيرزاتشي (Versace)", price: 950, stock: 5, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400" },
    { id: "3", name: "خمره (Khamrah)", price: 800, stock: 12, image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400" },
    { id: "4", name: "بلو دي شانيل (Bleu de Chanel)", price: 1500, stock: 3, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400" },
    { id: "5", name: "بلاك اوركيد (Black Orchid)", price: 1350, stock: 6, image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400" },
    { id: "6", name: "سترونجر ويز يو (Stronger With You)", price: 1100, stock: 4, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400" }
];

let orders = [
    { orderId: "ORD-102938", date: "2026-07-26", total: 2400, items: ["سوفاج (2x)"] }
];

/* ================= 🌐 الـ APIs والـ Backend ================= */

// جلب المنتجات
app.get('/api/products', (req, res) => {
    console.log('📡 [SERVER]: تم جلب قائمة العطور الـ 6');
    res.json(products);
});

// تسجيل دخول الأدمن
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    const u = (username || '').toString().trim();
    const p = (password || '').toString().trim();

    console.log(`🔑 [SERVER]: محاولة دخول بالأدمن -> User: "${u}", Pass: "${p}"`);

    if (u === 'admin' && p === '123456') {
        console.log('✅ [SERVER]: تم تسجيل دخول الأدمن بنجاح!');
        return res.json({ success: true, token: 'admin-auth-token-123' });
    } else {
        console.log('❌ [SERVER]: فشل الدخول - بيانات غير مطابقة');
        return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة السر غير صحيحة!' });
    }
});

// إحصائيات لوحة التحكم
app.get('/api/admin/stats', (req, res) => {
    const totalRev = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    res.json({
        revenue: totalRev,
        ordersCount: orders.length,
        productsCount: products.length
    });
});

// إضافة عطر جديد من اللوحة
app.post('/api/admin/products', (req, res) => {
    const { name, price, stock, image } = req.body;
    if (!name || !price) return res.status(400).json({ success: false, message: 'اكتب الاسم والسعر' });

    const newProd = { 
        id: Date.now().toString(), 
        name, 
        price: Number(price), 
        stock: Number(stock) || 10, 
        image: image || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400' 
    };
    products.push(newProd);
    console.log('➕ [SERVER]: تم إضافة عطر جديد من لوحة التحكم:', name);
    res.json({ success: true, product: newProd });
});

// حذف عطر من اللوحة
app.delete('/api/admin/products/:id', (req, res) => {
    products = products.filter(p => p.id !== req.params.id);
    console.log('🗑️ [SERVER]: تم حذف العطر رقم:', req.params.id);
    res.json({ success: true });
});

// تأكيد الشراء
app.post('/api/checkout', (req, res) => {
    const { items, total } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'السلة فارغة!' });

    let orderItems = [];
    items.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        if (prod) prod.stock = Math.max(0, prod.stock - item.qty);
        orderItems.push(`${item.name} (${item.qty}x)`);
    });

    const newOrder = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('ar-EG'),
        items: orderItems,
        total: Number(total)
    };
    orders.unshift(newOrder);
    console.log('🛍️ [SERVER]: طلب جديد برقم:', newOrder.orderId, 'بإجمالي:', total, 'ج.م');
    res.json({ success: true, message: 'تم تأكيد الطلب بنجاح!', orderId: newOrder.orderId });
});

/* ================= 🎨 الواجهة والتصميم المدمج بالكامل ================= */
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>المتجر الذكي برو - العطور</title>
        <style>
            :root { --primary: #2563eb; --bg: #f8fafc; --card-bg: rgba(255, 255, 255, 0.95); --text: #0f172a; --border: #e2e8f0; --radius: 16px; }
            body.dark-mode { --bg: #0f172a; --card-bg: rgba(30, 41, 59, 0.95); --text: #f8fafc; --border: #334155; }
            * { box-sizing: border-box; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; transition: background 0.3s, color 0.3s; }
            body { background: var(--bg); color: var(--text); padding-bottom: 50px; min-height: 100vh; position: relative; }

            nav { background: #0f172a; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; color: white; position: sticky; top: 0; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            nav button { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-left: 5px; font-weight: bold; }
            nav button.active { background: var(--primary); border-color: var(--primary); }

            .container { max-width: 950px; margin: 30px auto; padding: 0 20px; }
            .hidden { display: none !important; }

            .controls-bar { display: flex; gap: 10px; margin: 20px 0; }
            input, select { width: 100%; padding: 10px 14px; margin: 6px 0; border: 1px solid var(--border); border-radius: 8px; background: var(--card-bg); color: var(--text); outline: none; }

            .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px; }
            .product-card { background: var(--card-bg); border-radius: var(--radius); padding: 15px; border: 1px solid var(--border); text-align: center; position: relative; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .product-card img { width: 100%; height: 170px; object-fit: cover; border-radius: 10px; }
            .btn-main { width: 100%; padding: 10px; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 8px; }

            .cart-box { background: var(--card-bg); border-radius: var(--radius); border: 1px solid var(--border); padding: 20px; margin-top: 30px; }
            .badge-stock { position: absolute; top: 20px; right: 20px; background: #ef4444; color: white; font-size: 11px; padding: 3px 8px; border-radius: 10px; font-weight: bold; }
            
            .card { background: var(--card-bg); padding: 25px; border-radius: var(--radius); border: 1px solid var(--border); max-width: 600px; margin: 30px auto; }
            .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 15px 0; }
            .kpi { background: rgba(0,0,0,0.03); padding: 15px; border-radius: 10px; border: 1px solid var(--border); text-align: center; }
            .kpi-val { font-size: 22px; color: #10b981; font-weight: bold; margin-top: 5px; }
            .item-row { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(0,0,0,0.02); margin-top: 8px; border-radius: 8px; border: 1px solid var(--border); }
        </style>
    </head>
    <body>

        <nav>
            <h2>🛍️ المتجر الذكي PRO</h2>
            <div>
                <button type="button" id="btnTabStore" class="active" onclick="switchTab('store')">🛒 المتجر</button>
                <button type="button" id="btnTabAdmin" onclick="switchTab('admin')">🛠️ لوحة التحكم</button>
                <button type="button" onclick="toggleTheme()" id="tBtn">🌙</button>
            </div>
        </nav>

        <div class="container">
            <!-- 1. واجهة المتجر والمنتجات -->
            <div id="storeView">
                <div class="controls-bar">
                    <input type="text" id="sInput" oninput="filterProds()" placeholder="🔍 ابحث عن عطر...">
                    <select id="sSelect" onchange="filterProds()">
                        <option value="default">الترتيب الافتراضي</option>
                        <option value="low">السعر: من الأقل للأعلى</option>
                        <option value="high">السعر: من الأعلى للأقل</option>
                    </select>
                </div>
                <div id="pGrid" class="products-grid"></div>

                <div class="cart-box">
                    <h3>🛒 سلة الشراء</h3>
                    <div id="cItems" style="margin: 10px 0;">السلة فارغة حالياً.</div>
                    <h4>الإجمالي: <span id="cTotal">0</span> ج.م</h4>
                    <button class="btn-main" style="background: #10b981;" onclick="checkout()">تأكيد الشراء 💳</button>
                </div>
            </div>

            <!-- 2. تسجيل دخول الأدمن -->
            <div id="adminLogin" class="card hidden">
                <h3 style="text-align:center; margin-bottom: 15px;">🔐 دخول لوحة التحكم</h3>
                <label>اسم المستخدم:</label>
                <input type="text" id="aUser" value="admin" placeholder="admin">
                <label>كلمة السر:</label>
                <input type="password" id="aPass" value="123456" placeholder="123456">
                <button class="btn-main" type="button" onclick="login()">دخول اللوحة</button>
                <p id="lErr" style="color:#ef4444; text-align:center; margin-top:10px; font-weight:bold;"></p>
            </div>

            <!-- 3. لوحة تحكم الأدمن (Dashboard) -->
            <div id="adminDash" class="card hidden" style="max-width:750px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 15px;">
                    <h3>🛠️ لوحة التحكم الإدارية</h3>
                    <button type="button" onclick="logout()" style="background:#ef4444; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">خروج</button>
                </div>
                
                <div class="analytics-grid">
                    <div class="kpi"><span>إجمالي المبيعات</span><div id="kRev" class="kpi-val">0 ج.م</div></div>
                    <div class="kpi"><span>عدد الطلبات</span><div id="kOrd" class="kpi-val">0</div></div>
                    <div class="kpi"><span>أنواع العطور</span><div id="kProds" class="kpi-val">0</div></div>
                </div>

                <div style="margin-top:20px; background: rgba(0,0,0,0.02); padding: 15px; border-radius: 10px; border: 1px solid var(--border);">
                    <h4>➕ إضافة عطر جديد</h4>
                    <input type="text" id="pn" placeholder="اسم العطر">
                    <input type="number" id="pp" placeholder="السعر (ج.م)">
                    <input type="number" id="ps" placeholder="المخزون المتاح" value="10">
                    <input type="text" id="pi" placeholder="رابط صورة العطر (اختياري)">
                    <button class="btn-main" type="button" style="background:#10b981;" onclick="addP()">إضافة للمتجر فوراً</button>
                </div>

                <h4 style="margin-top:25px;">📦 العطور الحالية وتعديلها</h4>
                <div id="aList"></div>
            </div>
        </div>

        <script>
            let cart = [], allP = [];

            function toggleTheme() {
                document.body.classList.toggle('dark-mode');
                document.getElementById('tBtn').innerText = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
            }

            function switchTab(t) {
                document.getElementById('btnTabStore').classList.toggle('active', t === 'store');
                document.getElementById('btnTabAdmin').classList.toggle('active', t === 'admin');

                document.getElementById('storeView').classList.toggle('hidden', t !== 'store');
                
                const isLogged = !!localStorage.getItem('adminToken');
                document.getElementById('adminLogin').classList.toggle('hidden', t !== 'admin' || isLogged);
                document.getElementById('adminDash').classList.toggle('hidden', t !== 'admin' || !isLogged);

                if (t === 'store') loadStore();
                if (t === 'admin' && isLogged) loadAdmin();
            }

            async function loadStore() {
                try {
                    const res = await fetch('/api/products');
                    allP = await res.json();
                    render(allP);
                } catch(e) { console.error('خطأ في تحميل العطور:', e); }
            }

            function filterProds() {
                let q = document.getElementById('sInput').value.toLowerCase();
                let s = document.getElementById('sSelect').value;
                let f = allP.filter(p => p.name.toLowerCase().includes(q));
                if (s === 'low') f.sort((a,b) => a.price - b.price);
                if (s === 'high') f.sort((a,b) => b.price - a.price);
                render(f);
            }

            function render(list) {
                const g = document.getElementById('pGrid');
                g.innerHTML = '';
                if(!list || !list.length) {
                    g.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">لا توجد عطور متاحة حالياً.</p>';
                    return;
                }
                list.forEach(p => {
                    const badge = (p.stock <= 3 && p.stock > 0) ? \`<div class="badge-stock">متبقي \${p.stock}!</div>\` : '';
                    g.innerHTML += \`
                        <div class="product-card">
                            \${badge}
                            <img src="\${p.image}">
                            <h4 style="margin-top:10px;">\${p.name}</h4>
                            <p style="color:var(--primary); font-weight:bold; margin:6px 0;">\${p.price} ج.م</p>
                            <button class="btn-main" type="button" onclick="addToCart('\${p.id}')">إضافة للسلة 🛒</button>
                        </div>\`;
                });
            }

            function addToCart(id) {
                const item = allP.find(p => p.id === id);
                if(!item) return;
                const exist = cart.find(c => c.id === id);
                if (exist) exist.qty++; else cart.push({...item, qty: 1});
                renderCart();
            }

            function renderCart() {
                const box = document.getElementById('cItems');
                if (!cart.length) { box.innerHTML = 'السلة فارغة حالياً.'; document.getElementById('cTotal').innerText = '0'; return; }
                box.innerHTML = '';
                let tot = 0;
                cart.forEach(i => {
                    tot += i.price * i.qty;
                    box.innerHTML += \`<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>\${i.name} (\${i.qty}x)</span><span>\${i.price * i.qty} ج.م</span></div>\`;
                });
                document.getElementById('cTotal').innerText = tot;
            }

            async function checkout() {
                if (!cart.length) return alert('السلة فارغة!');
                const tot = cart.reduce((s, i) => s + (i.price * i.qty), 0);
                const res = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ items: cart, total: tot })
                });
                const data = await res.json();
                if (data.success) {
                    alert(\`🎉 \${data.message}\\nرقم الطلب: \${data.orderId}\`);
                    cart = []; renderCart(); loadStore();
                }
            }

            async function login() {
                document.getElementById('lErr').innerText = '';
                const u = document.getElementById('aUser').value;
                const p = document.getElementById('aPass').value;
                
                try {
                    const res = await fetch('/api/admin/login', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({ username: u, password: p })
                    });
                    const d = await res.json();
                    if (d.success) {
                        localStorage.setItem('adminToken', d.token);
                        switchTab('admin');
                    } else {
                        document.getElementById('lErr').innerText = d.message;
                    }
                } catch(e) {
                    document.getElementById('lErr').innerText = 'حدث خطأ في الاتصال بالسيرفر!';
                }
            }

            function logout() { localStorage.removeItem('adminToken'); switchTab('admin'); }

            async function loadAdmin() {
                const res = await fetch('/api/admin/stats');
                const d = await res.json();
                document.getElementById('kRev').innerText = d.revenue + ' ج.م';
                document.getElementById('kOrd').innerText = d.ordersCount;
                document.getElementById('kProds').innerText = d.productsCount;
                
                const pRes = await fetch('/api/products');
                const prods = await pRes.json();
                const list = document.getElementById('aList');
                list.innerHTML = '';
                prods.forEach(p => {
                    list.innerHTML += \`<div class="item-row">
                        <span><b>\${p.name}</b> - \${p.price} ج.م (المخزون: \${p.stock})</span>
                        <button type="button" onclick="delP('\${p.id}')" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer;">حذف</button>
                    </div>\`;
                });
            }

            async function addP() {
                const name = document.getElementById('pn').value;
                const price = document.getElementById('pp').value;
                if(!name || !price) return alert('أدخل الاسم والسعر!');

                await fetch('/api/admin/products', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, price, stock: document.getElementById('ps').value, image: document.getElementById('pi').value })
                });
                document.getElementById('pn').value = '';
                document.getElementById('pp').value = '';
                document.getElementById('pi').value = '';
                loadAdmin();
            }

            async function delP(id) {
                await fetch('/api/admin/products/' + id, { method: 'DELETE' });
                loadAdmin();
            }

            // تشغيل تلقائي
            window.addEventListener('DOMContentLoaded', () => {
                loadStore();
            });
        </script>
    </body>
    </html>
    `);
});

/* ================= 🚀 تشغيل السيرفر ================= */
app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 السيرفر المدمج شغال وجاهز على: http://localhost:${PORT}`);
    console.log(`🔑 بيانات دخول الأدمن: اليوزر -> admin | الباسورد -> 123456`);
    console.log(`==================================================`);
});