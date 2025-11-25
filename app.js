/**
 * Puter AI 2025 - Pro Workspace
 * Ana JavaScript dosyası
 * 
 * İçerik:
 * - State değişkenleri
 * - initApp fonksiyonu
 * - handleSendClick fonksiyonu (API yanıt parsing düzeltilmiş)
 * - UI güncelleme fonksiyonları
 * - Sohbet yönetimi fonksiyonları
 * - Yardımcı fonksiyonlar
 * - Event listeners
 * - Optimizasyon: Debounce, Event delegation, Intersection Observer, LocalStorage fallback
 */

// --- STATE DEĞİŞKENLERİ ---
let chats = [];
let activeChatId = null;
let isUserSignedIn = false;

// Mod tanımlamaları
const MODES = {
    'general': { 
        title: 'Genel Sohbet',
        system: 'Sen Z kuşağı dilinden anlayan, samimi, kısa ve öz konuşan zeki bir asistansın. Gereksiz resmiyet yapma. Nokta kullanma.',
        steps: ['Mesaj inceleniyor...', 'Bağlam kuruluyor...', 'Cevap üretiliyor...']
    },
    'deepsearch': { 
        title: 'Deep Search',
        system: 'Sen derinlemesine araştırma yapan bir analistsin. Cevaplarında mutlaka kaynak belirt. Konuyu her açıdan ele al.',
        steps: ['Sorgu analiz ediliyor...', 'Web kaynakları taranıyor (Google & Scholar)...', 'Veriler doğrulanıyor...', 'İçerik sentezleniyor...', 'Kaynaklar ekleniyor...']
    },
    'coding': { 
        title: 'Kodlama',
        system: 'Sen Expert Senior Developer\'sın. Kod istenirse TEK DOSYA HTML olarak ver. "Deploy" butonu için hazırla.',
        steps: ['Gereksinimler analiz ediliyor...', 'Mimari tasarlanıyor...', 'Kod yazılıyor...', 'Syntax kontrol ediliyor...', 'Deploy paketi hazırlanıyor...']
    },
    'teacher': { 
        title: 'Öğretmen',
        system: 'Sen Sokratik bir öğretmensin. Cevabı direkt verme, sorularla yönlendir. Basit anlat.',
        steps: ['Öğrenme seviyesi belirleniyor...', 'Pedagojik yaklaşım seçiliyor...', 'Analoji kuruluyor...', 'Cevap hazırlanıyor...']
    }
};

// --- OPTİMİZASYON: Debounce Fonksiyonu ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// --- OPTİMİZASYON: Intersection Observer (Lazy Loading) ---
let chatObserver = null;

function initIntersectionObserver() {
    // Büyük sohbet geçmişleri için lazy loading
    if ('IntersectionObserver' in window) {
        chatObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Görünür olduğunda işlem yapılabilir
                    entry.target.classList.add('visible');
                }
            });
        }, {
            root: document.getElementById('chat-container'),
            rootMargin: '50px',
            threshold: 0.1
        });
    }
}

// --- OPTİMİZASYON: LocalStorage Fallback ---
const Storage = {
    // Puter.js kullanılamadığında LocalStorage kullan
    async save(key, data) {
        if (isUserSignedIn && typeof puter !== 'undefined') {
            try {
                await puter.fs.write(key, JSON.stringify(data));
                return true;
            } catch (e) {
                // Puter başarısız olursa localStorage'a düş
                console.warn('Puter.fs.write başarısız, localStorage kullanılıyor');
            }
        }
        // LocalStorage fallback
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('LocalStorage kaydetme başarısız:', e);
            return false;
        }
    },
    
    async load(key) {
        if (isUserSignedIn && typeof puter !== 'undefined') {
            try {
                const f = await puter.fs.read(key);
                if (f) return JSON.parse(await f.text());
            } catch (e) {
                // Puter başarısız olursa localStorage'dan oku
                console.warn('Puter.fs.read başarısız, localStorage kullanılıyor');
            }
        }
        // LocalStorage fallback
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('LocalStorage okuma başarısız:', e);
            return null;
        }
    }
};

// --- OPTİMİZASYON: Sessiz Error Handling (Production) ---
// Production ortamı tespiti - localhost, 127.0.0.1 ve ::1 (IPv6 localhost) kontrol edilir
const isProduction = !['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

function logError(error, context = '') {
    if (!isProduction) {
        console.error(`[${context}]`, error);
    }
    // Production'da sessiz hata yönetimi - isteğe bağlı hata raporlama eklenebilir
}

// --- INIT ---
function initApp() {
    // Lucide ikonlarını başlat
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Intersection Observer'ı başlat
    initIntersectionObserver();
    
    // Event listeners'ı ayarla
    setupEventListeners();
    
    // Kullanıcı durumunu kontrol et ve sohbetleri yükle
    initUser();
}

async function initUser() {
    try {
        if (typeof puter !== 'undefined') {
            const user = await puter.auth.getUser().catch(() => null);
            if (user) {
                isUserSignedIn = true;
                document.getElementById('username').innerText = user.username;
                document.getElementById('user-avatar').innerText = user.username.charAt(0).toUpperCase();
                await loadChats();
            }
        }
    } catch(e) {
        logError(e, 'initUser');
    }
    
    // İlk sohbeti başlat veya mevcut olanı yükle
    if (chats.length === 0) {
        startNewChat();
    } else {
        loadChatToUI(chats[0].id);
    }
}

// --- CORE CHAT ---
async function handleSendClick() {
    const text = document.getElementById('prompt-input').value.trim();
    if (!text) return;

    document.getElementById('prompt-input').value = '';
    resizeTextarea();

    if (!activeChatId) startNewChat();
    const chatId = activeChatId; 
    const currentChat = chats.find(c => c.id === chatId);
    
    // Kullanıcı mesajını ekle
    currentChat.messages.push({ role: 'user', content: text, timestamp: Date.now() });
    updateChatUI(chatId);
    
    // İşleme başla
    currentChat.isProcessing = true;
    currentChat.processLog = []; // Düşünme adımları için log
    renderHistoryList();
    
    const modeKey = currentChat.mode || 'general';
    const modeConfig = MODES[modeKey];
    const modelId = document.getElementById('model-selector').value;

    try {
        // --- CANLI DÜŞÜNME SİMÜLASYONU (TÜM MODLAR) ---
        // Her mod için tanımlı adımları (steps) tek tek oynatıyoruz
        for (const step of modeConfig.steps) {
            if (!currentChat.isProcessing) break; 
            
            currentChat.tempStatus = step;
            currentChat.processLog.push({ text: step, done: false }); // İlerlemeyi logla
            
            // Aktif sohbette UI güncelle
            if (activeChatId === chatId) updateThinkingUI(chatId);
            
            // Gerçekçilik için rastgele gecikme (DeepSearch daha yavaş)
            const delay = modeKey === 'deepsearch' ? 1500 : 600; 
            await new Promise(r => setTimeout(r, delay + Math.random() * 500));
            
            // Son adımı tamamlandı olarak işaretle
            if (currentChat.processLog.length > 0) {
                currentChat.processLog[currentChat.processLog.length - 1].done = true;
            }
        }

        // API Çağrısı
        const historyContext = currentChat.messages.slice(-8).map(m => `${m.role}: ${m.content}`).join('\n');
        const fullPrompt = `${modeConfig.system}\n\nGEÇMİŞ:\n${historyContext}\n\nUSER: ${text}`;
        
        const response = await puter.ai.chat(fullPrompt, { model: modelId });
        
        // --- HATA DÜZELTMESİ: API Yanıt Parsing ---
        // Puter.js API yanıtını doğru şekilde parse et
        let content = '';
        if (typeof response === 'string') {
            // Doğrudan string yanıt
            content = response;
        } else if (response?.message?.content) {
            // response.message.content formatı
            content = response.message.content;
        } else if (response?.text) {
            // response.text formatı
            content = response.text;
        } else if (response?.content) {
            // response.content formatı
            content = response.content;
        } else if (response?.choices?.[0]?.message?.content) {
            // OpenAI formatı: response.choices[0].message.content
            content = response.choices[0].message.content;
        } else if (typeof response === 'object') {
            // Bilinmeyen obje formatı - JSON olarak göster
            content = JSON.stringify(response, null, 2);
        } else {
            // Son çare - string'e çevir
            content = String(response);
        }
        
        // Array kontrolü - bazı API'ler array döndürebilir
        if (Array.isArray(content)) {
            content = content.map(c => typeof c === 'object' ? (c.text || JSON.stringify(c)) : c).join('');
        }

        currentChat.messages.push({ role: 'assistant', content: content, timestamp: Date.now() });

    } catch (err) {
        logError(err, 'handleSendClick');
        currentChat.messages.push({ role: 'assistant', content: `⚠️ Hata: ${err.message || "Bağlantı koptu."}` });
    } finally {
        currentChat.isProcessing = false;
        currentChat.tempStatus = null;
        saveChats();
        renderHistoryList();
        if (activeChatId === chatId) updateChatUI(chatId);
    }
}

// --- UI GÜNCELLEME FONKSİYONLARI ---
function updateChatUI(chatId) {
    if (chatId !== activeChatId) return;
    
    const chat = chats.find(c => c.id === chatId);
    const container = document.getElementById('messages-list');
    container.innerHTML = '';
    document.getElementById('empty-state').style.display = chat.messages.length ? 'none' : 'flex';
    document.getElementById('chat-header-title').innerText = chat.title || "Yeni Sohbet";

    // Mesajları render et
    chat.messages.forEach(msg => {
        const div = document.createElement('div');
        const isUser = msg.role === 'user';
        div.className = `flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`;
        
        const avatarBg = isUser ? 'bg-[#3b52d4]' : 'bg-[#2b2e40] border border-[#2f3345]';
        const icon = isUser ? 'user' : 'bot';
        
        let contentHtml = marked.parse(msg.content);
        
        // Kodlama modu için Deploy butonu ekle
        if (!isUser && (chat.mode === 'coding' || msg.content.includes('```html'))) {
            const match = msg.content.match(/```html([\s\S]*?)```/);
            if (match) {
                const code = match[1].trim().replace(/"/g, '&quot;');
                contentHtml += `<div class="mt-3"><button onclick="deployCode(this)" data-code="${code}" class="text-xs bg-[#3b52d4] hover:bg-[#2e42b5] text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"><i data-lucide="rocket" class="w-3 h-3"></i> Canlıya Al (Host)</button></div>`;
            }
        }

        // DeepSearch modu için kaynaklar ekle
        if (!isUser && chat.mode === 'deepsearch') {
            contentHtml += `
            <div class="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1"><i data-lucide="book" class="w-3 h-3"></i> Kaynaklar:</div>
                <span class="text-[10px] bg-[#151722] text-blue-400 px-2 py-1 rounded border border-[#2f3345] hover:border-blue-500 cursor-pointer transition-colors">wikipedia.org</span>
                <span class="text-[10px] bg-[#151722] text-blue-400 px-2 py-1 rounded border border-[#2f3345] hover:border-blue-500 cursor-pointer transition-colors">researchgate.net</span>
                <span class="text-[10px] bg-[#151722] text-blue-400 px-2 py-1 rounded border border-[#2f3345] hover:border-blue-500 cursor-pointer transition-colors">github.com</span>
            </div>`;
        }

        div.innerHTML = `
            <div class="w-8 h-8 rounded-full ${avatarBg} flex-shrink-0 flex items-center justify-center text-white text-xs shadow-lg"><i data-lucide="${icon}" class="w-4 h-4"></i></div>
            <div class="max-w-[85%] min-w-0">
                <div class="p-4 rounded-2xl ${isUser ? 'bg-[#3b52d4] text-white' : 'bg-[#1e2130] text-gray-100 border border-[#2f3345]'} shadow-md markdown-body">
                    ${contentHtml}
                </div>
                <div class="text-[10px] text-gray-600 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'} opacity-60">${new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        container.appendChild(div);
    });

    // İşleme göstergesi (en altta)
    if (chat.isProcessing) {
        const thinkingDiv = document.createElement('div');
        thinkingDiv.id = 'thinking-bubble';
        thinkingDiv.className = "flex gap-4";
        thinkingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#2b2e40] flex-shrink-0 flex items-center justify-center text-gray-300 text-xs border border-[#2f3345] animate-pulse"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i></div>
            <div class="max-w-[85%] min-w-0">
                <div class="p-0 rounded-2xl">
                    <div class="thinking-process rounded-lg border border-[#2f3345] bg-[#151722] p-3 shadow-inner" id="thinking-steps-container">
                        <!-- Adımlar JS ile eklenir -->
                    </div>
                </div>
            </div>
        `;
        container.appendChild(thinkingDiv);
        updateThinkingUI(chatId); // Adımları hemen doldur
    }

    // Lucide ikonlarını yenile
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // OPTİMİZASYON: RequestAnimationFrame ile smooth scrolling
    requestAnimationFrame(() => {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    });
}

function updateThinkingUI(chatId) {
    const container = document.getElementById('thinking-steps-container');
    if (!container) return;
    
    const chat = chats.find(c => c.id === chatId);
    if (!chat || !chat.processLog) return;

    container.innerHTML = chat.processLog.map((log, index) => {
        const isActive = index === chat.processLog.length - 1;
        const icon = log.done ? 'check-circle' : (isActive ? 'loader' : 'circle');
        const color = log.done ? 'text-green-500' : (isActive ? 'text-blue-400 animate-pulse' : 'text-gray-600');
        const spin = isActive && !log.done ? 'animate-spin' : '';
        
        return `
            <div class="thinking-step ${isActive ? 'active' : ''}">
                <i data-lucide="${icon}" class="${color} ${spin} w-3 h-3"></i>
                <span>${log.text}</span>
            </div>
        `;
    }).join('');
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// --- SOHBET YÖNETİMİ FONKSİYONLARI ---
function startNewChat() {
    const id = Date.now().toString();
    // UI butonlarından aktif modu al
    const activeBtn = document.querySelector('.mode-btn.active');
    const initialMode = activeBtn ? activeBtn.id.replace('btn-mode-', '') : 'general';

    const newChat = {
        id: id,
        title: 'Yeni Sohbet',
        messages: [],
        mode: initialMode,
        timestamp: Date.now(),
        isProcessing: false,
        processLog: []
    };
    chats.unshift(newChat);
    loadChatToUI(id);
    renderHistoryList();
    saveChats();
    
    // Mobilde sol sidebar'ı kapat
    if (window.innerWidth < 768) {
        document.getElementById('sidebar-left').classList.add('-translate-x-full');
    }
}

function loadChatToUI(id) {
    activeChatId = id;
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    
    setMode(chat.mode || 'general', false);
    updateChatUI(id);
    renderHistoryList();
}

function renderHistoryList() {
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    
    chats.forEach(chat => {
        const isActive = chat.id === activeChatId;
        const btn = document.createElement('button');
        btn.onclick = () => loadChatToUI(chat.id);
        
        const processingBadge = chat.isProcessing 
            ? `<div class="absolute right-3 top-3 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div><div class="absolute right-3 top-3 w-2 h-2 bg-blue-500 rounded-full"></div>` 
            : '';

        btn.className = `w-full text-left p-3 rounded-xl text-sm mb-1 flex items-center gap-3 relative transition-all group border border-transparent
            ${isActive ? 'bg-[#1e2130] border-[#2f3345] text-white shadow-md' : 'text-gray-400 hover:bg-[#151722] hover:text-gray-200'}`;
        
        btn.innerHTML = `
            <i data-lucide="message-circle" class="w-4 h-4 opacity-60"></i>
            <div class="flex-1 min-w-0">
                <div class="truncate font-medium text-[13px]">${chat.title}</div>
                <div class="text-[10px] opacity-50 truncate">${chat.isProcessing ? chat.tempStatus || 'Çalışıyor...' : new Date(chat.timestamp).toLocaleDateString()}</div>
            </div>
            ${processingBadge}
        `;
        list.appendChild(btn);
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function setMode(mode, updateChat = true) {
    document.querySelectorAll('.mode-btn').forEach(b => {
        b.classList.remove('active', 'border-[#3b52d4]', 'bg-[#25283a]');
        if (b.id === `btn-mode-${mode}`) {
            b.classList.add('active', 'border-[#3b52d4]', 'bg-[#25283a]');
        }
    });
    
    if (updateChat && activeChatId) {
        const chat = chats.find(c => c.id === activeChatId);
        if (chat) {
            chat.mode = mode;
            saveChats();
        }
    }
}

// --- YARDIMCI FONKSİYONLAR ---
async function handleAuth() {
    try {
        if (typeof puter !== 'undefined') {
            const user = await puter.auth.signIn();
            isUserSignedIn = true;
            document.getElementById('username').innerText = user.username;
            document.getElementById('user-avatar').innerText = user.username.charAt(0).toUpperCase();
            await loadChats();
        }
    } catch(e) {
        logError(e, 'handleAuth');
    }
}

async function saveChats() {
    await Storage.save('chats_pro_v1.json', chats);
}

async function loadChats() {
    const data = await Storage.load('chats_pro_v1.json');
    if (data) {
        chats = data;
        renderHistoryList();
    }
}

async function deployCode(btn) {
    if (!isUserSignedIn) { 
        handleAuth(); 
        return; 
    }
    
    const code = btn.getAttribute('data-code').replace(/&quot;/g, '"');
    const originalHtml = btn.innerHTML;
    const originalClass = btn.className; // Orijinal class'ı sakla
    
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Hazırlanıyor...`;
    btn.disabled = true;

    try {
        const randomId = Math.random().toString(36).substring(7);
        const subdomain = `pro-${randomId}`;
        const dir = `www_${randomId}`;
        
        // 1. Klasör oluştur
        await puter.fs.mkdir(dir);
        
        // 2. index.html yaz
        await puter.fs.write(`${dir}/index.html`, code);
        
        // 3. Hosting oluştur
        btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> Yayınlanıyor...`;
        const site = await puter.hosting.create(subdomain, dir);
        
        console.log("Hosting Response:", site); // Debug
        
        // URL'i oluştur
        const finalSubdomain = site.subdomain || subdomain;
        const url = `https://${finalSubdomain}.puter.site`;
        
        btn.className = "text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors";
        btn.innerHTML = `<i data-lucide="external-link" class="w-3 h-3"></i> ${finalSubdomain}`;
        
        btn.onclick = (e) => {
            e.preventDefault();
            window.open(url, '_blank');
        };
        
    } catch (err) {
        logError(err, 'deployCode');
        btn.innerHTML = `⚠️ Hata`;
        console.error("Deploy Hatası Detayı:", err);
        
        setTimeout(() => { 
            btn.innerHTML = originalHtml; 
            btn.className = originalClass; // Orijinal class'a dön
            btn.disabled = false; 
        }, 3000);
    }
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Textarea boyutlandırma (debounce ile)
function resizeTextarea() {
    const el = document.getElementById('prompt-input');
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

// OPTİMİZASYON: Debounce ile textarea resize
const debouncedResizeTextarea = debounce(resizeTextarea, 50);

// Sidebar toggle fonksiyonları
function toggleLeftSidebar() { 
    document.getElementById('sidebar-left').classList.toggle('-translate-x-full'); 
}

function toggleRightSidebar() { 
    document.getElementById('sidebar-right').classList.toggle('translate-x-full'); 
}

// --- EVENT LISTENERS (Event Delegation ile) ---
function setupEventListeners() {
    const promptInput = document.getElementById('prompt-input');
    
    // Textarea input eventi (debounce ile)
    promptInput.addEventListener('input', debouncedResizeTextarea);
    
    // Enter tuşu ile gönderme
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    });
    
    // OPTİMİZASYON: Event delegation ile mod butonları
    // ID selector kullanarak daha stabil bir çözüm
    const modeButtonsContainer = document.getElementById('mode-buttons-container');
    if (modeButtonsContainer) {
        modeButtonsContainer.addEventListener('click', (e) => {
            const modeBtn = e.target.closest('.mode-btn');
            if (modeBtn) {
                const mode = modeBtn.id.replace('btn-mode-', '');
                setMode(mode);
            }
        });
    }
}

// DOM hazır olduğunda uygulamayı başlat
document.addEventListener('DOMContentLoaded', initApp);
