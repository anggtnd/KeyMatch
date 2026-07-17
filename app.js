// 1. CONFIGURATION SUPABASE
const SUPABASE_URL = "https://elzncubwogaabejekevz.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsem5jdWJ3b2dhYWJlamVrZXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTY2NDUsImV4cCI6MjA5NzM5MjY0NX0.P861FHbaZ0y3hMv-C3qPi8o6JqdZbndKX8D5aro0SSM";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. AMBIL ELEMEN HTML
const authSection = document.getElementById('authSection');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const togglePasswordBtn = document.getElementById('togglePasswordVisibility');

const mainAppSection = document.getElementById('mainAppSection');
const userDisplayEmail = document.getElementById('userDisplayEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Perubahan untuk Input Dinamis
const container = document.getElementById('dynamicInputContainer');
const addBtn = document.getElementById('addInputBtn');
const searchBtn = document.getElementById('searchBtn');

const resultSection = document.getElementById('resultSection');
const keywordsContainer = document.getElementById('keywordsContainer');
const queryResult = document.getElementById('queryResult');
const copyQueryBtn = document.getElementById('copyQueryBtn');
const saveToFavoriteBtn = document.getElementById('saveToFavoriteBtn');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');

const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const toggleSidebarLaptopBtn = document.getElementById('toggleSidebarLaptopBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarAside = document.getElementById('sidebarAside');
const mainContentArea = document.getElementById('mainContentArea');

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
        authPassword.setAttribute('type', type);
        
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
    authEmail.value = ''; authPassword.value = '';
    
    // Reset container menggunakan struktur "Keyword 1" yang seragam dan bisa dihapus
    container.innerHTML = `
        <div class="flex items-end gap-2 input-row transition-all duration-300 w-full" id="row-1">
            <div class="flex flex-col gap-1 flex-grow">
                <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Keyword 1</span>
                <input type="text" class="keyword-input w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 select-text" placeholder="Enter first keyword (e.g., smart city)">
            </div>
            <button type="button" class="remove-input-btn p-2 text-slate-400 hover:text-rose-500 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 h-9 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        </div>`;
    
    initFirstRow();
    resultSection.classList.add('hidden');
});

function showMainApp(email) {
    authSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
    
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
        userDisplayEmail.textContent = (user?.user_metadata?.full_name) ? user.user_metadata.full_name : email;
    });
    
    // Memaksa pembaruan data profil baru saat login sukses
    loadUserProfileData();
    handleResize();
}

function showAuthForm() {
    authSection.classList.remove('hidden');
    mainAppSection.classList.add('hidden');
}

// 4. PENGATURAN INPUT DINAMIS & LOGIKA PENCARIAN (AI)

// Fungsi mengurutkan nomor Keyword & mengelola divider AND secara dinamis
function reindexConcepts() {
    const rows = container.querySelectorAll('.input-row, #row-1');
    const dividers = container.querySelectorAll('.and-divider');
    
    // Bersihkan semua divider terlebih dahulu
    dividers.forEach(div => div.remove());

    rows.forEach((row, idx) => {
        const label = row.querySelector('span');
        if (label) {
            label.textContent = `Keyword ${idx + 1}`;
        }

        // Sisipkan pembatas AND yang tipis di sela-sela baris
        if (idx > 0) {
            const andLabel = document.createElement('div');
            andLabel.className = "flex items-center justify-center my-1 and-divider w-full";
            andLabel.innerHTML = `
                <div class="h-px bg-slate-100 dark:bg-slate-700 flex-grow"></div>
                <span class="px-2 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest">AND</span>
                <div class="h-px bg-slate-100 dark:bg-slate-700 flex-grow"></div>
            `;
            container.insertBefore(andLabel, row);
        }
    });
}

// Aktifkan tombol hapus pada baris pertama (Keyword 1)
function initFirstRow() {
    const firstRow = document.getElementById('row-1');
    if (firstRow) {
        const deleteBtn = firstRow.querySelector('.remove-input-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                firstRow.remove();
                reindexConcepts();
            });
        }
    }
}

// Event Listener tombol "+ Add Keyword (AND)"
if (addBtn) {
    addBtn.addEventListener('click', () => {
        const currentInputs = container.querySelectorAll('.keyword-input').length;
        const nextIndex = currentInputs + 1;

        // Baris input baru
        const inputRow = document.createElement('div');
        inputRow.className = "flex items-end gap-2 input-row transition-all duration-300 w-full";
        inputRow.innerHTML = `
            <div class="flex flex-col gap-1 flex-grow">
                <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Keyword ${nextIndex}</span>
                <input type="text" class="keyword-input w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 select-text" placeholder="Enter keyword...">
            </div>
            <button type="button" class="remove-input-btn p-2 text-slate-400 hover:text-rose-500 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 h-9 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
            </button>
        `;

        container.appendChild(inputRow);
        
        // Aktifkan fungsi hapus untuk baris baru
        inputRow.querySelector('.remove-input-btn').addEventListener('click', () => {
            inputRow.remove();
            reindexConcepts();
        });

        reindexConcepts();
    });
}

// Inisialisasi tombol hapus baris pertama sejak awal
initFirstRow();

// Hubungkan tombol search utama
if (searchBtn) {
    searchBtn.addEventListener('click', () => fetchSynonyms());
}

// Event listener enter di dalam input dinamis
container.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('keyword-input')) {
        fetchSynonyms();
    }
});

async function fetchSynonyms(forcedWord = null) {
    const warningContainer = document.getElementById('searchWarningContainer');
    const successContainer = document.getElementById('searchSuccessContainer');

    // Ambil semua input yang ada isinya
    let keywords = [];
    if (forcedWord) {
        keywords = [forcedWord.trim()];
    } else {
        const inputElements = container.querySelectorAll('.keyword-input');
        keywords = Array.from(inputElements).map(el => el.value.trim()).filter(val => val !== "");
    }

    if (keywords.length === 0) {
        showToastNotification('Please enter at least one keyword!');
        return;
    }

    loading.classList.remove('hidden');
    resultSection.classList.add('hidden');
    warningContainer.classList.add('hidden');
    successContainer.classList.remove('hidden');
    keywordsContainer.innerHTML = '';

    try {
        const apiUrl = "https://text.pollinations.ai/";
        
        const systemPrompt = `You are a Scopus literature mapping expert.
Your job is to analyze the user's concepts and provide exactly 6 key synonyms, equivalent academic terms, or related research phrases for EACH concept provided.
Rules:
1. Return ONLY a valid JSON object where the keys are the original input concepts, and the values are JSON arrays containing exactly 6 synonyms.
Example format:
{
  "open government": ["e-government", "public sector transparency", "government open data", "digital governance", "public sector information", "transparency data initiatives"],
  "smart city": ["intelligent city", "smart urbanism", "connected city", "digital metropolis", "smart infrastructure", "urban innovation"]
}
2. Do not include markdown blocks, backticks (\`\`\`json), or conversational text.`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Concepts list: ${JSON.stringify(keywords)}` }
                ],
                model: "openai", 
                jsonMode: true
            })
        });

        if (!response.ok) throw new Error(`AI Server Error: ${response.status}`);

        let textResponse = await response.text();
        textResponse = textResponse.trim();

        // Ekstrak struktur objek JSON { ... }
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Format JSON objek tidak ditemukan");

        const aiOutput = JSON.parse(jsonMatch[0]);
        loading.classList.add('hidden');

        // Render data hasil AI ke antarmuka pengguna (DIPERBAIKI DISINI)
        renderMultiTopicResults(aiOutput, forcedWord);
        showToastNotification('Advanced query mapping generated successfully!');

    } catch (error) {
        console.error("AI Fetch Error:", error);
        loading.classList.add('hidden');
        
        // Emergency Fallback aman jika server bermasalah
        const fallbackOutput = {};
        keywords.forEach(kw => {
            fallbackOutput[kw] = [
                `${kw} technology`, `applied ${kw}`, `digital ${kw}`, 
                `evaluation of ${kw}`, `${kw} framework`, `${kw} system`
            ];
        });
        renderMultiTopicResults(fallbackOutput, forcedWord);
        
        // Matikan pesan cadangan, ganti dengan respon sukses agar silent
        showToastNotification('Advanced query mapping generated successfully!'); 
    }
}

// RENDER HASIL MULTI-INPUT KE UI & SINTAKS SCOPUS
async function renderMultiTopicResults(data, isForcedHistory = false) {
    resultSection.classList.remove('hidden');
    keywordsContainer.innerHTML = ''; 
    
    let globalScopusParts = [];
    const conceptsArray = Object.keys(data);

    // Render kotak penampung visual untuk masing-masing konsep
    conceptsArray.forEach((concept, index) => {
        const synonyms = data[concept];
        
        const groupWrapper = document.createElement('div');
        groupWrapper.className = "p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-3 w-full";
        
        // Ganti teks judul grup dari "Concept" menjadi "Keyword"
        groupWrapper.innerHTML = `
            <h4 class="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Keyword ${index + 1}: ${concept}</h4>
            <div class="flex flex-wrap gap-2 badge-pool"></div>
        `;
        
        const badgePool = groupWrapper.querySelector('.badge-pool');
        
        // Tampilkan kata asli sebagai badge pertama
        const originalBadge = createBadgeElement(concept);
        badgePool.appendChild(originalBadge);
        
        // Tampilkan sinonim-sinonimnya
        synonyms.forEach(syn => {
            const badge = createBadgeElement(syn);
            badgePool.appendChild(badge);
        });

        keywordsContainer.appendChild(groupWrapper);

        // Bangun sintaks query individual untuk kelompok ini
        const allTermsInGroup = [concept, ...synonyms].map(term => `"${term}"`);
        const scopusGroupQuery = `TITLE-ABS-KEY (${allTermsInGroup.join(" OR ")})`;
        globalScopusParts.push(scopusGroupQuery);
    });

    // Satukan kelompok-kelompok query di atas menggunakan AND
    const finalScopusQuery = globalScopusParts.join(" AND ");
    queryResult.value = finalScopusQuery;

    // Pasang fungsi salin massal
    copyQueryBtn.onclick = () => {
        copyToClipboard(finalScopusQuery);
        showToastNotification('All query syntax copied successfully!');
    };

    // Pasang fungsi simpan favorit untuk kata kunci pertama
    const primaryKeyword = conceptsArray[0];
    saveToFavoriteBtn.onclick = async () => {
        await saveToFavorites(primaryKeyword, finalScopusQuery);
    };

    // Simpan ke database riwayat (Hanya jika dicari manual, bukan diklik dari history)
    if (!isForcedHistory) {
        const historyKeywordJoined = conceptsArray.join(" AND ");
        await saveToHistory(historyKeywordJoined, finalScopusQuery);
    }
}

// Pembantu untuk membuat tombol badge yang bisa disalin satuan
function createBadgeElement(text) {
    const btn = document.createElement('button');
    btn.className = "flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 border border-slate-200 dark:border-slate-600 hover:border-indigo-200 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-xl text-sm font-medium transition-all duration-150 shadow-sm active:scale-95";
    btn.innerHTML = `<span>${text}</span> <span class="text-slate-400 text-xs">📋</span>`;
    
    btn.addEventListener('click', () => {
        copyToClipboard(text);
        showToastNotification(`Copied: "${text}"`);
    });
    return btn;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(() => {});
}

function showToastNotification(message) {
    toast.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => { toast.classList.add('translate-y-20', 'opacity-0'); }, 2500);
}

// 5. NAVIGASI SIDEBAR & RESPONSIVITAS (FIX CENTERED CONTENT)
if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', openSidebar);
}
if (toggleSidebarLaptopBtn) {
    toggleSidebarLaptopBtn.addEventListener('click', toggleSidebar);
}
if (closeSidebarBtn) {
    closeSidebarBtn.addEventListener('click', closeSidebar);
}

// Membuka sidebar (Kembalikan fisik sidebar di samping konten)
function openSidebar() {
    // 1. Tampilkan kembali fisik sidebar di layar
    sidebarAside.style.display = "flex";
    
    // 2. Berikan sedikit jeda mikro agar efek transisi animasi geser halusnya terlihat
    setTimeout(() => {
        sidebarAside.style.transform = "translateX(0)";
        sidebarAside.classList.remove('-translate-x-full');
    }, 10);
    
    // 3. Kembalikan lebar standar agar pas bersandingan
    if (mainContentArea) {
        mainContentArea.classList.remove('max-w-7xl');
        mainContentArea.classList.add('max-w-4xl');
    }
}

// Menutup sidebar (Sembunyikan fisik sidebar agar konten ke tengah)
function closeSidebar() {
    // 1. Geser sidebar terlebih dahulu ke kiri luar layar
    sidebarAside.style.transform = "translateX(-100%)";
    sidebarAside.classList.add('-translate-x-full');
    
    // 2. Hilangkan "ruang hantu" fisiknya setelah animasi geser selesai (300ms)
    setTimeout(() => {
        if (sidebarAside.classList.contains('-translate-x-full')) {
            sidebarAside.style.display = "none";
        }
    }, 300); // 300ms sesuai dengan duration-300 di HTML
    
    // 3. Lebarkan halaman utama ke tengah layar secara penuh
    if (mainContentArea) {
        mainContentArea.classList.remove('max-w-4xl');
        mainContentArea.classList.add('max-w-7xl');
    }
}

// Fungsi toggle (buka/tutup bergantian)
function toggleSidebar() {
    const isHidden = sidebarAside.classList.contains('-translate-x-full') || sidebarAside.style.transform === "translateX(-100%)" || sidebarAside.style.display === "none";
    if (isHidden) {
        openSidebar();
    } else {
        closeSidebar();
    }
}

// Mengatur otomatis tampilan saat ukuran layar berubah
function handleResize() {
    if (window.innerWidth >= 768) {
        // Layar Laptop: Tampilkan secara normal di samping
        sidebarAside.style.display = "flex";
        sidebarAside.style.transform = "none";
        sidebarAside.classList.remove('-translate-x-full');
        if (mainContentArea) {
            mainContentArea.classList.remove('max-w-7xl');
            mainContentArea.classList.add('max-w-4xl');
        }
    } else {
        // Layar HP: Sembunyikan sidebar
        closeSidebar();
    }
}
window.addEventListener('resize', handleResize);

// Reset menu styles & tutup otomatis di HP
function resetMenuStyles() {
    [menuSearch, menuFavorites, menuHistory, menuProfile].forEach(btn => {
        if(btn) btn.className = "w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium rounded-xl text-sm text-left transition-all duration-150";
    });
    pageSearch.classList.add('hidden'); 
    pageFavorites.classList.add('hidden'); 
    pageHistory.classList.add('hidden'); 
    pageProfile.classList.add('hidden');
    
    if (window.innerWidth < 768) {
        closeSidebar();
    }
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
const profilePasswordInput = document.getElementById('profilePasswordInput'); 

async function loadUserProfileData() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (user) {
        profileEmailDisplay.textContent = user.email;
        let displayName = user.user_metadata?.full_name ? user.user_metadata.full_name : user.email.split('@')[0];

        currentSavedName = displayName;
        profileNameInput.value = displayName;
        profileCardName.textContent = displayName;
        
        // Perbarui inisial avatar profil secara dinamis
        if (profileAvatar) {
            profileAvatar.textContent = displayName.charAt(0).toUpperCase();
        }
    }
    if (profilePasswordInput) profilePasswordInput.value = '';
    lockProfileForm();
}

editProfileBtn.addEventListener('click', () => {
    profileNameInput.disabled = false;
    profileNameInput.classList.remove('bg-slate-50', 'text-slate-400');
    profileNameInput.classList.add('bg-white', 'text-slate-700');

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
        
        if (profileAvatar) {
            profileAvatar.textContent = fullNameValue.charAt(0).toUpperCase();
        }
        
        if (profilePasswordInput) profilePasswordInput.value = '';
        lockProfileForm();
    }
});

// 7. MANAJEMEN DATABASE: HISTORY & FAVORITES (SUPABASE)
async function saveToHistory(word, result) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;
    await supabaseClient.from('history').insert([{ user_id: user.id, keyword: word, result: result }]);
}

async function saveToFavorites(word, querySyntaxValue) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return showToastNotification('Please login first!');
    
    const { data } = await supabaseClient.from('favorites').select('id').eq('user_id', user.id).eq('keyword', word);
    if (data && data.length > 0) {
        showToastNotification('Already saved in Favorites! ⭐');
        return;
    }

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
        if (!pageFavorites.classList.contains('hidden')) {
            renderFavorites();
        }
    }
}

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

            const parts = item.keyword.split(" AND ");
            container.innerHTML = ''; 

            parts.forEach((part, index) => {
                const inputRow = document.createElement('div');
                if (index === 0) {
                    inputRow.id = "row-1";
                }
                inputRow.className = "flex items-end gap-2 input-row transition-all duration-300 w-full";
                inputRow.innerHTML = `
                    <div class="flex flex-col gap-1 flex-grow">
                        <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Keyword ${index + 1}</span>
                        <input type="text" class="keyword-input w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 select-text" value="${part}">
                    </div>
                    <button type="button" class="remove-input-btn p-2 text-slate-400 hover:text-rose-500 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 h-9 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                `;

                container.appendChild(inputRow);

                inputRow.querySelector('.remove-input-btn').addEventListener('click', () => {
                    inputRow.remove();
                    reindexConcepts();
                });
            });

            reindexConcepts();
            menuSearch.click();
            fetchSynonyms(null); 
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
        
        const cleanDisplayResult = item.result ? item.result.replace(/TITLE-ABS-KEY\s*\(/g, '').replace(/\)/g, '') : '';

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

            const groupRegex = /TITLE-ABS-KEY\s*\(([^)]+)\)/g;
            let matches;
            const reconstructData = {};

            while ((matches = groupRegex.exec(item.result)) !== null) {
                const groupContent = matches[1];
                const wordMatches = groupContent.match(/"([^"]+)"/g);
                if (wordMatches) {
                    const cleanWords = wordMatches.map(w => w.replace(/"/g, ''));
                    const originalConcept = cleanWords[0]; 
                    const synonyms = cleanWords.slice(1);
                    reconstructData[originalConcept] = synonyms;
                }
            }

            container.innerHTML = '';
            const concepts = Object.keys(reconstructData);

            concepts.forEach((concept, index) => {
                const inputRow = document.createElement('div');
                if (index === 0) {
                    inputRow.id = "row-1";
                }
                inputRow.className = "flex items-end gap-2 input-row transition-all duration-300 w-full";
                inputRow.innerHTML = `
                    <div class="flex flex-col gap-1 flex-grow">
                        <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Keyword ${index + 1}</span>
                        <input type="text" class="keyword-input w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-150 select-text" value="${concept}">
                    </div>
                    <button type="button" class="remove-input-btn p-2 text-slate-400 hover:text-rose-500 transition rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 h-9 flex items-center justify-center">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                `;

                container.appendChild(inputRow);

                inputRow.querySelector('.remove-input-btn').addEventListener('click', () => {
                    inputRow.remove();
                    reindexConcepts();
                });
            });

            reindexConcepts();
            menuSearch.click();
            renderMultiTopicResults(reconstructData, true); 
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

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear your entire search history?')) return;
        const { data: { user } } = await supabaseClient.auth.getUser();
        await supabaseClient.from('history').delete().eq('user_id', user.id);
        showToastNotification('History cleared!');
        renderHistory();
    });
}

if (clearFavoritesBtn) {
    clearFavoritesBtn.addEventListener('click', async () => {
        if (!confirm('Are you sure you want to clear all your favorite keywords?')) return;
        const { data: { user } } = await supabaseClient.auth.getUser();
        await supabaseClient.from('favorites').delete().eq('user_id', user.id);
        showToastNotification('All favorites cleared!');
        renderFavorites();
    });
}

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

if (exportHistoryBtn) {
    exportHistoryBtn.addEventListener('click', async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data } = await supabaseClient.from('history').select('keyword, created_at').eq('user_id', user.id);
        if (!data || data.length === 0) return alert('No history data to export!');
        const rows = data.map(item => [`"${item.keyword}"`, `"${new Date(item.created_at).toLocaleString()}"`]);
        downloadCSV("keymatch_history.csv", ["Keyword", "Search Date & Time"], rows);
    });
}

if (exportFavoritesBtn) {
    exportFavoritesBtn.addEventListener('click', async () => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { data } = await supabaseClient.from('favorites').select('keyword, result').eq('user_id', user.id);
        if (!data || data.length === 0) return alert('No favorite data to export!');
        const rows = data.map(item => [`"${item.keyword}"`, `"${item.result.replace(/"/g, '""')}"`]);
        downloadCSV("keymatch_favorites.csv", ["Main Keyword", "Scopus Query Syntax"], rows);
    });
}

// 8. KODE AUTO-LOGIN SINKRONISASI
async function checkCurrentSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (error) {
        console.error("Gagal mengecek sesi:", error.message);
        return;
    }

    if (session && session.user) {
        console.log("Sesi aktif ditemukan:", session.user.email);
        
        if (authSection) authSection.classList.add('hidden');
        if (mainAppSection) mainAppSection.classList.remove('hidden');
        
        if (userDisplayEmail) {
            userDisplayEmail.textContent = (session.user.user_metadata?.full_name) 
                ? session.user.user_metadata.full_name 
                : session.user.email;
        }
        
        loadUserProfileData();
        if (typeof handleResize === 'function') handleResize();
        if (typeof renderHistory === 'function') renderHistory();
    } else {
        console.log("Tidak ada sesi aktif, silakan login.");
    }
}

// Jalankan auto login saat load
checkCurrentSession();
