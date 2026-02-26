// Anti-Gambling Shield - Content Script v1.2
// Soft mode warning overlay — fixes page flash by hiding immediately on load

(function() {
  'use strict';

  // Never run inside iframes
  if (window.self !== window.top) return;

  // ── Immediately hide the page before any content renders ──────────────────
  // This must happen synchronously before the async domain check returns.
  // We reveal it again only after we've confirmed it's safe (or shown overlay).
  const hostname = window.location.hostname.replace(/^www\./, '');

  // ── Fast-exit for strict mode and disabled state ──────────────────────────
  // Read from session storage (set by background on every settings change).
  // Avoids hiding the page at all when we know blocking is off or strict.
  // Falls back to the full message-based check if session storage unavailable.
  let fastExited = false;
  try {
    chrome.storage.session.get(['agMode', 'agEnabled'], (s) => {
      if (chrome.runtime.lastError) { startCheck(); return; }
      if (!s.agEnabled || s.agMode !== 'soft') {
        fastExited = true;
        return; // strict mode or disabled — content script does nothing
      }
      startCheck();
    });
  } catch (e) {
    startCheck(); // session storage not available — fall through to full check
  }

  function startCheck() {
    if (fastExited) return;

    // Only hide the page now that we know we're in soft mode
    const hideStyle = document.createElement('style');
    hideStyle.id = 'ag-hide';
    hideStyle.textContent = 'html { visibility: hidden !important; }';
    (document.head || document.documentElement).appendChild(hideStyle);

    // Safety net: reveal after 800ms if message never returns
    const safetyTimer = setTimeout(reveal, 800);

    function reveal() {
      clearTimeout(safetyTimer);
      const el = document.getElementById('ag-hide');
      if (el) el.remove();
    }

    chrome.runtime.sendMessage({ action: 'checkDomain', hostname }, (response) => {
      if (chrome.runtime.lastError || !response || !response.blocked || response.mode !== 'soft') {
        reveal();
        return;
      }

    // Site is blocked in soft mode — show overlay (page stays hidden underneath)
    chrome.runtime.sendMessage({ action: 'siteBlocked' });
    showOverlay(hostname);
    // Don't call reveal() — overlay handles visibility
    });
  } // end startCheck

  // ── Overlay ───────────────────────────────────────────────────────────────

  function showOverlay(domain) {
    // Load fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600&display=swap';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.textContent = `
      #ag-overlay *,
      #ag-overlay *::before,
      #ag-overlay *::after { box-sizing: border-box; margin: 0; padding: 0; }

      #ag-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: #0F1011;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'DM Sans', -apple-system, sans-serif;
        -webkit-font-smoothing: antialiased;
      }

      #ag-overlay .ag-card {
        width: 100%;
        max-width: 440px;
        margin: 24px;
        background: #161719;
        border: 1px solid #2A2D31;
        border-radius: 4px;
        overflow: hidden;
        animation: ag-in 0.2s ease;
      }

      @keyframes ag-in {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      #ag-overlay .ag-header {
        padding: 20px 24px 18px;
        border-bottom: 1px solid #2A2D31;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      #ag-overlay .ag-icon {
        width: 36px;
        height: 36px;
        background: #E8253A;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      #ag-overlay .ag-icon svg {
        width: 20px;
        height: 20px;
      }

      #ag-overlay .ag-header-text {}

      #ag-overlay .ag-tag {
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        font-weight: 500;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #E8253A;
        background: #1E1214;
        border: 1px solid #4A1520;
        padding: 2px 8px;
        border-radius: 99px;
        display: inline-block;
        margin-bottom: 6px;
      }

      #ag-overlay .ag-title {
        font-size: 16px;
        font-weight: 600;
        color: #F0F2F5;
        letter-spacing: -0.01em;
      }

      #ag-overlay .ag-body {
        padding: 20px 24px;
        border-bottom: 1px solid #2A2D31;
      }

      #ag-overlay .ag-domain-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 14px;
        padding: 10px 12px;
        background: #1E2022;
        border: 1px solid #2A2D31;
        border-radius: 3px;
      }

      #ag-overlay .ag-domain-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #E8253A;
        flex-shrink: 0;
      }

      #ag-overlay .ag-domain-name {
        font-family: 'DM Mono', monospace;
        font-size: 13px;
        color: #A8B0BC;
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      #ag-overlay .ag-domain-label {
        font-family: 'DM Mono', monospace;
        font-size: 9px;
        color: #636B78;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        flex-shrink: 0;
      }

      #ag-overlay .ag-desc {
        font-size: 13px;
        color: #636B78;
        line-height: 1.55;
      }

      #ag-overlay .ag-actions {
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      #ag-overlay .ag-btn-back {
        width: 100%;
        padding: 11px 16px;
        background: #E8253A;
        color: #fff;
        border: none;
        border-radius: 3px;
        font-family: 'DM Sans', sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.12s;
        text-align: center;
      }

      #ag-overlay .ag-btn-back:hover { background: #C41E30; }

      #ag-overlay .ag-btn-continue {
        width: 100%;
        padding: 9px 16px;
        background: transparent;
        color: #3E444D;
        border: 1px solid #2A2D31;
        border-radius: 3px;
        font-family: 'DM Sans', sans-serif;
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;
        transition: color 0.12s, border-color 0.12s;
        text-align: center;
      }

      #ag-overlay .ag-btn-continue:hover {
        color: #636B78;
        border-color: #383C42;
      }

      #ag-overlay .ag-footer {
        padding: 12px 24px;
        border-top: 1px solid #2A2D31;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #ag-overlay .ag-footer-text {
        font-family: 'DM Mono', monospace;
        font-size: 10px;
        color: #3E444D;
      }

      #ag-overlay .ag-footer a {
        color: #636B78;
        text-decoration: none;
        transition: color 0.12s;
      }

      #ag-overlay .ag-footer a:hover { color: #A8B0BC; }
    `;

    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'ag-overlay';
    overlay.innerHTML = `
      <div class="ag-card">
        <div class="ag-header">
          <div class="ag-icon">
            <svg viewBox="0 0 20 20" fill="none">
              <path d="M10 1.5L3 4.5V10C3 13.7 6.1 17.2 10 18C13.9 17.2 17 13.7 17 10V4.5L10 1.5Z"
                fill="white" opacity="0.2"/>
              <path d="M10 1.5L3 4.5V10C3 13.7 6.1 17.2 10 18C13.9 17.2 17 13.7 17 10V4.5L10 1.5Z"
                stroke="white" stroke-width="1.25" stroke-linejoin="round"/>
              <path d="M7 10L9 12L13 8" stroke="white" stroke-width="1.5"
                stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="ag-header-text">
            <div class="ag-tag">Gambling site detected</div>
            <div class="ag-title">Anti-Gambling Shield</div>
          </div>
        </div>

        <div class="ag-body">
          <div class="ag-domain-row">
            <div class="ag-domain-dot"></div>
            <div class="ag-domain-name">${escapeHtml(domain)}</div>
            <div class="ag-domain-label">Blocked</div>
          </div>
          <p class="ag-desc">
            This site is on your gambling blocklist. Continuing may undermine your goals.
            You can go back, or override this warning if you're sure.
          </p>
        </div>

        <div class="ag-actions">
          <button class="ag-btn-back" id="ag-back">← Go back to safety</button>
          <button class="ag-btn-continue" id="ag-continue">Continue anyway (not recommended)</button>
        </div>

        <div class="ag-footer">
          <span class="ag-footer-text">
            <a href="https://www.ncpgambling.org/" target="_blank" rel="noopener">
              NCPG Helpline
            </a>
            &nbsp;·&nbsp; 1-800-522-4700
          </span>
          <span class="ag-footer-text">Soft mode active</span>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Now reveal — overlay is visible, underlying page stays hidden
    const hideEl = document.getElementById('ag-hide');
    if (hideEl) hideEl.remove();
    document.documentElement.style.visibility = '';

    // ── Button handlers ──────────────────────────────────────────────────────
    document.getElementById('ag-back').addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.replace('chrome://newtab/');
      }
    });

    document.getElementById('ag-continue').addEventListener('click', () => {
      overlay.remove();
      style.remove();
      // Page is already visible from above
    });
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

})();
