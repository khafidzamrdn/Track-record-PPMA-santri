/* ============================================================
   TRACK RECORD SANTRI v1.0
   LocalStorage-based offline app
   ============================================================ */

const STORAGE_KEY = 'track_record_santri_v1';
const PIN_KEY = 'trs_pin';
const THEME_KEY = 'trs_theme';
const AUTOLOGOUT_KEY = 'trs_autologout';
const DEFAULT_PIN = '1234';
const AUTO_LOGOUT_MS = 5 * 60 * 1000; // 5 menit

let state = {
  santri: [],
  isAdmin: false,
  currentSantriId: null,
  pinBuffer: '',
  logoutTimer: null
};

/* ============================================================
   UTIL
   ============================================================ */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function uid() {
  return 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatRupiah(n) {
  const num = Number(n) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d)) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function toast(msg, ms = 2000) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('show'), ms);
}

/* ============================================================
   STORAGE
   ============================================================ */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Load error', e);
    return [];
  }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.santri));
  } catch (e) {
    console.error('Save error', e);
    toast('Gagal menyimpan data');
  }
}

function getPin() {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

function setPin(pin) {
  localStorage.setItem(PIN_KEY, String(pin));
}

/* ============================================================
   THEME
   ============================================================ */
function applyTheme() {
  const theme = localStorage.getItem(THEME_KEY) || 'light';
  document.body.classList.toggle('dark', theme === 'dark');
  const icon = theme === 'dark' ? '☀️' : '🌙';
  const t1 = $('#themeToggleHome');
  const t2 = $('#themeToggleDash');
  if (t1) t1.textContent = icon;
  if (t2) t2.textContent = icon;
}

function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'light';
  localStorage.setItem(THEME_KEY, current === 'dark' ? 'light' : 'dark');
  applyTheme();
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function showScreen(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

/* ============================================================
   DEMO DATA
   ============================================================ */
function getDemoData() {
  return [
    {
      id: 'S001',
      nama: 'Ahmad Fauzi',
      kelas: 'XI-A',
      alamat: 'Jl. Pesantren No. 12, Bandung',
      wali: '081234567890',
      prestasi: [
        { id: uid(), nama: 'Juara 1 MTQ', tingkat: 'kabupaten', tanggal: '2024-03-15', keterangan: 'Tilawah dewasa' },
        { id: uid(), nama: 'Juara 2 Hafalan Juz 30', tingkat: 'sekolah', tanggal: '2024-05-20', keterangan: '-' }
      ],
      pelanggaran: [
        { id: uid(), jenis: 'Terlambat sholat', tanggal: '2024-06-10', kategori: 'ringan', keterangan: 'Terlambat 3x', tindakan: 'Teguran lisan' }
      ],
      tagihan: [
        { id: uid(), bulan: 'Januari 2025', jenis: 'SPP Bulanan', nominal: 350000, status: 'lunas', tanggalBayar: '2025-01-10' },
        { id: uid(), bulan: 'Februari 2025', jenis: 'SPP Bulanan', nominal: 350000, status: 'belum', tanggalBayar: '' }
      ]
    },
    {
      id: 'S002',
      nama: 'Muhammad Rizki',
      kelas: 'X-B',
      alamat: 'Jl. Merdeka No. 5, Cimahi',
      wali: '082198765432',
      prestasi: [
        { id: uid(), nama: 'Juara 3 Lomba Pidato', tingkat: 'kecamatan', tanggal: '2024-08-01', keterangan: 'Bahasa Arab' }
      ],
      pelanggaran: [],
      tagihan: [
        { id: uid(), bulan: 'Januari 2025', jenis: 'SPP Bulanan', nominal: 350000, status: 'lunas', tanggalBayar: '2025-01-08' }
      ]
    },
    {
      id: 'S003',
      nama: 'Abdullah Hakim',
      kelas: 'XII-C',
      alamat: 'Jl. Raya Padalarang No. 88',
      wali: '',
      prestasi: [],
      pelanggaran: [
        { id: uid(), jenis: 'Meninggalkan kelas', tanggal: '2025-01-12', kategori: 'sedang', keterangan: 'Tanpa izin', tindakan: 'Panggilan wali' },
        { id: uid(), jenis: 'Merokok', tanggal: '2024-11-05', kategori: 'berat', keterangan: 'Tertangkap basah', tindakan: 'Skorsing 3 hari' }
      ],
      tagihan: [
        { id: uid(), bulan: 'Desember 2024', jenis: 'SPP Bulanan', nominal: 350000, status: 'belum', tanggalBayar: '' },
        { id: uid(), bulan: 'Januari 2025', jenis: 'SPP Bulanan', nominal: 350000, status: 'belum', tanggalBayar: '' }
      ]
    },
    {
      id: 'S004',
      nama: 'Fatimah Az-Zahra',
      kelas: 'XI-A',
      alamat: 'Jl. Cihampelas No. 21',
      wali: '085678912345',
      prestasi: [
        { id: uid(), nama: 'Juara 1 Olimpiade Sains', tingkat: 'provinsi', tanggal: '2024-09-12', keterangan: 'Matematika' }
      ],
      pelanggaran: [],
      tagihan: []
    },
    {
      id: 'S005',
      nama: 'Yusuf Ibrahim',
      kelas: 'X-A',
      alamat: 'Jl. Setiabudi No. 44',
      wali: '081112223333',
      prestasi: [],
      pelanggaran: [],
      tagihan: [
        { id: uid(), bulan: 'Januari 2025', jenis: 'Uang Gedung', nominal: 1500000, status: 'lunas', tanggalBayar: '2025-01-05' }
      ]
    }
  ];
}

function loadDemoIfFirstTime() {
  const flag = localStorage.getItem('trs_demo_loaded');
  if (!flag) {
    if (state.santri.length === 0) {
      state.santri = getDemoData();
      saveData();
    }
    localStorage.setItem('trs_demo_loaded', '1');
  }
}

/* ============================================================
   SPLASH
   ============================================================ */
function initSplash() {
    showScreen('home');
}

/* ============================================================
   HOME - PUBLIC SEARCH
   ============================================================ */
function publicSearch() {
  const q = $('#publicSearch').value.trim().toLowerCase();
  const box = $('#publicResult');
  if (!q) {
    box.innerHTML = '<div class="empty-result">Masukkan kata kunci pencarian.</div>';
    return;
  }
  const results = state.santri.filter(s =>
    s.nama.toLowerCase().includes(q) ||
    s.kelas.toLowerCase().includes(q) ||
    s.id.toLowerCase().includes(q)
  );
  if (results.length === 0) {
    box.innerHTML = '<div class="empty-result">Data santri tidak ditemukan.</div>';
    return;
  }
  box.innerHTML = results.map(s => `
    <div class="public-card">
      <div><b>${escapeHtml(s.nama)}</b></div>
      <div style="font-size:13px;color:var(--text-soft);margin-top:2px;">
        ID: ${escapeHtml(s.id)} • Kelas: ${escapeHtml(s.kelas)}
      </div>
      <div class="locked">🔒 Detail lengkap hanya untuk admin</div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ============================================================
   LOGIN PIN
   ============================================================ */
function updatePinDisplay() {
  const dots = $$('#pinDisplay .pin-dot');
  dots.forEach((d, i) => {
    d.classList.toggle('filled', i < state.pinBuffer.length);
  });
}

function pinInput(num) {
  const errEl = $('#pinError');
  errEl.textContent = '';

  if (num === 'del') {
    state.pinBuffer = state.pinBuffer.slice(0, -1);
    updatePinDisplay();
    return;
  }
  if (num === 'ok') {
    doLogin();
    return;
  }
  if (state.pinBuffer.length >= 4) return;
  state.pinBuffer += num;
  updatePinDisplay();
  if (state.pinBuffer.length === 4) {
    setTimeout(doLogin, 180);
  }
}

function doLogin() {
  const errEl = $('#pinError');
  if (state.pinBuffer === getPin()) {
    state.isAdmin = true;
    state.pinBuffer = '';
    updatePinDisplay();
    errEl.textContent = '';
    showScreen('dashboard');
    refreshDashboard();
    startAutoLogout();
    toast('Login berhasil ✅');
  } else {
    errEl.textContent = '❌ PIN salah. Coba lagi.';
    state.pinBuffer = '';
    updatePinDisplay();
  }
}

function logout(silent) {
  state.isAdmin = false;
  state.currentSantriId = null;
  stopAutoLogout();
  showScreen('home');
  if (!silent) toast('Anda telah logout');
}

/* ============================================================
   AUTO LOGOUT
   ============================================================ */
function startAutoLogout() {
  stopAutoLogout();
  const enabled = localStorage.getItem(AUTOLOGOUT_KEY) !== '0';
  if (!enabled) return;
  state.logoutTimer = setTimeout(() => {
    if (state.isAdmin) logout();
  }, AUTO_LOGOUT_MS);
}

function stopAutoLogout() {
  if (state.logoutTimer) {
    clearTimeout(state.logoutTimer);
    state.logoutTimer = null;
  }
}

/* ============================================================
   DASHBOARD
   ============================================================ */
function refreshDashboard() {
  const totalSantri = state.santri.length;
  const totalPrestasi = state.santri.reduce((acc, s) => acc + (s.prestasi?.length || 0), 0);
  const totalPelanggaran = state.santri.reduce((acc, s) => acc + (s.pelanggaran?.length || 0), 0);
  const totalTagihan = state.santri.reduce((acc, s) => {
    const belum = (s.tagihan || []).filter(t => t.status === 'belum')
      .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);
    return acc + belum;
  }, 0);

  $('#statSantri').textContent = totalSantri;
  $('#statPrestasi').textContent = totalPrestasi;
  $('#statPelanggaran').textContent = totalPelanggaran;
  $('#statTagihan').textContent = formatRupiah(totalTagihan);
}

/* ============================================================
   FORM SANTRI
   ============================================================ */
function openFormSantri(editId) {
  $('#formTitle').textContent = editId ? 'Edit Santri' : 'Tambah Santri';
  $('#fEditId').value = editId || '';

  if (editId) {
    const s = state.santri.find(x => x.id === editId);
    if (s) {
      $('#fId').value = s.id;
      $('#fNama').value = s.nama;
      $('#fKelas').value = s.kelas;
      $('#fAlamat').value = s.alamat || '';
      $('#fWali').value = s.wali || '';
    }
  } else {
    $('#santriForm').reset();
    $('#fEditId').value = '';
  }
  showScreen('formSantri');
}

function submitSantriForm(e) {
  e.preventDefault();
  const editId = $('#fEditId').value;
  const id = $('#fId').value.trim();
  const nama = $('#fNama').value.trim();
  const kelas = $('#fKelas').value.trim();
  const alamat = $('#fAlamat').value.trim();
  const wali = $('#fWali').value.trim();

  if (!id || !nama || !kelas || !alamat) {
    toast('Lengkapi semua field wajib');
    return;
  }

  if (!editId) {
    // cek duplikat ID
    if (state.santri.some(s => s.id === id)) {
      toast('ID Santri sudah digunakan');
      return;
    }
    state.santri.push({
      id, nama, kelas, alamat, wali,
      prestasi: [],
      pelanggaran: [],
      tagihan: []
    });
    toast('Santri berhasil ditambahkan');
  } else {
    const s = state.santri.find(x => x.id === editId);
    if (!s) return;
    if (id !== editId && state.santri.some(x => x.id === id)) {
      toast('ID Santri sudah digunakan');
      return;
    }
    s.id = id;
    s.nama = nama;
    s.kelas = kelas;
    s.alamat = alamat;
    s.wali = wali;
    toast('Data santri diperbarui');
  }
  saveData();
  refreshDashboard();
  showScreen('dashboard');
}

/* ============================================================
   LIST SANTRI
   ============================================================ */
function renderSantriList() {
  const q = $('#listSearch').value.trim().toLowerCase();
  const filterKelas = $('#filterKelas').value;
  const filterStatus = $('#filterStatus').value;
  const sortBy = $('#sortBy').value;

  let list = [...state.santri];

  if (q) {
    list = list.filter(s =>
      s.nama.toLowerCase().includes(q) ||
      s.kelas.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    );
  }
  if (filterKelas) {
    list = list.filter(s => s.kelas === filterKelas);
  }
  if (filterStatus === 'prestasi') {
    list = list.filter(s => (s.prestasi || []).length > 0);
  } else if (filterStatus === 'pelanggaran') {
    list = list.filter(s => (s.pelanggaran || []).length > 0);
  } else if (filterStatus === 'tagihan') {
    list = list.filter(s => (s.tagihan || []).some(t => t.status === 'belum'));
  }

  // sort
  switch (sortBy) {
    case 'namaAZ': list.sort((a, b) => a.nama.localeCompare(b.nama)); break;
    case 'namaZA': list.sort((a, b) => b.nama.localeCompare(a.nama)); break;
    case 'terbaru': list.sort((a, b) => b.id.localeCompare(a.id)); break;
    case 'terlama': list.sort((a, b) => a.id.localeCompare(b.id)); break;
  }

  const container = $('#santriList');
  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state">Data santri tidak ditemukan.</div>';
    return;
  }

  container.innerHTML = list.map(s => {
    const pCount = (s.prestasi || []).length;
    const vCount = (s.pelanggaran || []).length;
    const hasUnpaid = (s.tagihan || []).some(t => t.status === 'belum');
    return `
      <div class="santri-item" data-id="${escapeHtml(s.id)}">
        <div class="avatar">${escapeHtml((s.nama[0] || '?').toUpperCase())}</div>
        <div class="santri-info">
          <b>${escapeHtml(s.nama)}</b>
          <small>ID: ${escapeHtml(s.id)} • Kelas: ${escapeHtml(s.kelas)}</small>
          <div>
            ${pCount ? `<span class="santri-badge badge-prestasi">🏆 ${pCount}</span>` : ''}
            ${vCount ? `<span class="santri-badge badge-pelanggaran">⚠️ ${vCount}</span>` : ''}
            ${hasUnpaid ? `<span class="santri-badge badge-tagihan">💰 Belum Lunas</span>` : ''}
          </div>
        </div>
        <div style="color:var(--text-soft);">›</div>
      </div>
    `;
  }).join('');
}

function refreshKelasFilter() {
  const sel = $('#filterKelas');
  const current = sel.value;
  const kelasSet = new Set(state.santri.map(s => s.kelas));
  const options = ['<option value="">Semua Kelas</option>'];
  [...kelasSet].sort().forEach(k => {
    options.push(`<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`);
  });
  sel.innerHTML = options.join('');
  if ([...kelasSet].includes(current)) sel.value = current;
}

/* ============================================================
   DETAIL SANTRI
   ============================================================ */
function openDetail(id) {
  const s = state.santri.find(x => x.id === id);
  if (!s) return;
  state.currentSantriId = id;

  $('#dAvatar').textContent = (s.nama[0] || '?').toUpperCase();
  $('#dNama').textContent = s.nama;
  $('#dKelas').textContent = s.kelas;
  $('#dAlamat').textContent = s.alamat || '-';
  const waliWrap = $('#dWaliWrap');
  if (s.wali) {
    waliWrap.style.display = '';
    $('#dWali').textContent = s.wali;
  } else {
    waliWrap.style.display = 'none';
  }

  $('#pId').textContent = s.id;
  $('#pNama').textContent = s.nama;
  $('#pKelas').textContent = s.kelas;
  $('#pAlamat').textContent = s.alamat || '-';
  $('#pWali').textContent = s.wali || '-';

  renderDetailPrestasi(s);
  renderDetailPelanggaran(s);
  renderDetailTagihan(s);

  // reset tab
  $$('#detailSantri .tab').forEach(t => t.classList.remove('active'));
  $$('#detailSantri .tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('#detailSantri .tab[data-tab="profil"]').classList.add('active');
  $('#tab-profil').classList.add('active');

  showScreen('detailSantri');
}

function renderDetailPrestasi(s) {
  const box = $('#listPrestasi');
  if (!s.prestasi || s.prestasi.length === 0) {
    box.innerHTML = '<div class="empty-state">Belum ada data prestasi.</div>';
    return;
  }
  box.innerHTML = s.prestasi.map(p => `
    <div class="item-card">
      <h4>🏆 ${escapeHtml(p.nama)}</h4>
      <p>Tingkat: <b>${escapeHtml(p.tingkat)}</b></p>
      <p>Tanggal: ${formatDate(p.tanggal)}</p>
      ${p.keterangan ? `<p>Ket: ${escapeHtml(p.keterangan)}</p>` : ''}
      <div class="item-actions">
        <button data-edit-item="prestasi" data-item-id="${p.id}">✏️ Edit</button>
        <button class="del-btn" data-del-item="prestasi" data-item-id="${p.id}">🗑️ Hapus</button>
      </div>
    </div>
  `).join('');
}

function renderDetailPelanggaran(s) {
  const box = $('#listPelanggaran');
  if (!s.pelanggaran || s.pelanggaran.length === 0) {
    box.innerHTML = '<div class="empty-state">Belum ada data pelanggaran.</div>';
    return;
  }
  box.innerHTML = s.pelanggaran.map(p => `
    <div class="item-card warn">
      <h4>⚠️ ${escapeHtml(p.jenis)}</h4>
      <p>Kategori: <b>${escapeHtml(p.kategori || '-')}</b></p>
      <p>Tanggal: ${formatDate(p.tanggal)}</p>
      ${p.keterangan ? `<p>Ket: ${escapeHtml(p.keterangan)}</p>` : ''}
      ${p.tindakan ? `<p>Tindakan: ${escapeHtml(p.tindakan)}</p>` : ''}
      <div class="item-actions">
        <button data-edit-item="pelanggaran" data-item-id="${p.id}">✏️ Edit</button>
        <button class="del-btn" data-del-item="pelanggaran" data-item-id="${p.id}">🗑️ Hapus</button>
      </div>
    </div>
  `).join('');
}

function renderDetailTagihan(s) {
  const box = $('#listTagihan');
  const totalBelum = (s.tagihan || [])
    .filter(t => t.status === 'belum')
    .reduce((sum, t) => sum + (Number(t.nominal) || 0), 0);

  const totalBox = $('#totalTagihanBelum');
  if (totalBelum > 0) {
    totalBox.style.display = '';
    totalBox.innerHTML = `Total Belum Lunas<b>${formatRupiah(totalBelum)}</b>`;
  } else {
    totalBox.style.display = 'none';
  }

  if (!s.tagihan || s.tagihan.length === 0) {
    box.innerHTML = '<div class="empty-state">Belum ada data tagihan.</div>';
    return;
  }
  box.innerHTML = s.tagihan.map(t => `
    <div class="item-card money">
      <h4>💰 ${escapeHtml(t.jenis)}</h4>
      <p>Bulan: ${escapeHtml(t.bulan)}</p>
      <p>Nominal: <b>${formatRupiah(t.nominal)}</b></p>
      ${t.tanggalBayar ? `<p>Tanggal Bayar: ${formatDate(t.tanggalBayar)}</p>` : ''}
      <span class="status-badge ${t.status === 'lunas' ? 'status-lunas' : 'status-belum'}">
        ${t.status === 'lunas' ? '✓ LUNAS' : '✗ BELUM LUNAS'}
      </span>
      <div class="item-actions">
        <button data-edit-item="tagihan" data-item-id="${t.id}">✏️ Edit</button>
        <button class="del-btn" data-del-item="tagihan" data-item-id="${t.id}">🗑️ Hapus</button>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   ITEM MODAL (prestasi/pelanggaran/tagihan)
   ============================================================ */
let itemModalState = { type: null, editId: null };

function openItemModal(type, editId) {
  const s = state.santri.find(x => x.id === state.currentSantriId);
  if (!s) return;
  itemModalState.type = type;
  itemModalState.editId = editId || null;

  const titleMap = { prestasi: 'Prestasi', pelanggaran: 'Pelanggaran', tagihan: 'Tagihan' };
  $('#itemModalTitle').textContent = (editId ? 'Edit
