const DEFAULT_API_KEY = "AIzaSyBYmsmqVHHnio0i7TOLAXmYSsU3UNOhd3o";
let currentUser = null;
const suara = new SpeechSynthesisUtterance();
suara.lang = 'id-ID';

const users = JSON.parse(localStorage.getItem("users") || "{}");

function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function showRegister() {
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("registerPage").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("registerPage").classList.add("hidden");
  document.getElementById("loginPage").classList.remove("hidden");
}

function register() {
  const u = document.getElementById("regUser").value.trim();
  const p = document.getElementById("regPass").value;
  if (users[u]) {
    document.getElementById("registerError").style.display = "block";
    return;
  }
  users[u] = { password: p, premium: false };
  saveUsers();
  alert("✅ Berhasil daftar! Silakan login.");
  showLogin();
}

function login() {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value;

  if (u === "annas" && p === "annas") {
    loadUserTable();
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("adminPanel").classList.remove("hidden");
    return;
  }

  if (!users[u] || users[u].password !== p) {
    document.getElementById("loginError").style.display = "block";
    return;
  }

  currentUser = u;
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("chatApp").classList.remove("hidden");
  loadHistory();
}

function logout() {
  location.reload();
}

function upgradeUser(username) {
  users[username].premium = true;
  saveUsers();
  loadUserTable();
}

function loadUserTable() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";
  Object.keys(users).forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${user}</td>
      <td>${users[user].premium ? 'Premium' : 'Gratis'}</td>
      <td>${users[user].premium ? '-' : `<button onclick="upgradeUser('${user}')">Setujui Premium</button>`}</td>`;
    tbody.appendChild(row);
  });
}

function renderMsg(sender, text) {
  const chatBox = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.className = `msg ${sender}`;
  const label = document.createElement("div");
  label.className = "sender-label";
  label.textContent = sender === "user" ? currentUser : "Gemini";
  const body = document.createElement("div");
  body.innerHTML = text;
  msg.appendChild(label);
  msg.appendChild(body);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function saveHistory() {
  localStorage.setItem("chat_" + currentUser, document.getElementById("chatBox").innerHTML);
}

function loadHistory() {
  const saved = localStorage.getItem("chat_" + currentUser);
  if (saved) document.getElementById("chatBox").innerHTML = saved;
}

async function sendMessage() {
  const input = document.getElementById("messageInput");
  const teks = input.value.trim();
  if (!teks) return;
  renderMsg("user", teks);
  input.value = "";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${DEFAULT_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: teks }] }] })
  });
  const data = await res.json();
  const balasan = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Tidak ada balasan dari AI.";
  renderMsg("bot", balasan);
  suara.text = balasan;
  speechSynthesis.speak(suara);
  saveHistory();
}

document.getElementById("messageInput").addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});