// Anti-Gambling Shield — Popup v1.1

let settings    = null;
let domainCount = 0;
let todayBlocked = 0;
let currentStreak = 0;

function todayKey() {
  return 'badge_' + new Date().toISOString().slice(0, 10);
}

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

function timeAgo(ts) {
  if (!ts) return 'never updated';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)  return 'updated just now';
  if (s < 3600) return `updated ${Math.floor(s/60)}m ago`;
  if (s < 86400) return `updated ${Math.floor(s/3600)}h ago`;
  return `updated ${Math.floor(s/86400)}d ago`;
}

// Returns a short milestone label; empty string if no milestone
function milestoneLabel(days) {
  if (days <= 0)  return 'Starting out';
  if (days === 1) return 'Day 1';
  if (days === 7) return '1 week';
  if (days === 14) return '2 weeks';
  if (days === 30) return '1 month';
  if (days === 60) return '2 months';
  if (days === 90) return '90 days';
  if (days === 180) return '6 months';
  if (days === 365) return '1 year';
  if (days > 365 && days % 365 === 0) return `${days/365} years`;
  if (days < 7)   return `${days} days`;
  if (days < 30)  return `${days} days`;
  if (days < 365) return `${days} days`;
  return `${days} days`;
}

function streakIcon(days) {
  if (days <= 0)  return '🌱';
  if (days < 3)   return '✦';
  if (days < 7)   return '🛡️';
  if (days < 30)  return '🔒';
  if (days < 90)  return '🏅';
  return '💎';
}

function updateUI() {
  if (!settings) return;

  const enabled = settings.enabled;

  // Status row
  const dot   = document.getElementById('statusDot');
  const label = document.getElementById('statusLabel');
  const meta  = document.getElementById('statusMeta');

  dot.className   = 'status-dot ' + (enabled ? 'active' : 'inactive');
  label.className = 'status-label' + (enabled ? '' : ' inactive');
  label.textContent = enabled ? 'Protection active' : 'Protection paused';
  meta.textContent  = settings.mode === 'strict'
    ? (enabled ? 'Strict mode · sites blocked at network level' : 'Re-enable to resume blocking')
    : (enabled ? 'Soft mode · warning overlay on match' : 'Re-enable to resume blocking');

  document.getElementById('enableToggle').checked = enabled;

  // Mode
  document.getElementById('modeStrict').className = 'mode-option' + (settings.mode === 'strict' ? ' active' : '');
  document.getElementById('modeSoft').className   = 'mode-option' + (settings.mode === 'soft'   ? ' active' : '');

  // Stats
  document.getElementById('todayCount').textContent   = fmt(todayBlocked);
  document.getElementById('blockedCount').textContent = fmt(settings.blockedCount || 0);
  document.getElementById('domainCount').textContent  = fmt(domainCount);

  // Last updated (footer)
  document.getElementById('lastUpdatedText').textContent = timeAgo(settings.lastUpdated);

  // Rules cap notice
  const capNotice = document.getElementById('capNotice');
  if (settings.rulesCapped) {
    capNotice.classList.add('visible');
    document.getElementById('capNum').textContent   = '4,800';
    document.getElementById('totalNum').textContent = fmt(domainCount);
  } else {
    capNotice.classList.remove('visible');
  }

  // Fetch error / info notice
  const fetchNotice = document.getElementById('fetchNotice');
  if (settings.fetchError) {
    fetchNotice.classList.add('visible');
    if (settings.fetchError?.includes('Both sources failed')) {
        fetchNotice.innerHTML = '<strong>List update failed.</strong> Using built-in domains. Check your connection and update manually.';
        fetchNotice.className = 'notice warn visible';
      } else if (settings.fetchError) {
        fetchNotice.innerHTML = '<strong>Backup list used.</strong> Primary source unavailable. Protection remains active.';
        fetchNotice.className = 'notice info visible';
      }
  } else {
    fetchNotice.classList.remove('visible');
  }

  // Streak
  const days = currentStreak;
  document.getElementById('streakDays').textContent    = days;
  document.getElementById('streakIcon').textContent    = streakIcon(days);
  document.getElementById('streakBadge').textContent   = milestoneLabel(days);
  document.getElementById('streakBadge').className     = 'streak-badge' + (days < 3 ? ' new' : '');

  // Domain lists
  renderList('customList', settings.customBlocklist || [], 'custom');
  renderList('allowList',  settings.allowlist       || [], 'allow');
}

function renderList(id, domains, type) {
  const el = document.getElementById(id);
  el.innerHTML = '';
  domains.forEach((domain, idx) => {
    const tag = document.createElement('div');
    tag.className = 'domain-tag';
    tag.innerHTML = `<span>${domain}</span><button data-type="${type}" data-idx="${idx}" title="Remove">✕</button>`;
    el.appendChild(tag);
  });
  el.querySelectorAll('button').forEach(btn =>
    btn.addEventListener('click', () => removeDomain(btn.dataset.type, +btn.dataset.idx))
  );
}

function removeDomain(type, idx) {
  if (type === 'custom') settings.customBlocklist.splice(idx, 1);
  else                   settings.allowlist.splice(idx, 1);
  save();
}

function save() {
  chrome.runtime.sendMessage({ action: 'updateSettings', settings }, updateUI);
}

function toast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => { el.className = `toast ${type}`; }, 2600);
}

// ── Boot ──────────────────────────────────────────────────────────────────────

chrome.runtime.sendMessage({ action: 'getSettings' }, (res) => {
  if (!res) return;
  settings       = res.settings;
  domainCount    = res.domainCount;
  currentStreak  = res.streak || 0;
  chrome.storage.local.get(todayKey(), (stored) => {
    todayBlocked = stored[todayKey()] || 0;
    updateUI();
  });
});

// ── Handlers ──────────────────────────────────────────────────────────────────

document.getElementById('enableToggle').addEventListener('change', (e) => {
  settings.enabled = e.target.checked;
  if (!e.target.checked) toast('Protection paused — streak may reset tomorrow', 'warn');
  save();
});

document.querySelectorAll('.mode-option').forEach(card =>
  card.addEventListener('click', () => {
    settings.mode = card.dataset.mode;
    save();
  })
);

document.getElementById('updateBtn').addEventListener('click', () => {
  const btn = document.getElementById('updateBtn');
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinning">↻</span> Updating…';

  chrome.runtime.sendMessage({ action: 'updateBlocklist' }, (res) => {
    btn.classList.remove('loading');
    btn.innerHTML = '↻ Update List';

    if (res?.success) {
      domainCount            = res.count;
      settings.lastUpdated   = res.lastUpdated;
      settings.fetchError    = res.fetchError || null;
      settings.rulesCapped   = res.count > 4800;
      updateUI();

      if (res.fetchError?.includes('Both sources failed')) toast('Update failed — using built-in list', 'warn');
      else if (res.fetchError)                             toast(`Backup list loaded — ${fmt(res.count)} domains`, 'warn');
      else                                                 toast(`Updated — ${fmt(res.count)} domains`, 'success');
    } else {
      toast('Update failed — check connection', 'warn');
    }
  });
});

document.getElementById('settingsBtn').addEventListener('click', () => {
  const panel = document.getElementById('settingsPanel');
  const open  = panel.classList.toggle('open');
  document.getElementById('settingsBtn').textContent = open ? 'Close' : 'Settings';
});

function addDomain(inputId, listKey, verb) {
  const input  = document.getElementById(inputId);
  const domain = input.value.trim().toLowerCase()
    .replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];

  if (!domain || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    toast('Invalid domain', 'warn'); return;
  }
  if (!settings[listKey]) settings[listKey] = [];
  if (settings[listKey].includes(domain)) {
    toast('Already in list', 'warn'); return;
  }
  settings[listKey].push(domain);
  input.value = '';
  save();
  toast(`${verb}: ${domain}`, 'success');
}

document.getElementById('addCustom').addEventListener('click', () => addDomain('customInput', 'customBlocklist', 'Blocked'));
document.getElementById('customInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('addCustom').click(); });

document.getElementById('addAllow').addEventListener('click', () => addDomain('allowInput', 'allowlist', 'Allowed'));
document.getElementById('allowInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') document.getElementById('addAllow').click(); });
