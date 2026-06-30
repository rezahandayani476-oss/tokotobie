/* =====================================================
   TOBIEE COLLECTION – JavaScript
===================================================== */

// ===== GLOBAL STATE =====
let cart = [];
let currentModal = { name: '', price: 0, img: '', tag: '' };
let testiIndex = 0;
let testiAuto;

// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.classList.add('hidden');
    initAnimations();
  }, 2200);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== HAMBURGER MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (mobileMenu.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link, .mobile-wa').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = ''; s.style.opacity = '';
    });
  });
});

// ===== CART =====
const cartBtn = document.getElementById('cart-btn');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartCountEl = document.getElementById('cart-count');

function toggleCart() {
  cartSidebar.classList.toggle('open');
  cartOverlay.classList.toggle('open');
}

cartBtn.addEventListener('click', toggleCart);

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCart();
  showToast(`✦ ${name} ditambahkan ke keranjang`);
}

function addToCartFromModal() {
  addToCart(currentModal.name, currentModal.price);
  closeModal();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  updateCart();
}

function updateCart() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  cartCountEl.textContent = totalQty;
  document.getElementById('cart-total-price').textContent = formatPrice(total);

  const cartItemsEl = document.getElementById('cart-items');
  const cartEmpty = document.getElementById('cart-empty');
  const cartFooter = document.getElementById('cart-footer');

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(cartEmpty.cloneNode(true));
    cartFooter.style.display = 'none';
  } else {
    cartFooter.style.display = 'block';
    cartItemsEl.innerHTML = cart.map((item, i) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${i})">✕</button>
      </div>
    `).join('');
  }

  // Build WhatsApp checkout message
  if (cart.length > 0) {
    const msg = buildCheckoutMessage();
    document.getElementById('checkout-btn').href = `https://wa.me/6285864554590?text=${encodeURIComponent(msg)}`;
  }
}

function buildCheckoutMessage() {
  let msg = 'Halo Tobiee Collection, saya ingin memesan:\n\n';
  cart.forEach(item => {
    msg += `• ${item.name} x${item.qty} = ${formatPrice(item.price * item.qty)}\n`;
  });
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  msg += `\nTotal: ${formatPrice(total)}\n\nMohon informasi ketersediaan dan pengiriman. Terima kasih!`;
  return msg;
}

function formatPrice(price) {
  return 'Rp ' + price.toLocaleString('id-ID');
}

// Init cart footer hidden
document.getElementById('cart-footer').style.display = 'none';

// ===== PRODUCT MODAL =====
function openModal(name, desc, priceStr, img, tag) {
  const price = parseInt(priceStr);
  currentModal = { name, price, img, tag };

  document.getElementById('modal-name').textContent = name;
  document.getElementById('modal-desc').textContent = desc;
  document.getElementById('modal-price').textContent = formatPrice(price);
  document.getElementById('modal-img').src = img;
  document.getElementById('modal-img').alt = name;
  document.getElementById('modal-tag').textContent = tag || 'Premium';

  const waMsg = `Halo Tobiee Collection, saya ingin memesan ${name}`;
  document.getElementById('modal-wa-btn').href = `https://wa.me/6285864554590?text=${encodeURIComponent(waMsg)}`;

  // Reset size buttons
  document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('size-s').classList.add('active');

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Size button selection
document.querySelectorAll('.size-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// ===== FILTER TABS =====
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const filter = tab.dataset.filter;
    document.querySelectorAll('.product-card').forEach(card => {
      const category = card.dataset.category || '';
      if (filter === 'all' || category.includes(filter)) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeUp 0.5s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// ===== TESTIMONIALS SLIDER =====
const testiTrack = document.getElementById('testi-track');
const testiDots = document.querySelectorAll('.testi-dot');
const testiCards = document.querySelectorAll('.testi-card');

function updateTestiSlider(index) {
  if (!testiTrack) return;
  const cardWidth = testiCards[0] ? testiCards[0].offsetWidth + 24 : 300;
  const maxIndex = Math.max(0, testiCards.length - getVisibleCards());
  const clampedIndex = Math.min(index, maxIndex);
  testiTrack.style.transform = `translateX(-${clampedIndex * cardWidth}px)`;
  testiDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
  });
  testiIndex = index;
}

function getVisibleCards() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

testiDots.forEach(dot => {
  dot.addEventListener('click', () => {
    clearInterval(testiAuto);
    updateTestiSlider(parseInt(dot.dataset.index));
    startTestiAuto();
  });
});

function startTestiAuto() {
  testiAuto = setInterval(() => {
    const maxIndex = Math.max(0, testiCards.length - getVisibleCards());
    testiIndex = (testiIndex >= maxIndex) ? 0 : testiIndex + 1;
    updateTestiSlider(testiIndex);
  }, 4000);
}

startTestiAuto();
window.addEventListener('resize', () => updateTestiSlider(0));

// ===== SCROLL ANIMATIONS =====
function initAnimations() {
  // Add fade-up class to elements
  const animateEls = document.querySelectorAll(
    '.feature-item, .product-card, .testi-card, .contact-card, .stat-item'
  );
  animateEls.forEach(el => el.classList.add('fade-up'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, (i % 4) * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  animateEls.forEach(el => observer.observe(el));
}

// ===== COUNTER ANIMATION =====
function animateCounter(el, target) {
  const duration = 2000;
  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString('id-ID');
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.target);
      animateCounter(entry.target, target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

// ===== TOAST NOTIFICATION =====
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navH = navbar.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sTop = section.offsetTop - navbar.offsetHeight - 100;
    if (window.scrollY >= sTop) current = section.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = 'var(--gold-light)';
    }
  });
});

// ===== TOUCH SWIPE FOR TESTIMONIALS =====
let touchStartX = 0;
const testiSlider = document.getElementById('testi-slider');
if (testiSlider) {
  testiSlider.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  testiSlider.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      clearInterval(testiAuto);
      const maxIndex = Math.max(0, testiCards.length - getVisibleCards());
      if (delta > 0) {
        testiIndex = Math.min(testiIndex + 1, maxIndex);
      } else {
        testiIndex = Math.max(testiIndex - 1, 0);
      }
      updateTestiSlider(testiIndex);
      startTestiAuto();
    }
  }, { passive: true });
}

console.log('%c✦ TOBIEE COLLECTION ✦', 'color: #c9a84c; font-size: 24px; font-weight: bold;');
console.log('%cPremium Muslim Wear | @TobieeCollection', 'color: #8a7d6b; font-size: 14px;');
