// ==========================================
// 1. CONFIGURATION & INITIALIZATION SUPABASE
// ==========================================
// Kunci URL dan ANON_KEY yang panjang banget (Pastikan sudah sesuai dengan dashboard Supabase-mu)
const SUPABASE_URL = "https://elzncubwogaabejekevz.supabase.co"; 
const SUPABASE_ANON_KEY = "PASTE_KUNCI_ANON_YANG_PANJANG_DI_SINI"; 

// Inisialisasi koneksi tunggal ke Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Dom Elements (Sesuaikan ID ini dengan atribut id di file HTML kamu)
const authSection = document.getElementById('authSection');
const mainAppSection = document.getElementById('mainAppSection');
const authForm = document.getElementById('authForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const submitAuthBtn = document.getElementById('submitAuthBtn');
const switchAuthBtn = document.getElementById('switchAuthBtn');
const authTitle = document.getElementById('authTitle');
const logoutBtn = document.getElementById('logoutBtn');
const userEmailDisplay = document.getElementById('userEmailDisplay');

const keywordInput = document.getElementById('keywordInput');
const searchBtn = document.getElementById('searchBtn');
const resultContainer = document.getElementById('resultContainer');
const historyListContainer = document.getElementById('historyListContainer');

let isLoginMode = true;

// ==========================================
// 2. OTOMATISASI STATUS LOGIN (AUTO-LOGIN)
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    // Menggunakan .getUser() agar validasi token real-time dan tidak tertukar akun
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    
    if (user) {
        showMainApp(user.email);
    } else {
        showAuthForm();
    }
});

// ==========================================
// 3. LOGIKA AUTHENTICATION (LOGIN & REGISTER)
// ==========================================
switchAuthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authTitle.innerText = "Login ke KeyMatch";
        submitAuthBtn.innerText = "Masuk";
        switchAuthBtn.innerText = "Belum punya akun? Daftar sekarang";
    } else {
        authTitle.innerText = "Daftar Akun Baru";
        submitAuthBtn.innerText = "Daftar";
        switchAuthBtn.innerText = "Sudah punya akun? Login di sini";
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Email dan password tidak boleh kosong!");
        return;
    }

    try {
        if (isLoginMode) {
            // Proses Login
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            showMainApp(data.user.email);
        } else {
            // Proses Register
            const { data, error } = await supabaseClient.auth.signUp({ email, password });
            if (error) throw error;
            alert("Pendaftaran berhasil! Silakan cek email untuk verifikasi atau langsung coba login.");
            isLoginMode = true;
            authTitle.innerText = "Login ke KeyMatch";
            submitAuthBtn.innerText = "Masuk";
        }
    } catch (error) {
        alert("Akses Gagal: " + error.message);
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    showAuthForm();
    // Bersihkan form input pencarian dan riwayat visual
    keywordInput.value = '';
    resultContainer.innerHTML = '';
    historyListContainer.innerHTML = '';
});

function showMainApp(email) {
    authSection.classList.add('hidden');
    mainAppSection.classList.remove('hidden');
    userEmailDisplay.innerText = email;
    renderHistory(); // Muat riwayat pencarian milik user saat ini
}

function showAuthForm() {
    authSection.classList.remove('hidden');
    mainAppSection.classList.add('hidden');
    emailInput.value = '';
    passwordInput.value = '';
}

// ==========================================
// 4. LOGIKA PENCARIAN KATA (API UTAMA)
// ==========================================
searchBtn.addEventListener('click', fetchSynonyms);
keywordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchSynonyms();
});

async function fetchSynonyms() {
    const word = keywordInput.value.trim();
    if (!word) {
        alert("Silakan ketik kata kunci pencarian dahulu!");
        return;
    }

    resultContainer.innerHTML = `<p class="text-slate-500 italic">Sedang mencari kata...</p>`;

    try {
        // Contoh integrasi API pencarian (Ganti URL API ini sesuai fungsionalitas aslimu jika berbeda)
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        if (!response.ok) {
            throw new Error("Kata tidak ditemukan di database kamus.");
        }

        const data = await response.json();
        
        // Render Hasil ke Tampilan HTML
        const definition = data[0].meanings[0].definitions[0].definition;
        resultContainer.innerHTML = `
            <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <h3 class="font-bold text-lg text-indigo-900 capitalize">🔍 ${word}</h3>
                <p class="text-slate-700 mt-2">${definition}</p>
            </div>
        `;

        // PENTING: Pemicu untuk otomatis menyimpan kata kunci ke database Supabase!
        await saveToHistory(word);

    } catch (error) {
        resultContainer.innerHTML = `<p class="text-rose-500 font-medium">⚠️ ${error.message}</p>`;
    }
}

// ==========================================
// 5. LOGIKA RIWAYAT PENCARIAN (SUPABASE HISTORY)
// ==========================================
async function saveToHistory(word) {
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
        console.error("Gagal menyimpan riwayat: User tidak valid.");
        return;
    }

    try {
        // Mengirim data keyword ke tabel 'history'
        const { error } = await supabaseClient
            .from('history') 
            .insert([
                { 
                    user_id: user.id, 
                    keyword: word     
                }
            ]);

        if (error) throw error;
        
        // Refresh daftar riwayat di layar setelah berhasil input
        renderHistory();

    } catch (error) {
        console.error("Gagal menginput data ke Supabase:", error.message);
    }
}

async function renderHistory() {
    if (!historyListContainer) return;
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    try {
        // Mengambil data riwayat khusus milik user yang sedang aktif login
        const { data: history, error } = await supabaseClient
            .from('history')
            .select('keyword')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10); // Dibatasi maksimal 10 riwayat terakhir

        if (error) throw error;

        if (!history || history.length === 0) {
            historyListContainer.innerHTML = `<p class="text-slate-400 italic text-center py-4 text-sm">Belum ada riwayat pencarian.</p>`;
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
            
            // Jika baris riwayat diklik, otomatis mencari kata itu kembali
            itemRow.addEventListener('click', () => {
                keywordInput.value = item.keyword;
                fetchSynonyms(); 
            });
            
            historyListContainer.appendChild(itemRow);
        });

    } catch (error) {
        console.error("Gagal memuat daftar riwayat dari Supabase:", error.message);
        historyListContainer.innerHTML = `<p class="text-rose-500 text-center py-4 text-xs">Gagal memuat riwayat.</p>`;
    }
}
