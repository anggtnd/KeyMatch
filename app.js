// 1. CONFIGURATION SUPABASE
const SUPABASE_URL = "https://elzncubwogaabejekevz.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsem5jdWJ3b2dhYWJlamVrZXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTY2NDUsImV4cCI6MjA5NzM5MjY0NX0.P861FHbaZ0y3hMv-C3qPi8o6JqdZbndKX8D5aro0SSM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. DOM ELEMENTS SELECTION
const authSection = document.getElementById('authSection');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

const mainAppSection = document.getElementById('mainAppSection');
const userDisplayEmail = document.getElementById('userDisplayEmail');
const logoutBtn = document.getElementById('logoutBtn');
const keywordInput = document.getElementById('keywordInput');
const searchBtn = document.getElementById('searchBtn');
const resultSection = document.getElementById('resultSection');
const keywordsContainer = document.getElementById('keywordsContainer');
const queryResult = document.getElementById('queryResult');
const copyQueryBtn = document.getElementById('copyQueryBtn');
const saveToFavoriteBtn = document.getElementById('saveToFavoriteBtn');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');
const clearBtn = document.getElementById('clearBtn');

const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const toggleSidebarLaptopBtn = document.getElementById('toggleSidebarLaptopBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarAside = document.getElementById('sidebarAside');

const menuSearch = document.getElementById('menuSearch');
const menuFavorites = document.getElementById('menuFavorites');
const menuHistory = document.getElementById('menuHistory');
const menuProfile = document.getElementById('menuProfile');

const pageSearch = document.getElementById('pageSearch');
const pageFavorites = document.getElementById('pageFavorites');
const pageHistory = document.getElementById('pageHistory');
const pageProfile = document.getElementById('pageProfile');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const favoritesListContainer = document.getElementById('favoritesListContainer');

const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeStatus = document.getElementById('darkModeStatus');

const profileEmailDisplay = document.getElementById('profileEmailDisplay');
const profileNameInput = document.getElementById('profileNameInput');
const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const profileAvatar = document.getElementById('profileAvatar');
const profileCardName = document.getElementById('profileCardName');
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const editActionGroup = document.getElementById('editActionGroup');

let currentSavedName = '';
const cuteAvatars = ['✨', '👩‍💻', '🚀', '🦊', '🧠', '💡', '🌟', '🎨', '🌸', '🐾'];
let currentAvatarEmoji = '👩‍💻';

const academicBannedWords = [
    'book', 'books', 'frame', 'heads', 'head', 'rebellion', 'insurrection', 
    'court', 'rebel', 'glasnost', 'landsat', 'artifact', 'toy', 'thing', 
    'names', 'name', 'open market operations', 'cybermind', 'sapient', 'sophont'
];

// 3. APPLICATION LIFE-CYCLE & INITIALIZATION
window.addEventListener('DOMContentLoaded', async () => {
    initAppEvents();
    initDarkMode();
    handleResize();

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showMainApp(session.user.email);
    } else {
        showAuthForm();
    }
});

window.addEventListener('resize', handleResize);

function initAppEvents() {
    // Auth Actions
    registerBtn.addEventListener('click', handleRegister);
    loginBtn.addEventListener('click', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    // Sidebar & Navigation
    if(toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
    if(toggleSidebarLaptopBtn) toggleSidebarLaptopBtn.addEventListener('click', toggleSidebar);
    if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);

    menuSearch.addEventListener('click', () => switchTab(menuSearch, pageSearch));
    menuFavorites.addEventListener('click', () => {
        switchTab(menuFavorites, pageFavorites);
        renderFavorites();
    });
    menuHistory.addEventListener('click', () => {
        switchTab(menuHistory, pageHistory);
        renderHistory();
    });
    menuProfile.addEventListener('click', () => {
        switchTab(menuProfile, pageProfile);
        loadUserProfileData();
    });

    // Search Actions
    searchBtn.addEventListener('click', fetchSynonyms);
    keywordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchSynonyms(); });
    keywordInput.addEventListener('input', toggleClearButton);
    clearBtn.addEventListener('click', clearSearchInput);
    saveToFavoriteBtn.addEventListener('click', addCurrentToFavorites);

    // Profile Actions
    editProfileBtn.addEventListener('click', unlockProfileForm);
    cancelProfileBtn.addEventListener('click', revertProfileForm);
    changeAvatarBtn.addEventListener('click', rotateAvatarEmoji);
    saveProfileBtn.addEventListener('click', saveUserProfile);

    // Global History Actions
    if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', clearAllHistoryData);
    if (exportHistoryBtn) exportHistoryBtn.addEventListener('click', exportHistoryToCSV);

    // Dark Mode Toggle Trigger
    darkModeToggle.addEventListener('click', toggleDarkMode);
}

// 4. DARK MODE LOGIC
function initDarkMode() {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        darkModeStatus.textContent = "Aktif 🌙";
    } else {
        document.documentElement.classList.remove('dark');
        darkModeStatus.textContent = "Nonaktif ☀️";
    }
}

function toggleDarkMode() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        darkModeStatus.textContent = "Nonaktif ☀️";
        showToastNotification('Mode Terang Diaktifkan');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        darkModeStatus.textContent = "Aktif 🌙";
        showToastNotification('Mode Gelap Diaktifkan');
    }
}

// 5. AUTHENTICATION LOGIC
async function handleRegister() {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (!email || !password) return alert('Email dan password harus diisi!');
    if (password.length < 6) return alert('Password minimal harus 6 karakter!');

    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        alert(error.message.includes("User already registered") ? 'Email sudah terdaftar!' : 'Gagal daftar: ' + error.message);
    } else {
        alert('Pendaftaran berhasil! Silakan masuk.');
    }
}

async function handleLogin() {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    if (!email || !password) return alert('Email dan password harus diisi!');

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert('Gagal masuk: ' + error.message);
    else showMainApp(data.user.email);
}

async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (!error) {
        showAuthForm();
        authEmail.value = '';
        authPassword.value = '';
        clearSearchInput();
        resultSection.classList.add('hidden');
    }
}

async function showMainApp(email) {
    authSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    userDisplayEmail.textContent = (user?.user_metadata?.full_name) ? user.user_metadata.full_name : email;
    handleResize();
}

function showAuthForm() {
    authSection.classList.remove('hidden');
    mainAppSection.classList.add('hidden');
}

// 6. SEARCH LOGIC & SYNONYMS CORE
async function fetchSynonyms() {
    const word = keywordInput.value.trim();
    if (!word) {
        showToastNotification('Kata kunci tidak boleh kosong!');
        keywordInput.focus();
        return;
    }

    loading.classList.remove('hidden');
    resultSection.classList.add('hidden');
    keywordsContainer.innerHTML = '';

    try {
        const apiUrl = `https://api.datamuse.com/words?ml=${encodeURIComponent(word)}&topics=government,technology,science,administration&max=25`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        loading.classList.add('hidden');

        if (data.length === 0) return alert('Maaf, tidak ditemukan padanan kata.');

        const filteredData = data.filter(item => {
            const lowerWord = item.word.toLowerCase();
            return !academicBannedWords.some(banned => lowerWord.includes(banned));
        });

        const finalData = filteredData.slice(0, 12);
        if (finalData.length === 0) return alert('Maaf, tidak ditemukan kata ilmiah standar akademis.');

        resultSection.classList.remove('hidden');
        let scopusWords = [word];

        finalData.forEach(item => {
            scopusWords.push(item.word);
            const badge = document.createElement('button');
            badge.className = "bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-700 dark:hover:text-indigo-200 text-slate-700 dark:text-slate-200 font-medium px-3 py-2 rounded-xl text-sm transition-all duration-150 flex items-center border border-slate-200/60 dark:border-slate-600 active:scale-95";
            badge.innerHTML = `${item.word} <span class="text-slate-300 ml-1.5 text-xs">📋</span>`;
            badge.addEventListener('click', () => {
                copyToClipboard(item.word);
                showToastNotification('Kata berhasil disalin!');
            });
            keywordsContainer.appendChild(badge);
        });

        const formattedQuery = `TITLE-ABS-KEY (${scopusWords.map(w => `"${w}"`).join(' OR ')})`;
        queryResult.value = formattedQuery;

        await saveToHistory(word, formattedQuery);

        copyQueryBtn.onclick = () => {
            copyToClipboard(formattedQuery);
            showToastNotification('Seluruh query OR berhasil disalin!');
        };

    } catch (error) {
        loading.classList.add('hidden');
        alert('Terjadi kesalahan koneksi.');
    }
}

function clearSearchInput() {
    keywordInput.value = '';
    clearBtn.classList.add('hidden');
    keywordInput.focus();
}

function toggleClearButton() {
    clearBtn.classList.toggle('hidden', keywordInput.value.trim().length === 0);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => console.error(err));
}

function showToastNotification(message) {
    toast.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); }, 2500);
}

// 7. FAVORITES FEATURE LOGIC
async function addCurrentToFavorites() {
    const word = keywordInput.value.trim();
    const result = queryResult.value;
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user || !word || !result) return;

    // Check duplicate first
    const { data: existing } = await supabaseClient.from('favorites').select('id').eq('user_id', user.id).eq('keyword', word);
    if (existing && existing.length > 0) {
        return showToastNotification('Kata kunci ini sudah ada di favorit!');
    }

    const { error } = await supabaseClient.from('favorites').insert([{ user_id: user.id, keyword: word, result: result }]);
    if (!error) showToastNotification('⭐ Tersimpan ke Favorit!');
    else alert(error.message);
}

async function renderFavorites() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    try {
        const { data: favs, error } = await supabaseClient.from('favorites').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;

        if (!favs || favs.length === 0) {
            favoritesListContainer.innerHTML = `<p class="text-slate-400 italic text-center py-4">Belum ada kata kunci favorit.</p>`;
            return;
        }

        favoritesListContainer.innerHTML = '';
        favs.forEach(item => {
            const row = document.createElement('div');
            row.className = "flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-xl transition cursor-pointer group";
            row.innerHTML = `
                <div class="flex justify-between items-center w-full">
                    <div class="flex items-center gap-3 fav-click flex-grow">
                        <span class="text-amber-400 text-base">⭐</span>
                        <div class="font-semibold text-slate-700 dark:text-slate-200">${item.keyword}</div>
                    </div>
                    <button class="delete-fav text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition" data-id="${item.id}">🗑️</button>
                </div>
            `;

            row.querySelector('.fav-click').addEventListener('click', () => {
                keywordInput.value = item.keyword;
                toggleClearButton();
                switchTab(menuSearch, pageSearch);
                resultSection.classList.remove('hidden');
                queryResult.value = item.result;
            });

            row.querySelector('.delete-fav').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Hapus dari favorit?')) {
                    await supabaseClient.from('favorites').delete().eq('id', item.id);
                    renderFavorites();
                }
            });
            favoritesListContainer.appendChild(row);
        });
    } catch (err) {
        console.error(err);
    }
}

// 8. SIDEBAR & NAVIGATION RESPONSIVENESS
function toggleSidebar() {
    sidebarAside.classList.toggle('-translate-x-full');
}

function handleResize() {
    if (window.innerWidth >= 768) sidebarAside.classList.remove('-translate-x-full');
    else sidebarAside.classList.add('-translate-x-full');
}

function switchTab(activeMenuBtn, activePageEl) {
    [menuSearch, menuFavorites, menuHistory, menuProfile].forEach(btn => {
        btn.className = "w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-xl text-sm text-left transition-all duration-150";
    });
    [pageSearch, pageFavorites, pageHistory, pageProfile].forEach(page => page.classList.add('hidden'));

    activeMenuBtn.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    activePageEl.classList.remove('hidden');
    if (window.innerWidth < 768) sidebarAside.classList.add('-translate-x-full');
}

// 9. SEARCH HISTORY & EXPORT EXCEL/CSV LOGIC
async function saveToHistory(word, result) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await supabaseClient.from('history').insert([{ user_id: user.id, keyword: word, result: result }]);
}

async function renderHistory() {
    const historyListContainer = document.getElementById('historyListContainer');
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    try {
        const { data: history, error } = await supabaseClient.from('history').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;

        if (!history || history.length === 0) {
            historyListContainer.innerHTML = `<p class="text-slate-400 italic text-center py-4">Belum ada riwayat pencarian.</p>`;
            return;
        }
        
        historyListContainer.innerHTML = '';
        history.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = "flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-xl transition cursor-pointer group";
            itemRow.innerHTML = `
                <div class="flex justify-between items-start w-full">
                    <div class="flex items-start gap-3 history-clickable-area flex-grow">
                        <span class="text-slate-400">🕒</span>
                        <div>
                            <div class="font-medium text-slate-700 dark:text-slate-200">${item.keyword}</div>
                            <div class="text-xs text-slate-400 mt-1">${new Date(item.created_at).toLocaleString('id-ID')}</div>
                        </div>
                    </div>
                    <button class="delete-single-history text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition" data-id="${item.id}">🗑️</button>
                </div>
            `;
            
            itemRow.querySelector('.history-clickable-area').addEventListener('click', () => {
                keywordInput.value = item.keyword;
                toggleClearButton();
                switchTab(menuSearch, pageSearch);
                resultSection.classList.remove('hidden');
                queryResult.value = item.result;
            });

            itemRow.querySelector('.delete-single-history').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Hapus riwayat ini?')) {
                    await supabaseClient.from('history').delete().eq('id', item.id);
                    renderHistory();
                }
            });
            historyListContainer.appendChild(itemRow);
        });

        const exportBtn = document.getElementById('exportHistoryBtn');
        if (exportBtn) {
            // Hapus listener lama jika ada agar tidak double download
            exportBtn.onclick = null; 
            exportBtn.onclick = async () => {
                // Gunakan langsung data 'history' yang sudah kita ambil di atas
                if (!history || history.length === 0) return alert('Tidak ada data riwayat untuk diekspor!');

                let csvContent = "\uFEFFKeyword,Scopus Query,Tanggal Pencarian\n"; 
                history.forEach(row => {
                    const cleanKeyword = `"${row.keyword.replace(/"/g, '""')}"`;
                    const cleanResult = `"${row.result.replace(/"/g, '""')}"`;
                    const cleanDate = `"${new Date(row.created_at).toLocaleString('id-ID')}"`;
                    csvContent += `${cleanKeyword},${cleanResult},${cleanDate}\n`;
                });

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", `KeyMatch_History_Export.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showToastNotification("📄 File CSV Berhasil Diunduh!");
            };
        }

    } catch (err) { console.error(err); }
}

async function exportHistoryToCSV() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: history } = await supabaseClient.from('history').select('keyword, result, created_at').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!history || history.length === 0) return alert('Tidak ada data riwayat untuk diekspor!');

    // Saring string agar aman dibaca CSV Excel (Escaping double quotes)
    let csvContent = "\uFEFFKeyword,Scopus Query,Tanggal Pencarian\n"; 
    history.forEach(row => {
        const safeKeyword = row.keyword || '';
        const safeResult = row.result || '';
        const cleanKeyword = `"${safeKeyword.replace(/"/g, '""')}"`;
        const cleanResult = `"${safeResult.replace(/"/g, '""')}"`;
        const cleanDate = `"${new Date(row.created_at).toLocaleString('id-ID')}"`;
        csvContent += `${cleanKeyword},${cleanResult},${cleanDate}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KeyMatch_History_Export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastNotification("📄 File CSV Berhasil Diunduh!");
}

async function clearAllHistoryData() {
    if (!confirm('Hapus semua riwayat?')) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    await supabaseClient.from('history').delete().eq('user_id', user.id);
    renderHistory();
}

// 10. PROFILE LOGIC
async function loadUserProfileData() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    profileEmailDisplay.textContent = user.email;
    currentAvatarEmoji = user.user_metadata?.avatar_emoji || '👩‍💻';
    profileAvatar.textContent = currentAvatarEmoji;
    currentSavedName = user.user_metadata?.full_name || '';
    profileNameInput.value = currentSavedName;
    profileCardName.textContent = currentSavedName || user.email.split('@')[0];
    lockProfileForm();
}

function unlockProfileForm() {
    profileNameInput.disabled = false;
    profileNameInput.classList.replace('bg-slate-50', 'bg-white');
    changeAvatarBtn.disabled = false;
    changeAvatarBtn.classList.remove('opacity-0', 'scale-75', 'pointer-events-none');
    editProfileBtn.classList.add('hidden');
    editActionGroup.classList.remove('hidden');
}

function lockProfileForm() {
    profileNameInput.disabled = true;
    profileNameInput.classList.replace('bg-white', 'bg-slate-50');
    changeAvatarBtn.disabled = true;
    changeAvatarBtn.classList.add('opacity-0', 'scale-75', 'pointer-events-none');
    editProfileBtn.classList.remove('hidden');
    editActionGroup.classList.add('hidden');
}

function revertProfileForm() {
    loadUserProfileData();
}

function rotateAvatarEmoji() {
    let nextIdx = Math.floor(Math.random() * cuteAvatars.length);
    profileAvatar.textContent = cuteAvatars[nextIdx];
}

async function saveUserProfile() {
    const name = profileNameInput.value.trim();
    if (!name) return alert('Nama wajib diisi!');
    const { error } = await supabaseClient.auth.updateUser({ data: { full_name: name, avatar_emoji: profileAvatar.textContent } });
    if (!error) {
        showToastNotification('Profil Diperbarui!');
        loadUserProfileData();
    }
}
