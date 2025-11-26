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

// --- DİL DESTEĞİ (20 DİL) ---
const LANGUAGES = {
  tr: { name: 'Türkçe', flag: '🇹🇷', prompt: 'Türkçe' },
  en: { name: 'English', flag: '🇺🇸', prompt: 'English' },
  zh: { name: '中文', flag: '🇨🇳', prompt: 'Chinese (Mandarin)' },
  es: { name: 'Español', flag: '🇪🇸', prompt: 'Spanish' },
  ar: { name: 'العربية', flag: '🇸🇦', prompt: 'Arabic' },
  hi: { name: 'हिन्दी', flag: '🇮🇳', prompt: 'Hindi' },
  pt: { name: 'Português', flag: '🇧🇷', prompt: 'Portuguese' },
  ru: { name: 'Русский', flag: '🇷🇺', prompt: 'Russian' },
  ja: { name: '日本語', flag: '🇯🇵', prompt: 'Japanese' },
  de: { name: 'Deutsch', flag: '🇩🇪', prompt: 'German' },
  fr: { name: 'Français', flag: '🇫🇷', prompt: 'French' },
  ko: { name: '한국어', flag: '🇰🇷', prompt: 'Korean' },
  it: { name: 'Italiano', flag: '🇮🇹', prompt: 'Italian' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳', prompt: 'Vietnamese' },
  fa: { name: 'فارسی', flag: '🇮🇷', prompt: 'Persian' },
  pl: { name: 'Polski', flag: '🇵🇱', prompt: 'Polish' },
  uk: { name: 'Українська', flag: '🇺🇦', prompt: 'Ukrainian' },
  ro: { name: 'Română', flag: '🇷🇴', prompt: 'Romanian' },
  nl: { name: 'Nederlands', flag: '🇳🇱', prompt: 'Dutch' },
  th: { name: 'ไทย', flag: '🇹🇭', prompt: 'Thai' },
};

// Arayüz çevirileri
const UI_TRANSLATIONS = {
  tr: {
    newChat: 'Yeni Sohbet',
    login: 'Giriş Yap',
    guest: 'Misafir',
    processing: 'İşleniyor...',
    controlPanel: 'Kontrol Paneli',
    modeSettings: 'Mod ve Motor Ayarları',
    workMode: 'Çalışma Modu',
    aiEngine: 'Yapay Zeka Motoru',
    generalChat: 'Genel Sohbet',
    generalChatDesc: 'Günlük asistan, hızlı cevaplar.',
    deepSearch: 'Deep Search',
    deepSearchDesc: 'Akademik araştırma, kaynaklı.',
    codingHost: 'Kodlama & Host',
    codingHostDesc: 'Tek tıkla deploy, temiz kod.',
    learningExpert: 'Öğrenme Uzmanı',
    learningExpertDesc: 'Sokratik metodla öğretim.',
    askSomething: 'Bir şeyler sor...',
    liveThinking: '⚡ Canlı Düşünme',
    cloudMemory: '🔒 Bulut Hafıza',
    autoDeploy: '🚀 Auto-Deploy',
    conversationStyle: 'Konuşma Stili',
    normal: 'Normal',
    genZ: 'Z Kuşağı',
    millennial: 'Y Kuşağı',
    academic: 'Akademik',
    friendly: 'Samimi',
    custom: 'Özel',
    customPromptPlaceholder: 'Özel konuşma stilinizi yazın...',
    language: 'Dil',
    addCustomModel: '➕ Özel model ekle...',
    customModels: '🔧 Özel Modellerim',
    chatTab: 'Sohbet',
    imageGenTab: 'Resim Oluştur',
    generate: 'Oluştur',
    download: 'İndir',
    uploadFile: 'Dosya Yükle',
    sources: 'Kaynaklar:',
    modelIdRequired: 'Model ID ve isim gereklidir.',
    confirmDeleteModel: 'Bu modeli silmek istediğinize emin misiniz?',
    unsupportedFileFormat:
      'Desteklenmeyen dosya formatı. JPG, PNG, GIF, HEIC, MP4 veya WEBM kullanın.',
    enterPrompt: 'Lütfen bir prompt girin.',
    imageError: 'Resim oluşturma hatası:',
    deploy: 'Canlıya Al (Host)',
    deploying: 'Yayınlanıyor...',
    preparing: 'Hazırlanıyor...',
  },
  en: {
    newChat: 'New Chat',
    login: 'Sign In',
    guest: 'Guest',
    processing: 'Processing...',
    controlPanel: 'Control Panel',
    modeSettings: 'Mode and Engine Settings',
    workMode: 'Work Mode',
    aiEngine: 'AI Engine',
    generalChat: 'General Chat',
    generalChatDesc: 'Daily assistant, quick answers.',
    deepSearch: 'Deep Search',
    deepSearchDesc: 'Academic research, sourced.',
    codingHost: 'Coding & Host',
    codingHostDesc: 'One-click deploy, clean code.',
    learningExpert: 'Learning Expert',
    learningExpertDesc: 'Socratic method teaching.',
    askSomething: 'Ask something...',
    liveThinking: '⚡ Live Thinking',
    cloudMemory: '🔒 Cloud Memory',
    autoDeploy: '🚀 Auto-Deploy',
    conversationStyle: 'Conversation Style',
    normal: 'Normal',
    genZ: 'Gen Z',
    millennial: 'Millennial',
    academic: 'Academic',
    friendly: 'Friendly',
    custom: 'Custom',
    customPromptPlaceholder: 'Write your custom conversation style...',
    language: 'Language',
    addCustomModel: '➕ Add your model...',
    customModels: '🔧 My Custom Models',
    chatTab: 'Chat',
    imageGenTab: 'Create Image',
    generate: 'Generate',
    download: 'Download',
    uploadFile: 'Upload File',
    sources: 'Sources:',
    deploy: 'Deploy (Host)',
    deploying: 'Deploying...',
    preparing: 'Preparing...',
    modelIdRequired: 'Model ID and name are required.',
    confirmDeleteModel: 'Are you sure you want to delete this model?',
    unsupportedFileFormat: 'Unsupported file format. Use JPG, PNG, GIF, HEIC, MP4 or WEBM.',
    enterPrompt: 'Please enter a prompt.',
    imageError: 'Image generation error:',
  },
};

// Eksik diller için varsayılan olarak İngilizce kullan
Object.keys(LANGUAGES).forEach((lang) => {
  if (!UI_TRANSLATIONS[lang]) {
    UI_TRANSLATIONS[lang] = UI_TRANSLATIONS['en'];
  }
});

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
    system: 'Sen zeki bir asistansın. Kısa ve öz cevaplar ver.',
    steps: ['Mesaj inceleniyor...', 'Bağlam kuruluyor...', 'Cevap üretiliyor...'],
  },
  deepsearch: {
    title: 'Deep Search',
    system:
      'Sen derinlemesine araştırma yapan bir analistsin. Cevaplarında mutlaka kaynak belirt. Konuyu her açıdan ele al.',
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
    system: `Sen Expert Senior Developer'sın. Kod istenirse MUTLAKA 3 AYRI KOD BLOĞU olarak ver:

1. HTML bloğu (\`\`\`html ... \`\`\`) - Temel yapı, CSS ve JS dosyalarına link içermeli:
   <link rel="stylesheet" href="styles.css">
   <script src="script.js"></script>

2. CSS bloğu (\`\`\`css ... \`\`\`) - Tüm stiller

3. JavaScript bloğu (\`\`\`javascript ... \`\`\`) - Tüm fonksiyonlar

Her zaman bu 3 ayrı blok formatını kullan. Tek dosya HTML verme.`,
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
    system: 'Sen Sokratik bir öğretmensin. Cevabı direkt verme, sorularla yönlendir. Basit anlat.',
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
    if (typeof puter !== 'undefined') {
      const user = await puter.auth.getUser().catch(() => null);
      if (user) {
        isUserSignedIn = true;
        document.getElementById('username').innerText = user.username;
        document.getElementById('user-avatar').innerText = user.username.charAt(0).toUpperCase();
        await loadChats();
      }
    }
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
    // Her mod için tanımlı adımları (steps) tek tek oynatıyoruz
    for (const step of modeConfig.steps) {
      if (!currentChat.isProcessing) break;

      currentChat.tempStatus = step;
      currentChat.processLog.push({ text: step, done: false }); // İlerlemeyi logla

      // Aktif sohbette UI güncelle
      if (activeChatId === chatId) updateThinkingUI(chatId);

      // Gerçekçilik için rastgele gecikme (DeepSearch daha yavaş)
      const delay = modeKey === 'deepsearch' ? 1500 : 600;
      await new Promise((r) => setTimeout(r, delay + Math.random() * 500));

      // Son adımı tamamlandı olarak işaretle
      if (currentChat.processLog.length > 0) {
        currentChat.processLog[currentChat.processLog.length - 1].done = true;
      }
    }

    // Dil ve stil prompt'larını oluştur
    const langPrompt = LANGUAGES[currentLanguage]
      ? `Lütfen ${LANGUAGES[currentLanguage].prompt} dilinde cevap ver.`
      : '';

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

    // Görsel/Video dosyası varsa vision API kullan
    if (uploadedFile && uploadedFile.base64) {
      const messages = [
        { type: 'text', text: fullPrompt },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: uploadedFile.type,
            data: uploadedFile.base64,
          },
        },
      ];
      response = await puter.ai.chat(messages, { model: modelId });

      // Dosyayı temizle
      clearUploadedFile();
    } else {
      response = await puter.ai.chat(fullPrompt, { model: modelId });
    }

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
      content = content
        .map((c) => (typeof c === 'object' ? c.text || JSON.stringify(c) : c))
        .join('');
    }

    currentChat.messages.push({ role: 'assistant', content: content, timestamp: Date.now() });
  } catch (err) {
    logError(err, 'handleSendClick');
    currentChat.messages.push({
      role: 'assistant',
      content: `⚠️ Hata: ${err.message || 'Bağlantı koptu.'}`,
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

  // Mesajları render et
  chat.messages.forEach((msg) => {
    const div = document.createElement('div');
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

    div.innerHTML = `
            <div class="w-8 h-8 rounded-full ${avatarBg} flex-shrink-0 flex items-center justify-center text-white text-xs shadow-lg"><i data-lucide="${icon}" class="w-4 h-4"></i></div>
            <div class="max-w-[85%] min-w-0">
                <div class="p-4 rounded-2xl ${isUser ? 'bg-[#3b52d4] text-white' : 'bg-[#1e2130] text-gray-100 border border-[#2f3345]'} shadow-md markdown-body">
                    ${contentHtml}
                </div>
                <div class="text-[10px] text-gray-600 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'} opacity-60">${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
      behavior: 'smooth',
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
    title: 'Yeni Sohbet',
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
async function handleAuth() {
  try {
    if (typeof puter !== 'undefined') {
      const user = await puter.auth.signIn();
      isUserSignedIn = true;
      document.getElementById('username').innerText = user.username;
      document.getElementById('user-avatar').innerText = user.username.charAt(0).toUpperCase();
      await loadChats();
    }
  } catch (e) {
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
      renderCustomModels();
    }
  } catch (e) {
    logError(e, 'loadCustomModels');
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

// --- RESİM OLUŞTURMA (NANO BANANA) ---
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

  generateBtn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> ${t('generate')}...`;
  generateBtn.disabled = true;

  try {
    const response = await puter.ai.txt2img(prompt, { model: model });

    // Yanıtı işle
    let imageUrl = '';
    if (typeof response === 'string') {
      imageUrl = response;
    } else if (response?.url) {
      imageUrl = response.url;
    } else if (response?.image) {
      imageUrl = response.image;
    } else if (response?.data) {
      imageUrl = `data:image/png;base64,${response.data}`;
    }

    if (imageUrl) {
      const imageCard = document.createElement('div');
      imageCard.className =
        'relative group rounded-xl overflow-hidden border border-[#2f3345] bg-[#1e2130]';
      imageCard.innerHTML = `
                <img src="${imageUrl}" alt="${prompt}" class="w-full aspect-square object-cover">
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a href="${imageUrl}" download="nano-banana-${Date.now()}.png" class="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                        <i data-lucide="download" class="w-5 h-5 text-white"></i>
                    </a>
                </div>
                <div class="p-2 text-xs text-gray-400 truncate">${prompt}</div>
            `;
      gallery.prepend(imageCard);

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    promptInput.value = '';
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

// --- SEKME DEĞİŞTİRME ---
function switchTab(tab) {
  activeTab = tab;

  const chatTab = document.getElementById('chat-tab-content');
  const imageTab = document.getElementById('image-tab-content');
  const chatTabBtn = document.getElementById('chat-tab-btn');
  const imageTabBtn = document.getElementById('image-tab-btn');

  if (tab === 'chat') {
    chatTab?.classList.remove('hidden');
    imageTab?.classList.add('hidden');
    chatTabBtn?.classList.add('active', 'border-b-2', 'border-blue-500');
    chatTabBtn?.classList.remove('text-gray-500');
    imageTabBtn?.classList.remove('active', 'border-b-2', 'border-blue-500');
    imageTabBtn?.classList.add('text-gray-500');
  } else {
    chatTab?.classList.add('hidden');
    imageTab?.classList.remove('hidden');
    imageTabBtn?.classList.add('active', 'border-b-2', 'border-blue-500');
    imageTabBtn?.classList.remove('text-gray-500');
    chatTabBtn?.classList.remove('active', 'border-b-2', 'border-blue-500');
    chatTabBtn?.classList.add('text-gray-500');
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
