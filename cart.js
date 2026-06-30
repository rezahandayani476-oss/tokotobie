/* ============================================
   cart.js – Cart, Coupon & Checkout
============================================ */
const Cart = {
  KEY: 'tc_cart',
  couponKey: 'tc_coupon',

  get() { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); },
  save(items) { localStorage.setItem(this.KEY, JSON.stringify(items)); Cart.updateBadges(); Cart.renderDrawer(); },
  clear() { localStorage.setItem(this.KEY, '[]'); localStorage.removeItem(this.couponKey); Cart.updateBadges(); Cart.renderDrawer(); },

  getAppliedCoupon() { return JSON.parse(localStorage.getItem(this.couponKey) || 'null'); },
  setAppliedCoupon(c) { localStorage.setItem(this.couponKey, JSON.stringify(c)); },
  clearCoupon() { localStorage.removeItem(this.couponKey); },

  addToCart(prodId, name, price, img, size, qty=1) {
    if (!Auth.current()) { Auth.postLoginAction = ()=>Cart.addToCart(prodId,name,price,img,size,qty); App.openAuth(); return; }
    const items = this.get();
    const key = `${prodId}-${size}`;
    const ex = items.find(i => i.key === key);
    if (ex) ex.qty = Math.min(ex.qty + qty, 99);
    else items.push({ key, prodId, name, price, img, size, qty, checked: true });
    this.save(items);
    showToast(`${name} (${size}) ditambahkan ke keranjang 🛍️`,'success');
    openCartDrawer();
  },

  addFromCard(prodId) {
    if (!Auth.current()) { App.openAuth(); return; }
    const prod = getProduct(prodId);
    if (!prod) return;
    const size = prod.sizes[0];
    this.addToCart(prodId, prod.name, prod.price, prod.images[0], size, 1);
  },

  buyNow(prodId) {
    if (!Auth.current()) { App.openAuth(); return; }
    const prod = getProduct(prodId);
    if (!prod) return;
    this.addFromCard(prodId);
    setTimeout(()=>App.navigate('checkout'), 300);
  },

  remove(key) {
    const items = this.get().filter(i => i.key !== key);
    this.save(items);
    if (document.getElementById('page-cart').classList.contains('active')) Cart.renderCartPage();
  },

  updateQty(key, delta) {
    const items = this.get();
    const item = items.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, Math.min(item.qty + delta, 99));
    this.save(items);
    if (document.getElementById('page-cart').classList.contains('active')) Cart.renderCartPage();
  },

  setQty(key, val) {
    const items = this.get();
    const item = items.find(i => i.key === key);
    if (!item) return;
    item.qty = Math.max(1, Math.min(parseInt(val)||1, 99));
    this.save(items);
  },

  toggleCheck(key, checked) {
    const items = this.get();
    const item = items.find(i => i.key === key);
    if (item) item.checked = checked;
    this.save(items);
    Cart.renderCartPage();
  },

  toggleAll(checked) {
    const items = this.get().map(i => ({ ...i, checked }));
    this.save(items);
    Cart.renderCartPage();
  },

  deleteSelected() {
    const items = this.get().filter(i => !i.checked);
    this.save(items);
    Cart.renderCartPage();
  },

  getChecked() { return this.get().filter(i => i.checked); },

  subtotal() { return this.getChecked().reduce((s,i) => s+i.price*i.qty, 0); },

  applyDiscount(subtotal, coupon) {
    if (!coupon) return 0;
    if (coupon.type === 'percent') return Math.round(subtotal * coupon.value / 100);
    if (coupon.type === 'flat') return Math.min(coupon.value, subtotal);
    return 0;
  },

  updateBadges() {
    const items = this.get();
    const total = items.reduce((s,i)=>s+i.qty,0);
    const el = document.getElementById('cart-count');
    const cd = document.getElementById('cd-count');
    if (el) el.textContent = total;
    if (cd) cd.textContent = items.length;
  },

  // ── Cart Page ──
  renderCartPage() {
    const items = this.get();
    const listEl = document.getElementById('cart-items-list');
    if (!listEl) return;
    const allChecked = items.length > 0 && items.every(i=>i.checked);
    document.getElementById('cart-select-all').checked = allChecked;

    if (!items.length) {
      listEl.innerHTML = `<div class="cart-empty-state"><div class="es-icon">🛒</div><h3>Keranjang Kosong</h3><p>Yuk, mulai belanja!</p><button class="btn-pri" data-page="store">Lihat Koleksi</button></div>`;
      document.querySelector('#cart-items-list [data-page="store"]')?.addEventListener('click',()=>App.navigate('store'));
    } else {
      listEl.innerHTML = items.map(item=>`
        <div class="cart-item-row" id="ci-${item.key.replace(/[^a-z0-9]/gi,'_')}">
          <div class="ci-check"><input type="checkbox" ${item.checked?'checked':''} onchange="Cart.toggleCheck('${item.key}',this.checked)"/></div>
          <div class="ci-img"><img src="${item.img}" alt="${item.name}" onerror="this.src='hero_banner.jpg'"/></div>
          <div class="ci-info">
            <div class="ci-name">${item.name}</div>
            <div class="ci-variant">Ukuran: ${item.size}</div>
            <div class="ci-qty-ctrl">
              <button class="ci-qty-btn" onclick="Cart.updateQty('${item.key}',-1)">−</button>
              <input class="ci-qty-val" type="number" value="${item.qty}" min="1" max="99" onchange="Cart.setQty('${item.key}',this.value)" onblur="Cart.renderCartPage()"/>
              <button class="ci-qty-btn" onclick="Cart.updateQty('${item.key}',1)">+</button>
            </div>
          </div>
          <div class="ci-price">
            <div class="ci-price-total">${formatRp(item.price*item.qty)}</div>
            <div class="ci-price-unit">${formatRp(item.price)} / pcs</div>
          </div>
          <button class="ci-del" onclick="Cart.remove('${item.key}')" title="Hapus">✕</button>
        </div>`).join('');
    }
    this.renderCartSummary();
    this.renderAvailCoupons();
  },

  renderCartSummary() {
    const sub = this.subtotal();
    const coupon = this.getAppliedCoupon();
    const disc = this.applyDiscount(sub, coupon);
    const total = sub - disc;
    document.getElementById('sum-subtotal').textContent = formatRp(sub);
    document.getElementById('sum-total').textContent = formatRp(total);
    const discRow = document.getElementById('sum-disc-row');
    if (disc > 0) { discRow.style.display='flex'; document.getElementById('sum-disc').textContent=`- ${formatRp(disc)}`; }
    else discRow.style.display='none';
  },

  renderAvailCoupons() {
    const el = document.getElementById('avail-coupons');
    if (!el) return;
    el.innerHTML = `<p class="ac-title">🏷️ Kupon Tersedia:</p>` + COUPONS.map(c=>`
      <div class="ac-item" onclick="Cart.useCoupon('${c.code}')">
        <div><div class="ac-code">${c.code}</div><div class="ac-desc">${c.desc}</div></div>
        <span class="ac-use">Pakai</span>
      </div>`).join('');
  },

  useCoupon(code) {
    document.getElementById('coupon-input').value = code;
    this.applyCoupon(code);
  },

  applyCoupon(codeInput) {
    const code = (codeInput || document.getElementById('coupon-input')?.value || '').toUpperCase().trim();
    const statusEl = document.getElementById('coupon-status');
    if (!code) { if(statusEl){ statusEl.textContent='Masukkan kode kupon'; statusEl.className='coupon-status err'; } return; }
    const coupon = COUPONS.find(c=>c.code===code);
    if (!coupon) { if(statusEl){ statusEl.textContent='Kode kupon tidak valid'; statusEl.className='coupon-status err'; } return; }
    const sub = this.subtotal();
    if (sub < coupon.minOrder) {
      if(statusEl){ statusEl.textContent=`Min. pembelian ${formatRp(coupon.minOrder)}`; statusEl.className='coupon-status err'; } return;
    }
    this.setAppliedCoupon(coupon);
    if (statusEl) { statusEl.textContent=`✓ Kupon "${code}" berhasil dipakai! ${coupon.desc}`; statusEl.className='coupon-status ok'; }
    this.renderCartSummary();
    showToast(`Kupon ${code} berhasil dipakai! 🏷️`,'success');
  },

  initCartPage() {
    document.getElementById('cart-select-all').addEventListener('change', e => Cart.toggleAll(e.target.checked));
    document.getElementById('btn-delete-selected').addEventListener('click', ()=>{
      if (confirm('Hapus item yang dipilih?')) Cart.deleteSelected();
    });
    document.getElementById('btn-apply-coupon').addEventListener('click', ()=>Cart.applyCoupon());
    document.getElementById('btn-go-checkout').addEventListener('click', ()=>{
      if (!Auth.current()) { App.openAuth(); return; }
      const checked = Cart.getChecked();
      if (!checked.length) { showToast('Pilih minimal 1 produk','error'); return; }
      App.navigate('checkout');
    });
    this.renderCartPage();
  },

  // ── Cart Drawer ──
  renderDrawer() {
    const body = document.getElementById('cd-body');
    const footer = document.getElementById('cd-footer');
    if (!body) return;
    const items = this.get();
    if (!items.length) {
      body.innerHTML = `<div class="cd-empty"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg><p>Keranjang kosong</p></div>`;
      footer.style.display='none';
    } else {
      footer.style.display='flex';
      body.innerHTML = items.map(i=>`
        <div class="cd-item">
          <div class="cd-item-img"><img src="${i.img}" alt="${i.name}" onerror="this.src='hero_banner.jpg'"/></div>
          <div class="cd-item-info">
            <div class="cd-item-name">${i.name}</div>
            <div class="cd-item-qty">Ukuran: ${i.size} × ${i.qty}</div>
            <div class="cd-item-price">${formatRp(i.price*i.qty)}</div>
          </div>
          <button class="cd-remove" onclick="Cart.remove('${i.key}')">✕</button>
        </div>`).join('');
      const total = items.reduce((s,i)=>s+i.price*i.qty,0);
      document.getElementById('cd-total').textContent = formatRp(total);
    }
  }
};

// ── Drawer controls ──
function openCartDrawer() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-drawer-overlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-drawer-overlay').classList.remove('open');
  document.body.style.overflow='';
}

// ── Checkout State ──
const Checkout = {
  step: 1,
  address: {},
  shipping: null,
  payment: null,

  init() {
    if (!Auth.current()) { App.openAuth(); return; }
    const checked = Cart.getChecked();
    if (!checked.length) { showToast('Keranjang kosong','error'); App.navigate('cart'); return; }
    this.step = 1;
    this.goStep(1);
    this.renderSummary();
    this.initAddressStep();
    this.initShippingStep();
    this.initPaymentStep();

    document.getElementById('btn-step1-next').onclick = () => {
      if (!this.validateAddress()) return;
      this.address = this.collectAddress();
      this.goStep(2);
    };
    document.getElementById('btn-step2-back').onclick = () => this.goStep(1);
    document.getElementById('btn-step2-next').onclick = () => {
      if (!this.shipping) { showToast('Pilih jasa pengiriman','error'); return; }
      this.goStep(3);
    };
    document.getElementById('btn-step3-back').onclick = () => this.goStep(2);
    document.getElementById('btn-step3-next').onclick = () => {
      const sel = document.querySelector('[name=payment]:checked');
      if (!sel) { showToast('Pilih metode pembayaran','error'); return; }
      this.payment = sel.value;
      this.goStep(4);
      this.renderConfirmation();
    };
    document.getElementById('btn-step4-back').onclick = () => this.goStep(3);
    document.getElementById('btn-place-order').onclick = () => Orders.place();
  },

  goStep(n) {
    this.step = n;
    document.querySelectorAll('.co-step-content').forEach(el=>el.classList.remove('active'));
    document.getElementById(`co-step-${n}`).classList.add('active');
    document.querySelectorAll('.cs-step').forEach((el,i)=>{
      el.classList.remove('active','done');
      if (i+1 < n) el.classList.add('done');
      else if (i+1 === n) el.classList.add('active');
    });
    document.querySelectorAll('.cs-line').forEach((el,i)=>{
      el.classList.toggle('done', i+1 < n);
    });
    this.renderSummary();
  },

  initAddressStep() {
    const provSel = document.getElementById('co-province');
    const citySel = document.getElementById('co-city');
    PROVINCES.forEach(p=>{ const opt=document.createElement('option'); opt.value=p; opt.textContent=p; provSel.appendChild(opt); });
    provSel.addEventListener('change', ()=>{
      const cities = CITIES[provSel.value] || CITIES['default'];
      citySel.innerHTML='<option value="">Pilih Kota</option>';
      cities.forEach(c=>{ const opt=document.createElement('option'); opt.value=c; opt.textContent=c; citySel.appendChild(opt); });
    });
    // Pre-fill from user profile
    const user = Auth.current();
    if (user) {
      document.getElementById('co-name').value = user.name || '';
      document.getElementById('co-phone').value = user.phone || '';
    }
  },

  validateAddress() {
    const fields = ['co-name','co-phone','co-address','co-province','co-city','co-zip'];
    for (const f of fields) {
      if (!document.getElementById(f)?.value.trim()) {
        showToast('Lengkapi semua field bertanda *','error'); return false;
      }
    }
    return true;
  },

  collectAddress() {
    return {
      name: document.getElementById('co-name').value,
      phone: document.getElementById('co-phone').value,
      address: document.getElementById('co-address').value,
      province: document.getElementById('co-province').value,
      city: document.getElementById('co-city').value,
      zip: document.getElementById('co-zip').value,
      note: document.getElementById('co-note').value
    };
  },

  initShippingStep() {
    const el = document.getElementById('shipping-options');
    el.innerHTML = SHIPPING_OPTIONS.map((s,i)=>`
      <label class="ship-opt" for="ship-${i}" onclick="Checkout.selectShipping(${i},${s.price})">
        <input type="radio" name="shipping" id="ship-${i}" value="${i}"/>
        <div class="so-logo" style="background:${s.color};color:#fff">${s.logo}</div>
        <div class="so-info">
          <div class="so-name">${s.name}</div>
          <div class="so-service">${s.courier} – ${s.service}</div>
          <div class="so-eta">Estimasi: ${s.eta}</div>
        </div>
        <div class="so-price">
          <b>${formatRp(s.price)}</b>
          <span>${s.eta}</span>
        </div>
      </label>`).join('');
  },

  selectShipping(i, price) {
    document.querySelectorAll('.ship-opt').forEach(el=>el.classList.remove('selected'));
    const label = document.querySelector(`label[for="ship-${i}"]`);
    if (label) label.classList.add('selected');
    this.shipping = { ...SHIPPING_OPTIONS[i], price };
    // Apply free shipping coupon
    const coupon = Cart.getAppliedCoupon();
    if (coupon?.freeShipping) this.shipping.price = 0;
    this.renderSummary();
  },

  renderConfirmation() {
    const el = document.getElementById('confirm-order');
    const checked = Cart.getChecked();
    const sub = Cart.subtotal();
    const coupon = Cart.getAppliedCoupon();
    const disc = Cart.applyDiscount(sub, coupon);
    const shipPrice = this.shipping ? this.shipping.price : 0;
    const total = sub - disc + shipPrice;
    const payLabels = { bca:'Bank BCA', mandiri:'Bank Mandiri', bni:'Bank BNI', bri:'Bank BRI', qris:'QRIS', cod:'COD (Bayar di Tempat)' };
    el.innerHTML = `
      <div class="co-confirm-row"><span>Penerima</span><span>${this.address.name} – ${this.address.phone}</span></div>
      <div class="co-confirm-row"><span>Alamat</span><span>${this.address.address}, ${this.address.city}, ${this.address.province} ${this.address.zip}</span></div>
      <div class="co-confirm-row"><span>Pengiriman</span><span>${this.shipping?.name || '-'} (${formatRp(shipPrice)})</span></div>
      <div class="co-confirm-row"><span>Pembayaran</span><span>${payLabels[this.payment] || this.payment}</span></div>
      <div class="co-confirm-row"><span>Subtotal (${checked.length} item)</span><span>${formatRp(sub)}</span></div>
      ${disc>0?`<div class="co-confirm-row"><span>Diskon</span><span style="color:#27ae60">- ${formatRp(disc)}</span></div>`:''}
      <div class="co-confirm-row"><span style="font-weight:700">Total Pembayaran</span><span style="color:var(--gold);font-weight:700;font-size:18px">${formatRp(total)}</span></div>`;
  },

  renderSummary() {
    const el = document.getElementById('co-summary-items');
    const sub = Cart.subtotal();
    const coupon = Cart.getAppliedCoupon();
    const disc = Cart.applyDiscount(sub, coupon);
    const shipPrice = this.shipping ? this.shipping.price : 0;
    const total = sub - disc + shipPrice;
    if (el) {
      el.innerHTML = Cart.getChecked().map(i=>`
        <div class="co-sum-item">
          <div class="co-sum-img"><img src="${i.img}" onerror="this.src='hero_banner.jpg'"/></div>
          <div class="co-sum-name">${i.name} (${i.size}) ×${i.qty}</div>
          <div class="co-sum-price">${formatRp(i.price*i.qty)}</div>
        </div>`).join('');
    }
    const els = {sub:'co-sum-sub',disc:'co-sum-disc',ship:'co-sum-ship',total:'co-sum-total'};
    const discRow = document.getElementById('co-sum-disc-row');
    if (discRow) discRow.style.display = disc>0?'flex':'none';
    setEl('co-sum-sub', formatRp(sub));
    setEl('co-sum-disc', `- ${formatRp(disc)}`);
    setEl('co-sum-ship', this.shipping ? formatRp(shipPrice) : 'Belum dipilih');
    setEl('co-sum-total', formatRp(total));
  },

  getTotal() {
    const sub = Cart.subtotal();
    const coupon = Cart.getAppliedCoupon();
    const disc = Cart.applyDiscount(sub, coupon);
    const shipPrice = this.shipping ? this.shipping.price : 0;
    return { sub, disc, shipPrice, total: sub - disc + shipPrice };
  }
};

function setEl(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
