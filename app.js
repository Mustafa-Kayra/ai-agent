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
 * - Dil desteği (20 dil)
 * - Konuşma stilleri
 * - Görsel/Video desteği
 * - Özel model ekleme
 * - Resim oluşturma (Nano Banana)
 */

// --- SUPABASE CLIENT ---
const SUPABASE_URL = 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

let supabase;
// Supabase client'ı başlat (sayfa yüklendiğinde)
if (typeof window.supabase !== 'undefined') {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase client initialized');
}

// --- STATE DEĞİŞKENLERİ ---
let chats = [];
let activeChatId = null;
let isUserSignedIn = false;
let currentLanguage = 'tr'; // Varsayılan dil
let currentStyle = 'normal'; // Varsayılan konuşma stili
let customStylePrompt = ''; // Özel stil prompt'u
let customModels = []; // Kullanıcının eklediği özel modeller
let uploadedFile = null; // Yüklenen dosya (görsel/video)
let activeTab = 'chat'; // 'chat' veya 'image-gen'
let compareMode = false; // Karşılaştırma modu

// --- DİL DESTEĞİ ---
// LANGUAGES ve UI_TRANSLATIONS artık languages.js dosyasında tanımlıdır

// Çeviri yardımcı fonksiyonu
function t(key) {
  const translations = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS['en'];
  return translations[key] || UI_TRANSLATIONS['en'][key] || key;
}

// --- KONUŞMA STİLLERİ ---
const CONVERSATION_STYLES = {
  normal: {
    name: 'Normal',
    prompt: 'Profesyonel ve net bir şekilde konuş.',
  },
  genz: {
    name: 'Z Kuşağı',
    prompt:
      'Z kuşağı gibi konuş. Bol emoji kullan 🔥💀, kısa cümleler kur, güncel argo ve internet jargonu kullan (no cap, fr fr, based, slay gibi). Rahat ve eğlenceli ol.',
  },
  millennial: {
    name: 'Y Kuşağı',
    prompt:
      "Y kuşağı (millennial) gibi konuş. Nostaljik referanslar yap, rahat ama profesyonel ol, ara sıra 90'lar ve 2000'ler pop kültürüne atıfta bulun.",
  },
  academic: {
    name: 'Akademik',
    prompt:
      'Akademik ve bilimsel bir dil kullan. Resmi ol, detaylı açıklamalar yap, teknik terimler kullan ve kaynak gösterme alışkanlığı ol.',
  },
  friendly: {
    name: 'Samimi',
    prompt:
      'Arkadaş gibi samimi konuş. Emoji kullan 😊, espri yap, sıcak ve yakın ol. Resmiyet yapma.',
  },
  custom: {
    name: 'Özel',
    prompt: '', // Kullanıcı tarafından belirlenir
  },
};

// Mod tanımlamaları
const MODES = {
  general: {
    title: 'Genel Sohbet',
    system: 'Sen zeki bir asistansın. Kısa ve öz cevaplar ver. Kullanıcının isteğine göre farklı dillerde cevap ver, ama otomatik olarak Türkçe konuş.',
    steps: ['Mesaj inceleniyor...', 'Bağlam kuruluyor...', 'Cevap üretiliyor...'],
  },
  deepsearch: {
    title: 'Deep Search',
    system:
      'Sen derinlemesine araştırma yapan bir analistsin. Cevaplarında mutlaka kaynak belirt. Konuyu her açıdan ele al. Kullanıcıya zeki ve biraz bilmiş şekilde cevap ver.',
    steps: [
      'Sorgu analiz ediliyor...',
      'Web kaynakları taranıyor (Google & Scholar)...',
      'Veriler doğrulanıyor...',
      'İçerik sentezleniyor...',
      'Kaynaklar ekleniyor...',
    ],
  },
  coding: {
    title: 'Kodlama',
    system: `Sen Expert Senior Developer'sın. Mühendis insanlar seni görünce mesleğimiz bitti diyecek kadar iyi kod yaz, kullanıcının isteğinin dışına çıkma. Kod istenirse 3 AYRI KOD BLOĞU olarak ver:

1. HTML bloğu (\`\`\`html ... \`\`\`) - Temel yapı, CSS ve JS dosyalarına link içermeli:
   <link rel="stylesheet" href="styles.css">
   <script src="script.js"></script>

2. CSS bloğu (\`\`\`css ... \`\`\`) - Tüm stiller

3. JavaScript bloğu (\`\`\`javascript ... \`\`\`) - Tüm fonksiyonlar

Otomatik olarak tek html dosyası oluştur, ama kullanıcının isteğine göre css, js ve html bulunan üç dosyalı web uygulaması yap. Kullanıcının isteğine göre farklı dillerde (örneğin python, c++) kod yazabilirsin ama tek dosyalı olacak.`,
    steps: [
      'Gereksinimler analiz ediliyor...',
      'Mimari tasarlanıyor...',
      'HTML yazılıyor...',
      'CSS yazılıyor...',
      'JavaScript yazılıyor...',
      'Deploy paketi hazırlanıyor...',
    ],
  },
  teacher: {
    title: 'Öğretmen',
    system: 'Sen Sokratik bir öğretmensin. Cevabı direkt verme, sorularla yönlendir. Basit anlat. Karşındaki öğrenciymiş gibi konuş.',
    steps: [
      'Öğrenme seviyesi belirleniyor...',
      'Pedagojik yaklaşım seçiliyor...',
      'Analoji kuruluyor...',
      'Cevap hazırlanıyor...',
    ],
  },
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
    chatObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Görünür olduğunda işlem yapılabilir
            entry.target.classList.add('visible');
          }
        });
      },
      {
        root: document.getElementById('chat-container'),
        rootMargin: '50px',
        threshold: 0.1,
      }
    );
  }
}

// --- DATABASE KEY SCHEMA ---
const DB_KEYS = {
  CHATS: 'chats',
  CHAT_TITLE: 'chat:{id}:title',
  CHAT_MESSAGES: 'chat:{id}:messages',
  IMAGES: 'image_gallery',
  SETTINGS: 'settings',
  CUSTOM_MODELS: 'custom_models',
  STATS: 'stats',
};

// --- OPTİMİZASYON: Puter.kv ile Storage ---
const Storage = {
  // Puter.kv kullan, başarısız olursa localStorage fallback
  async save(key, data) {
    if (typeof puter !== 'undefined' && puter.kv) {
      try {
        await puter.kv.set(key, JSON.stringify(data));
        return true;
      } catch (e) {
        console.warn('Puter.kv başarısız, localStorage fallback');
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
    if (typeof puter !== 'undefined' && puter.kv) {
      try {
        const data = await puter.kv.get(key);
        if (data) return JSON.parse(data);
      } catch (e) {
        console.warn('Puter.kv okuma başarısız, localStorage fallback');
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
  },

  async delete(key) {
    if (typeof puter !== 'undefined' && puter.kv) {
      try {
        await puter.kv.del(key);
      } catch (e) {
        console.warn('Puter.kv silme başarısız');
      }
    }
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('LocalStorage silme başarısız:', e);
    }
  },
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

  // Kayıtlı ayarları yükle
  loadSettings();

  // Özel modelleri yükle
  loadCustomModels();

  // Event listeners'ı ayarla
  setupEventListeners();

  // Kullanıcı durumunu kontrol et ve sohbetleri yükle
  initUser();

  // Arayüzü seçilen dile göre güncelle
  updateUILanguage();
}

async function initUser() {
  try {
    // Demo mode - skip Puter auth completely
    // User will click "Sign in" button to activate demo mode
    await loadChats();
  } catch (e) {
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
  if (!text && !uploadedFile) return;

  document.getElementById('prompt-input').value = '';
  resizeTextarea();

  if (!activeChatId) startNewChat();
  const chatId = activeChatId;
  const currentChat = chats.find((c) => c.id === chatId);

  // Kullanıcı mesajını ekle (görsel varsa belirt)
  const userMessage = uploadedFile ? `${text} [📎 ${uploadedFile.name}]` : text;
  currentChat.messages.push({ role: 'user', content: userMessage, timestamp: Date.now() });
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
    for (const step of modeConfig.steps) {
      if (!currentChat.isProcessing) break;

      currentChat.tempStatus = step;
      currentChat.processLog.push({ text: step, done: false }); // İlerlemeyi logla

      if (activeChatId === chatId) updateThinkingUI(chatId);

      const delay = modeKey === 'deepsearch' ? 1500 : 600;
      await new Promise((r) => setTimeout(r, delay + Math.random() * 500));

      if (currentChat.processLog.length > 0) {
        currentChat.processLog[currentChat.processLog.length - 1].done = true;
      }
    }

    // Dil ve stil prompt'larını oluştur
    let langPrompt = '';
    if (LANGUAGES[currentLanguage]) {
      const langName = LANGUAGES[currentLanguage].prompt;
      langPrompt = `🔴 CRITICAL INSTRUCTION - HIGHEST PRIORITY 🔴
You MUST respond ENTIRELY and EXCLUSIVELY in ${langName} language.
- Every single word, sentence, and paragraph MUST be in ${langName}
- Do NOT mix languages
- Do NOT use English or any other language except ${langName}
- This is MANDATORY and NON-NEGOTIABLE
Language: ${langName}`;
    }

    const stylePrompt =
      currentStyle === 'custom'
        ? customStylePrompt
        : CONVERSATION_STYLES[currentStyle]?.prompt || '';

    // API Çağrısı
    const historyContext = currentChat.messages
      .slice(-8)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');
    const fullPrompt = `${modeConfig.system}\n\n${langPrompt}\n\n${stylePrompt}\n\nGEÇMİŞ:\n${historyContext}\n\nUSER: ${text}`;

    let response;

    console.log('🚀 API çağrısı başlatılıyor...', { modelId, hasFile: !!uploadedFile });

    // Puter SDK kontrolü
    if (typeof puter === 'undefined') {
      throw new Error('Puter SDK yüklenmedi. Lütfen sayfayı yenileyin.');
    }
    if (!puter.ai || !puter.ai.chat) {
      throw new Error('Puter AI servisi kullanılamıyor. Giriş yapmanız gerekebilir.');
    }

    console.log('✅ Puter SDK hazır, AI çağrısı yapılıyor...');

    // --- DÜZELTİLMİŞ VISION API BLOĞU ---
    // Görsel/Video dosyası varsa vision API kullan
    if (uploadedFile && uploadedFile.base64) {
      const messages = [
        {
          role: 'user',
          content: [
            { type: 'text', text: fullPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${uploadedFile.type};base64,${uploadedFile.base64}`,
              },
            },
          ],
        },
      ];

      console.log('📷 Vision API çağrılıyor...');
      response = await puter.ai.chat(messages, { model: modelId });
      console.log('✅ Vision API yanıt aldı:', response);

      // Dosyayı temizle
      clearUploadedFile();
    } else {
      console.log('💬 Chat API çağrılıyor...');
      response = await puter.ai.chat(fullPrompt, { model: modelId });
      console.log('✅ Chat API yanıt aldı:', response);
    }
    // --- DÜZELTME SONU ---

    // --- API Yanıt Parsing ---
    let content = '';
    if (typeof response === 'string') {
      content = response;
    } else if (response?.message?.content) {
      content = response.message.content;
    } else if (response?.text) {
      content = response.text;
    } else if (response?.content) {
      content = response.content;
    } else if (response?.choices?.[0]?.message?.content) {
      content = response.choices[0].message.content;
    } else if (typeof response === 'object') {
      content = JSON.stringify(response, null, 2);
    } else {
      content = String(response);
    }

    if (Array.isArray(content)) {
      content = content
        .map((c) => (typeof c === 'object' ? c.text || JSON.stringify(c) : c))
        .join('');
    }

    currentChat.messages.push({ role: 'assistant', content: content, timestamp: Date.now() });
  } catch (err) {
    console.error('❌ handleSendClick hatası:', err);
    console.error('Error stack:', err.stack);
    logError(err, 'handleSendClick');
    currentChat.messages.push({
      role: 'assistant',
      content: `⚠️ Hata: ${err.message || 'Bağlantı koptu.'}\n\nDetay: ${JSON.stringify(err, null, 2)}`,
    });
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

  const chat = chats.find((c) => c.id === chatId);
  const container = document.getElementById('messages-list');
  container.innerHTML = '';
  document.getElementById('empty-state').style.display = chat.messages.length ? 'none' : 'flex';
  document.getElementById('chat-header-title').innerText = chat.title || t('newChat');

  // Tüm modelleri al (regenerate dropdown için)
  const allModels = getAllModels();

  // Mesajları render et
  chat.messages.forEach((msg, index) => {
    const div = document.createElement('div');
    div.setAttribute('data-message-index', index);
    const isUser = msg.role === 'user';
    div.className = `flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`;

    const avatarBg = isUser ? 'bg-[#3b52d4]' : 'bg-[#2b2e40] border border-[#2f3345]';
    const icon = isUser ? 'user' : 'bot';

    let contentHtml = marked.parse(msg.content);

    // Kodlama modu için Deploy butonu ekle (3 dosya desteği)
    if (!isUser && (chat.mode === 'coding' || msg.content.includes('```html'))) {
      const htmlMatch = msg.content.match(/```html([\s\S]*?)```/);
      const cssMatch = msg.content.match(/```css([\s\S]*?)```/);
      const jsMatch = msg.content.match(/```(?:javascript|js)([\s\S]*?)```/);

      if (htmlMatch) {
        const htmlCode = htmlMatch[1].trim();
        const cssCode = cssMatch ? cssMatch[1].trim() : '';
        const jsCode = jsMatch ? jsMatch[1].trim() : '';

        // Kod verilerini data attribute olarak sakla
        const deployData = JSON.stringify({
          html: htmlCode,
          css: cssCode,
          js: jsCode,
        }).replace(/"/g, '&quot;');

        contentHtml += `<div class="mt-3 flex flex-wrap gap-2">
                    <button onclick="deployMultipleFiles(this)" data-deploy="${deployData}" class="text-xs bg-[#3b52d4] hover:bg-[#2e42b5] text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <i data-lucide="rocket" class="w-3 h-3"></i> ${t('deploy')}
                    </button>
                </div>`;
      }
    }

    // DeepSearch modu için kaynaklar ekle
    if (!isUser && chat.mode === 'deepsearch') {
      contentHtml += `
            <div class="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                <div class="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1"><i data-lucide="book" class="w-3 h-3"></i> ${t('sources')}</div>
                <span class="text-[10px] bg-[#151722] text-blue-400 px-2 py-1 rounded border border-[#2f3345] hover:border-blue-500 cursor-pointer transition-colors">wikipedia.org</span>
                <span class="text-[10px] bg-[#151722] text-blue-400 px-2 py-1 rounded border border-[#2f3345] hover:border-blue-500 cursor-pointer transition-colors">researchgate.net</span>
                <span class="text-[10px] bg-[#151722] text-blue-400 px-2 py-1 rounded border border-[#2f3345] hover:border-blue-500 cursor-pointer transition-colors">github.com</span>
            </div>`;
    }

    // AI cevapları için "Başka modelle dene" butonu ekle
    if (!isUser && allModels.length > 0) {
      const modelOptions = allModels
        .map((m) => `<option value="${m.id}">${m.name}</option>`)
        .join('');

      contentHtml += `
            <div class="regenerate-with-model mt-3 pt-3 border-t border-white/10">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs text-gray-400">🔄 ${t('tryAnotherModel') || 'Başka modelle dene:'}</span>
                    <select class="regenerate-model-select bg-[#151722] border border-[#2f3345] text-xs text-gray-200 rounded px-2 py-1" onchange="this.nextElementSibling.dataset.model = this.value">
                        ${modelOptions}
                    </select>
                    <button class="regenerate-btn text-xs bg-[#3b52d4] hover:bg-[#2e42b5] text-white px-3 py-1 rounded flex items-center gap-1" onclick="regenerateWithModel(${index}, this.previousElementSibling.value)" data-model="${allModels[0]?.id || ''}">
                        <i data-lucide="refresh-cw" class="w-3 h-3"></i>
                        ${t('regenerate') || 'Yeniden Oluştur'}
                    </button>
                </div>
            </div>`;
    }

    div.innerHTML = `
            <div class="w-8 h-8 rounded-full ${avatarBg} flex-shrink-0 flex items-center justify-center text-white text-xs shadow-lg"><i data-lucide="${icon}" class="w-4 h-4"></i></div>
            <div class="max-w-[85%] min-w-0">
                <div class="p-4 rounded-2xl ${isUser ? 'bg-[#3b52d4] text-white' : 'bg-[#1e2130] text-gray-100 border border-[#2f3345]'} shadow-md markdown-body">
                    ${contentHtml}
                </div>
                <div class="text-[10px] text-gray-600 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'} opacity-60">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}${msg.model ? ` • ${msg.model.split('/').pop()}` : ''}</div>
            </div>
        `;
    container.appendChild(div);
  });

  // İşleme göstergesi (en altta)
  if (chat.isProcessing) {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.id = 'thinking-bubble';
    thinkingDiv.className = 'flex gap-4';
    thinkingDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#2b2e40] flex-shrink-0 flex items-center justify-center text-gray-300 text-xs border border-[#2f3345] animate-pulse"><i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i></div>
            <div class="max-w-[85%] min-w-0">
                <div class="p-0 rounded-2xl">
                    <div class="thinking-process rounded-lg border border-[#2f3345] bg-[#151722] p-3 shadow-inner" id="thinking-steps-container">
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

  // OPTİMİZASYON: RequestAnimationFrame ile scrolling
  requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'auto',
    });
  });
}

function updateThinkingUI(chatId) {
  const container = document.getElementById('thinking-steps-container');
  if (!container) return;

  const chat = chats.find((c) => c.id === chatId);
  if (!chat || !chat.processLog) return;

  container.innerHTML = chat.processLog
    .map((log, index) => {
      const isActive = index === chat.processLog.length - 1;
      const icon = log.done ? 'check-circle' : isActive ? 'loader' : 'circle';
      const color = log.done
        ? 'text-green-500'
        : isActive
          ? 'text-blue-400 animate-pulse'
          : 'text-gray-600';
      const spin = isActive && !log.done ? 'animate-spin' : '';

      return `
            <div class="thinking-step ${isActive ? 'active' : ''}">
                <i data-lucide="${icon}" class="${color} ${spin} w-3 h-3"></i>
                <span>${log.text}</span>
            </div>
        `;
    })
    .join('');

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
    title: t('newChat'),
    messages: [],
    mode: initialMode,
    timestamp: Date.now(),
    isProcessing: false,
    processLog: [],
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
  const chat = chats.find((c) => c.id === id);
  if (!chat) return;

  setMode(chat.mode || 'general', false);
  updateChatUI(id);
  renderHistoryList();
}

function renderHistoryList() {
  const list = document.getElementById('history-list');
  list.innerHTML = '';

  chats.forEach((chat) => {
    const isActive = chat.id === activeChatId;
    const chatItem = document.createElement('div');
    chatItem.className = 'relative group mb-1';

    const btn = document.createElement('button');
    btn.onclick = () => loadChatToUI(chat.id);

    const processingBadge = chat.isProcessing
      ? `<div class="absolute right-10 top-3 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div><div class="absolute right-10 top-3 w-2 h-2 bg-blue-500 rounded-full"></div>`
      : '';

    btn.className = `w-full text-left p-3 rounded-xl text-sm flex items-center gap-3 relative transition-all border border-transparent
            ${isActive ? 'bg-[#1e2130] border-[#2f3345] text-white shadow-md' : 'text-gray-400 hover:bg-[#151722] hover:text-gray-200'}`;

    btn.innerHTML = `
            <i data-lucide="message-circle" class="w-4 h-4 opacity-60 flex-shrink-0"></i>
            <div class="flex-1 min-w-0">
                <div class="truncate font-medium text-[13px]">${chat.title}</div>
                <div class="text-[10px] opacity-50 truncate">${chat.isProcessing ? chat.tempStatus || t('processing') : new Date(chat.timestamp).toLocaleDateString()}</div>
            </div>
            ${processingBadge}
        `;

    // Sohbet düzenleme menüsü (hover'da görünür)
    const menuContainer = document.createElement('div');
    menuContainer.className =
      'absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-[#1e2130] rounded-lg p-1 border border-[#2f3345] z-10';
    menuContainer.innerHTML = `
            <button onclick="event.stopPropagation(); renameChat('${chat.id}')" class="p-1.5 hover:bg-[#3b52d4]/20 rounded text-gray-400 hover:text-blue-400 transition-colors" title="${t('renameChat')}">
                <i data-lucide="pencil" class="w-3.5 h-3.5"></i>
            </button>
            <button onclick="event.stopPropagation(); deleteChat('${chat.id}')" class="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-colors" title="${t('deleteChat')}">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
        `;

    chatItem.appendChild(btn);
    chatItem.appendChild(menuContainer);
    list.appendChild(chatItem);
  });

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Sohbeti yeniden adlandır
function renameChat(chatId) {
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return;

  const newName = prompt(t('enterChatName'), chat.title);
  if (newName && newName.trim()) {
    chat.title = newName.trim();
    saveChats();
    renderHistoryList();
    if (chatId === activeChatId) {
      document.getElementById('chat-header-title').innerText = chat.title;
    }
  }
}

// Sohbeti sil
function deleteChat(chatId) {
  if (!confirm(t('confirmDeleteChat'))) return;

  const index = chats.findIndex((c) => c.id === chatId);
  if (index === -1) return;

  chats.splice(index, 1);
  saveChats();

  // Silinen sohbet aktifse, başka birine geç
  if (chatId === activeChatId) {
    if (chats.length > 0) {
      loadChatToUI(chats[0].id);
    } else {
      startNewChat();
    }
  } else {
    renderHistoryList();
  }
}

function setMode(mode, updateChat = true) {
  document.querySelectorAll('.mode-btn').forEach((b) => {
    b.classList.remove('active', 'border-[#3b52d4]', 'bg-[#25283a]');
    if (b.id === `btn-mode-${mode}`) {
      b.classList.add('active', 'border-[#3b52d4]', 'bg-[#25283a]');
    }
  });

  if (updateChat && activeChatId) {
    const chat = chats.find((c) => c.id === activeChatId);
    if (chat) {
      chat.mode = mode;
      saveChats();
    }
  }
}

// --- YARDIMCI FONKSİYONLAR ---
// --- GERÇEK AUTH FONKSİYONU ---
async function handleAuth() {
  try {
    // Puter ile GERÇEK giriş yapma penceresini açar
    const user = await puter.auth.signIn();
    
    // Giriş başarılıysa çalışır
    isUserSignedIn = true;
    document.getElementById('username').innerText = user.username;
    document.getElementById('user-avatar').innerText = (user.username || 'U').charAt(0).toUpperCase();

    const authBtnParent = document.querySelector('#auth-btn-text')?.parentElement;
    if (authBtnParent) {
      authBtnParent.style.display = 'none';
    }

    await loadChats();

    if (chats.length > 0) {
      loadChatToUI(chats[0].id);
    }
    
    console.log('✅ Puter girişi başarılı:', user.username);
    
  } catch (err) {
    console.error('Giriş iptal edildi veya hata oluştu:', err);
  }
}

async function saveChats() {
  await Storage.save(DB_KEYS.CHATS, chats);
}

async function loadChats() {
  const data = await Storage.load(DB_KEYS.CHATS);
  if (data) {
    chats = data;
    renderHistoryList();
  }
}

// --- DEPLOY FONKSİYONLARI ---
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

    console.log('Hosting Response:', site); // Debug

    // URL'i oluştur
    const finalSubdomain = site.subdomain || subdomain;
    const url = `https://${finalSubdomain}.puter.site`;

    btn.className =
      'text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors';
    btn.innerHTML = `<i data-lucide="external-link" class="w-3 h-3"></i> ${finalSubdomain}`;

    btn.onclick = (e) => {
      e.preventDefault();
      window.open(url, '_blank');
    };
  } catch (err) {
    logError(err, 'deployCode');
    btn.innerHTML = `⚠️ Hata`;
    console.error('Deploy Hatası Detayı:', err);

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
  if (!el) return;
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

// --- ÇOK DOSYALI DEPLOY FONKSİYONU ---
async function deployMultipleFiles(btn) {
  if (!isUserSignedIn) {
    handleAuth();
    return;
  }

  const deployData = JSON.parse(btn.getAttribute('data-deploy').replace(/&quot;/g, '"'));
  const originalHtml = btn.innerHTML;
  const originalClass = btn.className;

  btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> ${t('preparing')}`;
  btn.disabled = true;

  try {
    const randomId = Math.random().toString(36).substring(7);
    const subdomain = `pro-${randomId}`;
    const dir = `www_${randomId}`;

    // 1. Klasör oluştur
    await puter.fs.mkdir(dir);

    // 2. HTML dosyasını hazırla (CSS ve JS referanslarını ekle)
    let htmlContent = deployData.html;

    // CSS dosyası varsa referans ekle (yoksa)
    if (deployData.css && !htmlContent.includes('styles.css')) {
      htmlContent = htmlContent.replace(
        '</head>',
        '    <link rel="stylesheet" href="styles.css">\n</head>'
      );
    }

    // JS dosyası varsa referans ekle (yoksa)
    if (deployData.js && !htmlContent.includes('script.js')) {
      htmlContent = htmlContent.replace(
        '</body>',
        '    <script src="script.js"></script>\n</body>'
      );
    }

    // 3. Dosyaları yaz
    await puter.fs.write(`${dir}/index.html`, htmlContent);

    if (deployData.css) {
      await puter.fs.write(`${dir}/styles.css`, deployData.css);
    }

    if (deployData.js) {
      await puter.fs.write(`${dir}/script.js`, deployData.js);
    }

    // 4. Hosting oluştur
    btn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> ${t('deploying')}`;
    const site = await puter.hosting.create(subdomain, dir);

    console.log('Hosting Response:', site);

    const finalSubdomain = site.subdomain || subdomain;
    const url = `https://${finalSubdomain}.puter.site`;

    btn.className =
      'text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors';
    btn.innerHTML = `<i data-lucide="external-link" class="w-3 h-3"></i> ${finalSubdomain}`;

    btn.onclick = (e) => {
      e.preventDefault();
      window.open(url, '_blank');
    };
  } catch (err) {
    logError(err, 'deployMultipleFiles');
    btn.innerHTML = `⚠️ Hata`;
    console.error('Deploy Hatası Detayı:', err);

    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.className = originalClass;
      btn.disabled = false;
    }, 3000);
  }

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// --- AYARLARI KAYDET/YÜKLE ---
function saveSettings() {
  const settings = {
    language: currentLanguage,
    style: currentStyle,
    customStylePrompt: customStylePrompt,
  };
  localStorage.setItem('ai_workspace_settings', JSON.stringify(settings));
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('ai_workspace_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      currentLanguage = settings.language || 'tr';
      currentStyle = settings.style || 'normal';
      customStylePrompt = settings.customStylePrompt || '';
    }
  } catch (e) {
    logError(e, 'loadSettings');
  }
}

// --- DİL DEĞİŞTİRME ---
function setLanguage(lang) {
  if (LANGUAGES[lang]) {
    currentLanguage = lang;
    saveSettings();
    updateUILanguage();
  }
}

function updateUILanguage() {
  // Dil seçiciyi güncelle
  const langSelector = document.getElementById('language-selector');
  if (langSelector) {
    langSelector.value = currentLanguage;
  }

  // Stil seçiciyi güncelle
  const styleSelector = document.getElementById('style-selector');
  if (styleSelector) {
    styleSelector.value = currentStyle;
  }

  // Özel stil textarea'sını güncelle
  const customStyleTextarea = document.getElementById('custom-style-prompt');
  if (customStyleTextarea) {
    customStyleTextarea.value = customStylePrompt;
    customStyleTextarea.style.display = currentStyle === 'custom' ? 'block' : 'none';
  }

  // Arayüz metinlerini güncelle (Ana elementler)
  const elements = {
    'new-chat-btn-text': t('newChat'),
    'auth-btn-text': t('login'),
    'control-panel-title': t('controlPanel'),
    'control-panel-desc': t('modeSettings'),
    'work-mode-label': t('workMode'),
    'ai-engine-label': t('aiEngine'),
    'prompt-input': { placeholder: t('askSomething') },
    'conversation-style-label': t('conversationStyle'),
    'language-label': t('language'),
  };

  Object.entries(elements).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([attr, val]) => {
          el.setAttribute(attr, val);
        });
      } else {
        el.innerText = value;
      }
    }
  });

  // Mod butonlarını güncelle
  updateModeButtonLabels();
}

function updateModeButtonLabels() {
  const modeLabels = {
    general: { title: t('generalChat'), desc: t('generalChatDesc') },
    deepsearch: { title: t('deepSearch'), desc: t('deepSearchDesc') },
    coding: { title: t('codingHost'), desc: t('codingHostDesc') },
    teacher: { title: t('learningExpert'), desc: t('learningExpertDesc') },
  };

  Object.entries(modeLabels).forEach(([mode, labels]) => {
    const titleEl = document.getElementById(`mode-${mode}-title`);
    const descEl = document.getElementById(`mode-${mode}-desc`);
    if (titleEl) titleEl.innerText = labels.title;
    if (descEl) descEl.innerText = labels.desc;
  });
}

// --- KONUŞMA STİLİ DEĞİŞTİRME ---
function setStyle(style) {
  currentStyle = style;
  saveSettings();

  const customStyleTextarea = document.getElementById('custom-style-prompt');
  if (customStyleTextarea) {
    customStyleTextarea.style.display = style === 'custom' ? 'block' : 'none';
  }
}

function setCustomStylePrompt(prompt) {
  customStylePrompt = prompt;
  saveSettings();
}

// --- ÖZEL MODEL YÖNETİMİ ---
function loadCustomModels() {
  try {
    const saved = localStorage.getItem('ai_workspace_custom_models');
    if (saved) {
      customModels = JSON.parse(saved);
    }
  } catch (e) {
    logError(e, 'loadCustomModels');
  } finally {
    // Her zaman renderCustomModels çağır (boş olsa bile "Model Ekle" seçeneği için)
    renderCustomModels();
  }
}

function saveCustomModels() {
  localStorage.setItem('ai_workspace_custom_models', JSON.stringify(customModels));
}

function renderCustomModels() {
  const selector = document.getElementById('model-selector');
  if (!selector) return;

  // Mevcut özel model grubunu kaldır
  const existingGroup = document.getElementById('custom-models-group');
  if (existingGroup) {
    existingGroup.remove();
  }

  // "Model Ekle" seçeneğini kaldır
  const existingAddOption = document.getElementById('add-custom-model-option');
  if (existingAddOption) {
    existingAddOption.remove();
  }

  // Özel modeller varsa optgroup oluştur
  if (customModels.length > 0) {
    const optgroup = document.createElement('optgroup');
    optgroup.id = 'custom-models-group';
    optgroup.label = t('customModels');

    customModels.forEach((model, index) => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      option.dataset.customIndex = index;
      optgroup.appendChild(option);
    });

    selector.appendChild(optgroup);
  }

  // "Model Ekle" seçeneğini en sona ekle
  const addOption = document.createElement('option');
  addOption.id = 'add-custom-model-option';
  addOption.value = '__add_custom__';
  addOption.textContent = t('addCustomModel');
  selector.appendChild(addOption);
}

function showAddModelModal() {
  const modal = document.getElementById('add-model-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

function hideAddModelModal() {
  const modal = document.getElementById('add-model-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('new-model-id').value = '';
    document.getElementById('new-model-name').value = '';
  }
}

function addCustomModel() {
  const idInput = document.getElementById('new-model-id');
  const nameInput = document.getElementById('new-model-name');

  const id = idInput.value.trim();
  const name = nameInput.value.trim();

  if (!id || !name) {
    alert(t('modelIdRequired'));
    return;
  }

  customModels.push({ id, name });
  saveCustomModels();
  renderCustomModels();
  hideAddModelModal();

  // Yeni modeli seç
  document.getElementById('model-selector').value = id;
}

function deleteCustomModel(index) {
  if (confirm(t('confirmDeleteModel'))) {
    customModels.splice(index, 1);
    saveCustomModels();
    renderCustomModels();
  }
}

// --- DOSYA YÜKLEME (GÖRSEL/VİDEO) ---
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/heic',
    'video/mp4',
    'video/webm',
  ];

  if (!allowedTypes.includes(file.type)) {
    alert(t('unsupportedFileFormat'));
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result.split(',')[1];
    uploadedFile = {
      name: file.name,
      type: file.type,
      base64: base64,
    };
    showFilePreview(file, e.target.result);
  };
  reader.readAsDataURL(file);
}

function showFilePreview(file, dataUrl) {
  const previewContainer = document.getElementById('file-preview-container');
  if (!previewContainer) return;

  previewContainer.classList.remove('hidden');

  const isVideo = file.type.startsWith('video/');
  const previewHtml = isVideo
    ? `<video src="${dataUrl}" class="w-16 h-16 object-cover rounded-lg" muted></video>`
    : `<img src="${dataUrl}" alt="Preview" class="w-16 h-16 object-cover rounded-lg">`;

  previewContainer.innerHTML = `
        <div class="flex items-center gap-2 bg-[#1e2130] p-2 rounded-lg border border-[#2f3345]">
            ${previewHtml}
            <div class="flex-1 min-w-0">
                <div class="text-xs text-white truncate">${file.name}</div>
                <div class="text-[10px] text-gray-500">${(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <button onclick="clearUploadedFile()" class="p-1 hover:bg-red-500/20 rounded text-red-400">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

function clearUploadedFile() {
  uploadedFile = null;
  const previewContainer = document.getElementById('file-preview-container');
  if (previewContainer) {
    previewContainer.classList.add('hidden');
    previewContainer.innerHTML = '';
  }
  const fileInput = document.getElementById('file-upload-input');
  if (fileInput) {
    fileInput.value = '';
  }
}

// --- RESİM OLUŞTURMA ---
async function generateImage() {
  const promptInput = document.getElementById('image-prompt');
  const modelSelect = document.getElementById('image-model-selector');
  const generateBtn = document.getElementById('generate-image-btn');
  const gallery = document.getElementById('image-gallery');

  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert(t('enterPrompt'));
    return;
  }

  const model = modelSelect.value;
  const originalBtnText = generateBtn.innerHTML;

  generateBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> ${t('generating')}`;
  generateBtn.disabled = true;

  try {
    // Puter API kontrolü
    if (typeof puter === 'undefined' || !puter.ai) {
      throw new Error(t('puterApiUnavailable'));
    }

    let imageUrl = '';

    // puter.ai.txt2img API'sini kullan
    if (puter.ai.txt2img) {
      const response = await puter.ai.txt2img(prompt, { model: model });

      // Yanıt türüne göre işle
      if (response instanceof Blob) {
        // Blob yanıtı - URL oluştur
        imageUrl = URL.createObjectURL(response);
      } else if (typeof response === 'string') {
        // String yanıt (URL veya base64)
        if (response.startsWith('data:') || response.startsWith('http')) {
          imageUrl = response;
        } else {
          // Base64 data
          imageUrl = `data:image/png;base64,${response}`;
        }
      } else if (response?.src) {
        // HTMLImageElement - src özelliğini al
        imageUrl = response.src;
      } else if (response?.url) {
        imageUrl = response.url;
      } else if (response?.image) {
        imageUrl = response.image;
      } else if (response?.data) {
        imageUrl = `data:image/png;base64,${response.data}`;
      }
    } else {
      throw new Error('txt2img API not supported.');
    }

    if (imageUrl) {
      // Resmi galeriye kaydet
      await saveImageToGallery(imageUrl, prompt, model);

      const imageLoadErrorMsg = t('imageLoadError');
      const imageCard = document.createElement('div');
      imageCard.className =
        'relative group rounded-xl overflow-hidden border border-[#2f3345] bg-[#1e2130]';
      imageCard.innerHTML = `
                <img src="${imageUrl}" alt="${prompt}" class="w-full aspect-square object-cover" onerror="this.parentElement.innerHTML='<div class=\\'p-4 text-red-400 text-center\\'>${imageLoadErrorMsg}</div>'">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href="${imageUrl}" download="generated-${Date.now()}.png" class="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <i data-lucide="download" class="w-5 h-5 text-white"></i>
                    </a>
                </div>
                <div class="p-2 text-xs text-gray-400 truncate">${prompt}</div>
            `;
      gallery.prepend(imageCard);

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }

      promptInput.value = '';
    } else {
      throw new Error(t('imageGenError'));
    }
  } catch (err) {
    logError(err, 'generateImage');
    alert(`${t('imageError')} ${err.message}`);
  } finally {
    generateBtn.innerHTML = originalBtnText;
    generateBtn.disabled = false;
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }
}

// --- RESİM GALERİSİ DATABASE KAYDI ---
async function saveImageToGallery(imageUrl, prompt, model) {
  const gallery = (await Storage.load(DB_KEYS.IMAGES)) || [];

  gallery.unshift({
    id: Date.now().toString(),
    url: imageUrl,
    prompt: prompt,
    model: model,
    timestamp: Date.now(),
  });

  // Max 50 resim tut
  if (gallery.length > 50) gallery.pop();

  await Storage.save(DB_KEYS.IMAGES, gallery);
}

async function loadImageGallery() {
  const gallery = (await Storage.load(DB_KEYS.IMAGES)) || [];
  const container = document.getElementById('image-gallery');
  if (!container) return;

  if (gallery.length === 0) {
    container.innerHTML = `<div class="col-span-full text-center text-gray-500 py-8">${t('noImages') || 'Henüz resim oluşturulmadı'}</div>`;
    return;
  }

  container.innerHTML = gallery
    .map(
      (img) => `
    <div class="relative group rounded-xl overflow-hidden border border-[#2f3345]">
      <img src="${img.url}" alt="${img.prompt}" class="w-full aspect-square object-cover">
      <div class="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
        <div class="text-xs text-white truncate">${img.prompt}</div>
        <div class="text-[10px] text-gray-400">${img.model}</div>
      </div>
      <button onclick="deleteImage('${img.id}')" class="absolute top-2 right-2 p-1 bg-red-500/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        <i data-lucide="trash-2" class="w-3 h-3 text-white"></i>
      </button>
    </div>
  `
    )
    .join('');

  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

async function deleteImage(imageId) {
  if (!confirm(t('confirmDeleteImage') || 'Bu resmi silmek istediğinize emin misiniz?')) return;

  const gallery = (await Storage.load(DB_KEYS.IMAGES)) || [];
  const newGallery = gallery.filter((img) => img.id !== imageId);
  await Storage.save(DB_KEYS.IMAGES, newGallery);
  await loadImageGallery();
}

// --- MODEL KARŞILAŞTIRMA FONKSİYONLARI ---
function toggleCompareMode() {
  compareMode = !compareMode;

  const chatTabContent = document.getElementById('chat-tab-content');
  const comparePanel = document.getElementById('compare-panel');
  const compareModeBtn = document.getElementById('compare-mode-btn');

  if (chatTabContent) chatTabContent.classList.toggle('hidden', compareMode);
  if (comparePanel) comparePanel.classList.toggle('hidden', !compareMode);
  if (compareModeBtn) compareModeBtn.classList.toggle('text-blue-400', compareMode);

  // Karşılaştırma paneli açıldığında model seçicileri doldur
  if (compareMode) {
    populateCompareModelSelectors();
  }
}

function populateCompareModelSelectors() {
  const modelSelector = document.getElementById('model-selector');
  const compareModel1 = document.getElementById('compare-model-1');
  const compareModel2 = document.getElementById('compare-model-2');

  if (!modelSelector || !compareModel1 || !compareModel2) return;

  // Ana model seçiciden seçenekleri kopyala
  const options = modelSelector.innerHTML;
  compareModel1.innerHTML = options;
  compareModel2.innerHTML = options;

  // "Model Ekle" seçeneğini kaldır
  const addOption1 = compareModel1.querySelector('#add-custom-model-option');
  const addOption2 = compareModel2.querySelector('#add-custom-model-option');
  if (addOption1) addOption1.remove();
  if (addOption2) addOption2.remove();

  // Varsayılan olarak farklı modeller seç
  if (compareModel1.options.length > 0) {
    compareModel1.selectedIndex = 0;
  }
  if (compareModel2.options.length > 1) {
    compareModel2.selectedIndex = 1;
  }
}

async function runComparison() {
  const input = document.getElementById('compare-input')?.value.trim();
  if (!input) {
    alert(t('enterPrompt') || 'Lütfen bir soru girin.');
    return;
  }

  const model1 = document.getElementById('compare-model-1')?.value;
  const model2 = document.getElementById('compare-model-2')?.value;

  const result1 = document.getElementById('compare-result-1');
  const result2 = document.getElementById('compare-result-2');

  if (!result1 || !result2) return;

  // Loading göster
  result1.innerHTML = `<div class="animate-pulse text-gray-400">${t('loading') || 'Yükleniyor...'}</div>`;
  result2.innerHTML = `<div class="animate-pulse text-gray-400">${t('loading') || 'Yükleniyor...'}</div>`;

  try {
    // Puter SDK kontrolü
    if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat) {
      throw new Error(t('puterApiUnavailable'));
    }

    // Paralel olarak iki modelden cevap al
    const [response1, response2] = await Promise.all([
      puter.ai.chat(input, { model: model1 }),
      puter.ai.chat(input, { model: model2 }),
    ]);

    // Sonuçları parse et
    const content1 = parseAIResponse(response1);
    const content2 = parseAIResponse(response2);

    // Sonuçları göster
    result1.innerHTML = `<div class="markdown-body">${marked.parse(content1)}</div>`;
    result2.innerHTML = `<div class="markdown-body">${marked.parse(content2)}</div>`;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (err) {
    logError(err, 'runComparison');
    result1.innerHTML = `<div class="text-red-400">${t('error') || 'Hata'}: ${err.message}</div>`;
    result2.innerHTML = `<div class="text-red-400">${t('error') || 'Hata'}: ${err.message}</div>`;
  }
}

// --- FARKLI MODELLE YENİDEN OLUŞTUR ---
async function regenerateWithModel(messageIndex, newModelId) {
  const chat = chats.find((c) => c.id === activeChatId);
  if (!chat) return;

  // Kullanıcının orijinal mesajını bul
  const userMessage = chat.messages[messageIndex - 1];
  if (!userMessage || userMessage.role !== 'user') return;

  // Yükleniyor durumunu göster
  const regenerateBtn = document.querySelector(
    `[data-message-index="${messageIndex}"] .regenerate-btn`
  );
  if (regenerateBtn) {
    regenerateBtn.innerHTML = `<i data-lucide="loader-2" class="w-3 h-3 animate-spin"></i> ${t('regenerating') || 'Yeniden oluşturuluyor...'}`;
    regenerateBtn.disabled = true;
  }

  try {
    // Puter SDK kontrolü
    if (typeof puter === 'undefined' || !puter.ai || !puter.ai.chat) {
      throw new Error(t('puterApiUnavailable'));
    }

    // Yeni modelle cevap al
    const response = await puter.ai.chat(userMessage.content, { model: newModelId });

    // Sonucu parse et
    const content = parseAIResponse(response);

    // Mevcut AI cevabını güncelle
    chat.messages[messageIndex].content = content;
    chat.messages[messageIndex].model = newModelId;
    chat.messages[messageIndex].timestamp = Date.now();

    await saveChats();
    updateChatUI(activeChatId);
  } catch (err) {
    logError(err, 'regenerateWithModel');
    alert(`${t('error') || 'Hata'}: ${err.message}`);
  }
}

// --- API YANIT PARSE ---
function parseAIResponse(response) {
  let content = '';
  if (typeof response === 'string') {
    content = response;
  } else if (response?.message?.content) {
    content = response.message.content;
  } else if (response?.text) {
    content = response.text;
  } else if (response?.content) {
    content = response.content;
  } else if (response?.choices?.[0]?.message?.content) {
    content = response.choices[0].message.content;
  } else if (typeof response === 'object') {
    content = JSON.stringify(response, null, 2);
  } else {
    content = String(response);
  }

  // Array kontrolü
  if (Array.isArray(content)) {
    content = content
      .map((c) => (typeof c === 'object' ? c.text || JSON.stringify(c) : c))
      .join('');
  }

  return content;
}

// --- TÜM MODELLERİ LİSTELE (Regenerate dropdown için) ---
function getAllModels() {
  const modelSelector = document.getElementById('model-selector');
  if (!modelSelector) return [];

  const models = [];
  const options = modelSelector.querySelectorAll('option');
  options.forEach((option) => {
    if (option.value && option.value !== '__add_custom__') {
      models.push({
        id: option.value,
        name: option.textContent,
      });
    }
  });

  return models;
}

// --- SEKME DEĞİŞTİRME ---
function switchTab(tab) {
  activeTab = tab;

  const chatTab = document.getElementById('chat-tab-content');
  const imageTab = document.getElementById('image-tab-content');
  const comparePanel = document.getElementById('compare-panel');
  const chatTabBtn = document.getElementById('chat-tab-btn');
  const imageTabBtn = document.getElementById('image-tab-btn');

  // Karşılaştırma modunu kapat
  if (compareMode) {
    compareMode = false;
    const compareModeBtn = document.getElementById('compare-mode-btn');
    if (compareModeBtn) compareModeBtn.classList.remove('text-blue-400');
  }

  if (tab === 'chat') {
    chatTab?.classList.remove('hidden');
    imageTab?.classList.add('hidden');
    comparePanel?.classList.add('hidden');
    chatTabBtn?.classList.add('active', 'border-b-2', 'border-blue-500');
    chatTabBtn?.classList.remove('text-gray-500');
    imageTabBtn?.classList.remove('active', 'border-b-2', 'border-blue-500');
    imageTabBtn?.classList.add('text-gray-500');
  } else {
    chatTab?.classList.add('hidden');
    imageTab?.classList.remove('hidden');
    comparePanel?.classList.add('hidden');
    imageTabBtn?.classList.add('active', 'border-b-2', 'border-blue-500');
    imageTabBtn?.classList.remove('text-gray-500');
    chatTabBtn?.classList.remove('active', 'border-b-2', 'border-blue-500');
    chatTabBtn?.classList.add('text-gray-500');
    // Resim galerisini yükle
    loadImageGallery();
  }
}

// --- EVENT LISTENERS (Event Delegation ile) ---
function setupEventListeners() {
  const promptInput = document.getElementById('prompt-input');

  if (promptInput) {
    // Textarea input eventi (debounce ile)
    promptInput.addEventListener('input', debouncedResizeTextarea);

    // Enter tuşu ile gönderme
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendClick();
      }
    });
  }

  // OPTİMİZASYON: Event delegation ile mod butonları
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

  // Dil seçici event listener
  const langSelector = document.getElementById('language-selector');
  if (langSelector) {
    langSelector.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // Stil seçici event listener
  const styleSelector = document.getElementById('style-selector');
  if (styleSelector) {
    styleSelector.addEventListener('change', (e) => {
      setStyle(e.target.value);
    });
  }

  // Özel stil prompt textarea
  const customStyleTextarea = document.getElementById('custom-style-prompt');
  if (customStyleTextarea) {
    customStyleTextarea.addEventListener('input', (e) => {
      setCustomStylePrompt(e.target.value);
    });
  }

  // Model seçici - özel model ekleme kontrolü
  const modelSelector = document.getElementById('model-selector');
  if (modelSelector) {
    modelSelector.addEventListener('change', (e) => {
      if (e.target.value === '__add_custom__') {
        showAddModelModal();
        // Önceki seçimi geri al
        e.target.value = modelSelector.options[0].value;
      }
    });
  }

  // Dosya yükleme input
  const fileInput = document.getElementById('file-upload-input');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileUpload);
  }

  // Resim oluşturma butonu
  const generateBtn = document.getElementById('generate-image-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateImage);
  }

  // Resim prompt'u için Enter tuşu
  const imagePrompt = document.getElementById('image-prompt');
  if (imagePrompt) {
    imagePrompt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        generateImage();
      }
    });
  }
}

// DOM hazır olduğunda uygulamayı başlat
document.addEventListener('DOMContentLoaded', initApp);
