/* ── AI Chat Widget ─────────────────────────────────────────────────────── */

(function () {
  const CHAT_URL =
    "https://us-central1-brandonhinrichs.cloudfunctions.net/chat";

  // ── Inject HTML ──────────────────────────────────────────────────────────

  const panel = document.createElement("div");
  panel.id = "cwm-chat-panel";
  panel.innerHTML = `
    <div id="cwm-chat-header">
      <div id="cwm-chat-header-info">
        <span id="cwm-chat-avatar"><i class="fa-solid fa-comment-dots"></i></span>
        <div>
          <div id="cwm-chat-name">Michelle's Assistant</div>
          <div id="cwm-chat-status">Here to help</div>
        </div>
      </div>
      <button id="cwm-chat-close" aria-label="Close chat"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div id="cwm-chat-messages"></div>
    <div id="cwm-chat-input-row">
      <input id="cwm-chat-input" type="text" placeholder="Ask me anything…" autocomplete="off" />
      <button id="cwm-chat-send" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>
    </div>
  `;
  document.body.appendChild(panel);

  // ── Inject CSS ───────────────────────────────────────────────────────────

  const style = document.createElement("style");
  style.textContent = `
    #cwm-chat-panel {
      position: fixed;
      bottom: 90px;
      right: 28px;
      width: 340px;
      max-height: 500px;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 16px 48px rgba(47,93,98,0.18), 0 2px 8px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      z-index: 999;
      overflow: hidden;
      opacity: 0;
      transform: translateY(16px) scale(0.97);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
    }
    #cwm-chat-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    #cwm-chat-header {
      background: var(--primary, #2F5D62);
      color: #fff;
      padding: 16px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    #cwm-chat-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #cwm-chat-avatar {
      width: 38px;
      height: 38px;
      background: rgba(255,255,255,0.18);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
    #cwm-chat-name {
      font-weight: 600;
      font-size: 0.9rem;
      font-family: 'Lora', serif;
    }
    #cwm-chat-status {
      font-size: 0.72rem;
      opacity: 0.75;
    }
    #cwm-chat-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 1.1rem;
      cursor: pointer;
      opacity: 0.8;
      padding: 4px;
      line-height: 1;
    }
    #cwm-chat-close:hover { opacity: 1; }
    #cwm-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #F9F6F2;
    }
    .cwm-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 0.875rem;
      line-height: 1.55;
      word-break: break-word;
    }
    .cwm-msg.ai {
      background: #fff;
      color: #2B2B2B;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }
    .cwm-msg.user {
      background: var(--primary, #2F5D62);
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .cwm-typing {
      display: flex;
      gap: 5px;
      align-items: center;
      padding: 10px 14px;
      background: #fff;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }
    .cwm-typing span {
      width: 7px;
      height: 7px;
      background: var(--secondary, #B86B5E);
      border-radius: 50%;
      animation: cwm-bounce 1.2s infinite;
    }
    .cwm-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cwm-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cwm-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }
    #cwm-chat-input-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid rgba(0,0,0,0.07);
      background: #fff;
    }
    #cwm-chat-input {
      flex: 1;
      border: 1.5px solid rgba(47,93,98,0.2);
      border-radius: 100px;
      padding: 8px 14px;
      font-size: 0.875rem;
      font-family: inherit;
      outline: none;
      background: #F9F6F2;
      color: #2B2B2B;
      transition: border-color 0.2s;
    }
    #cwm-chat-input:focus { border-color: var(--primary, #2F5D62); }
    #cwm-chat-send {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: var(--secondary, #B86B5E);
      color: #fff;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.15s;
      flex-shrink: 0;
    }
    #cwm-chat-send:hover { background: #a35a4e; transform: scale(1.08); }
    #cwm-chat-send:disabled { opacity: 0.5; cursor: default; transform: none; }
    @media (max-width: 480px) {
      #cwm-chat-panel { width: calc(100vw - 32px); right: 16px; bottom: 80px; }
    }
  `;
  document.head.appendChild(style);

  // ── State ────────────────────────────────────────────────────────────────

  const messages = []; // { role: 'user'|'assistant', content: string }
  let isOpen = false;
  let isWaiting = false;

  const messagesEl = document.getElementById("cwm-chat-messages");
  const inputEl = document.getElementById("cwm-chat-input");
  const sendEl = document.getElementById("cwm-chat-send");

  // ── Helpers ──────────────────────────────────────────────────────────────

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = "cwm-msg " + (role === "user" ? "user" : "ai");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement("div");
    div.className = "cwm-typing";
    div.id = "cwm-typing-indicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById("cwm-typing-indicator");
    if (el) el.remove();
  }

  function setWaiting(val) {
    isWaiting = val;
    sendEl.disabled = val;
    inputEl.disabled = val;
  }

  // ── Greeting ─────────────────────────────────────────────────────────────

  function showGreeting() {
    if (messagesEl.children.length === 0) {
      appendMessage(
        "assistant",
        "Hi! I'm Michelle's assistant. Whether you're curious about a program or not sure where to start — I'm here to help. What's on your mind?"
      );
    }
  }

  // ── Send ─────────────────────────────────────────────────────────────────

  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isWaiting) return;

    inputEl.value = "";
    appendMessage("user", text);
    messages.push({ role: "user", content: text });

    setWaiting(true);
    showTyping();

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      hideTyping();

      const reply = data.reply || data.error || "Sorry, I couldn't get a response. Please try again.";
      appendMessage("assistant", reply);
      messages.push({ role: "assistant", content: reply });
    } catch {
      hideTyping();
      appendMessage("assistant", "Sorry, something went wrong. Please try again.");
    } finally {
      setWaiting(false);
      inputEl.focus();
    }
  }

  // ── Toggle ───────────────────────────────────────────────────────────────

  function openChat() {
    isOpen = true;
    panel.classList.add("open");
    showGreeting();
    setTimeout(() => inputEl.focus(), 250);
  }

  function closeChat() {
    isOpen = false;
    panel.classList.remove("open");
  }

  // ── Events ───────────────────────────────────────────────────────────────

  const chatBtn = document.querySelector(".chat-btn");
  if (chatBtn) {
    chatBtn.addEventListener("click", () => (isOpen ? closeChat() : openChat()));
  }

  document.getElementById("cwm-chat-close").addEventListener("click", closeChat);

  sendEl.addEventListener("click", sendMessage);

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
