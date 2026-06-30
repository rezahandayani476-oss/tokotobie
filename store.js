/* ============================================
   store.js – Product Data & Store Logic
============================================ */

const PRODUCTS = [
  {
    id: 1, name: 'Gamis Navy Royal', tag: 'Gamis Premium',
    category: ['gamis','premium'], isNew: true, isBestSeller: false, isSale: false, isFlashSale: false,
    price: 485000, originalPrice: 620000,
    images: ['product_navy.jpg','about_banner.jpg'],
    description: 'Gamis premium navy blue dengan sulaman emas mewah di bagian kerah, panel dada, dan manset. Bahan berkualitas tinggi yang nyaman dipakai seharian. Cocok untuk acara formal, pengajian, dan keagamaan.',
    sizes: ['S','M','L','XL','XXL'], stock: 25,
    rating: 4.9, reviewCount: 128, soldCount: 342,
    weight: 400
  },
  {
    id: 2, name: 'Gamis Sage Green', tag: 'Gamis',
    category: ['gamis'], isNew: false, isBestSeller: false, isSale: false, isFlashSale: false,
    price: 465000, originalPrice: 580000,
    images: ['product_green.jpg'],
    description: 'Gamis sage green elegan dengan detail sulaman emas di kerah dan manset. Dilengkapi hijab senada untuk tampilan sempurna. Warna sage yang menenangkan cocok untuk berbagai acara.',
    sizes: ['S','M','L','XL','XXL'], stock: 18,
    rating: 4.8, reviewCount: 96, soldCount: 215,
    weight: 380
  },
  {
    id: 3, name: 'Gamis Burgundy', tag: 'Premium',
    category: ['gamis','premium'], isNew: false, isBestSeller: true, isSale: false, isFlashSale: false,
    price: 475000, originalPrice: 600000,
    images: ['product_red.jpg'],
    description: 'Gamis merah burgundy mewah dengan sulaman emas eksklusif di kerah dan panel dada. Warna rich burgundy yang elegan dan berani untuk tampilan memukau di setiap kesempatan.',
    sizes: ['S','M','L','XL','XXL'], stock: 12,
    rating: 4.9, reviewCount: 214, soldCount: 587,
    weight: 390
  },
  {
    id: 4, name: 'Gamis Royal Purple', tag: 'Premium',
    category: ['gamis','premium'], isNew: false, isBestSeller: false, isSale: false, isFlashSale: true,
    price: 346500, originalPrice: 495000,
    images: ['product_purple.jpg'],
    description: 'Gamis ungu kerajaan dengan sulaman emas eksklusif. Tampilan mewah dan elegan untuk momen spesial. Sedang flash sale terbatas!',
    sizes: ['S','M','L','XL'], stock: 8,
    rating: 4.8, reviewCount: 73, soldCount: 198,
    flashSaleEndTime: null,
    weight: 400
  },
  {
    id: 5, name: 'Gamis Ivory Set', tag: 'Gamis Set',
    category: ['gamis','set'], isNew: true, isBestSeller: false, isSale: false, isFlashSale: false,
    price: 525000, originalPrice: 680000,
    images: ['product_cream.jpg'],
    description: 'Gamis ivory putih bersih dengan detail sulaman emas halus. Set lengkap dengan hijab senada. Cocok untuk pernikahan, acara formal, dan kegiatan keagamaan.',
    sizes: ['S','M','L','XL','XXL'], stock: 20,
    rating: 4.9, reviewCount: 52, soldCount: 134,
    weight: 420
  },
  {
    id: 6, name: 'Gamis Camel Gold', tag: 'Gamis',
    category: ['gamis'], isNew: false, isBestSeller: false, isSale: true, isFlashSale: false,
    price: 319000, originalPrice: 455000,
    images: ['product_khaki.jpg'],
    description: 'Gamis kamel hangat dengan detail bordir emas di kerah dan lengan. Warna netral yang elegan cocok untuk tampilan sehari-hari maupun formal. Sedang promo spesial!',
    sizes: ['S','M','L','XL','XXL'], stock: 30,
    rating: 4.7, reviewCount: 88, soldCount: 267,
    weight: 370
  },
  {
    id: 7, name: 'Gamis Midnight Black', tag: 'Premium',
    category: ['gamis','premium'], isNew: true, isBestSeller: false, isSale: false, isFlashSale: true,
    price: 367500, originalPrice: 525000,
    images: ['product_navy.jpg'],
    description: 'Gamis hitam elegan dengan sentuhan sulaman emas yang memukau. Warna klasik yang tak lekang waktu, cocok untuk segala kesempatan. Flash sale spesial!',
    sizes: ['S','M','L','XL','XXL'], stock: 5,
    rating: 4.8, reviewCount: 41, soldCount: 89,
    flashSaleEndTime: null,
    weight: 400
  },
  {
    id: 8, name: 'Gamis Dusty Rose', tag: 'Gamis',
    category: ['gamis'], isNew: true, isBestSeller: false, isSale: false, isFlashSale: false,
    price: 445000, originalPrice: 560000,
    images: ['product_cream.jpg'],
    description: 'Gamis dusty rose dengan nuansa feminin dan elegan. Detail sulaman gold thread di kerah dan ujung lengan menambah kesan mewah namun tetap lembut.',
    sizes: ['S','M','L','XL'], stock: 22,
    rating: 4.7, reviewCount: 34, soldCount: 112,
    weight: 380
  }
];

const COUPONS = [
  { code: 'TOBIEE10', type: 'percent', value: 10, minOrder: 200000, desc: 'Diskon 10% min. Rp 200.000', freeShipping: false },
  { code: 'NEWMEMBER', type: 'flat', value: 50000, minOrder: 300000, desc: 'Diskon Rp 50.000 min. Rp 300.000', freeShipping: false },
  { code: 'RAMADAN20', type: 'percent', value: 20, minOrder: 500000, desc: 'Diskon 20% min. Rp 500.000', freeShipping: false },
  { code: 'GRATISONGKIR', type: 'shipping', value: 0, minOrder: 150000, desc: 'Gratis ongkos kirim min. Rp 150.000', freeShipping: true },
  { code: 'FLASHSALE', type: 'percent', value: 30, minOrder: 0, desc: 'Diskon 30% (Flash Sale)', freeShipping: false }
];

const SHIPPING_OPTIONS = [
  { courier: 'JNE', service: 'REG', name: 'JNE Reguler', eta: '2–4 hari', price: 12000, logo: 'JNE', color: '#cc0000' },
  { courier: 'JNE', service: 'YES', name: 'JNE YES (1 Day)', eta: '1 hari', price: 22000, logo: 'JNE', color: '#cc0000' },
  { courier: 'JNE', service: 'OKE', name: 'JNE OKE', eta: '4–7 hari', price: 8000, logo: 'JNE', color: '#cc0000' },
  { courier: 'JNT', service: 'REG', name: 'J&T Express', eta: '1–3 hari', price: 10000, logo: 'J&T', color: '#e74c3c' },
  { courier: 'SICEPAT', service: 'BEST', name: 'SiCepat BEST', eta: '1–3 hari', price: 11000, logo: 'SCP', color: '#f39c12' },
  { courier: 'ANTERAJA', service: 'REG', name: 'AnterAja Regular', eta: '2–5 hari', price: 9000, logo: 'AJA', color: '#2ecc71' },
  { courier: 'POS', service: 'PKT', name: 'Pos Indonesia', eta: '3–7 hari', price: 7000, logo: 'POS', color: '#e74c3c' },
  { courier: 'GOSEND', service: 'SAMEDAY', name: 'GoSend Same Day', eta: 'Hari ini', price: 25000, logo: 'GO', color: '#00aa13' }
];

const REVIEWS_DATA = {
  1: [
    { user: 'Siti N.', rating: 5, date: '15 Jun 2024', text: 'Gamis sangat cantik dan berkualitas! Sulaman emasnya detail dan jahitannya rapi. Sudah beli 3 kali dan selalu puas!' },
    { user: 'Fatimah A.', rating: 5, date: '10 Jun 2024', text: 'Bahan kainnya sangat adem dan jatuh di badan. Packaging cantik. Highly recommended!' },
    { user: 'Dewi R.', rating: 4, date: '5 Jun 2024', text: 'Bagus sekali, sesuai foto. Pengiriman cepat. Sedikit kebesaran tapi overall puas.' }
  ],
  3: [
    { user: 'Aisyah P.', rating: 5, date: '20 Jun 2024', text: 'Warna burgundy-nya persis seperti foto, bahkan lebih cantik. Jadi favorit untuk acara keluarga!' },
    { user: 'Nurul H.', rating: 5, date: '18 Jun 2024', text: 'Kualitas premium! Sulaman emasnya sangat halus dan detail. Worth every penny!' }
  ]
};

const PROVINCES = ['Aceh','Bali','Banten','Bengkulu','DI Yogyakarta','DKI Jakarta','Gorontalo','Jambi','Jawa Barat','Jawa Tengah','Jawa Timur','Kalimantan Barat','Kalimantan Selatan','Kalimantan Tengah','Kalimantan Timur','Kalimantan Utara','Kepulauan Bangka Belitung','Kepulauan Riau','Lampung','Maluku','Maluku Utara','Nusa Tenggara Barat','Nusa Tenggara Timur','Papua','Papua Barat','Riau','Sulawesi Barat','Sulawesi Selatan','Sulawesi Tengah','Sulawesi Tenggara','Sulawesi Utara','Sumatera Barat','Sumatera Selatan','Sumatera Utara'];
const CITIES = {
  'DKI Jakarta': ['Jakarta Pusat','Jakarta Selatan','Jakarta Barat','Jakarta Timur','Jakarta Utara'],
  'Jawa Barat': ['Bandung','Bekasi','Bogor','Depok','Cimahi','Sukabumi','Cirebon','Tasikmalaya'],
  'Jawa Tengah': ['Semarang','Solo','Surakarta','Yogyakarta','Magelang','Purwokerto'],
  'Jawa Timur': ['Surabaya','Malang','Sidoarjo','Gresik','Mojokerto','Kediri','Blitar'],
  'Bali': ['Denpasar','Badung','Gianyar','Tabanan','Klungkung'],
  'Sumatera Utara': ['Medan','Deli Serdang','Binjai','Tebing Tinggi','Pematangsiantar'],
  'default': ['Kota/Kabupaten 1','Kota/Kabupaten 2','Kota/Kabupaten 3']
};

// ── helpers ──
function formatRp(n) { return 'Rp ' + Math.round(n).toLocaleString('id-ID'); }
function discPercent(p, op) { return op > p ? Math.round((1 - p/op)*100) : 0; }
function renderStars(rating) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  let s = '';
  for (let i=0;i<5;i++) {
    if (i<full) s+='★'; else if (i===full && half) s+='½'; else s+='☆';
  }
  return `<span>${s}</span> ${rating.toFixed(1)}`;
}
function getProduct(id) { return PRODUCTS.find(p=>p.id===+id); }
function getProductsByIds(ids) { return ids.map(id=>getProduct(id)).filter(Boolean); }

// ── Product Card HTML ──
function createProductCard(prod, extraClass='') {
  const disc = discPercent(prod.price, prod.originalPrice);
  const badgeHtml = prod.isBestSeller
    ? '<div class="pc-badge badge-best">BEST SELLER</div>'
    : prod.isNew ? '<div class="pc-badge badge-new">NEW</div>'
    : prod.isSale || prod.isFlashSale ? `<div class="pc-badge badge-sale">${disc}% OFF</div>`
    : '';
  const wishlist = Store.getWishlist();
  const isWished = wishlist.includes(prod.id);
  const stockPct = Math.min(100, (prod.stock / 30) * 100);
  return `
  <div class="prod-card fade-up ${extraClass}" data-id="${prod.id}">
    <div class="pc-img-wrap">
      <img src="${prod.images[0]}" alt="${prod.name}" loading="lazy" onerror="this.src='hero_banner.jpg'"/>
      ${badgeHtml}
      <button class="pc-wish-btn ${isWished?'active':''}" data-id="${prod.id}" onclick="event.stopPropagation();Store.toggleWishlist(${prod.id},this)" aria-label="Wishlist">
        <svg viewBox="0 0 24 24" fill="${isWished?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="pc-overlay">
        <button class="btn-pc-view" onclick="event.stopPropagation();App.navigate('product',${prod.id})" style="padding:10px 22px;border:1px solid #e4c06e;color:#e4c06e;border-radius:5px;font-size:12px;font-weight:600;background:transparent;cursor:pointer;transition:.3s">Lihat Detail</button>
      </div>
    </div>
    <div class="pc-info">
      <div class="pc-tag">${prod.tag}</div>
      <div class="pc-name">${prod.name}</div>
      <div class="pc-rating">
        <span class="pc-stars-val">★ ${prod.rating}</span>
        <span class="pc-rev">(${prod.reviewCount})</span>
        <span class="pc-sold">• ${prod.soldCount}+ terjual</span>
      </div>
      <div class="pc-price-row">
        <span class="pc-price">${formatRp(prod.price)}</span>
        ${prod.originalPrice>prod.price ? `<span class="pc-price-old">${formatRp(prod.originalPrice)}</span><span class="pc-disc">${disc}%</span>` : ''}
      </div>
      <div class="pc-actions">
        <button class="btn-pc-cart" onclick="event.stopPropagation();Cart.addFromCard(${prod.id})">+ Keranjang</button>
        <button class="btn-pc-buy" onclick="event.stopPropagation();Cart.buyNow(${prod.id})">Beli</button>
      </div>
      <div class="pc-stock-bar"><div class="pc-stock-fill" style="width:${stockPct}%"></div></div>
    </div>
  </div>`;
}

// ── Flash Sale Card ──
function createFSCard(prod) {
  const disc = discPercent(prod.price, prod.originalPrice);
  const stockPct = Math.min(100, (prod.stock / 20) * 100);
  return `
  <div class="fs-card" onclick="App.navigate('product',${prod.id})">
    <div class="pc-img-wrap">
      <img src="${prod.images[0]}" alt="${prod.name}" loading="lazy" onerror="this.src='hero_banner.jpg'"/>
      <div class="pc-badge badge-sale">${disc}% OFF</div>
    </div>
    <div class="fs-info">
      <div class="fs-name">${prod.name}</div>
      <div class="fs-price-row">
        <span class="fs-price">${formatRp(prod.price)}</span>
        <span class="fs-old">${formatRp(prod.originalPrice)}</span>
        <span class="fs-disc-badge">${disc}%</span>
      </div>
      <div class="fs-stock-bar"><div class="fs-stock-fill" style="width:${100-stockPct}%"></div></div>
      <div class="fs-stock-lbl">Stok tersisa: ${prod.stock}</div>
    </div>
  </div>`;
}

const Store = {
  currentFilter: 'all',
  currentSort: 'default',
  currentPage: 1,
  perPage: 6,
  priceMax: 1000000,
  ratingFilter: 0,
  sizeFilter: 'all',
  searchQuery: '',

  getWishlist() {
    return JSON.parse(localStorage.getItem('tc_wishlist') || '[]');
  },
  setWishlist(wl) {
    localStorage.setItem('tc_wishlist', JSON.stringify(wl));
    updateWishlistCount();
  },
  toggleWishlist(id, btn) {
    if (!Auth.current()) { App.openAuth(); return; }
    let wl = this.getWishlist();
    if (wl.includes(id)) {
      wl = wl.filter(x => x !== id);
      if (btn) { btn.classList.remove('active'); btn.querySelector('svg').setAttribute('fill','none'); }
      showToast('Dihapus dari wishlist','info');
    } else {
      wl.push(id);
      if (btn) { btn.classList.add('active'); btn.querySelector('svg').setAttribute('fill','currentColor'); }
      showToast('Ditambahkan ke wishlist ❤️','success');
    }
    this.setWishlist(wl);
  },

  getFiltered() {
    let list = [...PRODUCTS];
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (this.currentFilter !== 'all') {
      if (this.currentFilter === 'sale') list = list.filter(p => p.isSale || p.isFlashSale);
      else if (this.currentFilter === 'new') list = list.filter(p => p.isNew);
      else list = list.filter(p => p.category.includes(this.currentFilter));
    }
    if (this.priceMax < 1000000) list = list.filter(p => p.price <= this.priceMax);
    if (this.ratingFilter > 0) list = list.filter(p => p.rating >= this.ratingFilter);
    if (this.sizeFilter !== 'all') list = list.filter(p => p.sizes.includes(this.sizeFilter));
    switch(this.currentSort) {
      case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
      case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
      case 'rating': list.sort((a,b)=>b.rating-a.rating); break;
      case 'newest': list.sort((a,b)=>b.id-a.id); break;
      case 'bestseller': list.sort((a,b)=>b.soldCount-a.soldCount); break;
    }
    return list;
  },

  renderStoreGrid() {
    const list = this.getFiltered();
    const grid = document.getElementById('store-prod-grid');
    const countEl = document.getElementById('prod-count');
    if (!grid) return;
    const total = list.length;
    const pages = Math.ceil(total / this.perPage);
    const start = (this.currentPage - 1) * this.perPage;
    const paged = list.slice(start, start + this.perPage);
    countEl && (countEl.textContent = `${total} Produk`);
    grid.innerHTML = paged.length ? paged.map(p => createProductCard(p)).join('') : '<p style="color:var(--text-m);padding:40px;text-align:center;grid-column:1/-1">Produk tidak ditemukan</p>';
    this.renderPagination(pages);
    initScrollAnimations();
  },

  renderPagination(pages) {
    const el = document.getElementById('store-pagination');
    if (!el || pages <= 1) { el && (el.innerHTML=''); return; }
    let html = '';
    if (this.currentPage > 1) html += `<button class="pg-btn" onclick="Store.goPage(${this.currentPage-1})">‹</button>`;
    for (let i=1;i<=pages;i++) html += `<button class="pg-btn ${i===this.currentPage?'active':''}" onclick="Store.goPage(${i})">${i}</button>`;
    if (this.currentPage < pages) html += `<button class="pg-btn" onclick="Store.goPage(${this.currentPage+1})">›</button>`;
    el.innerHTML = html;
  },

  goPage(n) { this.currentPage = n; this.renderStoreGrid(); window.scrollTo({top:document.getElementById('page-store').offsetTop-130,behavior:'smooth'}); },

  renderHomeGrid() {
    const grid = document.getElementById('home-prod-grid');
    if (!grid) return;
    const featured = PRODUCTS.slice(0,6);
    grid.innerHTML = featured.map(p=>createProductCard(p)).join('');
    initScrollAnimations();
  },

  renderFlashSale() {
    const grid = document.getElementById('fs-grid');
    if (!grid) return;
    const fsSale = PRODUCTS.filter(p=>p.isFlashSale || p.isSale);
    grid.innerHTML = fsSale.length ? fsSale.map(p=>createFSCard(p)).join('') : '<p style="color:var(--text-m);padding:20px">Tidak ada flash sale saat ini</p>';
  },

  renderProductDetail(id) {
    const prod = getProduct(id);
    if (!prod) { App.navigate('store'); return; }
    // Breadcrumb
    document.getElementById('product-breadcrumb').innerHTML = `<a href="#" data-page="home">Beranda</a> › <a href="#" data-page="store">Koleksi</a> › <span>${prod.name}</span>`;
    // Images
    document.getElementById('pd-img-main').src = prod.images[0];
    document.getElementById('pd-img-main').alt = prod.name;
    const thumbsEl = document.getElementById('pd-thumbs');
    thumbsEl.innerHTML = prod.images.map((img,i)=>`<div class="pd-thumb ${i===0?'active':''}" onclick="switchPdImg('${img}',this)"><img src="${img}" alt=""/></div>`).join('');
    // Badge
    const badgeEl = document.getElementById('pd-badge');
    if (prod.isFlashSale) { badgeEl.textContent='FLASH SALE'; badgeEl.className='pd-badge badge-sale'; }
    else if (prod.isBestSeller) { badgeEl.textContent='BEST SELLER'; badgeEl.className='pd-badge badge-best'; }
    else if (prod.isNew) { badgeEl.textContent='NEW'; badgeEl.className='pd-badge badge-new'; }
    else badgeEl.textContent='';
    // Info
    document.getElementById('pd-tag').textContent = prod.tag;
    document.getElementById('pd-name').textContent = prod.name;
    document.getElementById('pd-stars').innerHTML = `★ ${prod.rating.toFixed(1)}`;
    document.getElementById('pd-rev-count').textContent = `(${prod.reviewCount} ulasan)`;
    document.getElementById('pd-sold').textContent = `• ${prod.soldCount}+ terjual`;
    document.getElementById('pd-price').textContent = formatRp(prod.price);
    const disc = discPercent(prod.price, prod.originalPrice);
    if (disc > 0) {
      document.getElementById('pd-price-old').textContent = formatRp(prod.originalPrice);
      document.getElementById('pd-disc-badge').textContent = `${disc}% OFF`;
    }
    document.getElementById('pd-desc').textContent = prod.description;
    // Sizes
    document.getElementById('pd-sizes').innerHTML = prod.sizes.map(s=>`<button class="pd-size-btn" onclick="selectPdSize(this,'${s}')">${s}</button>`).join('');
    // Stock
    document.getElementById('pd-stock').textContent = `Stok: ${prod.stock}`;
    // Wishlist
    const wl = Store.getWishlist();
    const wBtn = document.getElementById('btn-pd-wish');
    wBtn.classList.toggle('active', wl.includes(prod.id));
    wBtn.onclick = () => Store.toggleWishlist(prod.id, null);
    // Cart & Buy
    document.getElementById('btn-pd-cart').onclick = () => {
      const sz = document.querySelector('.pd-size-btn.active');
      if (!sz) { showToast('Pilih ukuran terlebih dahulu','error'); return; }
      const qty = parseInt(document.getElementById('pd-qty').value) || 1;
      Cart.addToCart(prod.id, prod.name, prod.price, prod.images[0], sz.textContent, qty);
    };
    document.getElementById('btn-pd-buy').onclick = () => {
      const sz = document.querySelector('.pd-size-btn.active');
      if (!sz) { showToast('Pilih ukuran terlebih dahulu','error'); return; }
      const qty = parseInt(document.getElementById('pd-qty').value) || 1;
      Cart.addToCart(prod.id, prod.name, prod.price, prod.images[0], sz.textContent, qty);
      App.navigate('cart');
    };
    // Qty
    document.getElementById('pd-qty-minus').onclick = () => {
      const i = document.getElementById('pd-qty');
      if (parseInt(i.value) > 1) i.value = parseInt(i.value) - 1;
    };
    document.getElementById('pd-qty-plus').onclick = () => {
      const i = document.getElementById('pd-qty');
      if (parseInt(i.value) < prod.stock) i.value = parseInt(i.value) + 1;
    };
    // Breadcrumb nav
    document.querySelectorAll('#product-breadcrumb [data-page]').forEach(a => {
      a.onclick = e => { e.preventDefault(); App.navigate(a.dataset.page); };
    });
    // Reviews
    this.renderReviews(id);
  },

  renderReviews(prodId) {
    const prod = getProduct(prodId);
    const reviews = [...(REVIEWS_DATA[prodId] || []), ...Orders.getReviewsForProduct(prodId)];
    const sumEl = document.getElementById('rev-summary');
    const listEl = document.getElementById('rev-list');
    if (!prod) return;
    const avg = prod.rating;
    const barData = [5,4,3,2,1];
    sumEl.innerHTML = `
      <div class="rs-score">
        <div class="rs-score-num">${avg.toFixed(1)}</div>
        <div class="rs-score-stars">★★★★★</div>
        <div class="rs-score-total">${prod.reviewCount + reviews.length} ulasan</div>
      </div>
      <div class="rs-bars">
        ${barData.map(n=>`<div class="rs-bar-row">
          <span class="rs-bar-lbl">${n}★</span>
          <div class="rs-bar-track"><div class="rs-bar-fill" style="width:${n===5?70:n===4?20:n===3?7:3}%"></div></div>
          <span class="rs-bar-count">${n===5?89:n===4?25:n===3?9:3}</span>
        </div>`).join('')}
      </div>`;
    if (!reviews.length) {
      listEl.innerHTML = '<div class="rev-empty">Belum ada ulasan. Jadilah yang pertama!</div>';
    } else {
      listEl.innerHTML = reviews.map(r=>`
        <div class="rev-card">
          <div class="rc-header">
            <div class="rc-av">${r.user[0]}</div>
            <div><div class="rc-name">${r.user}</div><div class="rc-date">${r.date}</div></div>
            <div class="rc-stars" style="margin-left:auto">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
          </div>
          <div class="rc-text">${r.text}</div>
        </div>`).join('');
    }
  },

  renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const empty = document.getElementById('wishlist-empty');
    const wl = this.getWishlist();
    const prods = getProductsByIds(wl);
    if (!prods.length) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      grid.innerHTML = prods.map(p=>createProductCard(p)).join('');
      initScrollAnimations();
    }
  },

  initFilters() {
    document.querySelectorAll('[name=cat]').forEach(r => r.addEventListener('change', ()=>{
      Store.currentFilter = r.value; Store.currentPage=1; Store.renderStoreGrid();
    }));
    document.getElementById('price-min').addEventListener('input', function() {
      Store.priceMax = +this.value; Store.currentPage=1;
      document.getElementById('price-max-lbl').textContent = formatRp(Store.priceMax);
      Store.renderStoreGrid();
    });
    document.querySelectorAll('[name=rating]').forEach(r => r.addEventListener('change', ()=>{
      Store.ratingFilter = +r.value; Store.currentPage=1; Store.renderStoreGrid();
    }));
    document.querySelectorAll('.sz-f-btn').forEach(btn => btn.addEventListener('click', ()=>{
      document.querySelectorAll('.sz-f-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      Store.sizeFilter = btn.dataset.size; Store.currentPage=1; Store.renderStoreGrid();
    }));
    document.getElementById('sort-select').addEventListener('change', function(){
      Store.currentSort = this.value; Store.currentPage=1; Store.renderStoreGrid();
    });
    document.getElementById('btn-clear-filter').addEventListener('click', ()=>{
      Store.currentFilter='all'; Store.currentSort='default'; Store.priceMax=1000000;
      Store.ratingFilter=0; Store.sizeFilter='all'; Store.searchQuery=''; Store.currentPage=1;
      document.querySelectorAll('[name=cat]')[0].checked=true;
      document.querySelectorAll('[name=rating]')[0].checked=true;
      document.getElementById('price-min').value=0;
      document.getElementById('price-max-lbl').textContent=formatRp(1000000);
      document.querySelectorAll('.sz-f-btn').forEach(b=>b.classList.remove('active'));
      document.querySelector('.sz-f-btn[data-size=all]').classList.add('active');
      Store.renderStoreGrid();
    });
    document.getElementById('btn-sidebar-toggle').addEventListener('click',()=>{
      document.getElementById('store-sidebar').classList.toggle('mobile-open');
    });
    document.querySelectorAll('.cat-card').forEach(c=>c.addEventListener('click',()=>{
      Store.currentFilter = c.dataset.filter || 'all'; Store.currentPage=1;
      App.navigate('store');
    }));
    document.querySelectorAll('[data-page="store"]').forEach(btn=>btn.addEventListener('click',()=>App.navigate('store')));
    document.querySelectorAll('.btn-see-all').forEach(btn=>btn.addEventListener('click',()=>App.navigate('store')));
  }
};

function switchPdImg(src, el) {
  document.getElementById('pd-img-main').src = src;
  document.querySelectorAll('.pd-thumb').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
}
function selectPdSize(el, size) {
  document.querySelectorAll('.pd-size-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');
}

function updateWishlistCount() {
  const wl = Store.getWishlist();
  const el = document.getElementById('wish-count');
  if (el) el.textContent = wl.length;
}

function initScrollAnimations() {
  const obs = new IntersectionObserver(entries=>{
    entries.forEach((e,i)=>{ if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('vis'),i*80); obs.unobserve(e.target); } });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.fade-up:not(.vis)').forEach(el=>obs.observe(el));
}
