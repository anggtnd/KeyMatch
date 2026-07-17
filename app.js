// 1. CONFIGURATION SUPABASE
const SUPABASE_URL = "https://elzncubwogaabejekevz.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsem5jdWJ3b2dhYWJlamVrZXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTY2NDUsImV4cCI6MjA5NzM5MjY0NX0.P861FHbaZ0y3hMv-C3qPi8o6JqdZbndKX8D5aro0SSM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. ELEMEN HTML
const authSection = document.getElementById('authSection');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const togglePasswordBtn = document.getElementById('togglePasswordVisibility');

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

const favoritesListContainer = document.getElementById('favoritesListContainer');
const historyListContainer = document.getElementById('historyListContainer');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const clearFavoritesBtn = document.getElementById('clearFavoritesBtn');
const exportHistoryBtn = document.getElementById('exportHistoryBtn');
const exportFavoritesBtn = document.getElementById('exportFavoritesBtn');

const profileEmailDisplay = document.getElementById('profileEmailDisplay');
const profileNameInput = document.getElementById('profileNameInput');
const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const profileAvatar = document.getElementById('profileAvatar');
const profileCardName = document.getElementById('profileCardName');
const editActionGroup = document.getElementById('editActionGroup');

const darkModeToggle = document.getElementById('darkModeToggle');
const darkModeStatus = document.getElementById('darkModeStatus');

let currentSavedName = '';

// 3. LOGIKA AUTHENTICATION & INTERAKSI MATA PASSWORD
if (togglePasswordBtn && authPassword) {
    togglePasswordBtn.addEventListener('click', function () {
        const type = authPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        authPassword.setValue = authPassword.setAttribute('type', type);
        
        // Mengubah gambar mata terbuka / mata tersilang (Eye / Eye Off) secara dinamis
        if (type === 'text') {
            this.innerHTML = `
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                </svg>`;
        } else {
            this.innerHTML = `
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>`;
        }
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        showMainApp(session.user.email);
    } else {
        showAuthForm();
    }
});

registerBtn.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    if (!email || !password) return alert('Email and password must be filled!');
    if (password.length < 6) return alert('Password must be at least 6 characters!');

    const { error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        alert(error.message.includes("already registered") ? 'This email is already registered!' : 'Registration failed: ' + error.message);
    } else {
        alert('Registration successful! Please click Sign In.');
    }
});

loginBtn.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    if (!email || !password) return alert('Email and password must be filled!');

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) alert('Login failed: ' + error.message);
    else showMainApp(data.user.email);
});

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showAuthForm();
    authEmail.value = ''; authPassword.value = ''; keywordInput.value = '';
    resultSection.classList.add('hidden');
});

function showMainApp(email) {
    authSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
        userDisplayEmail.textContent = (user?.user_metadata?.full_name) ? user.user_metadata.full_name : email;
    });
    handleResize();
}

function showAuthForm() {
    authSection.classList.remove('hidden');
    mainAppSection.classList.add('hidden');
}

// 4. LOGIKA PENCARIAN CERDAS (GLOBAL & AKADEMIS)
searchBtn.addEventListener('click', () => fetchSynonyms());
keywordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchSynonyms(); });

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        keywordInput.value = ''; clearBtn.classList.add('hidden'); keywordInput.focus();
    });
}

keywordInput.addEventListener('input', () => {
    if (keywordInput.value.trim().length > 0) clearBtn.classList.remove('hidden');
    else clearBtn.classList.add('hidden');
});

async function fetchSynonyms(forcedWord = null) {
    const word = forcedWord ? forcedWord.trim() : keywordInput.value.trim();
    const warningContainer = document.getElementById('searchWarningContainer');
    const successContainer = document.getElementById('searchSuccessContainer');

    if (!word) {
        showToastNotification('Keyword cannot be empty!');
        keywordInput.focus();
        return;
    }

    loading.classList.remove('hidden');
    resultSection.classList.add('hidden');
    warningContainer.classList.add('hidden');
    successContainer.classList.remove('hidden');
    keywordsContainer.innerHTML = '';

    try {
        const apiUrl = "https://text.pollinations.ai/";
        
        const systemPrompt = `You are a Scopus literature mapping expert. Provide exactly 10 highly relevant conceptual synonyms, alternative scientific terms, or related research phrases for the user's scientific keyword from any academic discipline.
Rules:
1. Do not just append words. Instead, return true alternative terms with the same conceptual meaning.
2. Return ONLY a valid JSON array of strings containing the 10 synonyms.
3. If you cannot return JSON, just list the 10 terms separated by commas.`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Keyword: "${word}"` }
                ],
                model: "openai", 
                jsonMode: true
            })
        });

        if (!response.ok) {
            throw new Error(`AI Server Error: ${response.status}`);
        }

        let textResponse = await response.text();
        textResponse = textResponse.trim();
        let finalSynonyms = [];

        // PARSING MULTI-FASE 
        
        // Fase 1: Coba ambil format array JSON [ ... ] jika ada
        const arrayMatch = textResponse.match(/\[[\s\S]*\]/);
        
        if (arrayMatch) {
            try {
                finalSynonyms = JSON.parse(arrayMatch[0]);
            } catch (e) {
                console.warn("Gagal parse JSON array, lanjut ke pembersihan teks...");
            }
        }

        // Fase 2: Jika Fase 1 gagal/kosong, pecah teks manual berdasarkan baris baru atau koma
        if (!Array.isArray(finalSynonyms) || finalSynonyms.length === 0) {
            // Bersihkan angka (1., 2.), tanda kutip, strip (-), dan kurung siku sisa
            let cleanText = textResponse.replace(/[\[\]"']/g, ''); 
            
            // Pecah teks berdasarkan koma atau baris baru
            let rawLines = cleanText.split(/,|\n/);
            
            finalSynonyms = rawLines
                .map(item => item.replace(/^\d+[\.\)]\s*/, '').trim()) // Hilangkan nomor urut "1. ", "2) "
                .filter(item => item.length > 2 && item.toLowerCase() !== word.toLowerCase());
        }

        loading.classList.add('hidden');

        // Jika setelah dibersihkan hasilnya masih kosong, lempar ke emergency generator agar tidak kosong
        if (finalSynonyms.length === 0) {
            finalSynonyms = [
                `${word} technology`, `applied ${word}`, `digital ${word}`, 
                `${word} framework`, `${word} system`, `${word} paradigm`
            ];
        }

        // Tampilkan tepat 10 kata konseptual sejati ke UI Tailwind KEYMATCH kamu
        displayGeneratedKeywords(word, finalSynonyms.slice(0, 10));
        showToastNotification('Global academic mapping loaded successfully!');

        if (!forcedWord) {
            await saveToHistory(word, queryResult.value);
        }

    } catch (error) {
        console.error("AI Fetch Error:", error);
        loading.classList.add('hidden');
        
        // Sistem penyelamat otomatis terakhir jika internet benar-benar terputus total
        const emergencySynonyms = [
            `${word} technology`, `applied ${word}`, `digital ${word}`, 
            `${word} framework`, `${word} system`, `${word} paradigm`
        ];
        displayGeneratedKeywords(word, emergencySynonyms);
        showToastNotification('Pencarian cadangan otomatis diaktifkan.');
    }
}

// Fungsi pembantu untuk memunculkan badge kata yang bisa diklik satu-satu
function displayGeneratedKeywords(mainWord, synonymsArray) {
    resultSection.classList.remove('hidden');
    keywordsContainer.innerHTML = '';
    
    let scopusWords = [mainWord, ...synonymsArray];

    synonymsArray.forEach(synonym => {
        const badge = document.createElement('button');
        badge.className = "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-500 hover:text-white font-medium px-3 py-2 rounded-xl text-sm transition-all duration-150 flex items-center border border-slate-200/40 dark:border-slate-600 active:scale-95";
        badge.innerHTML = `${synonym} <span class="text-slate-400 ml-1.5 text-xs">📋</span>`;
        
        badge.addEventListener('click', () => {
            copyToClipboard(synonym);
            showToastNotification(`Copied: "${synonym}"`);
        });
        keywordsContainer.appendChild(badge);
    });

    const formattedQuery = `TITLE-ABS-KEY (${scopusWords.map(w => `"${w}"`).join(' OR ')})`;
    queryResult.value = formattedQuery;

    copyQueryBtn.onclick = () => {
        copyToClipboard(formattedQuery);
        showToastNotification('All query syntax copied successfully!');
    };

    saveToFavoriteBtn.onclick = async () => {
        await saveToFavorites(mainWord, synonymsArray.join(', '));
    };
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {});
}

function showToastNotification(message) {
    toast.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); }, 2500);
}

// 5. NAVIGASI SIDEBAR & RESPONSIVITAS
if(toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
if(toggleSidebarLaptopBtn) toggleSidebarLaptopBtn.addEventListener('click', toggleSidebar);
if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);

function toggleSidebar() { sidebarAside.classList.toggle('-translate-x-full'); }

function handleResize() {
    if (window.innerWidth >= 768) sidebarAside.classList.remove('-translate-x-full');
    else sidebarAside.classList.add('-translate-x-full');
}
window.addEventListener('resize', handleResize);

function resetMenuStyles() {
    [menuSearch, menuFavorites, menuHistory, menuProfile].forEach(btn => {
        if(btn) btn.className = "w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-xl text-sm text-left transition-all duration-150";
    });
    pageSearch.classList.add('hidden'); pageFavorites.classList.add('hidden'); pageHistory.classList.add('hidden'); pageProfile.classList.add('hidden');
    if (window.innerWidth < 768) sidebarAside.classList.add('-translate-x-full');
}

menuSearch.addEventListener('click', () => {
    resetMenuStyles();
    menuSearch.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    pageSearch.classList.remove('hidden');
});

menuFavorites.addEventListener('click', () => {
    resetMenuStyles();
    menuFavorites.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    pageFavorites.classList.remove('hidden');
    renderFavorites();
});

menuHistory.addEventListener('click', () => {
    resetMenuStyles();
    menuHistory.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    pageHistory.classList.remove('hidden');
    renderHistory();
});

menuProfile.addEventListener('click', () => {
    resetMenuStyles();
    menuProfile.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    pageProfile.classList.remove('hidden');
    loadUserProfileData();
});

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        darkModeStatus.textContent = document.documentElement.classList.contains('dark') ? 'Enabled' : 'Disabled';
    });
}

// 6. MANAJEMEN PROFIL (SINKRONISASI UPDATE PASSWORD)
const profilePasswordInput = document.getElementById('profilePasswordInput'); // pastikan id input password di HTML kamu adalah ini

async function loadUserProfileData() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        profileEmailDisplay.textContent = user.email;
        let displayName = user.user_metadata?.full_name ? user.user_metadata.full_name : user.email.split('@')[0];

        currentSavedName = displayName;
        profileNameInput.value = displayName;
        profileCardName.textContent = displayName;
    }
    // Kosongkan kembali placeholder input password setiap kali halaman profil dimuat
    if (profilePasswordInput) profilePasswordInput.value = '';
    lockProfileForm();
}

editProfileBtn.addEventListener('click', () => {
    // Mengaktifkan input Nama
    profileNameInput.disabled = false;
    profileNameInput.classList.remove('bg-slate-50', 'text-slate-400');
    profileNameInput.classList.add('bg-white', 'text-slate-700');

    // Mengaktifkan input Password Baru
    if (profilePasswordInput) {
        profilePasswordInput.disabled = false;
        profilePasswordInput.classList.remove('bg-slate-50', 'text-slate-400');
        profilePasswordInput.classList.add('bg-white', 'text-slate-700');
    }

    editProfileBtn.classList.add('hidden');
    editActionGroup.classList.remove('hidden');
});

cancelProfileBtn.addEventListener('click', () => {
    profileNameInput.value = currentSavedName;
    if (profilePasswordInput) profilePasswordInput.value = '';
    lockProfileForm();
});

function lockProfileForm() {
    profileNameInput.disabled = true;
    profileNameInput.classList.remove('bg-white', 'text-slate-700');
    profileNameInput.classList.add('bg-slate-50', 'text-slate-400');

    if (profilePasswordInput) {
        profilePasswordInput.disabled = true;
        profilePasswordInput.classList.remove('bg-white', 'text-slate-700');
        profilePasswordInput.classList.add('bg-slate-50', 'text-slate-400');
    }

    editProfileBtn.classList.remove('hidden');
    editActionGroup.classList.add('hidden');
}

saveProfileBtn.addEventListener('click', async () => {
    const fullNameValue = profileNameInput.value.trim();
    const newPasswordValue = profilePasswordInput ? profilePasswordInput.value.trim() : '';
    
    if (!fullNameValue) return alert('Name field cannot be empty!');

    saveProfileBtn.disabled = true;
    let updatePayload = { data: { full_name: fullNameValue } };

    // Jika user mengetikkan password baru, sertakan ke dalam proses update Supabase
    if (newPasswordValue.length > 0) {
        if (newPasswordValue.length < 6) {
            saveProfileBtn.disabled = false;
            return alert('New password must be at least 6 characters long!');
        }
        updatePayload.password = newPasswordValue;
    }

    const { error } = await supabaseClient.auth.updateUser(updatePayload);
    saveProfileBtn.disabled = false;

    if (error) {
        alert('Failed to update profile: ' + error.message);
    } else {
        alert('Profile and password updated successfully!');
        currentSavedName = fullNameValue; 
        userDisplayEmail.textContent = fullNameValue; 
        profileCardName.textContent = fullNameValue;
        
        if (profilePasswordInput) profilePasswordInput.value = '';
        lockProfileForm();
    }
});

// 7. MANAJEMEN DATABASE: HISTORY & FAVORITES (SUPABASE)

// Fungsi Menyimpan Riwayat Pencarian
async function saveToHistory(word, result) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await supabaseClient.from('history').insert([{ user_id: user.id, keyword: word, result: result }]);
}

// FIX TOTAL: Fungsi Menyimpan ke Tabel Favorites Sesuai Kolom Supabase ('result')
async function saveToFavorites(word, synonymsString) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return showToastNotification('Please login first!');
    
    // Cek duplikasi di database agar tidak tersimpan ganda
    const { data } = await supabaseClient.from('favorites').select('id').eq('user_id', user.id).eq('keyword', word);
    if (data && data.length > 0) {
        showToastNotification('Already saved in Favorites! ⭐');
        return;
    }

    // Ambil nilai teks lengkap sintaks query dari kotak textarea hasil pencarian saat ini
    const querySyntaxValue = queryResult.value;

    // Menyesuaikan struktur kolom asli Supabase kamu: user_id, keyword, result
    const { error } = await supabaseClient.from('favorites').insert([
        { 
            user_id: user.id, 
            keyword: word, 
            result: querySyntaxValue 
        }
    ]);

    if (error) {
        console.error("Supabase Save Error Details:", error);
        showToastNotification(`Failed: ${error.message}`);
    } else {
        showToastNotification('Added to Favorites! ⭐');
        // Refresh otomatis jika user sedang membuka tab halaman favorit
        if (!pageFavorites.classList.contains('hidden')) {
            renderFavorites();
        }
    }
}

// Fungsi Memuat Riwayat Pencarian (Menampilkan Tanggal + Jam & Menit)
async function renderHistory() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: history } = await supabaseClient.from('history').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    if (!history || history.length === 0) {
        historyListContainer.innerHTML = `<p class="text-slate-400 italic text-center py-4">No search history available.</p>`;
        return;
    }

    historyListContainer.innerHTML = '';
    history.forEach(item => {
        const row = document.createElement('div');
        row.className = "flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-xl transition cursor-pointer group";
        
        // FORMAT WAKTU: Menambahkan komponen jam dan menit (HH:MM)
        const searchDate = new Date(item.created_at);
        const dateStr = searchDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeStr = searchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        const fullDateTime = `${dateStr} • ${timeStr}`; 
        
        row.innerHTML = `
            <div class="flex justify-between items-center w-full">
                <div>
                    <div class="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">${item.keyword}</div>
                    <div class="text-xs text-slate-400 mt-0.5">🕒 ${fullDateTime}</div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">Restore ↗</span>
                    <button class="del-btn text-rose-400 hover:text-rose-600 px-2 focus:outline-none opacity-0 group-hover:opacity-100 transition">🗑️</button>
                </div>
            </div>`;
        
        row.addEventListener('click', (e) => {
            if (e.target.classList.contains('del-btn')) return;
            keywordInput.value = item.keyword;
            menuSearch.click();
            fetchSynonyms(item.keyword);
        });

        row.querySelector('.del-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Delete this history record?')) {
                await supabaseClient.from('history').delete().eq('id', item.id);
                renderHistory();
            }
        });
        historyListContainer.appendChild(row);
    });
}

// Fungsi Memuat Daftar Favorit dari Supabase
async function renderFavorites() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const { data: favorites } = await supabaseClient.from('favorites').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (!favorites || favorites.length === 0) {
        favoritesListContainer.innerHTML = `<p class="text-slate-400 italic text-center py-4">No favorite keywords saved yet.</p>`;
        return;
    }

    favoritesListContainer.innerHTML = '';
    favorites.forEach(item => {
        const row = document.createElement('div');
        row.className = "flex justify-between items-center py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 px-2 rounded-xl transition cursor-pointer group";
        
        // Memotong tampilan teks query agar tidak merusak tata letak baris tabel
        const cleanDisplayResult = item.result ? item.result.replace('TITLE-ABS-KEY (', '').replace(')', '') : '';

        row.innerHTML = `
            <div class="flex justify-between items-center w-full">
                <div>
                    <div class="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600">⭐ ${item.keyword}</div>
                    <div class="text-xs text-slate-400 mt-1 truncate max-w-md">Query: ${cleanDisplayResult}</div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">Open ↗</span>
                    <button class="del-fav text-rose-400 hover:text-rose-600 px-2 focus:outline-none opacity-0 group-hover:opacity-100 transition">🗑️</button>
                </div>
            </div>`;

        row.addEventListener('click', (e) => {
            if (e.target.classList.contains('del-fav')) return;
            keywordInput.value = item.keyword;
            menuSearch.click();
            
            // Ekstrak kata-kata di dalam tanda kutip untuk mengembalikan badge tombol satuan
            const matches = item.result ? item.result.match(/"([^"]+)"/g) : [];
            const cleanWords = matches ? matches.map(w => w.replace(/"/g, '')) : [];
            
            // Buang elemen kata kunci utama dari deretan kata sinonim badge
            const finalSynonymsArr = cleanWords.filter(w => w.toLowerCase() !== item.keyword.toLowerCase());
            
            displayGeneratedKeywords(item.keyword, finalSynonymsArr);
        });

        row.querySelector('.del-fav').addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Remove this word from favorites?')) {
                await supabaseClient.from('favorites').delete().eq('id', item.id);
                renderFavorites();
            }
        });
        favoritesListContainer.appendChild(row);
    });
}

// Tombol Hapus Massal Riwayat
if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear your entire search history?')) return;
        const { data: { user } } = await supabaseClient.auth.getUser();
        await supabaseClient.from('history').delete().eq('user_id', user.id);
        showToastNotification('History cleared!');
        renderHistory();
    });
}

// Tombol Hapus Massal Favorit
if (clearFavoritesBtn) {
    clearFavoritesBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear all your favorite keywords?')) return;
        const { data: { user } } = await supabaseClient.auth.getUser();
        await supabaseClient.from('favorites').delete().eq('user_id', user.id);
        showToastNotification('All favorites cleared!');
        renderFavorites();
    });
}

// Fungsi Dasar Download CSV
function downloadCSV(filename, dataHeaders, rowsArray) {
    let csvContent = "data:text/csv;charset=utf-8," + dataHeaders.join(",") + "\n" + rowsArray.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export CSV Riwayat
if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data } = await supabaseClient.from('history').select('keyword, created_at').eq('user_id', user.id);
        if (!data || data.length === 0) return alert('No history data to export!');
        const rows = data.map(item => [`"${item.keyword}"`, `"${new Date(item.created_at).toLocaleString()}"`]);
        downloadCSV("keymatch_history.csv", ["Keyword", "Search Date & Time"], rows);
    });
}

// Export CSV Favorit
if (exportFavoritesBtn) {
    exportFavoritesBtn.addEventListener('click', async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data } = await supabaseClient.from('favorites').select('keyword, result').eq('user_id', user.id);
        if (!data || data.length === 0) return alert('No favorite data to export!');
        const rows = data.map(item => [`"${item.keyword}"`, `"${item.result.replace(/"/g, '""')}"`]);
        downloadCSV("keymatch_favorites.csv", ["Main Keyword", "Scopus Query Syntax"], rows);
    });
}

// KODE AUTO-LOGIN 
async function checkCurrentSession() {
    // 1. Cek apakah ada sesi login aktif di browser dari Supabase
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error("Gagal mengecek sesi:", error.message);
        return;
    }

    // 2. Jika user sudah login sebelumnya
    if (session && session.user) {
        console.log("Sesi aktif ditemukan:", session.user.email);
        
        const authSection = document.getElementById('authSection');
        const mainAppSection = document.getElementById('mainAppSection');
        
        // Sembunyikan halaman login, langsung buka dashboard utama
        if (authSection) authSection.classList.add('hidden');
        if (mainAppSection) mainAppSection.classList.remove('hidden');
        
        // 3. Sinkronisasi nama email di pojok kanan/kiri atas
        if (userDisplayEmail) {
            userDisplayEmail.textContent = (session.user.user_metadata?.full_name) 
                ? session.user.user_metadata.full_name 
                : session.user.email;
        }
        
        // 4. Otomatis jalankan fungsi muat riwayat data agar langsung muncul
        if (typeof handleResize === 'function') handleResize();
        if (typeof renderHistory === 'function') renderHistory();
    } else {
        console.log("Tidak ada sesi aktif, silakan login.");
    }
}

// Jalankan pengecekan otomatis setiap kali halaman web di-refresh atau dibuka
//document.addEventListener('DOMContentLoaded', () => {
 //   checkCurrentSession();
//});
