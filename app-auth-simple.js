// Basit auth replacement kodu
// 712-858 satırları arasını değiştirmek için

// --- YARDIMCI FONKSİYONLAR ---
async function handleAuth() {
  // Demo Mode - localStorage kullan, Puter'a gerek yok
  const demoUsername = 'Demo User';

  isUserSignedIn = true;
  document.getElementById('username').innerText = demoUsername;
  document.getElementById('user-avatar').innerText = demoUsername.charAt(0).toUpperCase();

  const authBtnParent = document.querySelector('#auth-btn-text')?.parentElement;
  if (authBtnParent) {
    authBtnParent.style.display = 'none';
  }

  await loadChats();

  if (chats.length > 0) {
    loadChatToUI(chats[0].id);
  }

  console.log('✅ Demo mode aktif:', demoUsername);
}
