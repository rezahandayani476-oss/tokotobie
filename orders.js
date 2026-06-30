/* ============================================
   orders.js – Order Management & Reviews
============================================ */
const Orders = {
  KEY: 'tc_orders',

  getAll() { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); },
  save(orders) { localStorage.setItem(this.KEY, JSON.stringify(orders)); },

  getUserOrders() {
    const user = Auth.current();
    if (!user) return [];
    return this.getAll().filter(o => o.userId === user.id);
  },

  getOrder(orderId) { return this.getAll().find(o => o.id === orderId); },

  place() {
    const user = Auth.current();
    if (!user) { App.openAuth(); return; }
    const checked = Cart.getChecked();
    if (!checked.length) { showToast('Keranjang kosong','error'); return; }
    const { sub, disc, shipPrice, total } = Checkout.getTotal();
    const coupon = Cart.getAppliedCoupon();
    const orderId = 'TBC' + Date.now();
    const order = {
      id: orderId,
      userId: user.id,
      userName: user.name,
      items: checked,
      address: Checkout.address,
      shipping: Checkout.shipping,
      payment: Checkout.payment,
      coupon: coupon,
      subtotal: sub,
      discount: disc,
      shippingCost: shipPrice,
      total,
      status: Checkout.payment === 'cod' ? 'confirmed' : 'pending',
      createdAt: new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }),
      resi: null,
      reviews: []
    };
    const all = this.getAll();
    all.unshift(order);
    this.save(all);
    // Remove ordered items from cart
    const remaining = Cart.get().filter(i => !checked.find(c=>c.key===i.key));
    Cart.save(remaining);
    Cart.clearCoupon();
    // Show success page
    this.renderSuccessPage(order);
    App.navigate('order-success');
    showToast(`Pesanan ${orderId} berhasil dibuat! 🎉`,'success');
  },

  renderSuccessPage(order) {
    const idEl = document.getElementById('success-order-id');
    if (idEl) idEl.textContent = `Nomor Pesanan: ${order.id}`;
    const infoEl = document.getElementById('success-payment-info');
    if (!infoEl) return;
    if (order.payment === 'cod') {
      infoEl.innerHTML = `
        <div class="pi-title">🏠 Pembayaran COD</div>
        <div class="pi-row"><span class="pi-lbl">Metode</span><span class="pi-val">Bayar di Tempat (COD)</span></div>
        <div class="pi-row"><span class="pi-lbl">Total</span><span class="pi-val">${formatRp(order.total)}</span></div>
        <div class="pi-row"><span class="pi-lbl">Jasa Kirim</span><span class="pi-val">${order.shipping.name}</span></div>
        <p class="pi-note">✓ Pesanan dikonfirmasi. Siapkan uang pas saat kurir tiba. Estimasi pengiriman: ${order.shipping.eta}.</p>`;
    } else if (order.payment === 'qris') {
      infoEl.innerHTML = `
        <div class="pi-title">📱 Pembayaran QRIS</div>
        <div class="pi-row"><span class="pi-lbl">Nominal</span><span class="pi-val" style="color:var(--gold)">${formatRp(order.total)}</span></div>
        <div class="pi-row"><span class="pi-lbl">Berlaku sampai</span><span class="pi-val">24 jam</span></div>
        <div style="text-align:center;padding:20px;background:var(--bg-card);border-radius:8px;margin-top:12px">
          <div style="width:160px;height:160px;background:#fff;margin:0 auto;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:12px;color:#333;border:2px solid var(--gold)">📱 QRIS<br/>Tobiee Collection</div>
          <p style="font-size:11px;color:var(--text-m);margin-top:8px">Scan dengan GoPay, OVO, DANA, ShopeePay, dll.</p>
        </div>
        <p class="pi-note">Setelah membayar, pesanan Anda akan otomatis dikonfirmasi dalam 5-10 menit.</p>`;
    } else {
      const bankInfo = {
        bca: { name:'Bank BCA', no:'0123-4567-89', an:'Tobiee Collection' },
        mandiri: { name:'Bank Mandiri', no:'1234-5678-90', an:'Tobiee Collection' },
        bni: { name:'Bank BNI', no:'9876-5432-10', an:'Tobiee Collection' },
        bri: { name:'Bank BRI', no:'0101-2345-6789', an:'Tobiee Collection' }
      };
      const info = bankInfo[order.payment] || bankInfo.bca;
      infoEl.innerHTML = `
        <div class="pi-title">🏦 Transfer ${info.name}</div>
        <div class="pi-row"><span class="pi-lbl">Nomor Rekening</span><div style="display:flex;align-items:center;gap:8px"><span class="pi-val">${info.no}</span><button class="pi-copy" onclick="copyText('${info.no}')">Salin</button></div></div>
        <div class="pi-row"><span class="pi-lbl">Atas Nama</span><span class="pi-val">${info.an}</span></div>
        <div class="pi-row"><span class="pi-lbl">Nominal</span><div style="display:flex;align-items:center;gap:8px"><span class="pi-val" style="color:var(--gold)">${formatRp(order.total)}</span><button class="pi-copy" onclick="copyText('${order.total}')">Salin</button></div></div>
        <div class="pi-row"><span class="pi-lbl">Kode Unik</span><span class="pi-val" style="color:var(--gold)">${formatRp(order.total)} (sesuaikan nominal)</span></div>
        <div class="pi-row"><span class="pi-lbl">No. Pesanan</span><span class="pi-val">${order.id}</span></div>
        <p class="pi-note">⚠️ Transfer sesuai nominal. Pembayaran otomatis terkonfirmasi 1×24 jam. Hubungi WA kami jika ada pertanyaan.</p>`;
    }
  },

  // ── Orders List Page ──
  renderOrdersPage(statusFilter='all') {
    const el = document.getElementById('orders-list');
    if (!el) return;
    if (!Auth.current()) {
      el.innerHTML = `<div class="orders-empty"><span class="es-icon">🔐</span><h3>Login Diperlukan</h3><p>Masuk untuk melihat pesanan Anda</p><button class="btn-pri" onclick="App.openAuth()">Masuk Sekarang</button></div>`;
      return;
    }
    let orders = this.getUserOrders();
    if (statusFilter !== 'all') orders = orders.filter(o => o.status === statusFilter);
    if (!orders.length) {
      el.innerHTML = `<div class="orders-empty"><span class="es-icon">📦</span><h3>Belum Ada Pesanan</h3><p>${statusFilter==='all'?'Yuk mulai belanja di Tobiee Collection!':'Tidak ada pesanan dengan status ini'}</p><button class="btn-pri" data-page="store">Mulai Belanja</button></div>`;
      el.querySelector('[data-page]')?.addEventListener('click',()=>App.navigate('store'));
      return;
    }
    const statusMap = { pending:'Menunggu Pembayaran', confirmed:'Dikonfirmasi', processing:'Diproses', shipped:'Dikirim', done:'Selesai', cancelled:'Dibatalkan' };
    el.innerHTML = orders.map(order=>`
      <div class="order-card" id="oc-${order.id}">
        <div class="oc-header">
          <div><div class="oc-id">📦 ${order.id}</div><div class="oc-date">${order.createdAt}</div></div>
          <span class="oc-status status-${order.status}">${statusMap[order.status]||order.status}</span>
        </div>
        ${order.resi ? `<div class="oc-track"><div class="oc-track-label">Nomor Resi ${order.shipping?.name||''}:</div><div class="oc-resi">${order.resi}</div></div>` : ''}
        <div class="oc-items">
          ${order.items.map(i=>`
            <div class="oc-item">
              <div class="oc-item-img"><img src="${i.img}" onerror="this.src='hero_banner.jpg'"/></div>
              <div class="oc-item-info"><div class="oc-item-name">${i.name}</div><div class="oc-item-var">Ukuran: ${i.size} × ${i.qty}</div></div>
              <div class="oc-item-price">${formatRp(i.price*i.qty)}</div>
            </div>`).join('')}
        </div>
        <div class="oc-footer">
          <div class="oc-total"><span>Total: </span><b>${formatRp(order.total)}</b> <span style="font-size:11px">(${order.shipping?.name||''})</span></div>
          <div class="oc-actions">
            ${order.status==='pending'?`<button class="btn-oc-action btn-oc-cancel" onclick="Orders.cancel('${order.id}')">Batalkan</button>`:''}
            ${order.status==='done'?`<button class="btn-oc-action btn-oc-review" onclick="Orders.openReview('${order.id}')">Beri Ulasan</button>`:''}
            <button class="btn-oc-action btn-oc-rebuy" onclick="Orders.rebuy('${order.id}')">Beli Lagi</button>
          </div>
        </div>
      </div>`).join('');
    // Demo: auto-advance status after a delay
    this.simulateStatusUpdates(orders);
  },

  simulateStatusUpdates(orders) {
    // For demo purposes, advance "confirmed" orders to "processing" -> "shipped" -> "done" over time
    // In real app this would be server-driven
  },

  cancel(orderId) {
    if (!confirm('Batalkan pesanan ini?')) return;
    const all = this.getAll();
    const order = all.find(o=>o.id===orderId);
    if (order && order.status==='pending') {
      order.status = 'cancelled';
      this.save(all);
      showToast('Pesanan berhasil dibatalkan','info');
      this.renderOrdersPage();
    }
  },

  rebuy(orderId) {
    const order = this.getOrder(orderId);
    if (!order) return;
    order.items.forEach(i => Cart.addToCart(i.prodId, i.name, i.price, i.img, i.size, i.qty));
    showToast('Produk ditambahkan ke keranjang 🛍️','success');
    App.navigate('cart');
  },

  openReview(orderId) {
    const order = this.getOrder(orderId);
    if (!order) return;
    const modal = document.getElementById('review-modal');
    const prodInfo = document.getElementById('rev-prod-info');
    prodInfo.innerHTML = order.items.map(i=>`
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <img src="${i.img}" style="width:40px;height:50px;object-fit:cover;border-radius:4px;border:1px solid var(--border)" onerror="this.src='hero_banner.jpg'"/>
        <span>${i.name} (${i.size})</span>
      </div>`).join('');
    modal._orderId = orderId;
    modal._rating = 5;
    document.querySelectorAll('.si').forEach(s=>s.classList.add('active'));
    modal.classList.add('open');
  },

  submitReview(orderId, rating, text) {
    const order = this.getOrder(orderId);
    if (!order) return;
    const user = Auth.current();
    const all = this.getAll();
    const o = all.find(x=>x.id===orderId);
    if (!o) return;
    o.reviews = o.reviews || [];
    o.reviews.push({ user: user.name, rating, text, date: new Date().toLocaleDateString('id-ID'), prodIds: o.items.map(i=>i.prodId) });
    o.status = 'done';
    this.save(all);
    showToast('Ulasan berhasil dikirim! ⭐','success');
  },

  getReviewsForProduct(prodId) {
    const all = this.getAll();
    const reviews = [];
    all.forEach(o => {
      (o.reviews||[]).forEach(r => {
        if (r.prodIds && r.prodIds.includes(+prodId)) reviews.push(r);
      });
    });
    return reviews;
  }
};

function copyText(text) {
  navigator.clipboard.writeText(String(text)).then(()=>showToast('Disalin ke clipboard ✓','success'));
}
