# 🤖 Puter AI 2025 - Pro Workspace

Modern AI sohbet arayüzü. GPT-5, Claude, Gemini, Grok ve daha fazla modelle çalışır.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js->=18.0.0-green.svg)](https://nodejs.org/)

---

## 🌟 Özellikler

### 4 Çalışma Modu

| Mod                   | Açıklama                              | İkon |
| --------------------- | ------------------------------------- | ---- |
| **🗨️ Genel Sohbet**   | Günlük asistan, hızlı cevaplar        | 💬   |
| **🔍 Deep Search**    | Akademik araştırma, kaynaklı sonuçlar | 🌐   |
| **💻 Kodlama & Host** | Tek tıkla deploy, temiz kod üretimi   | ⚡   |
| **📚 Öğrenme Uzmanı** | Sokratik metodla öğretim              | 🎓   |

---

## 🧠 Desteklenen AI Modelleri

### 2025 Flagships (En İyiler)

| Model                   | Sağlayıcı |
| ----------------------- | --------- |
| GPT 5.1 (Preview)       | OpenAI    |
| Claude Opus 4.5         | Anthropic |
| Gemini 3 Ultra          | Google    |
| Grok 3                  | xAI       |
| DeepSeek R1 (Reasoning) | DeepSeek  |

### Anthropic Claude Ailesi

| Model             | Açıklama           |
| ----------------- | ------------------ |
| Claude 3.7 Sonnet | Dengeli performans |
| Claude 3.5 Sonnet | Hızlı ve akıllı    |
| Claude Opus 4.1   | En güçlü           |
| Claude Haiku 4.5  | En hızlı           |

### OpenAI GPT & O Serisi

| Model               | Açıklama         |
| ------------------- | ---------------- |
| GPT 5               | En güncel        |
| GPT-4o              | Multimodal       |
| OpenAI o3           | Reasoning        |
| o3 Deep Research    | Araştırma odaklı |
| GPT-5 Görsel Modülü | Görsel işleme    |

### Google Gemini

| Model                 | Açıklama            |
| --------------------- | ------------------- |
| Gemini 3 Pro (Native) | Doğal entegrasyon   |
| Gemini 2.5 Pro        | Gelişmiş yetenekler |
| Gemini 2.5 Flash      | Hızlı yanıt         |

### xAI Grok

| Model         | Açıklama    |
| ------------- | ----------- |
| Grok 4.1 Fast | Ultra hızlı |
| Grok 4        | Standart    |
| Grok 2        | Kararlı     |

### DeepSeek & Çin Modelleri

| Model             | Açıklama     |
| ----------------- | ------------ |
| DeepSeek V3.1     | Güncel sürüm |
| DeepSeek V3.2 Exp | Deneysel     |
| Kimi k2 Thinking  | Moonshot AI  |
| GLM 4.6           | Z-AI         |

### Diğerleri

| Model                | Sağlayıcı  |
| -------------------- | ---------- |
| Llama 4 Maverick     | Meta       |
| Llama 3.3 70B        | Meta       |
| Qwen 2.5 72B         | Alibaba    |
| Mistral Large 2411   | Mistral AI |
| Perplexity Sonar Pro | Perplexity |

---

## ✨ Ek Özellikler

- **⚡ Canlı Düşünme Göstergesi** - AI'ın düşünme sürecini adım adım takip edin
- **☁️ Bulut Hafıza** - Sohbet geçmişiniz Puter Cloud'da güvenle saklanır
- **🚀 Tek Tıkla Deploy** - Kodlama modunda üretilen HTML'leri anında yayınlayın
- **📱 Responsive Tasarım** - Mobil, tablet ve masaüstü uyumlu
- **🌙 Karanlık Tema** - Göz dostu modern arayüz

---

## 🚀 Kurulum

### Gereksinimler

- Node.js >= 18.0.0
- npm veya yarn

### Adımlar

```bash
# Repository'yi klonlayın
git clone https://github.com/Mustafa-Kayra/ai-agent.git

# Proje dizinine gidin
cd ai-agent

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda `http://localhost:3000` adresine giderek uygulamayı kullanabilirsiniz.

---

## 📜 NPM Scriptleri

| Script   | Komut            | Açıklama                                     |
| -------- | ---------------- | -------------------------------------------- |
| `start`  | `npm start`      | Üretim sunucusunu başlatır (serve)           |
| `dev`    | `npm run dev`    | Geliştirme sunucusunu başlatır (live-server) |
| `build`  | `npm run build`  | Build işlemi (static HTML projesi)           |
| `test`   | `npm test`       | Testleri çalıştırır                          |
| `lint`   | `npm run lint`   | Kod formatını kontrol eder                   |
| `format` | `npm run format` | Kodu otomatik formatlar                      |

---

## 📁 Proje Yapısı

```
ai-agent/
├── index.html          # Ana uygulama dosyası
├── package.json        # NPM konfigürasyonu
├── .gitignore          # Git ignore kuralları
├── .prettierrc         # Prettier konfigürasyonu
└── README.md           # Bu dosya
```

---

## 🛠️ Kullanılan Teknolojiler

| Teknoloji                                | Açıklama                                          |
| ---------------------------------------- | ------------------------------------------------- |
| [Puter.js](https://js.puter.com/)        | Bulut kimlik doğrulama, dosya depolama ve hosting |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework                       |
| [Lucide Icons](https://lucide.dev/)      | Modern ikon kütüphanesi                           |
| [Marked.js](https://marked.js.org/)      | Markdown parser                                   |

---

## 🔗 Puter Entegrasyonu

Bu proje, [Puter](https://puter.com/) platformunun sunduğu API'leri kullanmaktadır:

### Kimlik Doğrulama

```javascript
// Kullanıcı girişi
const user = await puter.auth.signIn();

// Kullanıcı bilgilerini al
const user = await puter.auth.getUser();
```

### Dosya Depolama

```javascript
// Sohbet geçmişini kaydet
await puter.fs.write('chats.json', JSON.stringify(chats));

// Sohbet geçmişini oku
const file = await puter.fs.read('chats.json');
```

### AI Chat

```javascript
// AI modeli ile sohbet
const response = await puter.ai.chat(prompt, { model: modelId });
```

### Hosting

```javascript
// Tek tıkla deploy
await puter.fs.mkdir(dir);
await puter.fs.write(`${dir}/index.html`, code);
const site = await puter.hosting.create(subdomain, dir);
```

---

## 📖 Kullanım Talimatları

1. **Giriş Yapın**: Sol panelde "Giriş Yap" butonuna tıklayarak Puter hesabınızla giriş yapın
2. **Mod Seçin**: Sağ panelden çalışma modunuzu seçin (Genel Sohbet, Deep Search, Kodlama, Öğrenme)
3. **Model Seçin**: Kullanmak istediğiniz AI modelini seçin
4. **Sohbet Edin**: Mesajınızı yazın ve gönderin
5. **Deploy**: Kodlama modunda üretilen HTML kodlarını "Canlıya Al" butonu ile yayınlayın

---

## 🤝 Katkıda Bulunma

Katkılarınızı memnuniyetle karşılıyoruz! Aşağıdaki adımları izleyerek katkıda bulunabilirsiniz:

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/yeni-ozellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/yeni-ozellik`)
5. Pull Request açın

### Katkı Kuralları

- Kod formatı için Prettier kullanın (`npm run format`)
- Commit mesajlarınızı açıklayıcı yazın
- Değişikliklerinizi test edin

---

## 📄 Lisans

Bu proje [MIT Lisansı](https://opensource.org/licenses/MIT) altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

**Mustafa-Kayra**

- GitHub: [@Mustafa-Kayra](https://github.com/Mustafa-Kayra)

---

## 🙏 Teşekkürler

- [Puter](https://puter.com/) - Bulut altyapısı için
- [OpenRouter](https://openrouter.ai/) - AI model erişimi için
- Tüm açık kaynak kütüphane geliştiricilerine

---

<p align="center">
  ⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın! ⭐
</p>
