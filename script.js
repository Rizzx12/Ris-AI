// script.js
let messages = JSON.parse(localStorage.getItem('chatHistory')) || [];

const chatBox = document.getElementById('chat-box');
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const clearBtn = document.getElementById('clear-btn');

function addMessage(role, content) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${role}`;
  msgDiv.textContent = `${role === 'user' ? 'You' : 'AI'}: ${content}`;
  chatBox.appendChild(msgDiv);
}

function renderHistory() {
  chatBox.innerHTML = '';
  messages.forEach(msg => addMessage(msg.role, msg.content));
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getAIResponse(userMessage) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [...messages, { role: 'user', content: userMessage }] })
  });

  const data = await response.json();
  return data.reply || 'Maaf, saya tidak bisa menjawab sekarang.';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userInput = input.value.trim();
  if (!userInput) return;

  // Tambah pesan user
  messages.push({ role: 'user', content: userInput });
  addMessage('user', userInput);
  input.value = '';
  localStorage.setItem('chatHistory', JSON.stringify(messages));

  // Tampilkan loading
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message ai';
  loadingDiv.textContent = 'AI sedang mengetik...';
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Dapatkan jawaban AI
  const aiReply = await getAIResponse(userInput);

  // Hapus loading, ganti dengan jawaban
  chatBox.removeChild(loadingDiv);
  messages.push({ role: 'assistant', content: aiReply });
  addMessage('ai', aiReply);
  localStorage.setItem('chatHistory', JSON.stringify(messages));
});

clearBtn.addEventListener('click', () => {
  messages = [];
  localStorage.removeItem('chatHistory');
  chatBox.innerHTML = '';
});

// Render saat halaman dimuat
renderHistory();
