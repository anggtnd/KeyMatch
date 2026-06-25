// ==========================================
// 1. CONFIGURATION SUPABASE
// ==========================================
const SUPABASE_URL = "https://elzncubwogaabejekevz.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsem5jdWJ3b2dhYWJlamVrZXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MTY2NDUsImV4cCI6MjA5NzM5MjY0NX0.P861FHbaZ0y3hMv-C3qPi8o6JqdZbndKX8D5aro0SSM";

// Inisialisasi koneksi ke Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. AMBIL ELEMEN HTML
// ==========================================
// Elemen Auth (Halaman Login)
const authSection = document.getElementById('authSection');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');

// Elemen Main App (Halaman Utama Pencarian & Tata Letak)
const mainAppSection = document.getElementById('mainAppSection');
const userDisplayEmail = document.getElementById('userDisplayEmail');
const logoutBtn = document.getElementById('logoutBtn');
const keywordInput = document.getElementById('keywordInput');
const searchBtn = document.getElementById('searchBtn');
const resultSection = document.getElementById('resultSection');
const keywordsContainer = document.getElementById('keywordsContainer');
const queryResult = document.getElementById('queryResult');
const copyQueryBtn = document.getElementById('copyQueryBtn');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');

// Elemen Kontrol Menu & Responsif Sidebar
const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const sidebarAside = document.getElementById('sidebarAside');

const menuSearch = document.getElementById('menuSearch');
const menuHistory = document.getElementById('menuHistory');
const menuProfile = document.getElementById('menuProfile');

const pageSearch = document.getElementById('pageSearch');
const pageHistory = document.getElementById('pageHistory');
const pageProfile = document.getElementById('pageProfile');

// Elemen Isian Profil & Tombol Pastel
const profileEmailDisplay = document.getElementById('profileEmailDisplay');
const profileNameInput = document.getElementById('profileNameInput');
const editProfileBtn = document.getElementById('editProfileBtn');
const saveProfileBtn = document.getElementById('saveProfileBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const profileAvatar = document.getElementById('profileAvatar');
const profileCardName = document.getElementById('profileCardName');

// Penampung nama sementara di memori lokal saat tombol batal ditekan
let currentSavedName = '';

// ==========================================
// 3. LOGIKA AUTHENTICATION (LOGIN, DAFTAR, LOGOUT)
// ==========================================

// Fungsi Otomatis Cek Status Login Saat Web Dibuka (Auto-Login)
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session) {
        showMainApp(session.user.email);
    } else {
        showAuthForm();
    }
});

// Fungsi Pendaftaran Akun Baru (Register)
registerBtn.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (!email || !password) return alert('Email dan password harus diisi!');
    if (password.length < 6) return alert('Password minimal harus 6 karakter!');

    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        if (error.message.includes("Unable to validate email")) {
            alert('Format email salah! Pastikan menggunakan tanda @ dan domain yang benar (Contoh: nama@gmail.com).');
        } else if (error.message.includes("User already registered")) {
            alert('Email ini sudah terdaftar! Silakan langsung ketik password lalu klik tombol Masuk.');
        } else {
            alert('Gagal daftar: ' + error.message);
        }
    } else {
        alert('Pendaftaran berhasil! Akun Anda sudah aktif. Silakan klik tombol Masuk.');
    }
});

// Fungsi Masuk Akun (Login)
loginBtn.addEventListener('click', async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (!email || !password) return alert('Email dan password harus diisi!');

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert('Gagal masuk: ' + error.message);
    } else {
        showMainApp(data.user.email);
    }
});

// Fungsi Keluar Akun (Logout)
logoutBtn.addEventListener('click', async () => {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
        alert('Gagal logout: ' + error.message);
    } else {
        showAuthForm();
        authEmail.value = '';
        authPassword.value = '';
        keywordInput.value = '';
        resultSection.classList.add('hidden');
    }
});

// Fungsi pembantu untuk pindah tampilan ke Dashboard Utama
async function showMainApp(email) {
    authSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (user && user.user_metadata && user.user_metadata.full_name) {
        userDisplayEmail.textContent = user.user_metadata.full_name;
    } else {
        userDisplayEmail.textContent = email;
    }
    handleResize(); // Sesuaikan ukuran sidebar saat dashboard dimuat
}

// Helper untuk ganti tampilan ke Form Login
function showAuthForm() {
    authSection.classList.remove('hidden');
    mainAppSection.classList.add('hidden');
}

// ==========================================
// 4. LOGIKA PENCARIAN KATA KUNCI & HASIL QUERY (VERSI AKADEMIS)
// ==========================================
searchBtn.addEventListener('click', fetchSynonyms);
keywordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') fetchSynonyms();
});

// Pantau ketikan user: Jika ada teks, munculkan tombol silang. Jika kosong, sembunyikan.
keywordInput.addEventListener('input', toggleClearButton);

// Daftar kata umum / non-akademis yang wajib diblokir dari pencarian Scopus
const academicBannedWords = [
    'book', 'books', 'frame', 'heads', 'head', 'rebellion', 'insurrection', 
    'court', 'rebel', 'glasnost', 'landsat', 'artifact', 'toy', 'thing', 
    'names', 'name', 'open market operations', 'cybermind', 'sapient', 'sophont'
];

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

        if (data.length === 0) {
            alert('Maaf, tidak ditemukan padanan kata yang cocok.');
            return;
        }

        const filteredData = data.filter(item => {
            const lowerWord = item.word.toLowerCase();
            const isBanned = academicBannedWords.some(banned => lowerWord.includes(banned));
            const isTooShort = word.includes(' ') && lowerWord.length <= 3 && lowerWord !== 'ai';
            
            return !isBanned && !isTooShort;
        });

        const finalData = filteredData.slice(0, 12);

        if (finalData.length === 0) {
            alert('Maaf, tidak ditemukan padanan kata ilmiah yang sesuai standar akademis.');
            return;
        }

        resultSection.classList.remove('hidden');
        let scopusWords = [word];

        finalData.forEach(item => {
            scopusWords.push(item.word);
            const badge = document.createElement('button');
            badge.className = "bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-700 font-medium px-3 py-2 rounded-xl text-sm transition-all duration-150 flex items-center border border-slate-200/60 active:scale-95";
            badge.innerHTML = `${item.word} <span class="text-slate-300 ml-1.5 text-xs">📋</span>`;
            
            badge.addEventListener('click', () => {
                copyToClipboard(item.word);
                showToastNotification('Kata berhasil disalin ke clipboard!');
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
        console.error("Error fetching data:", error);
        loading.classList.add('hidden');
        alert('Terjadi kesalahan koneksi saat mengambil data.');
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
        console.error('Gagal menyalin teks: ', err);
    });
}

function showToastNotification(message) {
    toast.textContent = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 2500);
}

// ==========================================
// 🛠️ LOGIKA BARU: TOMBOL SILANG PEMBERSIH INPUT (CLEAR BUTTON)
// ==========================================
const inputWrapper = keywordInput.parentElement;
inputWrapper.classList.add('relative', 'flex', 'items-center');

// Beri space padding kanan secukupnya agar teks tidak menabrak tombol silang
keywordInput.classList.add('pr-12'); 

// Buat tombol silang secara dinamis tepat di sebelah kiri tombol "Cari Kata"
const clearBtn = document.createElement('button');
clearBtn.type = 'button';
// Posisi absolut diatur pas di space antara teks input dan tombol Cari Kata
clearBtn.className = 'absolute right-4 sm:right-[130px] text-slate-300 hover:text-slate-500 transition p-1.5 focus:outline-none hidden active:scale-75 z-10';
clearBtn.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
`;
inputWrapper.insertBefore(clearBtn, searchBtn);

// Fungsi ketika tombol silang diklik
clearBtn.addEventListener('click', () => {
    keywordInput.value = '';
    clearBtn.classList.add('hidden'); // Sembunyikan tombol silang kembali
    keywordInput.focus();            // Fokuskan kembali kursor ke kotak input
});

// Fungsi untuk cek apakah tombol silang harus muncul atau sembunyi
function toggleClearButton() {
    if (keywordInput.value.trim().length > 0) {
        clearBtn.classList.remove('hidden');
    } else {
        clearBtn.classList.add('hidden');
    }
}

// ==========================================
// 5. LOGIKA NAVIGASI SIDEBAR, RESPONSIVITAS, & PROFIL MEWAH
// ==========================================

function toggleSidebar() {
    if (window.innerWidth >= 768) {
        if (sidebarAside.classList.contains('md:translate-x-0')) {
            sidebarAside.classList.remove('md:translate-x-0', 'w-64', 'p-6', 'border-r');
            sidebarAside.classList.add('-translate-x-full', 'w-0', 'p-0', 'border-r-0', 'overflow-hidden');
        } else {
            sidebarAside.classList.add('md:translate-x-0', 'w-64', 'p-6', 'border-r');
            sidebarAside.classList.remove('-translate-x-full', 'w-0', 'p-0', 'border-r-0', 'overflow-hidden');
        }
    } else {
        if (sidebarAside.classList.contains('-translate-x-full')) {
            sidebarAside.classList.remove('-translate-x-full');
            sidebarAside.classList.add('translate-x-0');
        } else {
            sidebarAside.classList.add('-translate-x-full');
            sidebarAside.classList.remove('translate-x-0');
        }
    }
}

if(toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', toggleSidebar);
if(closeSidebarBtn) closeSidebarBtn.addEventListener('click', toggleSidebar);

function handleResize() {
    if (window.innerWidth >= 768) {
        sidebarAside.classList.add('md:translate-x-0', 'w-64', 'p-6', 'border-r');
        sidebarAside.classList.remove('-translate-x-full', 'w-0', 'p-0', 'border-r-0', 'overflow-hidden', 'translate-x-0');
    } else {
        sidebarAside.classList.add('-translate-x-full');
        sidebarAside.classList.remove('md:translate-x-0', 'w-64', 'p-6', 'border-r', 'translate-x-0', 'w-0', 'p-0', 'border-r-0');
    }
}
window.addEventListener('resize', handleResize);
window.addEventListener('DOMContentLoaded', handleResize);

function resetMenuStyles() {
    [menuSearch, menuHistory, menuProfile].forEach(btn => {
        btn.className = "w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 font-medium rounded-xl text-sm text-left transition-all duration-150";
    });
    pageSearch.classList.add('hidden');
    pageHistory.classList.add('hidden');
    pageProfile.classList.add('hidden');
    
    if (window.innerWidth < 768) {
        sidebarAside.classList.add('-translate-x-full');
    }
}

menuSearch.addEventListener('click', () => {
    resetMenuStyles();
    menuSearch.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    pageSearch.classList.remove('hidden');
});

menuHistory.addEventListener('click', () => {
    resetMenuStyles();
    menuHistory.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    pageHistory.classList.remove('hidden');
    renderHistory();
});

menuProfile.addEventListener('click', () => {
    resetMenuStyles();
    menuProfile.className = "w-full flex items-center gap-3 px-4 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-sm text-left transition-all duration-150";
    pageProfile.classList.remove('hidden');
    loadUserProfileData();
});

// --- FITUR KELOLA PROFIL RESPONSIVE & AVATAR LUCU ---
const changeAvatarBtn = document.getElementById('changeAvatarBtn');
const editActionGroup = document.getElementById('editActionGroup');

const cuteAvatars = ['✨', '👩‍💻', '🚀', '🦊', '🧠', '💡', '🌟', '🎨', '🌸', '🐾'];
let currentAvatarEmoji = '👩‍💻';

async function loadUserProfileData() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (user) {
        profileEmailDisplay.textContent = user.email;
        
        if (user.user_metadata && user.user_metadata.avatar_emoji) {
            currentAvatarEmoji = user.user_metadata.avatar_emoji;
            profileAvatar.textContent = currentAvatarEmoji;
        }
        
        if (user.user_metadata && user.user_metadata.full_name) {
            currentSavedName = user.user_metadata.full_name;
            profileNameInput.value = currentSavedName;
            profileCardName.textContent = currentSavedName;
            if (!user.user_metadata.avatar_emoji) profileAvatar.textContent = currentSavedName.charAt(0).toUpperCase();
        } else {
            currentSavedName = '';
            profileNameInput.value = '';
            profileCardName.textContent = user.email.split('@')[0];
            if (!user.user_metadata.avatar_emoji) profileAvatar.textContent = user.email.charAt(0).toUpperCase();
        }
    }
    lockProfileForm();
}

editProfileBtn.addEventListener('click', () => {
    profileNameInput.disabled = false;
    profileNameInput.classList.remove('bg-slate-50', 'text-slate-400');
    profileNameInput.classList.add('bg-white', 'text-slate-700');
    profileNameInput.focus();
    
    changeAvatarBtn.disabled = false;
    changeAvatarBtn.classList.remove('opacity-0', 'scale-75', 'pointer-events-none');
    changeAvatarBtn.classList.add('opacity-100', 'scale-100');
    
    editProfileBtn.classList.add('hidden');
    editActionGroup.classList.remove('hidden');
});

changeAvatarBtn.addEventListener('click', () => {
    const currentIndex = cuteAvatars.indexOf(profileAvatar.textContent);
    let nextIndex = Math.floor(Math.random() * cuteAvatars.length);
    
    while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * cuteAvatars.length);
    }
    
    currentAvatarEmoji = cuteAvatars[nextIndex];
    profileAvatar.textContent = currentAvatarEmoji;
});

cancelProfileBtn.addEventListener('click', () => {
    profileNameInput.value = currentSavedName;
    if (currentSavedName) {
        profileAvatar.textContent = currentAvatarEmoji;
    }
    lockProfileForm();
});

function lockProfileForm() {
    profileNameInput.disabled = true;
    profileNameInput.classList.remove('bg-white', 'text-slate-700');
    profileNameInput.classList.add('bg-slate-50', 'text-slate-400');
    
    changeAvatarBtn.disabled = true;
    changeAvatarBtn.classList.remove('opacity-100', 'scale-100');
    changeAvatarBtn.classList.add('opacity-0', 'scale-75', 'pointer-events-none');
    
    editProfileBtn.classList.remove('hidden');
    editActionGroup.classList.add('hidden');
}

saveProfileBtn.addEventListener('click', async () => {
    const fullNameValue = profileNameInput.value.trim();
    if (!fullNameValue) return alert('Nama lengkap tidak boleh kosong!');

    saveProfileBtn.disabled = true;
    saveProfileBtn.textContent = 'Menyimpan...';

    const { data, error } = await supabaseClient.auth.updateUser({
        data: { 
            full_name: fullNameValue,
            avatar_emoji: currentAvatarEmoji 
        }
    });

    saveProfileBtn.disabled = false;
    saveProfileBtn.textContent = '✨ Simpan';

    if (error) {
        alert('Gagal memperbarui profil: ' + error.message);
    } else {
        alert('Profil dan Avatar lucu Anda berhasil diperbarui!');
        currentSavedName = fullNameValue;
        userDisplayEmail.textContent = fullNameValue;
        profileCardName.textContent = fullNameValue;
        lockProfileForm();
    }
});

// ==========================================
// 6. LOGIKA RIWAYAT PENCARIAN (HISTORY)
// ==========================================
async function saveToHistory(word, result) {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
        console.error("Gagal menyimpan riwayat: User belum login.");
        return;
    }

    try {
        console.log("DATA YANG AKAN DISIMPAN");
        console.log({
        user_id: user.id,
        keyword: word,
        result: result
        });
        const { error } = await supabaseClient
            .from('history') 
            .insert([
                { 
                    user_id: user.id, 
                    keyword: word,
                    result: result
                }
                if (error) {
    console.error(error);
} else {
    console.log("INSERT BERHASIL");
}
            ]);

        if (error) throw error;
        renderHistory();

    } catch (error) {
        console.error("Gagal mengirim riwayat ke Supabase:", error.message);
    }
}

async function renderHistory() {
    const historyListContainer = document.getElementById('historyListContainer');
    
    // Memakai supabaseClient 
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    try {
        const { data: history, error } = await supabaseClient
            .from('history')
            .select('keyword')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!history || history.length === 0) {
            historyListContainer.innerHTML = `<p class="text-slate-400 italic text-center py-4">Belum ada riwayat pencarian.</p>`;
            return;
        }
        
        historyListContainer.innerHTML = '';
        
        history.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.className = "flex justify-between items-center py-3 hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer group";
            
            itemRow.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="text-slate-400">🕒</span>
                    <span class="font-medium text-slate-700 group-hover:text-indigo-600 transition">${item.keyword}</span>
                </div>
                <span class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition">Cari Lagi ↗</span>
            `;
            
            itemRow.addEventListener('click', () => {
                keywordInput.value = item.keyword;
                menuSearch.click();
                fetchSynonyms(); 
            });
            
            historyListContainer.appendChild(itemRow);
        });

    } catch (error) {
        console.error("Gagal memuat data dari Supabase:", error.message);
        historyListContainer.innerHTML = `<p class="text-rose-500 text-center py-4 text-xs">Gagal memuat riwayat pencarian.</p>`;
    }
}
