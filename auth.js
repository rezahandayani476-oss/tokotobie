/* ============================================
   auth.js – Authentication System
============================================ */
const Auth = {
  current() { return JSON.parse(localStorage.getItem('tc_user') || 'null'); },
  getUsers() { return JSON.parse(localStorage.getItem('tc_users') || '[]'); },
  saveUsers(u) { localStorage.setItem('tc_users', JSON.stringify(u)); },
  setCurrentUser(u) { localStorage.setItem('tc_user', JSON.stringify(u)); },
  logout() {
    localStorage.removeItem('tc_user');
    Auth.renderNavAuth();
    showToast('Berhasil keluar 👋','info');
    App.navigate('home');
  },

  register(name, phone, email, pass) {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) return { ok: false, msg: 'Email sudah terdaftar' };
    if (pass.length < 6) return { ok: false, msg: 'Password minimal 6 karakter' };
    const user = { id: Date.now(), name, phone, email, pass, dob: '', gender: '', createdAt: new Date().toLocaleDateString('id-ID'), addresses: [] };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser(user);
    return { ok: true };
  },

  login(email, pass, remember) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.pass === pass);
    if (!user) return { ok: false, msg: 'Email atau password salah' };
    this.setCurrentUser(user);
    if (!remember) { /* session only – still using LS for SPA */ }
    return { ok: true };
  },

  updateProfile(data) {
    const user = this.current();
    if (!user) return;
    const updated = { ...user, ...data };
    this.setCurrentUser(updated);
    const users = this.getUsers().map(u => u.id === user.id ? updated : u);
    this.saveUsers(users);
    return updated;
  },

  changePassword(oldPass, newPass) {
    const user = this.current();
    if (!user) return { ok: false, msg: 'Tidak login' };
    if (user.pass !== oldPass) return { ok: false, msg: 'Password lama salah' };
    if (newPass.length < 6) return { ok: false, msg: 'Password baru minimal 6 karakter' };
    return { ok: true, data: { pass: newPass } };
  },

  renderNavAuth() {
    const area = document.getElementById('nav-auth-area');
    const user = this.current();
    if (!area) return;
    if (user) {
      area.innerHTML = `
        <div class="user-avatar-btn" id="user-avatar-btn">
          <div class="ua-circle">${user.name[0].toUpperCase()}</div>
          <div class="ua-info">
            <span class="ua-name">${user.name.split(' ')[0]}</span>
            <span class="ua-sub">Akun Saya ▾</span>
          </div>
        </div>`;
      document.getElementById('user-avatar-btn').addEventListener('click', e => {
        e.stopPropagation();
        const dd = document.getElementById('user-dropdown');
        dd.classList.toggle('open');
        const info = document.getElementById('ud-header-info');
        if (info) info.innerHTML = `<b>${user.name}</b><span>${user.email}</span>`;
      });
    } else {
      area.innerHTML = `
        <button class="btn-nav-login" id="btn-nav-login">Masuk</button>
        <button class="btn-nav-register" id="btn-nav-register">Daftar</button>`;
      document.getElementById('btn-nav-login').onclick = () => App.openAuth('login');
      document.getElementById('btn-nav-register').onclick = () => App.openAuth('register');
    }
  },

  initModal() {
    const modal = document.getElementById('auth-modal');
    const tabLogin = document.getElementById('tab-login');
    const tabReg = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    document.getElementById('auth-modal-close').onclick = () => modal.classList.remove('open');
    modal.onclick = (e) => { if(e.target===modal) modal.classList.remove('open'); };

    const showLogin = () => {
      tabLogin.classList.add('active'); tabReg.classList.remove('active');
      loginForm.classList.add('active'); regForm.classList.remove('active');
      document.getElementById('li-error').textContent='';
    };
    const showReg = () => {
      tabReg.classList.add('active'); tabLogin.classList.remove('active');
      regForm.classList.add('active'); loginForm.classList.remove('active');
      document.getElementById('reg-error').textContent='';
    };

    tabLogin.onclick = showLogin;
    tabReg.onclick = showReg;
    document.getElementById('sw-to-reg').onclick = (e) => { e.preventDefault(); showReg(); };
    document.getElementById('sw-to-login').onclick = (e) => { e.preventDefault(); showLogin(); };

    // Password toggles
    document.getElementById('li-toggle').onclick = () => togglePassVis('li-pass','li-toggle');
    document.getElementById('reg-toggle').onclick = () => togglePassVis('reg-pass','reg-toggle');

    loginForm.onsubmit = e => {
      e.preventDefault();
      const errEl = document.getElementById('li-error');
      const res = Auth.login(document.getElementById('li-email').value.trim(), document.getElementById('li-pass').value, document.getElementById('li-remember').checked);
      if (!res.ok) { errEl.textContent = res.msg; return; }
      modal.classList.remove('open');
      Auth.renderNavAuth();
      showToast(`Selamat datang, ${Auth.current().name}! 👋`,'success');
      Auth.postLoginAction && Auth.postLoginAction();
      Auth.postLoginAction = null;
    };

    regForm.onsubmit = e => {
      e.preventDefault();
      const errEl = document.getElementById('reg-error');
      const pass = document.getElementById('reg-pass').value;
      const conf = document.getElementById('reg-conf').value;
      if (pass !== conf) { errEl.textContent = 'Password tidak cocok'; return; }
      const res = Auth.register(document.getElementById('reg-name').value.trim(), document.getElementById('reg-phone').value.trim(), document.getElementById('reg-email').value.trim(), pass);
      if (!res.ok) { errEl.textContent = res.msg; return; }
      modal.classList.remove('open');
      Auth.renderNavAuth();
      showToast('Akun berhasil dibuat! Selamat belanja 🎉','success');
    };
  },

  initProfile() {
    const user = this.current();
    if (!user) { App.navigate('home'); App.openAuth(); return; }
    const av = document.getElementById('profile-avatar-big');
    if (av) { av.textContent = user.name[0].toUpperCase(); }
    const nd = document.getElementById('profile-name-display');
    const ed = document.getElementById('profile-email-display');
    if (nd) nd.textContent = user.name;
    if (ed) ed.textContent = user.email;

    const fillFn = id => { const el=document.getElementById(id); if(el) return; };
    const pf = {name:user.name,phone:user.phone||'',email:user.email,dob:user.dob||'',gender:user.gender||''};
    Object.entries(pf).forEach(([k,v])=>{ const el=document.getElementById('pf-'+k); if(el) el.value=v; });

    document.getElementById('profile-form').onsubmit = e => {
      e.preventDefault();
      const data = { name:document.getElementById('pf-name').value, phone:document.getElementById('pf-phone').value, dob:document.getElementById('pf-dob').value, gender:document.getElementById('pf-gender').value };
      Auth.updateProfile(data);
      const nd2 = document.getElementById('profile-name-display');
      if (nd2) nd2.textContent = data.name;
      const av2 = document.getElementById('profile-avatar-big');
      if (av2) av2.textContent = data.name[0].toUpperCase();
      Auth.renderNavAuth();
      showToast('Profil berhasil disimpan ✓','success');
    };

    document.getElementById('security-form').onsubmit = e => {
      e.preventDefault();
      const res = Auth.changePassword(document.getElementById('sf-old-pass').value, document.getElementById('sf-new-pass').value);
      if (!res.ok) { showToast(res.msg,'error'); return; }
      const conf = document.getElementById('sf-conf-pass').value;
      if (document.getElementById('sf-new-pass').value !== conf) { showToast('Konfirmasi password tidak cocok','error'); return; }
      Auth.updateProfile(res.data);
      showToast('Password berhasil diubah ✓','success');
      e.target.reset();
    };

    // Profile nav tabs
    document.querySelectorAll('.pnav-btn').forEach(btn => btn.onclick = () => {
      document.querySelectorAll('.pnav-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.ptab').forEach(t=>t.classList.remove('active'));
      document.getElementById('ptab-'+btn.dataset.ptab).classList.add('active');
    });

    // Addresses
    this.renderAddresses();
    document.getElementById('btn-add-addr').onclick = () => {
      const name = prompt('Label alamat (contoh: Rumah, Kantor):');
      if (!name) return;
      const addr = prompt('Alamat lengkap:');
      if (!addr) return;
      const user2 = Auth.current();
      user2.addresses = user2.addresses || [];
      user2.addresses.push({ label: name, address: addr, id: Date.now() });
      Auth.updateProfile(user2);
      Auth.renderAddresses();
    };
  },

  renderAddresses() {
    const el = document.getElementById('saved-addresses');
    if (!el) return;
    const user = Auth.current();
    const addrs = user?.addresses || [];
    if (!addrs.length) { el.innerHTML = '<p style="color:var(--text-m);font-size:13px">Belum ada alamat tersimpan</p>'; return; }
    el.innerHTML = addrs.map(a=>`
      <div class="saved-addr-card">
        <div class="sac-label"><span class="sac-tag">${a.label}</span></div>
        <div class="sac-addr">${a.address}</div>
      </div>`).join('');
  }
};

function togglePassVis(inputId, btnId) {
  const inp = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}
