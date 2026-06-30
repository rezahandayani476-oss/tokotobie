/* ============================================
   app.js – Main Application Router & Init
============================================ */

// ── TOAST SYSTEM ──
function showToast(msg, type='info') {
  const wrap = document.getElementById('toast-wrap');
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  wrap.appendChild(toast);
  requestAnimationFrame(()=>{ setTimeout(()=>toast.classList.add('show'), 10); });
  setTimeout(()=>{
    toast.classList.remove('show');
    setTimeout(()=>toast.remove(), 400);
  }, 3500);
}

// ── PAGE ROUTER ──
const App = {
  currentPage: 'home',
  currentProductId: null,

  navigate(page, param) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);
    if (!pageEl) { console.warn('Page not found:', page); return; }
    pageEl.classList.add('active');
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (page === 'home') { Store.renderHomeGrid(); Store.renderFlashSale(); initTestiSlider(); startCountdown(); }
    else if (page === 'store') { Store.renderStoreGrid(); }
    else if (page === 'product') {
      this.currentProductId = param;
      Store.renderProductDetail(param);
    }
    else if (page === 'cart') { Cart.initCartPage(); }
    else if (page === 'checkout') {
      if (!Auth.current()) { this.openAuth(); return; }
      Checkout.init();
    }
    else if (page === 'orders') { Orders.renderOrdersPage(); }
    else if (page === 'profile') { Auth.initProfile(); }
    else if (page === 'wishlist') { Store.renderWishlist(); }
    else if (page === 'about') { initCounterAnimations(); }
  },

  openAuth(tab='login') {
    const modal = document.getElementById('auth-modal');
    modal.classList.add('open');
    if (tab === 'register') {
      document.getElementById('tab-register').click();
    } else {
      document.getElementById('tab-login').click();
    }
  },

  init() {
    // Preloader
    setTimeout(()=>{ document.getElementById('preloader').classList.add('hidden'); }, 2500);

    // Auth
    Auth.renderNavAuth();
    Auth.initModal();

    // Nav badges
    Cart.updateBadges();
    updateWishlistCount();

    // Cart drawer
    document.getElementById('btn-cart-open').addEventListener('click', openCartDrawer);
    document.getElementById('cd-close').addEventListener('click', closeCartDrawer);
    document.getElementById('cart-drawer-overlay').addEventListener('click', closeCartDrawer);
    document.getElementById('btn-go-cart').addEventListener('click', ()=>{ closeCartDrawer(); App.navigate('cart'); });
    document.getElementById('btn-quick-checkout').addEventListener('click', ()=>{ closeCartDrawer(); App.navigate('checkout'); });
    Cart.renderDrawer();

    // Wishlist
    document.getElementById('btn-wishlist').addEventListener('click', ()=>{
      if (!Auth.current()) { this.openAuth(); return; }
      App.navigate('wishlist');
    });

    // Nav logo
    document.getElementById('nav-logo').addEventListener('click', e=>{ e.preventDefault(); App.navigate('home'); });

    // Global [data-page] links
    document.addEventListener('click', e => {
      const el = e.target.closest('[data-page]');
      if (el && !el.closest('#store-sidebar') && el.tagName !== 'SELECT') {
        const page = el.dataset.page;
        if (page) { e.preventDefault(); App.navigate(page); }
      }
    });

    // User Dropdown
    document.addEventListener('click', e=>{
      const dd = document.getElementById('user-dropdown');
      if (!e.target.closest('#user-avatar-btn') && !e.target.closest('#user-dropdown')) {
        dd.classList.remove('open');
      }
    });
    document.querySelectorAll('.ud-link').forEach(link=>{
      link.addEventListener('click', e=>{
        const page = link.dataset.page;
        if (page) { e.preventDefault(); document.getElementById('user-dropdown').classList.remove('open'); App.navigate(page); }
      });
    });
    document.getElementById('btn-logout').addEventListener('click', ()=>{ document.getElementById('user-dropdown').classList.remove('open'); Auth.logout(); });

    // Search
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const doSearch = ()=>{
      Store.searchQuery = searchInput.value.trim();
      Store.currentPage = 1;
      App.navigate('store');
    };
    searchBtn.addEventListener('click', doSearch);
    searchInput.addEventListener('keydown', e=>{ if(e.key==='Enter') doSearch(); });
    document.querySelectorAll('.s-tag').forEach(tag=>{
      tag.addEventListener('click', ()=>{ searchInput.value=tag.dataset.q; doSearch(); });
    });

    // Orders tabs
    document.querySelectorAll('.ord-tab').forEach(tab=>{
      tab.addEventListener('click', ()=>{
        document.querySelectorAll('.ord-tab').forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        Orders.renderOrdersPage(tab.dataset.status);
      });
    });

    // Review modal
    const revModal = document.getElementById('review-modal');
    document.getElementById('review-modal-close').onclick = ()=>revModal.classList.remove('open');
    revModal.onclick = e=>{ if(e.target===revModal) revModal.classList.remove('open'); };
    let selectedRating = 5;
    document.querySelectorAll('.si').forEach(star=>{
      star.addEventListener('mouseover', ()=>{
        document.querySelectorAll('.si').forEach((s,i)=>{
          s.classList.toggle('active', i <= star.dataset.v-1);
        });
      });
      star.addEventListener('mouseout', ()=>{
        document.querySelectorAll('.si').forEach((s,i)=>{
          s.classList.toggle('active', i < selectedRating);
        });
      });
      star.addEventListener('click', ()=>{
        selectedRating = +star.dataset.v;
        revModal._rating = selectedRating;
        document.querySelectorAll('.si').forEach((s,i)=>s.classList.toggle('active', i<selectedRating));
      });
    });
    document.getElementById('btn-submit-review').onclick = ()=>{
      const text = document.getElementById('rev-text').value.trim();
      if (!text) { showToast('Tulis ulasan terlebih dahulu','error'); return; }
      Orders.submitReview(revModal._orderId, revModal._rating||5, text);
      revModal.classList.remove('open');
      document.getElementById('rev-text').value='';
    };

    // Seller chat
    document.getElementById('btn-seller-chat').href='https://wa.me/6285864554590';

    // Navbar scroll
    window.addEventListener('scroll', ()=>{
      document.getElementById('navbar').classList.toggle('scrolled', window.scrollY>60);
    });

    // ESC close modals
    document.addEventListener('keydown', e=>{
      if (e.key==='Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));
        closeCartDrawer();
        document.getElementById('user-dropdown').classList.remove('open');
      }
    });

    // Store filter init
    Store.initFilters();

    // Home page renders
    Store.renderHomeGrid();
    Store.renderFlashSale();
    initTestiSlider();
    startCountdown();
    initScrollAnimations();

    console.log('%c✦ TOBIEE COLLECTION ✦', 'color:#c9a84c;font-size:22px;font-weight:bold');
    console.log('%cPremium Muslim Wear | tobiee.collection@gmail.com', 'color:#8a7d6b;font-size:12px');
  }
};

// ── FLASH SALE COUNTDOWN ──
let cdInterval;
function startCountdown() {
  const fsEnd = new Date();
  fsEnd.setHours(23, 59, 59, 0);
  clearInterval(cdInterval);
  cdInterval = setInterval(()=>{
    const now = new Date();
    let diff = Math.max(0, fsEnd - now);
    const h = Math.floor(diff/3600000); diff %= 3600000;
    const m = Math.floor(diff/60000); diff %= 60000;
    const s = Math.floor(diff/1000);
    setEl('cd-h', String(h).padStart(2,'0'));
    setEl('cd-m', String(m).padStart(2,'0'));
    setEl('cd-s', String(s).padStart(2,'0'));
  }, 1000);
}

// ── TESTIMONIALS SLIDER ──
let testiIdx = 0, testiTimer;
function initTestiSlider() {
  const track = document.getElementById('testi-track');
  const cards = document.querySelectorAll('.testi-card');
  if (!track || !cards.length) return;
  const dotsEl = document.getElementById('testi-dots');
  dotsEl.innerHTML = Array.from({length: cards.length}, (_,i)=>`<button class="td-dot ${i===0?'active':''}" data-i="${i}"></button>`).join('');
  document.querySelectorAll('.td-dot').forEach(dot=>{
    dot.addEventListener('click', ()=>{ clearInterval(testiTimer); goTesti(+dot.dataset.i); startTestiAuto(); });
  });
  function goTesti(i) {
    testiIdx = i;
    const visible = window.innerWidth<=768?1:window.innerWidth<=1024?2:3;
    const max = Math.max(0, cards.length - visible);
    const clamped = Math.min(i, max);
    const cardW = cards[0] ? cards[0].offsetWidth + 20 : 300;
    track.style.transform = `translateX(-${clamped * cardW}px)`;
    document.querySelectorAll('.td-dot').forEach((d,j)=>d.classList.toggle('active', j===i));
  }
  function startTestiAuto() {
    testiTimer = setInterval(()=>{
      const visible = window.innerWidth<=768?1:window.innerWidth<=1024?2:3;
      const max = Math.max(0, cards.length - visible);
      testiIdx = testiIdx >= max ? 0 : testiIdx+1;
      goTesti(testiIdx);
    }, 4500);
  }
  startTestiAuto();
  window.addEventListener('resize', ()=>goTesti(0));
  // Touch swipe
  let tx=0;
  track.addEventListener('touchstart', e=>tx=e.touches[0].clientX, {passive:true});
  track.addEventListener('touchend', e=>{
    const d = tx - e.changedTouches[0].clientX;
    if (Math.abs(d)>50) {
      clearInterval(testiTimer);
      const visible = window.innerWidth<=768?1:window.innerWidth<=1024?2:3;
      const max = Math.max(0, cards.length - visible);
      testiIdx = d>0 ? Math.min(testiIdx+1,max) : Math.max(testiIdx-1,0);
      goTesti(testiIdx);
      startTestiAuto();
    }
  }, {passive:true});
}

// ── COUNTER ANIMATIONS ──
function initCounterAnimations() {
  const nums = document.querySelectorAll('.asg-num');
  nums.forEach(el=>{
    const target = +el.dataset.target;
    const suffix = el.textContent.includes('+') ? '+' : el.textContent.includes('%') ? '%' : '';
    const dur=2000, start=performance.now();
    el.textContent='0'+suffix;
    const obs = new IntersectionObserver(entries=>{
      if (entries[0].isIntersecting) {
        const tick = now=>{
          const p = Math.min((now-start)/dur,1);
          const eased = 1-Math.pow(1-p,3);
          el.textContent = Math.floor(eased*target)+suffix;
          if (p<1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    },{threshold:.5});
    obs.observe(el);
  });
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', ()=>App.init());
