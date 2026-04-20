/**
 * Firebase lead capture + chat modal
 * Loaded on all site pages to power the "Let's Connect" chat button.
 */

const CWM_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhL8nJ95Be8miIeLvZDT_78oWmBa3N3aA",
  authDomain: "brandonhinrichs.firebaseapp.com",
  projectId: "brandonhinrichs",
  storageBucket: "brandonhinrichs.firebasestorage.app",
  messagingSenderId: "163913694311",
  appId: "1:163913694311:web:fb07d0fcba9fceda47a8c2"
};

if (!firebase.apps.length) {
  firebase.initializeApp(CWM_FIREBASE_CONFIG);
}
const cwmDb = firebase.firestore();

/**
 * Save a lead to Firestore.
 * @param {string} name
 * @param {string} email
 * @param {string} source  e.g. 'chat-widget', 'event-registration', 'newsletter'
 * @param {string} [message]
 * @returns {Promise}
 */
window.cwmSaveLead = function(name, email, source, message) {
  return cwmDb.collection('leads').add({
    name:      name.trim(),
    email:     email.trim().toLowerCase(),
    source:    source || 'chat-widget',
    message:   (message || '').trim(),
    page:      window.location.pathname,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    createdAt: new Date().toISOString()
  });
};

// ── Chat modal ─────────────────────────────────────────────────────────────────

(function () {
  const MODAL_ID = 'cwm-chat-modal';

  function buildModal() {
    if (document.getElementById(MODAL_ID)) return;

    const overlay = document.createElement('div');
    overlay.id = MODAL_ID;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'cwm-modal-title');
    overlay.style.cssText =
      'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);' +
      'z-index:9999;align-items:center;justify-content:center;' +
      'padding:20px;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);';

    overlay.innerHTML = `
      <div style="
        background:#fff;border-radius:16px;padding:40px;
        max-width:480px;width:100%;position:relative;
        box-shadow:0 20px 60px rgba(0,0,0,0.3);font-family:'Inter',sans-serif;">

        <button id="cwm-modal-close" aria-label="Close"
          style="position:absolute;top:16px;right:16px;background:none;border:none;
                 cursor:pointer;font-size:1.3rem;color:#888;line-height:1;padding:4px;">✕</button>

        <div id="cwm-modal-body">
          <p style="font-size:0.75rem;letter-spacing:3px;text-transform:uppercase;
                    color:#8BA9AC;margin:0 0 10px;font-weight:600;">CONNECT WITH JOCELYN</p>
          <h2 id="cwm-modal-title"
              style="font-family:'Lora',serif;color:#2F5D62;font-size:1.65rem;
                     margin:0 0 10px;line-height:1.2;">Let's Talk</h2>
          <p style="color:#666;font-size:0.9rem;line-height:1.7;margin:0 0 26px;">
            Leave your name and email — Jocelyn will reach out personally.
            Want to catch her live?
            <a href="event.html" style="color:#C4956A;text-decoration:underline;">Check upcoming events.</a>
          </p>

          <form id="cwm-lead-form" novalidate>
            <div style="margin-bottom:14px;">
              <input type="text" id="cwm-lead-name" placeholder="Your first name" required
                style="width:100%;padding:12px 16px;border:1.5px solid #e0e0e0;border-radius:8px;
                       font-family:'Inter',sans-serif;font-size:0.95rem;outline:none;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:14px;">
              <input type="email" id="cwm-lead-email" placeholder="Your email address" required
                style="width:100%;padding:12px 16px;border:1.5px solid #e0e0e0;border-radius:8px;
                       font-family:'Inter',sans-serif;font-size:0.95rem;outline:none;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:22px;">
              <textarea id="cwm-lead-message" placeholder="What's on your mind? (optional)" rows="3"
                style="width:100%;padding:12px 16px;border:1.5px solid #e0e0e0;border-radius:8px;
                       font-family:'Inter',sans-serif;font-size:0.95rem;outline:none;
                       resize:vertical;box-sizing:border-box;"></textarea>
            </div>
            <button type="submit" id="cwm-lead-submit"
              style="width:100%;padding:14px;background:#2F5D62;color:#fff;border:none;
                     border-radius:8px;font-family:'Inter',sans-serif;font-size:0.95rem;
                     font-weight:600;cursor:pointer;letter-spacing:0.5px;transition:opacity 0.2s;">
              Send Message
            </button>
            <p id="cwm-lead-error"
               style="color:#e74c3c;font-size:0.83rem;margin:10px 0 0;display:none;"></p>
          </form>
        </div>

        <div id="cwm-modal-success" style="display:none;text-align:center;padding:20px 0;">
          <div style="font-size:2.5rem;margin-bottom:14px;">💌</div>
          <h3 style="font-family:'Lora',serif;color:#2F5D62;margin:0 0 12px;">Message received!</h3>
          <p style="color:#666;font-size:0.9rem;line-height:1.7;margin:0 0 24px;">
            Jocelyn will be in touch soon. In the meantime,
            <a href="event.html" style="color:#C4956A;text-decoration:underline;">
              check upcoming events</a> to connect with her live.
          </p>
          <button id="cwm-modal-done"
            style="padding:12px 32px;background:#C4956A;color:#fff;border:none;
                   border-radius:8px;cursor:pointer;font-family:'Inter',sans-serif;
                   font-size:0.9rem;font-weight:600;">
            Done
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.getElementById('cwm-modal-close').addEventListener('click', closeModal);
    document.getElementById('cwm-modal-done').addEventListener('click', closeModal);

    document.getElementById('cwm-lead-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn    = document.getElementById('cwm-lead-submit');
      const errEl  = document.getElementById('cwm-lead-error');
      const name   = document.getElementById('cwm-lead-name').value;
      const email  = document.getElementById('cwm-lead-email').value;
      const msg    = document.getElementById('cwm-lead-message').value;

      if (!name.trim() || !email.trim()) {
        errEl.textContent = 'Please fill in your name and email.';
        errEl.style.display = 'block';
        return;
      }

      btn.disabled   = true;
      btn.textContent = 'Sending…';
      errEl.style.display = 'none';

      try {
        await window.cwmSaveLead(name, email, 'chat-widget', msg);
        document.getElementById('cwm-modal-body').style.display = 'none';
        document.getElementById('cwm-modal-success').style.display = 'block';
      } catch (err) {
        console.error('Lead save error:', err);
        errEl.textContent = 'Something went wrong. Please email us directly.';
        errEl.style.display = 'block';
        btn.disabled    = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  function openModal() {
    const m = document.getElementById(MODAL_ID);
    if (!m) return;
    m.style.display = 'flex';
    const form = document.getElementById('cwm-lead-form');
    const btn  = document.getElementById('cwm-lead-submit');
    document.getElementById('cwm-modal-body').style.display    = 'block';
    document.getElementById('cwm-modal-success').style.display = 'none';
    if (form) form.reset();
    if (btn)  { btn.disabled = false; btn.textContent = 'Send Message'; }
    document.getElementById('cwm-lead-name').focus();
  }

  function closeModal() {
    const m = document.getElementById(MODAL_ID);
    if (m) m.style.display = 'none';
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildModal();
    const chatBtn = document.querySelector('.chat-btn');
    if (chatBtn) {
      chatBtn.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }
  });
})();
